import React from 'react';
import { ArrowRight, Stethoscope } from 'lucide-react';

let DiagnosisFlow = ({ isDiagnosed }) => {
  console.log(isDiagnosed);
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isDiagnosed ? 'Welcome Back!' : 'Get Started'}
          </h2>
          
          <p className="text-gray-600">
            {isDiagnosed 
              ? 'Continue your personalized learning journey'
              : 'Take a quick diagnosis to create your learning path'}
          </p>

          {isDiagnosed ? (
            <button className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              <span>Continue Learning</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
              <Stethoscope className="w-5 h-5" />
              <span>Start Diagnosis</span>
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