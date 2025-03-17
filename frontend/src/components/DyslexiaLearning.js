import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import FloatingCamera from './FloatingCamera';
import DyslexiaAssessment from './DyslexiaAssessment';

const ThreeScene = ({ containerId, modelPath }) => {
  const mountRef = useRef(null);
  const mixerRef = useRef(null); // Reference to store the AnimationMixer
  const [rlState, setRlState] = useState({
    currentState: '',
    action: '',
    emotionCounts: {},
    lastTenEmotions: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add new useEffect for RL agent interaction
  useEffect(() => {
    const fetchRLAction = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users/rl_action`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setRlState({
          currentState: data.state,
          action: data.action,
          emotionCounts: data.emotion_counts,
          lastTenEmotions: data.last_ten_emotions
        });

        // Apply adaptive changes based on RL action
        handleRLAction(data.action);

      } catch (error) {
        setError(error.message);
        console.error('Error fetching RL action:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Poll every 10 seconds
    const intervalId = setInterval(fetchRLAction, 10000);
    return () => clearInterval(intervalId);
  }, []);

  // Function to handle RL actions
  const handleRLAction = (action) => {
    if (!mountRef.current) return;

    switch (action) {
      case 'Slow down pace':
        // Adjust animation speed
        if (mixerRef.current) {
          mixerRef.current.timeScale = 0.5;
        }
        break;
      case 'Repeat lesson':
        // Reset animation to beginning
        if (mixerRef.current) {
          mixerRef.current.setTime(0);
        }
        break;
      case 'Provide encouragement':
        // Could trigger a visual feedback or helper overlay
        // Implementation depends on your UI requirements
        break;
      case 'Offer additional hint':
        // Could show additional visual guides or helpers
        break;
      case 'Proceed normally':
        // Reset any modifications
        if (mixerRef.current) {
          mixerRef.current.timeScale = 1.0;
        }
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  useEffect(() => {
    if (!mountRef.current) return;

    // Set up Scene, Camera, and Renderer
    const container = mountRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0.5, 0.5, 2);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(2, 2, 5);
    scene.add(directionalLight);

    // Clock for updating animations
    const clock = new THREE.Clock();

    // Load the 3D model using GLTFLoader
    const loader = new GLTFLoader();
    loader.load(modelPath, (gltf) => {
      const model = gltf.scene;

      // Compute bounding box to center the model
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);

      scene.add(model);

      // Set up animation mixer if there are animations
      if (gltf.animations && gltf.animations.length > 0) {
        const mixer = new THREE.AnimationMixer(model);
        // Play the first animation clip (you can choose others as needed)
        const action = mixer.clipAction(gltf.animations[0]);
        action.play();
        mixerRef.current = mixer;
      }
    });

    // Mouse Interaction for camera rotation (if needed)
    const isDragging = { current: false };
    const previousMousePosition = { current: { x: 0, y: 0 } };

    const handleMouseDown = (e) => {
      isDragging.current = true;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    const handleMouseMove = (e) => {
      if (!isDragging.current) return;

      const deltaMove = {
        x: e.clientX - previousMousePosition.current.x,
        y: e.clientY - previousMousePosition.current.y,
      };

      const rotationSpeed = 0.005;

      camera.position.x = 0.5 * Math.cos(deltaMove.x * rotationSpeed)
                         - 2 * Math.sin(deltaMove.x * rotationSpeed);
      camera.position.z = 0.5 * Math.sin(deltaMove.x * rotationSpeed)
                         + 2 * Math.cos(deltaMove.x * rotationSpeed);

      camera.lookAt(scene.position);
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    const animate = () => {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();
      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup on unmount
    return () => {
      container.removeChild(renderer.domElement);
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mousemove', handleMouseMove);
    };
  }, [modelPath]);

  return (
    <div>
      <div id={containerId} ref={mountRef} style={{ width: '100%', height: '100vh' }} />
      {isLoading && <div className="loading-overlay">Loading...</div>}
      {error && <div className="error-message">{error}</div>}
      {rlState.action && (
        <div className="rl-status">
          <p>Current Emotional State: {rlState.currentState}</p>
          <p>Adaptive Action: {rlState.action}</p>
        </div>
      )}
    </div>
  );
};

const ThreeViewer = () => {
  const [subtitle, setSubtitle] = useState('Ready to view 3D models!');
  const modelPath = 'models/646d9dcdc8a5f5bddbfac913.glb'; // Adjust path to your `.glb` model file

  return (
    <div className="flex flex-col w-full h-screen p-4 gap-4">
      <div className="flex gap-4 h-3/4">
        <div className="w-1/2 bg-white rounded-lg shadow-md p-4 overflow-auto">
          <DyslexiaAssessment />
        </div>

        <div className="w-1/2 bg-white rounded-lg shadow-md p-4">
          <ThreeScene containerId="viewer2" modelPath={modelPath} />
        </div>
      </div>
      <FloatingCamera />
    </div>
  );
};

export default ThreeViewer;
