import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import FloatingCamera from './FloatingCamera';

// Main Learning Page Component
const LearningAssistant = () => {
  const [currentLesson, setCurrentLesson] = useState({
    id: 1,
    title: 'Introduction to Reading',
    difficulty: 'Beginner',
    type: 'Dyslexia Support',
    content: 'Today we will practice recognizing letter shapes and sounds...'
  });
  
  const [studentState, setStudentState] = useState({
    emotion: 'neutral',
    engagementLevel: 'moderate',
    recentProgress: [70, 75, 72, 80, 85],
    adaptiveActions: [],
    currentDifficulty: 'standard'
  });
  
  const [activeSection, setActiveSection] = useState('lesson'); // 'lesson', 'practice', 'assessment'
  
  // Add new handwriting analysis state
  const [handwritingAnalysis, setHandwritingAnalysis] = useState({
    letterFormation: 'needs improvement',
    spacing: 'inconsistent',
    pressure: 'heavy', 
    recommendations: ['Practice letter b/d differentiation', 'Use guiding lines']
  });
  
  // Track diagnosis results
  const [diagnosisResults, setDiagnosisResults] = useState({
    dyslexia: { probability: 0.75, confidence: 'high' },
    dyscalculia: { probability: 0.28, confidence: 'low' },
    dysgraphia: { probability: 0.65, confidence: 'medium' },
    attention: { probability: 0.45, confidence: 'medium' }
  });

  // New state for learning history
  const [learningHistory, setLearningHistory] = useState([
    { date: '2025-03-18', lessonId: 'L42', completionRate: 92, adaptationsMade: 3 },
    { date: '2025-03-19', lessonId: 'L43', completionRate: 85, adaptationsMade: 5 }
  ]);

  // Mock function for handling adaptive responses
  const handleAdaptiveAction = (action) => {
    // Update the student state with the new adaptive action
    setStudentState(prev => ({
      ...prev,
      adaptiveActions: [...prev.adaptiveActions.slice(-4), {
        action: action,
        timestamp: new Date().toLocaleTimeString()
      }]
    }));
    
    // Here you would implement the actual adaptations to the learning content
    console.log(`Applying adaptive action: ${action}`);
  };

  // Mock function to update student emotion from camera feed
  const updateStudentEmotion = (emotion) => {
    setStudentState(prev => ({ ...prev, emotion }));
    
    // Apply an adaptive action based on emotion
    if (emotion === 'frustrated') {
      handleAdaptiveAction('Slow down pace');
    } else if (emotion === 'confused') {
      handleAdaptiveAction('Offer additional hint');
    } else if (emotion === 'happy') {
      handleAdaptiveAction('Proceed normally');
    }
  };

  // Simulate emotion changes for demo
  useEffect(() => {
    const emotions = ['neutral', 'engaged', 'confused', 'engaged', 'happy'];
    let index = 0;
    
    const interval = setInterval(() => {
      updateStudentEmotion(emotions[index % emotions.length]);
      index++;
    }, 15000); // Change emotion every 15 seconds
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">AI Learning Assistant</h1>
          <div className="flex items-center space-x-4">
            <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">
              Student: Alex Johnson
            </span>
            <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">
              Focus Area: Reading Skills
            </span>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4">
        {/* Learning Environment - Two-Column Layout */}
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          {/* Avatar and Interaction Column */}
          <div className="lg:w-1/2 bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-4 bg-blue-50 border-b border-blue-100">
              <h2 className="text-xl font-semibold text-blue-800">Learning Companion</h2>
              <p className="text-sm text-blue-600">Your personalized AI assistant is here to help</p>
            </div>
            <FloatingCamera onEmotionDetected={updateStudentEmotion} />
            {/* 3D Avatar Viewer */}
            <AvatarViewer 
              emotion={studentState.emotion} 
              currentAction={studentState.adaptiveActions[studentState.adaptiveActions.length - 1]?.action}
            />
            
            {/* Camera Feed and Analysis */}
            <div className="p-4 border-t border-gray-200">
              <h3 className="font-medium text-gray-700 mb-2">Live Interaction</h3>
              <StudentCamera onEmotionDetected={updateStudentEmotion} />
            </div>
          </div>
          
          {/* Learning Content Column */}
          <div className="lg:w-1/2 bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-4 bg-purple-50 border-b border-purple-100">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-purple-800">{currentLesson.title}</h2>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  {currentLesson.type}
                </span>
              </div>
            </div>
            
            {/* Navigation Tabs */}
            <div className="flex border-b">
              <button 
                className={`px-4 py-2 ${activeSection === 'lesson' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-600'}`}
                onClick={() => setActiveSection('lesson')}
              >
                Lesson
              </button>
              <button 
                className={`px-4 py-2 ${activeSection === 'practice' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-600'}`}
                onClick={() => setActiveSection('practice')}
              >
                Practice
              </button>
              <button 
                className={`px-4 py-2 ${activeSection === 'assessment' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-600'}`}
                onClick={() => setActiveSection('assessment')}
              >
                Assessment
              </button>
            </div>
            
            {/* Content Area */}
            <div className="p-5 max-h-[600px] overflow-y-auto">
              {activeSection === 'lesson' && <LessonContent lesson={currentLesson} />}
              {activeSection === 'practice' && <PracticeActivities lessonType={currentLesson.type} />}
              {activeSection === 'assessment' && <AssessmentModule lessonType={currentLesson.type} />}
            </div>
          </div>
        </div>
        
        {/* Analytics and Status Section */}
        <div className="bg-white rounded-xl shadow-md p-5 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Learning Analytics & Adaptations</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Emotion and Engagement Tracking */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-700 mb-2">Current Student State</h3>
              <div className="flex items-center mb-3">
                <div className={`w-10 h-10 rounded-full mr-3 ${getEmotionBg(studentState.emotion)}`}></div>
                <div>
                  <p className="font-medium">{capitalize(studentState.emotion)}</p>
                  <p className="text-sm text-gray-500">Engagement: {capitalize(studentState.engagementLevel)}</p>
                </div>
              </div>
              
              <h4 className="text-sm font-medium text-gray-600 mt-4 mb-2">Emotion Trend</h4>
              <div className="flex h-6 rounded-md overflow-hidden">
                {['engaged', 'confused', 'neutral', 'happy', 'engaged'].map((emotion, i) => (
                  <div key={i} className={`flex-1 ${getEmotionBg(emotion)}`}></div>
                ))}
              </div>
            </div>
            
            {/* Adaptive Actions Log */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-700 mb-2">Recent Adaptations</h3>
              {studentState.adaptiveActions.length > 0 ? (
                <ul className="text-sm space-y-2">
                  {studentState.adaptiveActions.map((item, index) => (
                    <li key={index} className="pb-2 border-b border-gray-100 last:border-0 flex justify-between">
                      <span className={`px-2 py-0.5 rounded ${getActionClass(item.action)}`}>
                        {item.action}
                      </span>
                      <span className="text-gray-400 text-xs">{item.timestamp}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 italic text-sm">No adaptations yet</p>
              )}
            </div>
            
            {/* Learning Disability Analysis */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-700 mb-2">Learning Profile</h3>
              <div className="space-y-2">
                {Object.entries(diagnosisResults).map(([condition, data]) => (
                  <div key={condition} className="flex items-center">
                    <div className="w-24 text-sm">{capitalize(condition)}:</div>
                    <div className="flex-grow h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getConfidenceColor(data.confidence)}`}
                        style={{ width: `${data.probability * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              
              {handwritingAnalysis && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-1">Handwriting Analysis</h4>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>Formation: {capitalize(handwritingAnalysis.letterFormation)}</p>
                    <p>Spacing: {capitalize(handwritingAnalysis.spacing)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Recommended Adaptations */}
        <div className="bg-blue-50 rounded-xl shadow-sm p-5 border border-blue-100">
          <h2 className="text-lg font-semibold text-blue-800 mb-3">Recommended Learning Adaptations</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <RecommendationCard 
              title="Reading Support"
              description="Use larger font sizes and high contrast colors"
              actionText="Apply to lessons"
              area="dyslexia"
            />
            <RecommendationCard 
              title="Writing Assistance"
              description="Enable letter formation guides and simplified keyboard"
              actionText="Enable guides"
              area="dysgraphia"
            />
            <RecommendationCard 
              title="Attention Support"
              description="Break content into smaller, focused sections"
              actionText="Simplify content"
              area="attention"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

// Avatar Viewer Component
const AvatarViewer = ({ emotion, currentAction }) => {
  const mountRef = useRef(null);
  
  useEffect(() => {
    if (!mountRef.current) return;
    
    // Set up Three.js scene
    const container = mountRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8f9fa);
    
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.5, 3);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(2, 4, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2;
    
    // Load avatar model - in a real implementation, this would load your 3D model
    const loader = new GLTFLoader();
    
    // For demo purposes, creating a placeholder avatar
    const avatarGroup = new THREE.Group();
    
    // Simple avatar head (sphere)
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0xf5d0c5 })
    );
    head.position.y = 1.5;
    head.castShadow = true;
    avatarGroup.add(head);
    
    // Body (cylinder)
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.4, 1.2, 32),
      new THREE.MeshStandardMaterial({ color: 0x4466aa })
    );
    body.position.y = 0.6;
    body.castShadow = true;
    avatarGroup.add(body);
    
    // Add simple placeholder eyes
    const eyeGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
    
    const eyeLeft = new THREE.Mesh(eyeGeo, eyeMat);
    eyeLeft.position.set(-0.15, 1.55, 0.40);
    avatarGroup.add(eyeLeft);
    
    const eyeRight = new THREE.Mesh(eyeGeo, eyeMat);
    eyeRight.position.set(0.15, 1.55, 0.40);
    avatarGroup.add(eyeRight);
    
    // Add a mouth
    const smileCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.2, 1.3, 0.4),
      new THREE.Vector3(0, 1.25, 0.45),
      new THREE.Vector3(0.2, 1.3, 0.4)
    );
    
    const points = smileCurve.getPoints(50);
    const mouthGeo = new THREE.BufferGeometry().setFromPoints(points);
    const mouthMat = new THREE.LineBasicMaterial({ color: 0x333333 });
    const mouth = new THREE.Line(mouthGeo, mouthMat);
    avatarGroup.add(mouth);
    
    scene.add(avatarGroup);
    
    // Add a simple floor/ground
    const floorGeo = new THREE.PlaneGeometry(10, 10);
    const floorMat = new THREE.MeshStandardMaterial({ 
      color: 0xeeeeee,
      roughness: 0.8,
      metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor);
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      
      // Add subtle avatar animation
      avatarGroup.rotation.y = Math.sin(Date.now() * 0.001) * 0.3;
      
      renderer.render(scene, camera);
    };
    animate();
    
    // Handle resize
    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);
    
    // Update avatar based on emotion
    const updateAvatarEmotion = (emotion) => {
      // In a real implementation, you would change the avatar's expression
      // For this demo, we'll just log it
      console.log(`Avatar emotion updated to: ${emotion}`);
    };
    
    if (emotion) {
      updateAvatarEmotion(emotion);
    }
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);
  
  // Update avatar when emotion or action changes
  useEffect(() => {
    console.log(`Avatar should react to: ${emotion}, Action: ${currentAction}`);
    // In a real implementation, this would update the avatar's animation or expression
  }, [emotion, currentAction]);
  
  return (
    <div className="relative">
      <div 
        ref={mountRef} 
        className="w-full h-[400px]"
      />
      
      {/* Speech bubble for avatar */}
      <div className="absolute bottom-4 right-4 bg-white rounded-xl p-3 shadow-md max-w-[70%] border-2 border-blue-200">
        <p className="text-sm">
          {getAvatarSpeech(emotion, currentAction)}
        </p>
      </div>
      
      {/* Emotion indicator */}
      <div className="absolute top-4 left-4 px-3 py-1 bg-white rounded-full shadow text-sm">
        <span className={`inline-block w-3 h-3 rounded-full mr-2 ${getEmotionBg(emotion)}`}></span>
        Detecting: {capitalize(emotion)}
      </div>
      
      {/* Action indicator when adaptation happens */}
      {currentAction && (
        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full shadow text-sm ${getActionClass(currentAction)}`}>
          {currentAction}
        </div>
      )}
    </div>
  );
};

// Camera component for student monitoring
const StudentCamera = ({ onEmotionDetected }) => {
  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraPermission, setCameraPermission] = useState('pending');
  
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        setCameraPermission('granted');
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setCameraPermission('denied');
    }
  };
  
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);
  
  return (
    <div className="relative rounded-lg overflow-hidden border border-gray-200">
      {cameraPermission === 'pending' && (
        <div className="bg-gray-100 p-4 text-center rounded-lg">
          <p className="text-gray-700 mb-2">Camera access is needed for emotion detection</p>
          <button 
            onClick={startCamera}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Enable Camera
          </button>
        </div>
      )}
      
      {cameraPermission === 'denied' && (
        <div className="bg-red-50 p-4 text-center rounded-lg">
          <p className="text-red-700">Camera access was denied.</p>
          <p className="text-sm text-red-600 mt-1">Emotion detection requires camera access.</p>
        </div>
      )}
      
      {cameraActive && (
        <>
          <video 
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-[180px] object-cover"
          />
          <div className="absolute bottom-2 right-2 flex space-x-2">
            <button 
              onClick={stopCamera}
              className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 text-xs rounded">
            Analyzing emotions...
          </div>
        </>
      )}
    </div>
  );
};

// Lesson Content Component
const LessonContent = ({ lesson }) => {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-purple-50 rounded-lg">
        <h3 className="font-medium text-purple-800 mb-2">Learning Objectives</h3>
        <ul className="list-disc pl-5 text-purple-700 space-y-1">
          <li>Identify and distinguish similar-looking letters (b, d, p, q)</li>
          <li>Associate letters with their corresponding sounds</li>
          <li>Recognize common letter combinations</li>
        </ul>
      </div>
      
      <div className="space-y-4">
        <h3 className="font-medium text-gray-800">Letter Recognition</h3>
        
        <div className="flex justify-center space-x-8 my-6">
          {['b', 'd', 'p', 'q'].map(letter => (
            <div key={letter} className="text-center">
              <div className="text-6xl font-bold text-blue-600 bg-blue-50 w-24 h-24 flex items-center justify-center rounded-lg border-2 border-blue-200">
                {letter}
              </div>
              <p className="mt-2 text-gray-600">Letter "{letter}"</p>
            </div>
          ))}
        </div>
        
        <p className="text-gray-700 leading-relaxed">
          These letters can look similar, but each makes a different sound. Let's learn how to tell them apart:
        </p>
        
        <div className="grid grid-cols-2 gap-4 my-4">
          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
            <h4 className="font-medium text-yellow-800">The letter 'b'</h4>
            <p className="text-sm text-gray-600">Makes the /b/ sound as in "ball"</p>
            <div className="mt-2 p-2 bg-white rounded">
              <span className="text-4xl font-bold text-yellow-600">b</span>
              <span className="text-gray-500 ml-3">→ has its circle on the right</span>
            </div>
          </div>
          
          <div className="p-3 bg-green-50 rounded-lg border border-green-100">
            <h4 className="font-medium text-green-800">The letter 'd'</h4>
            <p className="text-sm text-gray-600">Makes the /d/ sound as in "dog"</p>
            <div className="mt-2 p-2 bg-white rounded">
              <span className="text-4xl font-bold text-green-600">d</span>
              <span className="text-gray-500 ml-3">→ has its circle on the left</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg mt-6">
        <h3 className="font-medium text-gray-800 mb-2">Let's Practice!</h3>
        <p className="text-gray-600">Try tracing these letters on your screen or paper:</p>
        
        <div className="flex justify-center my-4">
          <div className="p-4 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-8xl font-bold text-gray-300 tracking-wide">b d p q</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Practice Activities Component
const PracticeActivities = ({ lessonType }) => {
  return (
    <div className="space-y-6">
      <h3 className="font-medium text-gray-800">Practice Activities</h3>
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">Letter Recognition Game</h4>
        <p className="text-gray-600 mb-4">Click on the correct letter when you hear its sound.</p>
        
        <div className="grid grid-cols-2 gap-4">
          {['b', 'd', 'p', 'q'].map(letter => (
            <button 
              key={letter}
              className="bg-white p-6 rounded-lg shadow hover:bg-blue-100 transition"
            >
              <span className="text-5xl font-bold text-blue-600">{letter}</span>
            </button>
          ))}
        </div>
        
        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg">
          Play Sound
        </button>
      </div>
      
      <div className="bg-purple-50 p-4 rounded-lg">
        <h4 className="font-medium text-purple-800 mb-2">Word Building</h4>
        <p className="text-gray-600 mb-4">Drag the letters to build the word shown in the picture.</p>
        
        <div className="bg-white p-4 rounded-lg mb-4">
          <div className="flex justify-center mb-4">
            <div className="w-36 h-36 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">[Image of a dog]</span>
            </div>
          </div>
          
          <div className="flex justify-center space-x-2">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300"></div>
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300"></div>
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300"></div>
          </div>
        </div>
        
        <div className="flex justify-center space-x-3">
          {['o', 'd', 'g'].map(letter => (
            <div 
              key={letter}
              className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl font-bold text-purple-800 cursor-grab"
            >
              {letter}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Assessment Module Component
const AssessmentModule = ({ lessonType }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-gray-800">Assessment</h3>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
          Progress: 3/10
        </span>
      </div>
      
      <div className="bg-yellow-50 p-5 rounded-lg border border-yellow-100">
      <h4 className="font-medium text-yellow-800 mb-3">Question 3</h4>
        <p className="text-gray-700 mb-4">Which word begins with the letter 'b'?</p>
        
        <div className="grid grid-cols-2 gap-3">
          <button className="bg-white p-3 rounded-lg hover:bg-yellow-100 transition flex items-center border border-gray-200">
            <div className="w-12 h-12 bg-gray-100 rounded mr-3 flex items-center justify-center">
              <span className="text-gray-400">[img]</span>
            </div>
            <span className="font-medium">dog</span>
          </button>
          
          <button className="bg-white p-3 rounded-lg hover:bg-yellow-100 transition flex items-center border border-gray-200">
            <div className="w-12 h-12 bg-gray-100 rounded mr-3 flex items-center justify-center">
              <span className="text-gray-400">[img]</span>
            </div>
            <span className="font-medium">cat</span>
          </button>
          
          <button className="bg-white p-3 rounded-lg hover:bg-yellow-100 transition flex items-center border border-gray-200">
            <div className="w-12 h-12 bg-gray-100 rounded mr-3 flex items-center justify-center">
              <span className="text-gray-400">[img]</span>
            </div>
            <span className="font-medium">ball</span>
          </button>
          
          <button className="bg-white p-3 rounded-lg hover:bg-yellow-100 transition flex items-center border border-gray-200">
            <div className="w-12 h-12 bg-gray-100 rounded mr-3 flex items-center justify-center">
              <span className="text-gray-400">[img]</span>
            </div>
            <span className="font-medium">pen</span>
          </button>
        </div>
        
        <div className="flex justify-between mt-6">
          <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition">
            Previous
          </button>
          <button className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition">
            Next Question
          </button>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-700 mb-2">Assessment Progress</h4>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '30%' }}></div>
        </div>
        <div className="flex justify-between text-sm text-gray-500 mt-1">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
};

// Recommendation Card Component
const RecommendationCard = ({ title, description, actionText, area }) => {
  // Get appropriate styles based on learning area
  const getStyles = (area) => {
    switch (area) {
      case 'dyslexia':
        return {
          icon: '📖',
          color: 'text-blue-700',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          buttonBg: 'bg-blue-600 hover:bg-blue-700'
        };
      case 'dysgraphia':
        return {
          icon: '✏️',
          color: 'text-purple-700',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          buttonBg: 'bg-purple-600 hover:bg-purple-700'
        };
      case 'attention':
        return {
          icon: '🔍',
          color: 'text-green-700',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          buttonBg: 'bg-green-600 hover:bg-green-700'
        };
      default:
        return {
          icon: '🧠',
          color: 'text-gray-700',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          buttonBg: 'bg-gray-600 hover:bg-gray-700'
        };
    }
  };
  
  const styles = getStyles(area);
  
  return (
    <div className={`${styles.bgColor} rounded-lg p-4 border ${styles.borderColor}`}>
      <div className="flex items-start mb-3">
        <span className="text-2xl mr-2">{styles.icon}</span>
        <h3 className={`font-medium ${styles.color}`}>{title}</h3>
      </div>
      
      <p className="text-gray-600 text-sm mb-4">{description}</p>
      
      <button className={`w-full py-2 px-3 ${styles.buttonBg} text-white text-sm rounded-lg transition`}>
        {actionText}
      </button>
    </div>
  );
};

// Helper functions
const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const getEmotionBg = (emotion) => {
  switch (emotion) {
    case 'happy':
      return 'bg-green-400';
    case 'engaged':
      return 'bg-blue-400';
    case 'confused':
      return 'bg-yellow-400';
    case 'frustrated':
      return 'bg-red-400';
    default:
      return 'bg-gray-400';
  }
};

const getActionClass = (action) => {
  if (!action) return '';
  
  if (action.includes('Slow down')) {
    return 'bg-yellow-100 text-yellow-800';
  } else if (action.includes('hint')) {
    return 'bg-blue-100 text-blue-800';
  } else if (action.includes('Proceed')) {
    return 'bg-green-100 text-green-800';
  } else {
    return 'bg-gray-100 text-gray-800';
  }
};

const getConfidenceColor = (confidence) => {
  switch (confidence) {
    case 'high':
      return 'bg-red-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'low':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
};

const getAvatarSpeech = (emotion, action) => {
  if (emotion === 'confused' || emotion === 'frustrated') {
    return "I notice you might be having some difficulty. Would you like me to explain this differently?";
  } else if (emotion === 'happy') {
    return "You're doing great! Let's keep going with these exercises.";
  } else if (action && action.includes('hint')) {
    return "Here's a hint: Try looking at how the circle connects to the line in each letter.";
  } else {
    return "I'm here to help you with your reading practice. Let me know if you need assistance!";
  }
};

export default LearningAssistant;