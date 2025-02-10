import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';

const FloatingCamera = ({ onEmotionCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [result, setResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const startVideo = () => {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().catch(error => {
              console.error("Error playing video: ", error);
            });
          };
        })
        .catch(err => {
          console.error("Error accessing webcam: ", err);
        });
    };
    startVideo();

    const intervalId = setInterval(() => {
      handleCapture();
    }, 5000); // Capture frame every 5 seconds to reduce load

    return () => {
      clearInterval(intervalId);
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const captureImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg');
  };

  const handleCapture = async () => {
    const imageData = captureImage();
    const blob = await fetch(imageData).then(res => res.blob());
    const formData = new FormData();
    formData.append('image', blob, 'capture.jpg');

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/users/facedetection`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const emotion = response.data.emotion;
      setResult(emotion);
      
      // Capture emotion for parent component
      if (onEmotionCapture) {
        onEmotionCapture(emotion);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.current.x;
    const newY = e.clientY - dragStart.current.y;
    
    setPosition({
      x: newX,
      y: newY
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div 
      className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg overflow-hidden cursor-move"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        width: '320px',
        zIndex: 1000
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="p-2 bg-gray-100 flex justify-between items-center">
        <span className="text-sm font-medium">Live Camera</span>
      </div>
      <video 
        ref={videoRef} 
        className="w-full h-auto"
        style={{ pointerEvents: 'none' }}
      />
      <canvas 
        ref={canvasRef} 
        className="w-full h-auto absolute top-0 left-0"
      />
      {result && (
        <div className="p-2 text-sm">
          <p>Detected Emotion: {result}</p>
        </div>
      )}
    </div>
  );
};

export default FloatingCamera;