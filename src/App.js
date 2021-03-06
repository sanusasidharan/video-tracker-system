import * as faceapi from 'face-api.js';
import React from 'react';
function App() {

  const [modelsLoaded, setModelsLoaded] = React.useState(false);
  const [captureVideo, setCaptureVideo] = React.useState(false);
  const [imageBase64Data, setImageBase64Data] = React.useState("");
  const videoRef = React.useRef();
  const videoHeight = 480;
  const videoWidth = 640;
  const canvasRef = React.useRef();

  React.useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = process.env.PUBLIC_URL + '/models';
      await faceapi.loadSsdMobilenetv1Model(MODEL_URL)
      await faceapi.loadTinyFaceDetectorModel(MODEL_URL)
      await faceapi.loadMtcnnModel(MODEL_URL)
      await faceapi.loadFaceLandmarkModel(MODEL_URL)
      await faceapi.loadFaceLandmarkTinyModel(MODEL_URL)
      await faceapi.loadFaceRecognitionModel(MODEL_URL)
      await faceapi.loadFaceExpressionModel(MODEL_URL)
      console.log(faceapi.nets)
      Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]).then(setModelsLoaded(true));
    }
    loadModels();
  }, []);

  const startVideo = () => {
    setCaptureVideo(true);
    navigator.mediaDevices
        .getUserMedia({ video: { width: 300 } })
        .then(stream => {
          let video = videoRef.current;
          video.srcObject = stream;
          video.play();
        })
        .catch(err => {
          console.error("error:", err);
        });
  }

  const handleVideoOnPlay = () => {
    setInterval(async () => {
      if (canvasRef && canvasRef.current) {
        canvasRef.current.innerHTML = faceapi.createCanvasFromMedia(videoRef.current);
        const displaySize = {
          width: videoWidth,
          height: videoHeight
        }

        faceapi.matchDimensions(canvasRef.current, displaySize);

        const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.SsdMobilenetv1Options());
        const resizedDetections = faceapi.resizeResults(detections, displaySize)
        console.log(" painted in canvas !!")
        console.log(detections[0].box);
        canvasRef && canvasRef.current && canvasRef.current.getContext('2d').clearRect(0, 0, videoWidth, videoHeight);
        canvasRef && canvasRef.current && faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
        console.log(" canvasRef !!" , canvasRef)

        //canvasRef && canvasRef.current && faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
        //canvasRef && canvasRef.current && faceapi.draw.drawFaceExpressions(canvasRef.current, resizedDetections);

        // research


      }
    }, 100)
  }

  const closeWebcam = () => {
    videoRef.current.pause();
    videoRef.current.srcObject.getTracks()[0].stop();
    setCaptureVideo(false);
  }

 const getSnapShot = () => {
   /*  Method that will return video screen shot
    *  High quality --> toDataURL('image/jpg', 1);
    *  Mid quality --> toDataURL('image/jpg', 0.5);
    *  Low quality --> toDataURL('image/jpg', 0);
   */
   let canvas = document.createElement('canvas');
   let ctx = canvas.getContext('2d');
   let video = videoRef.current;
   ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
   return canvas.toDataURL('image/jpg', 1);
 }

 return (
      <div>
        <div style={{ textAlign: 'center', padding: '10px' }}>
          {
            captureVideo && modelsLoaded ?
                <button onClick={closeWebcam} style={{ cursor: 'pointer', backgroundColor: 'green', color: 'white', padding: '15px', fontSize: '25px', border: 'none', borderRadius: '10px' }}>
                  Close Webcam
                </button>
                :
                <button onClick={startVideo} style={{ cursor: 'pointer', backgroundColor: 'green', color: 'white', padding: '15px', fontSize: '25px', border: 'none', borderRadius: '10px' }}>
                  Open Webcam
                </button>
          }
        </div>
        {
          captureVideo ?
              modelsLoaded ?
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '10px' }}>
                      <video ref={videoRef} height={videoHeight} width={videoWidth} onPlay={handleVideoOnPlay} style={{ borderRadius: '10px' }} />
                      <canvas ref={canvasRef} style={{ position: 'absolute' }} />
                    </div>
                  </div>

                  :
                  <div>loading...</div>
              :
              <>
              </>
        }
        <button onClick={() => {
          setImageBase64Data(getSnapShot())
        }}> Save Image </button>
        <img src={imageBase64Data} height={videoHeight} width={videoWidth} />
      </div>
  );
}

export default App;
