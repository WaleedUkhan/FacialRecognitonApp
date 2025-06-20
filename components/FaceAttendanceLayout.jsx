'use client'
import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export default function FaceAttendanceLayout() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const router = useRouter();
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [modelLoadError, setModelLoadError] = useState(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640,
          height: 480,
          facingMode: 'user'
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Error accessing camera. Please ensure you have granted camera permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      setIsCameraActive(false);
    }
  };

  useEffect(() => {
    const initializeFaceAPI = async () => {
      try {
        const MODEL_URL = process.env.NODE_ENV === 'development' 
          ? '/models'
          : '/models';
        
        console.log('Loading face-api models...');
        try {
          await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
          await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
          await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
          await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
          
          console.log('All models loaded successfully');
          setIsModelLoaded(true);
          setModelLoadError(null);
        } catch (error) {
          console.error('Error loading face-api models:', error);
          setModelLoadError('Failed to load face recognition models. Please ensure all model files are present in the /public/models directory.');
          toast.error('Error loading face recognition models. Please ensure all model files are present in the /public/models directory.');
        }
      } catch (error) {
        console.error('Error loading face-api models:', error);
        setModelLoadError('Failed to load face recognition models. Please refresh the page.');
        toast.error('Error loading face recognition models. Please refresh the page.');
      }
    };

    initializeFaceAPI();
  
    return () => {
      stopCamera();
    };
  }, []);

  // In the handleMarkAttendance function
  const handleMarkAttendance = async () => {
    if (!isModelLoaded || isProcessing || !isCameraActive || modelLoadError) {
      if (modelLoadError) {
        toast.error(modelLoadError);
      }
      return;
    }
  
    setIsProcessing(true);
    try {
      const detection = await faceapi.detectSingleFace(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions()
      ).withFaceLandmarks().withFaceDescriptor();
  
      if (!detection) {
        toast.error('No face detected. Please position your face in the frame.');
        setIsProcessing(false);
        return;
      }
  
      // Send only the face descriptor to the server
      const response = await fetch('/api/face-recognition/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          faceDescriptor: Array.from(detection.descriptor)
        })
      });
  
      const data = await response.json();
      if (data.success) {
        toast.success('Attendance marked successfully!');
        router.push('/user/viewRecord'); 
      } else {
        if (data.message.includes('No face data registered')) {
          toast.error('You need to register your face first. Please go to Face Registration page.');
        } else {
          toast.error(data.message || 'Failed to mark attendance');
        }
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error('Error marking attendance');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <h1 className="text-2xl font-bold">Face Recognition Attendance</h1>
      
      {modelLoadError && (
        <div className="text-red-500 mb-4">
          {modelLoadError}
        </div>
      )}
      
      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`w-[640px] h-[480px] bg-gray-100 rounded-lg ${!isCameraActive ? 'hidden' : ''}`}
        />
        {!isCameraActive && (
          <div className="w-[640px] h-[480px] bg-gray-200 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Camera is off</p>
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0"
          width={640}
          height={480}
        />
      </div>

      <div className="flex gap-4">
        {!isCameraActive ? (
          <button
            onClick={startCamera}
            disabled={!isModelLoaded || !!modelLoadError}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
          >
            Start Camera
          </button>
        ) : (
          <>
            <button
              onClick={handleMarkAttendance}
              disabled={!isModelLoaded || isProcessing || !!modelLoadError}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 cursor-pointer"
            >
              {isProcessing ? 'Processing...' : 'Mark Attendance'}
            </button>
            <button
              onClick={stopCamera}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer"
            >
              Stop Camera
            </button>
          </>
        )}
      </div>
    </div>
  );
}