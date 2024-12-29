import React, { useState,useEffect } from 'react';
import Sidebar from './sidebar';
import DiagnosisFlow from './DiagnosisFlow';

const LandingPage = () => {
  const [diagnosisStatus, setDiagnosisStatus] = useState();

  useEffect(() => {
    // Fetch user data from local storage or an API
    const userId = localStorage.getItem('userId');
    if (userId) {
      // Example fetch from local storage
console.log(localStorage);

      // Example fetch from an API
     // Ensure userId is defined and passed correctly
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
      <DiagnosisFlow isDiagnosed={diagnosisStatus} />
    </div>
  );
};

export default LandingPage;