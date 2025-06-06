import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import * as faceapi from 'face-api.js';

const FaceRegistration = () => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      console.log('Loading face-api models...');
      const MODEL_URL = '/models'; // Changed from '/node_modules/face-api.js/weights'
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
      ]).catch(error => {
        console.error('Error loading specific model:', error);
        throw error;
      });
      
      console.log('All models loaded successfully');
      setIsModelLoaded(true);
    } catch (error) {
      console.error('Error loading models:', error);
      toast.error('Error loading face recognition models. Please ensure model files are in the /public/models directory.');
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      toast.error('Error accessing camera. Please ensure you have granted camera permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      setIsCameraActive(false);
    }
  };

  const captureAndRegister = async () => {
    if (!videoRef.current || !isModelLoaded) return;

    setIsProcessing(true);
    try {
      const detection = await faceapi.detectSingleFace(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions()
      ).withFaceLandmarks().withFaceDescriptor();

      if (!detection) {
        toast.error('No face detected. Please position your face clearly in the frame and ensure good lighting.');
        setIsProcessing(false);
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);
      
      const imageData = canvas.toDataURL('image/jpeg');
      
      const response = await fetch('/api/face-recognition/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          imageData,
          faceDescriptor: Array.from(detection.descriptor)
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Face data registered successfully!');
        router.push('/user/profile'); // Changed from '/profile' to '/user/profile'
      } else {
        toast.error(data.message || 'Face registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Error processing face registration:', error);
      if (error.message.includes('model')) {
        toast.error('Face recognition models failed to load. Please refresh the page and try again.');
      } else if (error.message.includes('network')) {
        toast.error('Network error. Please check your internet connection and try again.');
      } else {
        toast.error('Error processing face registration. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h2 className="text-2xl font-bold mb-4">Register Your Face</h2>
      <p className="text-gray-600 mb-4">Please ensure good lighting and a clear view of your face.</p>
      
      <div className="relative w-full max-w-md mb-4">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className={`w-full rounded-lg ${!isCameraActive ? 'hidden' : ''}`}
        />
        {!isCameraActive && (
          <div className="w-full aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Camera is off</p>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        {!isCameraActive ? (
          <button
            onClick={startCamera}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Start Camera
          </button>
        ) : (
          <>
            <button
              onClick={captureAndRegister}
              disabled={isProcessing || !isModelLoaded}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : 'Register Face'}
            </button>
            <button
              onClick={stopCamera}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Stop Camera
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default FaceRegistration;