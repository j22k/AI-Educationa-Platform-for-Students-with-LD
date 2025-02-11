import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Stethoscope, Loader2, AlertCircle } from 'lucide-react';

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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full mx-4 p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-4 text-sm rounded-lg bg-red-50 text-red-600 border border-red-200">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <h2 className="text-2xl font-bold text-gray-900">
            {isDiagnosed ? 'Welcome Back!' : 'Get Started'}
          </h2>
          
          <p className="text-gray-600">
            {isDiagnosed 
              ? 'Continue your personalized learning journey'
              : 'Take a quick diagnosis to create your learning path'}
          </p>

          {isDiagnosed ? (
            <button 
              onClick={() => navigate('/learning-path')}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span>Continue Learning</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button 
              className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-white
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
          
          <div className="text-sm text-gray-500">
            {isDiagnosed 
              ? 'Your learning path is personalized based on your diagnosis'
              : 'This will take approximately 15 minutes'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosisFlow;