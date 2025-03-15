from flask import json
from pymongo import MongoClient
from app.Config.config import Config
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId

# Initialize MongoDB client
client = MongoClient(Config.MONGO_URI)
db = client[Config.MONGO_DBNAME]

def user_exists(email):
    print("\n\n 1.1 \n\n")
    user = db.users.find_one({"email": email}) is not None
    print(f"\n\n user exist : {user} ")    
    return user

def signup(name, email, password):
    if user_exists(email):
        return {"status": False, "message": "User already exists"}
    db.users.insert_one({"name": name, "email": email, "password": password, "isDiagnosed": False})
    return {"status": True, "message": "User created successfully"}

def login(email, password):
    user = db.users.find_one({"email": email})
    if user and user["password"] == password:
        user_id = str(user["_id"])
        name = user.get("name", "Unknown")
        return {"status": True, "message": "User logged in successfully", "userId": user_id, "name": name}
    else:
        return {"status": False, "message": "Invalid email or password"}

    
def check_diagnosed(user_id):
    user = db.users.find_one({"_id": ObjectId(user_id)})
    if user:
        return {"isDiagnosed": user.get("isDiagnosed", False)}
    else:
        return {"message": "User not found"}, 404

def check_assessed(user_id):
    try:
        # Convert string ID to ObjectId
        user = db.history.find_one({"userId": user_id})
        if user:
            return {"isAssessed": True}
        return {"isAssessed": False}
    except Exception as e:
        print(f"Error in check_assessed: {str(e)}")
        return {"Assessed": False, "message": "Error checking assessment status"}
    
def HistoryAssesment(data):
    user_id = data.get("userId")
    user = db.users.find_one({"_id": ObjectId(user_id)})

    if not user:
        return {"status": False, "message": "User not found"}, 404
    
    # Check if assessment already exists for this user
    existing_assessment = db.history.find_one({"userId": user_id})
    if existing_assessment:
        return {"status": False, "message": "Assessment already exists for this user"}

    # If no existing assessment, insert new one
    db.history.insert_one({"userId": user_id, "assessmentData": data["assessmentData"]})
    return {"status": True, "message": "Assessment data saved successfully"}

def add_dysgraphia_image_data(data, userID):
    try:
        # Check if document exists for this user
        doc = db.dysgraphia_diagnosis.find_one({"userID": userID})
        
        if not doc:
            # Create new document with initial writing task
            db.dysgraphia_diagnosis.insert_one({
                "_id": ObjectId(),  # Generate a new ObjectId for the document
                "userID": userID,
                "writingTasks": data["writingTasks"]
            })
        else:
            # Add new tasks to existing array
            db.dysgraphia_diagnosis.update_one(
                {"userID": userID},
                {"$push": {"writingTasks": {"$each": data["writingTasks"]}}}
            )

        return {
            "status": True, 
            "message": "Writing data added successfully",
            "taskCount": len(data["writingTasks"])
        }
    except Exception as e:
        print(f"Error in add_dysgraphia_image_data: {str(e)}")
        return {"status": False, "message": f"Error adding writing data: {str(e)}"}
    
def add_dylexia_data(data, userID):
    try:
        # Check if document exists for this user
        doc = db.dyslexia_diagnosis.find_one({"userID": userID})
        
        if not doc:
            # Create new document with initial writing task
            db.dyslexia_diagnosis.insert_one({
                "_id": ObjectId(),  # Generate a new ObjectId for the document
                "userID": userID,
                "audioTask": data["audioTask"]
            })
        else:
            # Add new tasks to existing array
            db.dyslexia_diagnosis.update_one(
                {"userID": userID},
                {"$push": {"audioTask": {"$each": data["audioTask"]}}}
            )

        return {
            "status": True, 
            "message": "Writing data added successfully",
            "taskCount": len(data["audioTask"])
        }
    except Exception as e:
        print(f"Error in add_dysgraphia_image_data: {str(e)}")
        return {"status": False, "message": f"Error adding writing data: {str(e)}"}
    
def get_user_assessment_data(userID):
    try:
        # Get data from all collections
        history_data = db.history.find_one({"userId": userID})
        dyslexia_data = db.dyslexia_diagnosis.find_one({"userID": userID})
        dysgraphia_data = db.dysgraphia_diagnosis.find_one({"userID": userID})

        # Format the response
        response = {
            "status": True,
            "data": {
                "history": history_data["assessmentData"] if history_data else None,
                "dyslexia": {
                    "audioTask": dyslexia_data["audioTask"] if dyslexia_data else []
                } if dyslexia_data else None,
                "dysgraphia": {
                    "writingTasks": dysgraphia_data["writingTasks"] if dysgraphia_data else []
                } if dysgraphia_data else None
            }
        }

        # Check if any data exists
        if not any([history_data, dyslexia_data, dysgraphia_data]):
            return {
                "status": False,
                "message": "No assessment data found for this user"
            }

        return response

    except Exception as e:
        print(f"Error in get_user_assessment_data: {str(e)}")
        return {
            "status": False,
            "message": f"Error retrieving assessment data: {str(e)}"
        }

def save_model_response(user_id, data):
    try:
        # Validate user_id format
        if not ObjectId.is_valid(user_id):
            return {"status": False, "message": "Invalid user ID format"}

        # Check if user exists
        user = db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            return {"status": False, "message": "User not found"}

        # Insert the structured data into the 'assessment_results' collection.
        insert_result = db.assessment_results_collection.insert_one(data)
        print(f"✅ Inserted document ID: {insert_result.inserted_id}")

        # Optionally, update the user record to reflect that a diagnosis has been made.
        db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"isDiagnosed": True}}
        )

        return {"status": True, "message": "Model response saved successfully", "inserted_id": str(insert_result.inserted_id)}


    except Exception as e:
        print(f"Error in save_model_response: {str(e)}")
        return {"status": False, "message": f"Error saving model response: {str(e)}"}