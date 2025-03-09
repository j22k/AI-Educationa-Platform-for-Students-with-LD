import React, { useState, useRef, useEffect } from 'react';
import { Mic, StopCircle } from 'lucide-react';

const AudioRecordingComponent = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState('Ready to begin');
  const [transcription, setTranscription] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioStreamRef = useRef(null);

  const sentence = "The quick brown fox jumps over the lazy dog.";
  const instructionText = "Record yourself reading the sentence below";

  // Request Microphone Access
  useEffect(() => {
    const requestMicrophoneAccess = async () => {
      try {
        setStatus('Requesting microphone access...');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStreamRef.current = stream;
        setStatus('Ready to begin - Microphone access granted');
      } catch (err) {
        console.error('Error accessing microphone:', err);
        setStatus(`Error: ${err.message}. Please check microphone permissions`);
      }
    };

    requestMicrophoneAccess();

    return () => {
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    setTranscription('');
    
    try {
      if (!audioStreamRef.current) {
        setStatus('Requesting microphone access...');
        audioStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      audioChunksRef.current = [];

      // Start recording in WebM format
      const mediaRecorder = new MediaRecorder(audioStreamRef.current, { mimeType: 'audio/webm' });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (audioChunksRef.current.length === 0) {
          setStatus('Recording was too short. Please try again.');
          return;
        }

        // Convert recorded chunks to WAV
        const webmBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const wavBlob = await convertWebMtoWav(webmBlob);

        if (!wavBlob) {
          setStatus('Error converting to WAV. Please try again.');
          return;
        }

        // Send WAV file to Flask
        await sendAudioToServer(wavBlob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();

      setIsRecording(true);
      setStatus('Recording in progress...');
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setStatus(`Error starting recording: ${error.message}`);
    }
  };

  const stopRecording = () => {
    if (!isRecording || !mediaRecorderRef.current) return;

    try {
      setIsRecording(false);
      setStatus('Processing recording...');

      if (mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }

    } catch (error) {
      console.error('Error stopping recording:', error);
      setStatus(`Error stopping recording: ${error.message}`);
    }
  };

  // 🔹 Convert WebM to WAV in the Browser
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

  // 🔹 Encode WAV File
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

    writeString('RIFF');
    view.setUint32(offset, 36 + audioBuffer.length * numOfChan * 2, true);
    offset += 4;
    writeString('WAVE');
    writeString('fmt ');
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
    writeString('data');
    view.setUint32(offset, audioBuffer.length * numOfChan * 2, true);
    offset += 4;

    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
      channels.push(audioBuffer.getChannelData(i));
    }

    let interleaved;
    if (numOfChan === 2) {
      interleaved = new Float32Array(audioBuffer.length * 2);
      for (let i = 0, j = 0; i < audioBuffer.length; i++, j += 2) {
        interleaved[j] = channels[0][i];
        interleaved[j + 1] = channels[1][i];
      }
    } else {
      interleaved = channels[0];
    }

    floatTo16BitPCM(view, 44, interleaved);

    return new Blob([view], { type: 'audio/wav' });
  };

  // 🔹 Send WAV File to Flask
  const sendAudioToServer = async (audioBlob) => {
    try {
      setStatus('Preparing audio data...');

      const audioFile = new File([audioBlob], "recording.wav", { type: 'audio/wav' });

      const formData = new FormData();
      formData.append('audio', audioFile);
      formData.append('sentence', sentence);

      console.log([...formData]);

      setStatus('Sending audio to server...');

      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/dyslexia_audio`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const result = await response.json();
      setStatus('Recording processed successfully!');
      setTranscription(result.transcription || sentence);

    } catch (error) {
      console.error('Error sending audio to server:', error);
      setStatus(`Error: ${error.message}. Please try again.`);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto p-4">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-blue-800 mb-4">Reading Task</h2>
        
        <div className="bg-blue-50 p-3 rounded-md border border-blue-100 mb-4">
          <p className="font-medium text-blue-600">{sentence}</p>
        </div>

        <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-4 mb-4">
          <p className="text-gray-600 mb-4">{instructionText}</p>
          <div className="flex justify-center space-x-4">
            <button 
              onClick={startRecording} 
              disabled={isRecording}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                isRecording ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              <Mic className="w-5 h-5" />
              <span>Start Recording</span>
            </button>
            <button 
              onClick={stopRecording} 
              disabled={!isRecording}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                !isRecording ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              <StopCircle className="w-5 h-5" />
              <span>Stop Recording</span>
            </button>
          </div>
          <p className="text-center mt-4 text-sm italic">{status}</p>
        </div>

        {transcription && (
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-2">Transcription:</h3>
            <div className="bg-gray-50 p-3 rounded-md">{transcription}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioRecordingComponent;
