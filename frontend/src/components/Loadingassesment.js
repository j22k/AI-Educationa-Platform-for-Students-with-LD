import React, { useState, useEffect } from 'react';
import { Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LoadingAssessmentPage = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState(null);
  
  const assessmentSteps = [
    { id: 1, label: "Analyzing interaction patterns", completed: false },
    { id: 2, label: "Processing written responses", completed: false },
    { id: 3, label: "Evaluating emotional responses", completed: false },
    { id: 4, label: "Analyzing handwriting samples", completed: false },
    { id: 5, label: "Identifying learning patterns", completed: false },
    { id: 6, label: "Generating personalized learning profile", completed: false },
    { id: 7, label: "Preparing dashboard insights", completed: false }
  ];
  
  const [steps, setSteps] = useState(assessmentSteps);
  const LEARNING_PATTERNS_STEP_INDEX = 4; // Index of "Identifying learning patterns" step
  
  // Get userID from localStorage
  const userID = localStorage.getItem("userId") || "unknown_user";
  console.log(userID);
  
  // Function to make API request to the server
  const requestLearningAnalysis = async () => {
    try {
      setIsProcessing(false); // Pause the progress while waiting for server
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/ld_identification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userID }),
      });

      alert("Learning patterns analysis result:", response);
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log("Learning patterns analysis result:", result);
      
      // Resume progress after successful response
      setIsProcessing(true);
      return true;
    } catch (error) {
      console.error("Error analyzing learning patterns:", error);
      setError(`Failed to analyze learning patterns: ${error.message}. Please try again.`);
      return false;
    }
  };
  
  // Simulate the assessment process
  useEffect(() => {
    let interval;
    
    if (isProcessing) {
      interval = setInterval(async () => {
        if (progress < 100) {
          // Calculate step progress percentage (each step is approximately 14.3% of total)
          const stepPercentage = 100 / steps.length;
          const currentStepProgress = currentStep * stepPercentage;
          const nextStepThreshold = (currentStep + 1) * stepPercentage;
          
          // Slower progress increment for more realistic feeling
          const increment = 0.5 + Math.random() * 1.5;
          const newProgress = Math.min(progress + increment, nextStepThreshold);
          
          // Check if we're approaching the "Identifying learning patterns" step
          if (currentStep === LEARNING_PATTERNS_STEP_INDEX - 1 && 
              newProgress >= currentStepProgress + stepPercentage * 0.9) {
            // Move to the learning patterns step
            setProgress(currentStepProgress + stepPercentage);
            setCurrentStep(LEARNING_PATTERNS_STEP_INDEX);
            
            // Update steps
            const updatedSteps = [...steps];
            for (let i = 0; i <= LEARNING_PATTERNS_STEP_INDEX; i++) {
              updatedSteps[i].completed = i < LEARNING_PATTERNS_STEP_INDEX;
            }
            setSteps(updatedSteps);
            
            // Pause processing to make API request
            setIsProcessing(false);
            
            // Make API request
            const success = await requestLearningAnalysis();
            if (success) {
              // Mark the current step as completed
              updatedSteps[LEARNING_PATTERNS_STEP_INDEX].completed = true;
              setSteps(updatedSteps);
              setIsProcessing(true);
            }
          } else {
            setProgress(newProgress);
            
            // Check if we've reached a new step threshold
            const stepIndex = Math.floor((newProgress / 100) * steps.length);
            if (stepIndex !== currentStep && stepIndex < steps.length && 
                stepIndex !== LEARNING_PATTERNS_STEP_INDEX) {
              setCurrentStep(stepIndex);
              
              // Mark previous steps as completed
              const updatedSteps = [...steps];
              for (let i = 0; i <= stepIndex; i++) {
                updatedSteps[i].completed = true;
              }
              setSteps(updatedSteps);
            }
          }
        } else {
          clearInterval(interval);
          // Navigate to dashboard after a short delay
          setTimeout(() => {
            navigate('/dash');
          }, 1500);
        }
      }, 250);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [progress, currentStep, steps, isProcessing, navigate]);
  
  // Reset error and retry
  const handleRetry = () => {
    setError(null);
    setIsProcessing(true);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 h-1 bg-indigo-100 w-full">
          <div 
            className="h-full bg-indigo-600 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="text-center mb-8 mt-4">
          <h1 className="text-2xl font-bold text-gray-800">Analyzing Learning Profile</h1>
          <p className="text-gray-600 mt-2">
            Our AI is processing data to create personalized learning experiences
          </p>
        </div>
        
        {error ? (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="text-red-500 mr-2" size={20} />
              <p className="text-red-700">{error}</p>
            </div>
            <button 
              onClick={handleRetry} 
              className="mt-4 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Assessment Progress</span>
              <span className="text-sm font-medium text-indigo-600">{Math.round(progress)}%</span>
            </div>
            <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 transition-all duration-300 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div 
              key={step.id} 
              className={`flex items-center p-3 rounded-lg transition-all duration-300 ${
                index === currentStep ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''
              }`}
            >
              {step.completed ? (
                <CheckCircle className="text-green-500 mr-3 flex-shrink-0" size={20} />
              ) : (
                <div className={`mr-3 flex-shrink-0 ${index === currentStep && isProcessing ? 'animate-spin' : ''}`}>
                  <Loader className={`${index === currentStep ? 'text-indigo-600' : 'text-gray-300'}`} size={20} />
                </div>
              )}
              <span className={`${
                step.completed ? 'text-gray-700' : 
                index === currentStep ? 'text-indigo-700 font-medium' : 'text-gray-400'
              }`}>
                {step.label}
                {index === LEARNING_PATTERNS_STEP_INDEX && currentStep === LEARNING_PATTERNS_STEP_INDEX && !isProcessing && !error && (
                  <span className="ml-2 text-sm text-indigo-500">Contacting server...</span>
                )}
              </span>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-8 text-sm text-gray-500">
          {progress < 100 ? (
            <p>{isProcessing ? "Please wait while we analyze the data..." : "Connecting to server..."}</p>
          ) : (
            <p className="text-green-600 font-medium">Assessment complete! Redirecting to dashboard...</p>
          )}
        </div>
      </div>
      
      <div className="mt-6 text-center max-w-sm">
        <p className="text-gray-600 text-sm">
          This assessment helps us create a personalized learning experience for students with learning disabilities like autism, dyslexia, dysgraphia, and dyscalculia.
        </p>
      </div>
    </div>
  );
};

export default LoadingAssessmentPage;