import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import FloatingCamera from './FloatingCamera';
import DysgraphiaAssessment from './DysgraphiaAssessment';


const ThreeScene = ({ containerId, modelPath }) => {
  const mountRef = useRef(null);
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const cameraPosition = useRef({ x: 0, y: 0, z: 5 });
 
  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(cameraPosition.current.x, cameraPosition.current.y, cameraPosition.current.z);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(2, 2, 5);
    scene.add(directionalLight);

    // Load 3D model using GLTFLoader
    const loader = new GLTFLoader();
    loader.load(modelPath, (gltf) => {
      const model = gltf.scene;
      scene.add(model);
    });

    const handleMouseDown = (e) => {
      isDragging.current = true;
      previousMousePosition.current = {
        x: e.clientX,
        y: e.clientY,
      };
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

      camera.position.x = cameraPosition.current.x * Math.cos(deltaMove.x * rotationSpeed) 
                         - cameraPosition.current.z * Math.sin(deltaMove.x * rotationSpeed);
      camera.position.z = cameraPosition.current.x * Math.sin(deltaMove.x * rotationSpeed) 
                         + cameraPosition.current.z * Math.cos(deltaMove.x * rotationSpeed);

      camera.position.y += deltaMove.y * rotationSpeed;
      camera.lookAt(scene.position);

      previousMousePosition.current = {
        x: e.clientX,
        y: e.clientY,
      };
    };

    const handleWheel = (e) => {
      const zoomSpeed = 0.1;
      camera.position.z = Math.max(2, Math.min(10, camera.position.z + (e.deltaY * zoomSpeed * 0.01)));
    };

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('wheel', handleWheel);

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);


    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      renderer.domElement.removeEventListener('mouseup', handleMouseUp);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('wheel', handleWheel);
      container.removeChild(renderer.domElement);
    };
  }, [containerId, modelPath]);

  return <div ref={mountRef} className="w-full h-full" />;
};

const ThreeViewer = () => {
  const [subtitle, setSubtitle] = useState('Ready to view 3D models!');
  const modelPath = 'models/face.glb'; // Adjust path to your `.glb` model file

  return (
    <div className="flex flex-col w-full h-screen p-4 gap-4">
    <div className="flex gap-4 h-3/4">
      <div className="w-1/2 bg-white rounded-lg shadow-md p-4 overflow-auto">
        <DysgraphiaAssessment  />
      </div>

      <div className="w-1/2 bg-white rounded-lg shadow-md p-4">
        <ThreeScene containerId="viewer2" modelPath={modelPath} />
      </div>
    </div>

    <div className="w-full bg-white rounded-lg shadow-md p-4">
      <h3 className="font-semibold mb-2">Assessment Guidance</h3>
      <div className="text-sm text-gray-600">
        {subtitle}
      </div>
    </div>
    {/* <FloatingCamera /> */}
  </div>
  );
};

export default ThreeViewer;
