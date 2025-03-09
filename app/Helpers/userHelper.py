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