import cv2
import numpy as np
from flask import Blueprint, request, jsonify
import mediapipe as mp
import torch
from PIL import Image
from app.Model.EmotionDetection.model import pth_backbone_model, pth_LSTM_model
from app.Model.EmotionDetection.utlis import pth_processing, norm_coordinates, get_box
from app.Helpers.userHelper import check_diagnosed,HistoryAssesment # Adjust import as per project structure

bp_user = Blueprint('user', __name__)
mp_face_mesh = mp.solutions.face_mesh
DICT_EMO = {0: 'Neutral', 1: 'Happiness', 2: 'Sadness', 3: 'Surprise', 4: 'Fear', 5: 'Disgust', 6: 'Anger'}

@bp_user.route('/users/checkdiagnosed/<user_id>', methods=['GET'])
def check_diagnosed_route(user_id):
    try:
        response = check_diagnosed(user_id)
        return jsonify(response)
    except Exception as e:
        return jsonify({"message": "Server error"}), 500

@bp_user.route('/users/facedetection', methods=['POST'])
def face_detection_route():
    try:
        file = request.files['image']
        npimg = np.frombuffer(file.read(), np.uint8)
        img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        h, w, _ = img.shape

        with mp_face_mesh.FaceMesh(
            max_num_faces=1,
            refine_landmarks=False,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5) as face_mesh:

            results = face_mesh.process(img_rgb)
            if results.multi_face_landmarks:
                for fl in results.multi_face_landmarks:
                    startX, startY, endX, endY = get_box(fl, w, h)
                    cur_face = img_rgb[startY:endY, startX:endX]
                    cur_face = pth_processing(Image.fromarray(cur_face))
                    
                    # Log debugging info
                    print(f"Processed face region: {cur_face.size()}")
                    
                    features = torch.nn.functional.relu(
                        pth_backbone_model.extract_features(cur_face)
                    ).detach().numpy()

                    lstm_features = [features] * 10
                    lstm_f = torch.from_numpy(np.vstack(lstm_features))
                    lstm_f = torch.unsqueeze(lstm_f, 0)
                    
                    output = pth_LSTM_model(lstm_f).detach().numpy()
                    cl = np.argmax(output)
                    label = DICT_EMO[cl]

                    print(f"Emotion: {label}, Confidence: {output[0][cl]}")  # Debugging info
                    
                    return jsonify({
                        "emotion": label,
                        "confidence": float(output[0][cl]),
                        "box": [int(startX), int(startY), int(endX), int(endY)]
                    })
            else:
                return jsonify({"message": "No face detected"}), 400
    except Exception as e:
        print(f"Error in face_detection: {str(e)}")  # Log the error
        return jsonify({"message": "Server error"}), 500


@bp_user.route('/users/submitassesment', methods=['POST'])
def submit_assesment_route():
    try:
        data = request.get_json()
        response = HistoryAssesment(data)
        print(f"\n\n response : {response} ")
        return jsonify(response)
    except Exception as e:
        return jsonify({"message": "Server error"}), 500