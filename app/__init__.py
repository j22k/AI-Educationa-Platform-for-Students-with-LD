from flask import Flask
from pymongo import MongoClient
from flask_cors import CORS
from app.Config.config import Config  # Corrected import path
from .routes import main

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Initialize MongoDB client
    client = MongoClient(app.config['MONGO_URI'])
    db = client[app.config['MONGO_DBNAME']]

        # Test MongoDB connection
    try:
        # Attempt to list collections to verify connection
        db.list_collection_names()
        print("MongoDB connection successful")
    except Exception as e:
        print(f"MongoDB connection failed: {e}")

    CORS(app)  # Enable cross-origin requests
    
    # Register Blueprints
    app.register_blueprint(main.bp)
    # from .routes import main as main_blueprint
    # app.register_blueprint(main_blueprint)

    return app