import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import FloatingCamera from './FloatingCamera';
import DysgraphiaAssessment from './DysgraphiaAssessment';

const ThreeScene = ({ containerId, modelPath }) => {
  const mountRef = useRef(null);
  const mixerRef = useRef(null); // Reference to store the AnimationMixer

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

    // Handle window resize
    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

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
      window.removeEventListener('resize', handleResize);
    };
  }, [modelPath]);

  return (
    <div id={containerId} ref={mountRef} style={{ width: '100%', height: '100%' }} />
  );
};

const ThreeViewer = () => {
  const [modelPath, setModelPath] = useState('models/646d9dcdc8a5f5bddbfac913.glb');
  const [isLoading, setIsLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const handleModelChange = (newPath) => {
    setIsLoading(true);
    setModelPath(newPath);
    // Reset loading after a short delay to simulate model loading
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="flex flex-col w-full h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-600 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold">Dysgraphia Assessment Suite</h1>
        <p className="text-sm opacity-80">Handwriting analysis and intervention tools</p>
      </header>
      
      {/* Main Content */}
      <div className="flex flex-col md:flex-row flex-1 p-4 gap-4 overflow-hidden">
        {/* Left Panel - Assessment */}
        <div className="w-full md:w-1/2 flex flex-col bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-green-50 p-3 border-b border-green-100">
            <h2 className="text-lg font-semibold text-green-800">Dysgraphia Assessment</h2>
          </div>
          <div className="flex-1 p-4 overflow-auto">
            <DysgraphiaAssessment />
          </div>
        </div>
        
        {/* Right Panel - 3D Viewer */}
        <div className="w-full md:w-1/2 flex flex-col bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-green-50 p-3 border-b border-green-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-green-800">Handwriting Model</h2>
            {isLoading && (
              <span className="text-sm text-green-600">Loading model...</span>
            )}
          </div>
          <div className="flex-1 relative">
            {/* Overlay loading indicator */}
            {isLoading && (
              <div className="absolute inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center z-10">
                <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <ThreeScene containerId="model-viewer" modelPath={modelPath} />
          </div>
          <div className="p-3 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-wrap gap-2 justify-between">
              <div className="flex gap-2">
                <button 
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  onClick={() => handleModelChange('models/646d9dcdc8a5f5bddbfac913.glb')}
                >
                  Standard Model
                </button>
                <button 
                  className="px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded hover:bg-gray-300"
                  onClick={() => handleModelChange('models/alternative-model.glb')}
                >
                  Alternative View
                </button>
              </div>
              <button
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                onClick={() => setShowCamera(!showCamera)}
              >
                {showCamera ? 'Hide Camera' : 'Show Camera'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating Camera Component */}
      {showCamera && (
        <div className="absolute bottom-4 right-4 z-20">
          <FloatingCamera />
        </div>
      )}
    </div>
  );
};

export default ThreeViewer;