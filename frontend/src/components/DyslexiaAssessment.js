import React, { useState, useRef, useEffect } from "react";
import { Mic, StopCircle } from "lucide-react";

const questions = [
  "I like to play outside with my friends.",
  "My favorite subject in school is science.",
  "The sun is shining, and the sky is blue.",
  "I enjoy reading books about adventure.",
  "Today, I had breakfast with my family."
];

const AudioRecordingComponent = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState("Ready to begin");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioStreamRef = useRef(null);

  const currentQuestion = questions[currentQuestionIndex];

  // Get userID from localStorage
  const userID = localStorage.getItem("userId") || "unknown_user";

  useEffect(() => {
    const requestMicrophoneAccess = async () => {
      try {
        setStatus("Requesting microphone access...");
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStreamRef.current = stream;
        setStatus("Ready to begin - Microphone access granted");
      } catch (err) {
        console.error("Error accessing microphone:", err);
        setStatus(`Error: ${err.message}. Please check microphone permissions`);
      }
    };

    requestMicrophoneAccess();

    return () => {
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    setStatus("Recording... Speak clearly.");
    setIsRecording(true);

    try {
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(audioStreamRef.current, { mimeType: "audio/webm" });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (audioChunksRef.current.length === 0) {
          setStatus("Recording was too short. Please try again.");
          return;
        }

        const webmBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const wavBlob = await convertWebMtoWav(webmBlob);

        if (!wavBlob) {
          setStatus("Error converting to WAV. Please try again.");
          return;
        }

        await sendAudioToServer(wavBlob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
    } catch (error) {
      console.error("Error starting recording:", error);
      setStatus(`Error: ${error.message}`);
    }
  };

  const stopRecording = () => {
    if (!isRecording || !mediaRecorderRef.current) return;
    setIsRecording(false);
    setStatus("Processing...");
    mediaRecorderRef.current.stop();
  };

  const convertWebMtoWav = async (webmBlob) => {
    return new Promise((resolve, reject) => {
      const audioContext = new AudioContext();
      const reader = new FileReader();

      reader.onload = async () => {
        try {
          const arrayBuffer = reader.result;
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          const wavBlob = encodeWAV(audioBuffer);
          resolve(wavBlob);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = reject;
      reader.readAsArrayBuffer(webmBlob);
    });
  };

  const encodeWAV = (audioBuffer) => {
    const numOfChan = audioBuffer.numberOfChannels,
      length = audioBuffer.length * numOfChan * 2 + 44,
      buffer = new ArrayBuffer(length),
      view = new DataView(buffer),
      channels = [],
      sampleRate = audioBuffer.sampleRate;

    let offset = 0;

    const writeString = (str) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset++, str.charCodeAt(i));
      }
    };

    const floatTo16BitPCM = (output, offset, input) => {
      for (let i = 0; i < input.length; i++, offset += 2) {
        const s = Math.max(-1, Math.min(1, input[i]));
        output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      }
    };

    writeString("RIFF");
    view.setUint32(offset, 36 + audioBuffer.length * numOfChan * 2, true);
    offset += 4;
    writeString("WAVE");
    writeString("fmt ");
    view.setUint32(offset, 16, true);
    offset += 4;
    view.setUint16(offset, 1, true);
    offset += 2;
    view.setUint16(offset, numOfChan, true);
    offset += 2;
    view.setUint32(offset, sampleRate, true);
    offset += 4;
    view.setUint32(offset, sampleRate * numOfChan * 2, true);
    offset += 4;
    view.setUint16(offset, numOfChan * 2, true);
    offset += 2;
    view.setUint16(offset, 16, true);
    offset += 2;
    writeString("data");
    view.setUint32(offset, audioBuffer.length * numOfChan * 2, true);
    offset += 4;

    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
      channels.push(audioBuffer.getChannelData(i));
    }

    let interleaved = channels[0];

    floatTo16BitPCM(view, 44, interleaved);
    return new Blob([view], { type: "audio/wav" });
  };

  const sendAudioToServer = async (audioBlob) => {
    try {
      setStatus("Uploading response...");
      const audioFile = new File([audioBlob], `question_${currentQuestionIndex + 1}.wav`, { type: "audio/wav" });

      const formData = new FormData();
      formData.append("audio", audioFile);
      formData.append("question", currentQuestion);
      formData.append("userID", userID); // 🔹 Include userID

      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/dyslexia_audio`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      setResponses([...responses, { question: currentQuestion, response: result.transcription }]);

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setStatus("Next question ready.");
      } else {
        setIsCompleted(true);
        setStatus("All questions completed!");
      }
    } catch (error) {
      console.error("Error sending audio:", error);
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-blue-800 mb-4">Speech Assessment</h2>

        {!isCompleted ? (
          <>
            <p className="text-lg font-medium text-gray-700 mb-2">{currentQuestion}</p>
            <div className="flex justify-center mt-4 space-x-4">
              <button onClick={startRecording} disabled={isRecording} className="bg-red-600 text-white px-4 py-2 rounded-lg">
                <Mic className="w-5 h-5" />
              </button>
              <button onClick={stopRecording} disabled={!isRecording} className="bg-green-600 text-white px-4 py-2 rounded-lg">
                <StopCircle className="w-5 h-5" />
              </button>
            </div>
            <p className="text-center text-sm italic mt-4">{status}</p>
          </>
        ) : (
          <p className="text-green-600 font-bold">✅ Assessment Complete!</p>
        )}
      </div>
    </div>
  );
};

export default AudioRecordingComponent;
