import React, { useState, useRef, useEffect } from 'react';
import { Camera, CheckCircle2, X } from 'lucide-react';

const CameraCapture = ({
    task,
    onImageCaptured,
    onNext,
    onClose
}) => {
    const [capturedImage, setCapturedImage] = useState(null);
    const [cameraError, setCameraError] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const storedUserId = localStorage.getItem('userId');
   

    const closeCamera = () => {
        // Stop video stream if active
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
        }

        // Call the onClose prop to update parent component
        if (onClose) {
            onClose();
        }
    };

    useEffect(() => {
        let stream = null;
        const startCamera = async () => {
            try {
                // Cancel any existing streams
                if (videoRef.current && videoRef.current.srcObject) {
                    const tracks = videoRef.current.srcObject.getTracks();
                    tracks.forEach(track => track.stop());
                }

                // Request new stream
                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 640 },
                        height: { ideal: 480 }
                    }
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;

                    // Use a promise to handle play
                    const playPromise = videoRef.current.play();

                    // Handle potential play() errors
                    if (playPromise !== undefined) {
                        playPromise.then(() => {
                            // Video playback started successfully
                        }).catch(error => {
                            console.error("Error playing video:", error);
                            setCameraError("Could not start camera. Please try again.");
                        });
                    }
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                setCameraError("Unable to access camera. Please check permissions.");
            }
        };

        // Delay camera start to ensure DOM is ready
        const timeoutId = setTimeout(startCamera, 100);

        // Cleanup function
        return () => {
            clearTimeout(timeoutId);
            if (stream) {
                const tracks = stream.getTracks();
                tracks.forEach(track => track.stop());
            }
        };
    }, []);

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;

        try {
            const context = canvasRef.current.getContext('2d');
            context.drawImage(videoRef.current, 0, 0, 640, 480);
            const imageDataUrl = canvasRef.current.toDataURL('image/jpeg');
            setCapturedImage(imageDataUrl);

            // Stop video stream
            const stream = videoRef.current.srcObject;
            if (stream) {
                const tracks = stream.getTracks();
                tracks.forEach(track => track.stop());
            }
        } catch (error) {
            console.error("Error capturing photo:", error);
            setCameraError("Failed to capture photo. Please try again.");
        }
    };
const submitImage = async () => {
    if (!capturedImage) return;

    try {
        // Show loading state
        setCameraError(null);

        // Convert base64 to blob
        const response = await fetch(capturedImage);
        const blob = await response.blob();
        const formData = new FormData();
        formData.append('image', blob, 'writing_sample.jpg');
        formData.append('task', task.title);
        formData.append('text', task.text);
        formData.append('user_id', storedUserId);

        const serverResponse = await fetch(`${process.env.REACT_APP_API_URL}/users/dysgraphia_image`, {
            method: 'POST',
            body: formData,
        });

        const result = await serverResponse.json();

        if (!serverResponse.ok) {
            throw new Error(result.message || 'Failed to upload image');
        }

        console.log('Upload successful:', result);

        // Callback to parent component
        onImageCaptured({
            image: capturedImage,
            task: task.title,
            response: result
        });

        // Move to next task
        onNext();
    } catch (error) {
        console.error("Error submitting image:", error);
        setCameraError(error.message || "Failed to submit image. Please try again.");
    }
};

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden relative">
                {/* Close button */}
                <button
                    onClick={closeCamera}
                    className="absolute top-2 right-2 z-10 bg-gray-100 hover:bg-gray-200 rounded-full p-2"
                >
                    <X className="w-5 h-5 text-gray-600" />
                </button>

                <div className="bg-blue-600 text-white p-4">
                    <h2 className="text-xl font-semibold">{task.title}</h2>
                    <p className="text-sm">{task.question}</p>
                </div>

                <div className="p-4">
                    {cameraError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                            {cameraError}
                        </div>
                    )}

                    {!capturedImage ? (
                        <div className="relative">
                            <video
                                ref={videoRef}
                                className="w-full rounded-lg bg-gray-200"
                                width="640"
                                height="480"
                                playsInline
                                muted
                            />
                            <button
                                onClick={capturePhoto}
                                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                            >
                                <Camera className="w-5 h-5" />
                                <span>Capture Photo</span>
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <img
                                src={capturedImage}
                                alt="Captured writing sample"
                                className="w-full rounded-lg shadow-md"
                            />
                            <div className="flex space-x-4">
                                <button
                                    onClick={() => setCapturedImage(null)}
                                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
                                >
                                    Retake
                                </button>
                                <button
                                    onClick={submitImage}
                                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
                                >
                                    <CheckCircle2 className="w-5 h-5" />
                                    <span>Submit</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Hidden Canvas for Photo Capture */}
            <canvas
                ref={canvasRef}
                style={{ display: 'none' }}
                width="640"
                height="480"
            />
        </div>
    );
};

export default CameraCapture;