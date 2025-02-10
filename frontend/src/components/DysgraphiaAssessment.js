import React, { useState, useRef } from 'react';
import { Camera, ArrowRight, Info, Upload } from 'lucide-react';
import CameraCapture from './CameraCapture';

const dysgraphiaTasks = [
  {
    type: 'pangram',
    title: 'Copy the Pangram',
    question: "Copy this sentence exactly:",
    text: "The quick brown fox jumps over the lazy dog.",
    purpose: "Assess letter formation and spacing across the entire alphabet"
  },
  {
    type: 'spelling',
    title: 'Spell a Complex Word',
    question: "Write the word:",
    text: "accommodation",
    purpose: "Evaluate letter sequencing and spelling accuracy"
  },
  {
    type: 'math',
    title: 'Basic Math Expression',
    question: "Solve and write: 7 + 8 =",
    text: "15",
    purpose: "Check numerical writing and clarity"
  },
  {
    type: 'sentence-copy',
    title: 'Copy a Sentence',
    question: "Copy this sentence exactly:",
    text: "Learning is fun when you try your best.",
    purpose: "Assess consistency in letter size and spacing"
  },
  {
    type: 'fill-blank',
    title: 'Complete the Sentence',
    question: "Complete: Birds can _____",
    text: "fly",
    purpose: "Evaluate word recall and writing ability"
  }
];

const DysgraphiaAssessment = ({ onSubtitleChange, onImageCapture }) => {
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [capturedImages, setCapturedImages] = useState([]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageCapture = () => {
    setIsCameraActive(true);
  };

  const handleCameraCapture = (imageData) => {
    // Add captured image to the list
    setCapturedImages(prev => [...prev, imageData]);
    
    // Trigger parent component's image capture callback if needed
    if (onImageCapture) {
      onImageCapture(imageData);
    }
  };

  const handleNext = () => {
    // First, close the camera
    setIsCameraActive(false);

    // Then proceed to next task
    if (currentTaskIndex < dysgraphiaTasks.length - 1) {
      const nextIndex = currentTaskIndex + 1;
      setCurrentTaskIndex(nextIndex);
      
      // Update subtitle for next task
      const nextTask = dysgraphiaTasks[nextIndex];
      onSubtitleChange(`Preparing for next task: ${nextTask.title}`);
    } else {
      onSubtitleChange("Assessment complete! Review your writing samples.");
      alert("Assessment complete!");
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const uploadedImage = {
          image: reader.result,
          task: dysgraphiaTasks[currentTaskIndex].title
        };
        
        // Add uploaded image to the list
        setCapturedImages(prev => [...prev, uploadedImage]);
        
        // Trigger parent component's image capture callback if needed
        if (onImageCapture) {
          onImageCapture(uploadedImage);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const currentTask = dysgraphiaTasks[currentTaskIndex];

  return (
    <div className="w-full h-full flex flex-col space-y-4">
      {/* Camera Capture Overlay */}
      {isCameraActive && (
        <CameraCapture 
          task={currentTask}
          onImageCaptured={handleCameraCapture}
          onNext={handleNext}
          onClose={() => setIsCameraActive(false)}
        />
      )}

      <div className="bg-blue-100 rounded-lg p-4">
        <h2 className="text-xl font-semibold text-blue-800 mb-2">
          {currentTask.title}
        </h2>
        <div className="bg-white p-3 rounded-md shadow-sm">
          <p className="text-gray-700">{currentTask.question}</p>
          <p className="font-bold text-blue-600 mt-1">{currentTask.text}</p>
        </div>
        <p className="text-sm text-gray-600 italic mt-2 flex items-center">
          <Info className="w-4 h-4 mr-2" />
          {currentTask.purpose}
        </p>
      </div>

      <div className="flex-grow flex flex-col justify-center">
        <div className="text-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-600 mb-4">
            Write the task on paper and capture using camera or upload an image
          </p>
          <div className="flex justify-center space-x-4">
            <button 
              onClick={handleImageCapture}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Camera className="w-5 h-5" />
              <span>Open Camera</span>
            </button>
            <input 
              type="file" 
              ref={fileInputRef}
              accept="image/*"
              className="hidden" 
              onChange={handleFileUpload}
            />
            <button 
              onClick={() => fileInputRef.current.click()}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center space-x-2"
            >
              <Upload className="w-5 h-5" />
              <span>Upload Image</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DysgraphiaAssessment;