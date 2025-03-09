from flask import Blueprint, request, jsonify
from app.Helpers.userHelper import login, signup  # Corrected import path

bp = Blueprint('main', __name__)

@bp.route('/login', methods=['POST'])
def login_route():
    try:
        data = request.get_json()
        print(f"\n\n data : {data} \n\n")
        email = data.get('email')
        password = data.get('password')
        print(f"\n\n email : {email} \n\n")
        response = login(email, password)
        return jsonify(response)
    except Exception as e:
        print(f"Error in login: {str(e)}")  # Log the error
        return jsonify({"message": "Server error"}), 500

@bp.route('/signup', methods=['POST'])
def signup_route():
    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        response = signup(name, email, password)
        return jsonify(response)
    except Exception as e:
        print(f"Error in signup: {str(e)}")  # Log the error
        return jsonify({"message": "Server error"}), 500