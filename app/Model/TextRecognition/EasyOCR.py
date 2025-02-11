import easyocr
import cv2
import numpy as np

def recognize_text_from_image(image):
    npimg = np.frombuffer(image.read(), np.uint8)
    img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)
        
    # Initialize EasyOCR Reader for English (you can adjust languages as needed)
    reader = easyocr.Reader(['en'])
    # Run OCR on the image; detail=0 returns only the recognized text
    result = reader.readtext(img, detail=0)
    recognized_text = " ".join(result)
    return recognized_text