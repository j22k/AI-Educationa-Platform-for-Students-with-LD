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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="max-w-6xl w-full flex flex-row gap-8">
        {/* Left side - Informational content */}
        <div className="hidden md:block w-1/3 bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Learning Profile Analysis</h2>
            <p className="text-gray-700 mb-6">
              Our AI is analyzing your data to create a personalized learning experience tailored to your unique needs.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="text-indigo-600" size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Personalized Learning</h3>
                  <p className="text-gray-600 text-sm">Unique strategies based on your learning patterns</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="text-indigo-600" size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Adaptive Approach</h3>
                  <p className="text-gray-600 text-sm">Supports diverse learning styles and needs</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="text-indigo-600" size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Comprehensive Analysis</h3>
                  <p className="text-gray-600 text-sm">Insights for autism, dyslexia, dysgraphia, and dyscalculia</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
            <p className="text-sm text-indigo-700">
              This assessment helps us create tailored learning experiences for students with diverse learning needs.
            </p>
          </div>
        </div>
        
        {/* Right side - Progress tracking */}
        <div className="w-full md:w-2/3 bg-white rounded-xl shadow-lg p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 h-1 bg-indigo-100 w-full">
            <div 
              className="h-full bg-indigo-600 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="text-center mb-8 mt-4">
            <h1 className="text-3xl font-bold text-gray-800">Analyzing Learning Profile</h1>
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
                className="mt-4 bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors"
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {steps.map((step, index) => (
              <div 
                key={step.id} 
                className={`flex items-center p-4 rounded-lg transition-all duration-300 ${
                  index === currentStep ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'border border-gray-100'
                }`}
              >
                {step.completed ? (
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3 flex-shrink-0">
                    <CheckCircle className="text-green-500" size={18} />
                  </div>
                ) : (
                  <div className={`w-8 h-8 rounded-full ${index === currentStep ? 'bg-indigo-100' : 'bg-gray-100'} flex items-center justify-center mr-3 flex-shrink-0 ${index === currentStep && isProcessing ? 'animate-spin' : ''}`}>
                    <Loader className={`${index === currentStep ? 'text-indigo-600' : 'text-gray-300'}`} size={18} />
                  </div>
                )}
                <div>
                  <span className={`block ${
                    step.completed ? 'text-gray-700' : 
                    index === currentStep ? 'text-indigo-700 font-medium' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                  {index === LEARNING_PATTERNS_STEP_INDEX && currentStep === LEARNING_PATTERNS_STEP_INDEX && !isProcessing && !error && (
                    <span className="text-xs text-indigo-500">Contacting server...</span>
                  )}
                </div>
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
      </div>
    </div>
  );
};

export default LoadingAssessmentPage;