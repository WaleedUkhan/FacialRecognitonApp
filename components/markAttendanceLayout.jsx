import React, { useEffect, useState } from 'react';
import QRScanner from 'qr-scanner';
import { ToastContainer,toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MarkAttendance = ({ userId }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(false); 
  // const [videoStream, setVideoStream] = useState(null); // Store scanner instance
  // const [hasPermission, setHasPermission] = useState(false); // Store scanner instance 
  const [scanner, setScanner] = useState(null); 
  const [attendanceMarked, setAttendanceMarked] = useState(false); // To track if attendance is already marked

  useEffect(() => {
    setIsMounted(true); // When the component loads the first time, isMounted becomes true.
  }, []);

  useEffect(() => {
    if (isMounted && userId) { // mounting k bad agar userid available ha to, 
      checkAttendance(); // Check if attendance is marked 
    }
  }, [isMounted]);


  // If userId is undefined, show loading or error
  if (!userId) {
    return <div className="p-6">Loading userId data...</div>;
  }

  // Function to check if attendance is already marked
  const checkAttendance = async () => {
    try {
      const resp = await fetch('/api/checkAttendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const result = await resp.json()
      if (result.message) {
        setAttendanceMarked(true);
        console.log(result.message);
        setError(result.message);
      }
    } catch (error) {
      console.error("Error checking attendance:", error);
      typeof error !== 'object' ? setError(error) : setError('Error checking attendance')
    }
  };

  const handleQRCodeScan = async (data) => {
    setScanned(true);
    const parsedData = JSON.parse(data); // Parse (means converts string into real JS Object) the QR code data.

    try {
      console.log(userId);
      console.log(scanner);
      if (scanner) {
        try {
          await scanner.stop(); // Stop the scanner properly
          setIsScanning(false); // Update scanning state
        } catch (err) {
          console.error("Error stopping the scanner", err);
        }
      }

      const resp = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uuid: parsedData.uuid,
          date: parsedData.date,
          userId // Directly access userId from props
        }),
      });
      if (resp.ok) {
        toast.success('Attendance Marked Successfully!!!');
        setSuccess(true);
        stopScanning();
        return;
      } else {
        const result = await resp.json();
        if(result.message === 'QR code expired!!!'){
          toast.error('QR code expired!!!');
          setError('QR code expired!!!');
          return;
        }
      }
    } catch (error) {
      console.error("Error marking attendance:", error);
    }
  };

  const handleQRCodeError = (error) => {
    console.error("QR Code Scanning Error: ", error);
  };

  const startScanning = async () => {
    if (!scanner) return;
    setIsScanning(true); // Set scanning state to true
    try {
      scanner.start().catch(handleQRCodeError);  // Start the scanner and catch any errors
    } catch (error) {
      setError('Permission denied or camera not available. Check Camera connection, try clearing browser data or try use another browser!');
      console.error('Error accessing camera:', error);
    }

  };

  const stopScanning = async () => {
    setIsScanning(false); // Update scanning state
    if (scanner) {
      scanner.stop()?.catch(handleQRCodeError); // Stop the scanner
    }
    setError('')
  };

  useEffect(() => {
    if (!isMounted) return;

    const videoElement = document.getElementById('qr-reader'); // Get the video element
    if (!videoElement) {
      console.error('Video element not found');
      return;
    }
    
    const scannerInstance = new QRScanner(videoElement, handleQRCodeScan, handleQRCodeError);
    setScanner(scannerInstance); // Store the scanner instance
    
    // Cleanup: stop the scanner when component unmounts
    return () => {
      if (scannerInstance) {
        scannerInstance.stop()?.catch(handleQRCodeError);
      }
    };
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    scanner.stop();
    setIsScanning(false);
  }, [scanned]);

  if (!isMounted) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="lg:max-w-2xl lg:mx-auto m-2 p-10 lg:p-8 bg-gray-300 rounded shadow-lg lg:shadow-md">
      <ToastContainer />
      <h2 className="text-2xl font-bold mb-4">Mark Attendance</h2>

      {success && (
        <p className="my-10 py-5 text-center text-2xl font-bold text-green-500">Attendance marked successfully!</p>
      )}
      {error && (
        <p className="my-10 py-5 text-center text-2xl font-bold text-red-500">{attendanceMarked ? 'Attendance already marked for today!' : error}</p>
      )}

      {!scanned && !attendanceMarked && 
        <div className="flex flex-col items-center pb-6">
          <h1 className="mb-2">Scan QR Code to Mark Attendance</h1>
            <video
              id="qr-reader"
              className="border-4 lg:w-[390px] w-full h-[300px] rounded-lg shadow-lg bg-white p-4"
              style={{ width: '100%', height: 'auto' }}
            ></video>
        </div>
      }

      {/* Show Start/Stop scanning buttons */}
      {!isScanning && !scanned && !attendanceMarked ? (
        <button
          onClick={startScanning}
          className="mt-4 bg-green-500 text-white p-2 rounded"
        >
          Start Scanning
        </button>
      ) : !scanned && !attendanceMarked && (
        <button
          onClick={stopScanning}
          className="mt-4 bg-red-500 text-white p-2 rounded"
        >
          Stop Scanning
        </button>
      )}
    </div>
  );
};

export default MarkAttendance;