import './App.css';
import { useState, useRef, useEffect } from 'react';
import * as uuid from 'uuid';

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [image, setImage] = useState(null);
  const [uploadResultMessage, setUploadResultMessage] = useState(
    'Please upload an image to authenticate.'
  );
  const [imgSrc, setImgSrc] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  // Initialize camera when cameraActive becomes true
  useEffect(() => {
    let stream = null;

    async function setupCamera() {
      if (cameraActive && videoRef.current) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user' },
            audio: false,
          });

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error('Error accessing camera:', err);
          setCameraActive(false);
        }
      }
    }

    setupCamera();

    // Cleanup camera
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraActive]);

  // Capture photo from camera
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      setImgSrc(null);
      setIsAuth(false);
      setUploadResultMessage('Please authenticate with your new photo.');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const aspectRatio = video.videoWidth / video.videoHeight;

      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], 'camera-photo.jpeg', {
                type: 'image/jpeg',
              });
              setImage(file);

              const imageUrl = URL.createObjectURL(file);
              setImgSrc(imageUrl);

              const imgElement = document.querySelector('.preview-image');
              if (imgElement) {
                imgElement.dataset.aspectRatio = aspectRatio.toString();
              }

              setCameraActive(false);
            }
          },
          'image/jpeg',
          0.95
        );
      }
    }
  };

  // Toggle camera
  const toggleCamera = () => {
    if (!cameraActive) {
      setImgSrc(null);
      setUploadResultMessage('Please upload an image to authenticate.');
      setIsAuth(false);
    }
    setCameraActive(!cameraActive);
  };

  // Try again - reset and go back to capturing
  const tryAgain = () => {
    setImage(null);
    setImgSrc(null);
    setIsAuth(false);
    setUploadResultMessage('Please upload an image to authenticate.');
    setCameraActive(true);
  };

  const sendImage = async (e) => {
    e.preventDefault();

    if (!image) {
      setUploadResultMessage('Please take a photo first.');
      return;
    }

    const userImageName = uuid.v4();
    const imageUrl = URL.createObjectURL(image);
    setImgSrc(imageUrl);

    try {
      setUploadResultMessage('Uploading image...');
      const apiUrl = import.meta.env.VITE_API_GATEWAY_URL;
      const bucketPath = import.meta.env.VITE_S3_BUCKET_PATH;

      const uploadResponse = await fetch(
        `${apiUrl}/${bucketPath}/${userImageName}.jpeg`,
        {
          method: 'PUT',
          body: image,
          headers: {
            'Content-Type': 'image/jpeg',
          },
        }
      );

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed with status: ${uploadResponse.status}`);
      } else {
        console.log('Image uploaded at S3');
      }

      const response = await authenticate(userImageName);

      if (response && response.Message === 'Success') {
        setIsAuth(true);
        setUploadResultMessage(
          `Hi! ${response['firstName']} ${response['lastName']}, you are authenticated successfully!`
        );
      } else if (response && response.Message === 'NotFound') {
        setIsAuth(false);
        setUploadResultMessage(
          'Person not found in the system. Please register first.'
        );
      } else {
        setIsAuth(false);
        setUploadResultMessage(
          'Sorry, we could not authenticate you. Please try again.'
        );
      }
    } catch (error) {
      setIsAuth(false);
      console.error('Error uploading image:', error);
      setUploadResultMessage('An error occurred. Please try again.');
    }
  };

  async function authenticate(userImageName) {
    try {
      const apiUrl = import.meta.env.VITE_API_GATEWAY_URL;
      const requestURL =
        `${apiUrl}/attendee?` +
        new URLSearchParams({
          objectKey: `${userImageName}.jpeg`,
        });

      const response = await fetch(requestURL, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 403) {
        console.log('Person not found in the system');
        return { Message: 'NotFound' };
      } else if (!response.ok) {
        throw new Error(
          `Authentication failed with status: ${response.status}`
        );
      } else {
        console.log('Image authenticated');
      }

      return await response.json();
    } catch (error) {
      console.error('Error authenticating:', error);
      return null;
    }
  }

  return (
    /* UI wrapper for gradient background */
    <div className="app-bg">
      {/* Main card container */}
      <div className="App">
        <h2>Facial Recognition Attendance System</h2>

        <div className={isAuth ? 'success' : 'failure'}>
          {uploadResultMessage}
        </div>

        {/* Camera frame */}
        <div className="camera-frame">
          {cameraActive && (
            <>
              <video ref={videoRef} autoPlay playsInline />
              <button type="button" onClick={capturePhoto}>
                Take Photo
              </button>
              <button type="button" onClick={toggleCamera} className="secondary-btn">
                Turn Off Camera
              </button>
            </>
          )}

          {!cameraActive && !imgSrc && (
            <>
              <p className="camera-hint">
                This application requires a camera to work.
              </p>
              <button type="button" onClick={toggleCamera}>
                Turn On Camera
              </button>
            </>
          )}

          {imgSrc && !cameraActive && (
            <>
              <img
                src={imgSrc}
                alt="User"
                className="preview-image"
              />
              <button type="button" onClick={tryAgain} className="secondary-btn">
                Try Again
              </button>
            </>
          )}
        </div>

        <canvas ref={canvasRef} style={{ display: 'none' }} />

        <div className="auth-button-container">
          <button onClick={sendImage} disabled={!image || cameraActive}>
            Authenticate
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
