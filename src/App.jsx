import React, { useState, useEffect, useRef } from 'react';

function App() {
  const videoRef = useRef(null);

  // State to track whether the camera is currently turned on (true) or off (false)
  const [cameraOn, setCameraOn] = useState(false);

  // State to store any error messages, e.g., if camera permission is denied
  const [error, setError] = useState(null);

  useEffect(() => {
    if (cameraOn) {
      // When camera is turned on, clear any previous error
      setError(null);

      // Ask browser for camera access
      navigator.mediaDevices
        .getUserMedia({ video: true }) // request video stream only
        .then((stream) => {
          // If videoRef is connected to a video element, assign the camera stream to it
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          // If there's an error (e.g., user denies permission), show error and turn off camera
          console.error("Error accessing the camera: ", err);
          setError("Failed to access camera. Please ensure permissions are granted.");
          setCameraOn(false);
        });
    } else {
      // When camera is turned off, stop all active tracks to free the device
      const currentStream = videoRef.current?.srcObject;
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    }

    // Cleanup: stop the camera if component is unmounted
    return () => {
      const currentStream = videoRef.current?.srcObject;
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraOn]);

  // Function to toggle camera state between on and off
  const handleCameraToggle = () => {
    setCameraOn(prev => !prev);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12" style={{ background: "linear-gradient(120deg, #f7b2e6 0%, #a0e9ff 100%)" }}>
      <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 md:p-12 w-full max-w-4xl flex flex-col items-center border-4 border-purple-300">
        <h1 className="font-sans font-bold text-3xl sm:text-4xl text-center mb-6 text-gray-800">
          Facial Recognition Attendance System
        </h1>

        {/* Main area showing either the live camera feed or instructions */}
        <div className="relative rounded-2xl w-full max-w-2xl h-80 sm:h-96 flex items-center justify-center mb-8 bg-gray-100 shadow-inner overflow-hidden border-2 border-gray-300">
          {error && (
            <p className="absolute text-red-500 z-10 p-4 bg-white bg-opacity-75 rounded-lg text-center font-semibold">{error}</p>
          )}

          {cameraOn ? (
            // If camera is ON, show the live video feed
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted></video>
          ) : (
            // If camera is OFF, show instructions and "Turn On Camera" button
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <p className="font-sans mb-6 text-lg text-gray-600">This application requires a camera to work.</p>
              {/* Button to turn camera ON */}
              <button
                onClick={handleCameraToggle} // Click to toggle camera state to ON
                className="bg-purple-500 hover:bg-purple-600 focus:outline-none focus:ring-4 focus:ring-purple-300 font-sans text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg"
              >
                Turn On Camera
              </button>
            </div>
          )}
        </div>

        {/* Buttons below camera feed */}
        <div className="flex justify-center w-full max-w-md space-x-4">
          {cameraOn && (
            // Button to turn camera OFF (only shows if camera is currently ON)
            <button
              onClick={handleCameraToggle} // Click to toggle camera state to OFF
              className="bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-300 font-sans text-white font-semibold py-3 px-8 rounded-full flex items-center gap-3 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg"
            >
              Turn Off Camera
            </button>
          )}

          {/* Authentication button (not tied to camera control) */}
          <button className="bg-purple-500 hover:bg-purple-600 focus:outline-none focus:ring-4 focus:ring-purple-300 font-sans text-white font-semibold py-3 px-8 rounded-full flex items-center gap-3 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2l4-4m5 2a9 9 0 11-18 0a9 9 0 0118 0z" />
            </svg>
            Authenticate
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
