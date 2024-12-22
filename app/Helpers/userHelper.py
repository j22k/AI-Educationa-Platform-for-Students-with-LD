from pymongo import MongoClient
from app.Config.config import Config
from werkzeug.security import generate_password_hash, check_password_hash

# Initialize MongoDB client
client = MongoClient(Config.MONGO_URI)
db = client[Config.MONGO_DBNAME]

def user_exists(username):
    return db.users.find_one({"username": username}) is not None

def signup(name, email, password):
    if user_exists(name):
        return {"status": "failure", "message": "User already exists"}
    
    hashed_password = generate_password_hash(password)
    print(hashed_password)
    db.users.insert_one({"name": name, "email": email, "password": hashed_password})
    return {"status": "success", "message": "User created successfully"}

def login(username, password):
    user = db.users.find_one({"username": username})
    if user and check_password_hash(user["password"], password):
        return {"status": "success", "message": "Login successful"}
    else:
        return {"status": "failure", "message": "Invalid username or password"}