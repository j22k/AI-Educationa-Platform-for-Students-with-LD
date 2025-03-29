import React, { useState, useEffect } from 'react';
import Sidebar from './sidebar';
import DiagnosisFlow from './DiagnosisFlow';
import AssesmentResult from './AssesmentResult';

const LandingPage = () => {
  const [diagnosisStatus, setDiagnosisStatus] = useState(null); // Ensure it starts as null to handle loading state

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    console.log('User ID:', userId);
    
    if (userId) {
      fetch(`${process.env.REACT_APP_API_URL}/users/checkdiagnosed/${userId}`)
        .then(response => response.json())
        .then(data => {
          console.log(data);
          setDiagnosisStatus(data.isDiagnosed);
        })
        .catch(error => console.error('Error fetching user data:', error));
    }
  }, []);

  return (
    <div>
      <Sidebar />
      {diagnosisStatus === null ? (
        <p>Loading...</p> // Show loading message while waiting for the API response
      ) : diagnosisStatus ? (
        <AssesmentResult />
      ) : (
        <DiagnosisFlow isDiagnosed={diagnosisStatus} />
      )}
    </div>
  );
};

export default LandingPage;
