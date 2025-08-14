import React from 'react';

function App() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: "linear-gradient(120deg, #f7b2e6 0%, #a0e9ff 100%)"
      }}
    >
      <div className="bg-white rounded-2xl shadow-lg p-12 w-full max-w-4xl flex flex-col items-center">
        <h1 className="font-amazon-ember font-bold text-4xl text-center mb-8">
          Facial Recognition Attendance System
        </h1>
        <div className="border-2 border-black rounded-xl w-full max-w-2xl h-96 flex flex-col items-center justify-center mb-8">
          <p className="font-amazon-ember mb-6 text-center">This application requires a camera to work.</p>
          <button className="bg-purple-300 hover:bg-purple-400 font-amazon-ember text-white font-semibold py-2 px-8 rounded-full transition">
            Turn On Camera
          </button>
        </div>
        <button className="bg-purple-300 hover:bg-purple-400 font-amazon-ember text-white font-semibold py-2 px-8 rounded-full flex items-center gap-2">
          {/* Shield icon! */}
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