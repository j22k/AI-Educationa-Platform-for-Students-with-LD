import React, { useState, useRef, useEffect } from 'react';
import { Camera, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CameraCapture from './CameraCapture';

const useAutoSpeech = (texts, delayBetween = 3000) => {
  const [selectedVoice, setSelectedVoice] = useState(null);
  
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      const englishVoices = availableVoices.filter(voice => voice.lang.startsWith('en'));
      // Select the first English voice as default
      if (englishVoices.length > 0) {
        setSelectedVoice(englishVoices[0]);
      }
    };

    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    if (selectedVoice && texts.length > 0) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      // Speak each text with delay using the same voice
      texts.forEach((text, index) => {
        setTimeout(() => {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.voice = selectedVoice;
          utterance.rate = 0.9;
          utterance.pitch = 1.0;
          window.speechSynthesis.speak(utterance);
        }, index * delayBetween);
      });
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [texts, selectedVoice, delayBetween]);
};

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
  const navigate = useNavigate(); // Initialize useNavigate

  const currentTask = dysgraphiaTasks[currentTaskIndex];
  const taskText = `${currentTask.question} ${currentTask.text}`;
  const instructionText = "Write the task on paper and capture using camera ";

  // Setup auto-speech for current task
  useAutoSpeech([
    `Task ${currentTaskIndex + 1}: ${currentTask.title}`,
    taskText,
    currentTask.purpose,
    instructionText
  ]);

  const handleImageCapture = () => {
    setIsCameraActive(true);
  };

  const handleCameraCapture = (imageData) => {
    setCapturedImages(prev => [...prev, imageData]);
    if (onImageCapture) {
      onImageCapture(imageData);
    }
  };

  const handleNext = () => {
    setIsCameraActive(false);
    if (currentTaskIndex < dysgraphiaTasks.length - 1) {
      const nextIndex = currentTaskIndex + 1;
      setCurrentTaskIndex(nextIndex);
      const nextTask = dysgraphiaTasks[nextIndex];
      onSubtitleChange?.(`Preparing for next task: ${nextTask.title}`);
    } else {
      onSubtitleChange?.("Assessment complete! Review your writing samples.");
      alert("Assessment complete!");
      navigate('/dyslexia_diagnosis');
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
        setCapturedImages(prev => [...prev, uploadedImage]);
        if (onImageCapture) {
          onImageCapture(uploadedImage);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full h-full flex flex-col space-y-4">
      {isCameraActive && (
        <CameraCapture 
          task={currentTask}
          onImageCaptured={handleCameraCapture}
          onNext={handleNext}
          onClose={() => setIsCameraActive(false)}
        />
      )}

      <div className="bg-blue-100 rounded-lg p-4">
        <div className="mb-2">
          <h2 className="text-xl font-semibold text-blue-800">
            {currentTask.title}
          </h2>
        </div>
        <div className="bg-white p-3 rounded-md shadow-sm">
          <p className="text-gray-700">{currentTask.question}</p>
          <p className="font-bold text-blue-600 mt-1">{currentTask.text}</p>
        </div>
        <div className="mt-2">
          <p className="text-sm text-gray-600 italic flex items-center">
            <Info className="w-4 h-4 mr-2" />
            {currentTask.purpose}
          </p>
        </div>
      </div>

      <div className="flex-grow flex flex-col justify-center">
        <div className="text-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-600 mb-4">
            {instructionText}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default DysgraphiaAssessment;