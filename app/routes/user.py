from flask import Blueprint, request, jsonify
from app.Helpers.userHelper import check_diagnosed  # Corrected import path

bp_user = Blueprint('user', __name__)

@bp_user.route('/users/checkdiagnosed/<user_id>', methods=['GET'])
def check_diagnosed_route(user_id):
    try:
        response = check_diagnosed(user_id)
        print(f"\n\n response : {response} ")
        return jsonify(response)
    except Exception as e:
        print(f"Error in check_diagnosed: {str(e)}")  # Log the error
        return jsonify({"message": "Server error"}), 500