import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Stethoscope, Loader2, AlertCircle, Book } from 'lucide-react';

const DiagnosisFlow = ({ isDiagnosed }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const checkUser = () => {
      const storedUserId = localStorage.getItem('userId');
      if (!storedUserId) {
        navigate('/login', { replace: true });
        return;
      }
      setUserId(storedUserId);
      setIsInitialized(true);
    };

    checkUser();
  }, [navigate]);

  const handleStartDiagnosis = async () => {
    console.log('Starting diagnosis...');
    
    if (!userId) {
      setError('User ID not found. Please log in again.');
      navigate('/login', { replace: true });
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/checkassessed/${userId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch user data');
      }

      if (data.isAssessed) {
        navigate('/LD_identification', { replace: true });
      } else {
        navigate('/diagnosing', { replace: true });
      }
    } catch (err) {
      console.error('Diagnosis error:', err);
      setError(err.message || 'An error occurred while starting the diagnosis');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-blue-600 font-medium">Initializing your experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl w-full mx-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left side - illustration/info section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col justify-center items-center text-center order-2 md:order-1">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            {isDiagnosed ? (
              <Book className="w-12 h-12 text-blue-600" />
            ) : (
              <Stethoscope className="w-12 h-12 text-green-600" />
            )}
          </div>
          
          <h3 className="text-xl font-semibold mb-4">
            {isDiagnosed ? 'Your Learning Journey' : 'Why Take a Diagnosis?'}
          </h3>
          
          <div className="space-y-4 text-gray-600">
            {isDiagnosed ? (
              <>
                <p>Your personalized learning path is designed based on your unique needs and strengths.</p>
                <p>Track your progress, complete activities, and improve your skills at your own pace.</p>
              </>
            ) : (
              <>
                <p>Our quick assessment helps identify your specific learning style and needs.</p>
                <p>You'll receive a customized learning path designed specifically for you.</p>
                <p className="font-medium text-green-600">Takes only about 15 minutes to complete!</p>
              </>
            )}
          </div>
        </div>
        
        {/* Right side - action card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col justify-center order-1 md:order-2 border-t-4 border-blue-600">
          {error && (
            <div className="flex items-center gap-2 p-4 mb-6 text-sm rounded-lg bg-red-50 text-red-600 border border-red-200">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {isDiagnosed ? 'Welcome Back!' : 'Get Started Today'}
          </h2>
          
          <p className="text-lg text-gray-600 mb-8">
            {isDiagnosed 
              ? 'Continue your personalized learning journey where you left off.'
              : 'Take a quick diagnosis to create your personalized learning path.'}
          </p>

          {isDiagnosed ? (
            <button 
              onClick={() => navigate('/learning-path')}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-lg font-medium"
            >
              <span>Continue Learning</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button 
              className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-white text-lg font-medium
                ${isLoading 
                  ? 'bg-green-500 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'}`}
              onClick={handleStartDiagnosis}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Stethoscope className="w-5 h-5" />
              )}
              <span>{isLoading ? 'Starting...' : 'Start Diagnosis'}</span>
            </button>
          )}
          
          <div className="mt-6 text-center">
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                navigate('/help');
              }}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Need help? Learn more about the process
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosisFlow;