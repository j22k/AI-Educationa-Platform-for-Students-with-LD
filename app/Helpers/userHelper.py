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
   
    hashed_password = generate_password_hash(password)
    print(hashed_password)
    db.users.insert_one({"name": name, "email": email, "password": hashed_password, "isDiagnosed": False})
    return {"status": True, "message": "User created successfully"}
def login(username, password):
    user = db.users.find_one({"username": username})
    print(f"\n\n user : {user} ")
    if user and check_password_hash(user["password"], password):
        user_id = str(user["_id"])
        name = user.get("name", "Unknown")  # Retrieve the name from the user object
        return {"status": True, "message": "User logged in successfully", "userId": user_id, "name": name}
    else:
        return {"status": False, "message": "Invalid username or password"}
    
def check_diagnosed(user_id):
    user = db.users.find_one({"_id": ObjectId(user_id)})
    if user:
        return {"isDiagnosed": user.get("isDiagnosed", False)}
    else:
        return {"message": "User not found"}, 404