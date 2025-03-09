import os
import cv2
import numpy as np
import torch
import base64
import tempfile
import speech_recognition as sr
import mediapipe as mp
from flask import Blueprint, request, jsonify, current_app
from PIL import Image
from datetime import datetime
from werkzeug.utils import secure_filename
from difflib import SequenceMatcher
import base64
import tempfile
import subprocess
import speech_recognition as sr
from flask import Blueprint, request, jsonify
from datetime import datetime
from werkzeug.utils import secure_filename


# Import project-specific modules
from app.Model.EmotionDetection.model import pth_backbone_model, pth_LSTM_model
from app.Model.EmotionDetection.utlis import pth_processing, norm_coordinates, get_box
from app.Model.TextRecognition.EasyOCR import recognize_text_from_image  
from app.Helpers.userHelper import check_diagnosed, check_assessed, HistoryAssesment, add_dysgraphia_image_data  

# Initialize Flask Blueprint
bp_user = Blueprint('user', __name__)

# Configure Upload Folder
UPLOAD_FOLDER = 'static/uploads/audio'
ALLOWED_EXTENSIONS = {'wav', 'mp3', 'webm'}

# Create upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Helper function to check file format
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Initialize Face Mesh
mp_face_mesh = mp.solutions.face_mesh
DICT_EMO = {0: 'Neutral', 1: 'Happiness', 2: 'Sadness', 3: 'Surprise', 4: 'Fear', 5: 'Disgust', 6: 'Anger'}

emotion_history = []  # Fixed typo from `emotion_hitsory`

### 📌 **Face Detection Route**
@bp_user.route('/users/facedetection', methods=['POST'])
def face_detection_route(): 
    try:
        if 'image' not in request.files:
            return jsonify({"message": "No image file provided"}), 400

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

                    features = torch.nn.functional.relu(
                        pth_backbone_model.extract_features(cur_face)
                    ).detach().numpy()

                    lstm_features = [features] * 10
                    lstm_f = torch.from_numpy(np.vstack(lstm_features))
                    lstm_f = torch.unsqueeze(lstm_f, 0)

                    output = pth_LSTM_model(lstm_f).detach().numpy()
                    cl = np.argmax(output)
                    label = DICT_EMO[cl]

                    emotion_history.append(label)
                    return jsonify({
                        "emotion": label,
                        "confidence": float(output[0][cl]),
                        "box": [int(startX), int(startY), int(endX), int(endY)]
                    })
            else:
                return jsonify({"message": "No face detected"}), 400
    except Exception as e:
        return jsonify({"message": f"Server error: {str(e)}"}), 500

### 📌 **Check Diagnosis Routes**
@bp_user.route('/users/checkdiagnosed/<user_id>', methods=['GET'])
def check_diagnosed_route(user_id):
    try:
        response = check_diagnosed(user_id)
        return jsonify(response)
    except Exception as e:
        return jsonify({"message": "Server error"}), 500

@bp_user.route('/users/checkassessed/<user_id>', methods=['GET'])
def check_assessed_route(user_id):
    try:
        response = check_assessed(user_id)
        return jsonify(response)
    except Exception as e:
        return jsonify({"message": "Server error", "isAssessed": False}), 500

### 📌 **Dysgraphia Image Processing**
@bp_user.route('/users/dysgraphia_image', methods=['POST'])
def dysgraphia_image():
    try:
        if 'image' not in request.files:
            return jsonify({'status': 'error', 'message': 'No image file provided'}), 400

        image = request.files['image']
        task = request.form.get('task')
        text = request.form.get('text')
        user_id = request.form.get('user_id')

        if not image or not task:
            return jsonify({'status': 'error', 'message': 'Missing required fields'}), 400

        recognized_text = recognize_text_from_image(image)

        writing_data = {
            "writingTasks": [
                {
                    "task": task,
                    "originalText": text,
                    "recognizedText": recognized_text,
                    "timestamp": datetime.now().isoformat()
                }
            ]
        }

        response = add_dysgraphia_image_data(writing_data, user_id)

        return jsonify({
            'status': 'success',
            'message': 'Image processed successfully',
            'task': task,
            'recognized_text': recognized_text
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500



# Configure upload folder and allowed extensions
UPLOAD_FOLDER = 'static/uploads/audio'
ALLOWED_EXTENSIONS = {'wav', 'mp3', 'webm'}

# Create upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Check if file has a valid extension
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Convert WEBM to WAV using FFmpeg
def convert_to_wav(input_path, output_path):
    if not os.path.exists(input_path):
        print(f"❌ Error: Input file not found at {input_path}")
        return False

    ffmpeg_path = "C:/ffmpeg/bin/ffmpeg.exe"  # 🔹 Update this with your FFmpeg path
    command = [
        ffmpeg_path, "-y", "-i", input_path, "-acodec", "pcm_s16le",
        "-ar", "16000", "-ac", "1", output_path
    ]

    try:
        subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
        print("✅ Conversion successful!")
        return True
    except Exception as e:
        print(f"❌ Error converting file: {e}")
        return False


# Transcribe audio using Google Speech Recognition
def transcribe_audio(file_path):
    recognizer = sr.Recognizer()
    try:
        print(f"Transcribing audio file: {file_path}")
        with sr.AudioFile(file_path) as source:
            audio_data = recognizer.record(source)

        print("Sending audio to Google Speech Recognition...")
        text = recognizer.recognize_google(audio_data)
        print(f"\n\n\n Transcription successful: {text}")
        print(f"\n\n\n Emotion History: {emotion_history}")
        return text
    except sr.UnknownValueError:
        return "Google Speech Recognition could not understand the audio."
    except sr.RequestError as e:
        return f"Could not request results from Google Speech Recognition service; {e}"
    except Exception as e:
        return f"Error transcribing audio: {str(e)}"

# API Route for processing audio
@bp_user.route('/users/dyslexia_audio', methods=['POST'])
def process_audio():
    print("✅ Received request to /users/dyslexia_audio")

    # Log request content type
    print(f"Request Content-Type: {request.content_type}")

    if 'audio' not in request.files:
        print("❌ No 'audio' file found in request!")
        return jsonify({'error': 'No audio file provided'}), 400

    audio_file = request.files['audio']
    sentence = request.form.get('sentence', '')

    print(f"✅ Received filename: {audio_file.filename}, Type: {audio_file.content_type}")

    if audio_file.filename == '':
        print("❌ Received an empty filename!")
        return jsonify({'error': 'No audio file selected'}), 400

    if allowed_file(audio_file.filename):
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = secure_filename(f"{timestamp}_{audio_file.filename}")
        file_path = os.path.join(UPLOAD_FOLDER, filename)

        # Save the uploaded file
        audio_file.save(file_path)
        print(f"✅ File saved at: {file_path}")

        # If file is WEBM, convert to WAV
        if file_path.endswith('.webm'):
            converted_path = file_path.replace(".webm", ".wav")
            print("🔄 Converting WEBM to WAV...")
            if convert_to_wav(file_path, converted_path):
                file_path = converted_path
            else:
                return jsonify({'error': 'Failed to convert WebM to WAV'}), 500

        # Transcribe the audio
        transcription = transcribe_audio(file_path)

        return jsonify({
            'success': True,
            'filename': filename,
            'file_path': file_path,
            'transcription': transcription,
            'expected': sentence
        })

    print("❌ Invalid file format")
    return jsonify({'error': 'Invalid file format'}), 400
