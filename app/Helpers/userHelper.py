from pymongo import MongoClient
from app.Config.config import Config
from werkzeug.security import generate_password_hash, check_password_hash

# Initialize MongoDB client
client = MongoClient(Config.MONGO_URI)
db = client[Config.MONGO_DBNAME]

def user_exists(email):
    print("\n\n 1.1 \n\n")
    user = db.users.find_one({"email": email}) is not None
    print(f"\n\n user exist : {user} ")    
    return user

def signup(name, email, password):
    print("\n\n 1 \n\n")
    if user_exists(email):
        print("\n\n 2 \n\n")
        return {"status": False, "message": "User already exists"}
    print("\n\n 3 \n\n")
    hashed_password = generate_password_hash(password)
    print(hashed_password)
    db.users.insert_one({"name": name, "email": email, "password": hashed_password})
    return {"status": True, "message": "User created successfully"}

def login(username, password):
    user = db.users.find_one({"username": username})
    if user and check_password_hash(user["password"], password):
        return {"status": True, "message": "Login successful"}
    else:
        return {"status": False, "message": "Invalid username or password"}