import React, { useState, useEffect, useRef } from 'react';

function App() {
  const videoRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (cameraOn) {
      setError(null);
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error("Error accessing the camera: ", err);
          setError("Failed to access camera. Please ensure permissions are granted.");
          setCameraOn(false);
        });
    } else {
      const currentStream = videoRef.current?.srcObject;
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    }

    return () => {
      const currentStream = videoRef.current?.srcObject;
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraOn]);

  const handleCameraToggle = () => {
    setCameraOn(prev => !prev);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12"
      style={{
        background: "linear-gradient(120deg, #f7b2e6 0%, #a0e9ff 100%)"
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 md:p-12 w-full max-w-4xl flex flex-col items-center border-4 border-purple-300">
        <h1 className="font-sans font-bold text-3xl sm:text-4xl text-center mb-6 text-gray-800">
          Facial Recognition Attendance System
        </h1>
        
        {/* Main content area for camera/placeholder */}
        <div className="relative rounded-2xl w-full max-w-2xl h-80 sm:h-96 flex items-center justify-center mb-8 bg-gray-100 shadow-inner overflow-hidden border-2 border-gray-300">
          {error && (
            <p className="absolute text-red-500 z-10 p-4 bg-white bg-opacity-75 rounded-lg text-center font-semibold">{error}</p>
          )}

          {cameraOn ? (
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            ></video>
          ) : (
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <p className="font-sans mb-6 text-lg text-gray-600">This application requires a camera to work.</p>
              <button
                onClick={handleCameraToggle}
                className="bg-purple-500 hover:bg-purple-600 focus:outline-none focus:ring-4 focus:ring-purple-300 font-sans text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg"
              >
                Turn On Camera
              </button>
            </div>
          )}
        </div>
        <button className="bg-purple-300 hover:bg-purple-400 font-amazon-ember text-white font-semibold py-2 px-8 rounded-full flex items-center gap-2">
          {/* Shield icon */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2l4-4m5 2a9 9 0 11-18 0a9 9 0 0118 0z" />
          </svg>
          Authenticate
        </button>
      </div>
    </div>
  );
}

export default App;
