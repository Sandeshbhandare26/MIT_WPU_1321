import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { detectSeverityFromText } from '../utils/voiceSeverity';
import toast from 'react-hot-toast';

export default function VoiceInput({ onSeverityDetected }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [severity, setSeverity] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const toggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      mediaRecorderRef.current?.stop();
    } else {
      // Start recording
      setTranscript('');
      setSeverity(null);
      audioChunksRef.current = [];
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Use an audio format supported mostly everywhere
        const mediaRecorder = new MediaRecorder(stream);
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };
        
        mediaRecorder.onstop = async () => {
          stream.getTracks().forEach(track => track.stop());
          setIsRecording(false);
          setIsProcessing(true);
          
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          await processAudioWithBackend(audioBlob);
        };
        
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Mic error:', err);
        toast.error('Microphone permission denied or unsupported.');
      }
    }
  };

  const processAudioWithBackend = async (audioBlob) => {
    try {
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      
      const response = await fetch(`${BACKEND_URL}/voice-transcribe`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setTranscript(data.transcript);
        setSeverity(data.severity);
        if (onSeverityDetected) {
          onSeverityDetected(data.severity, data.transcript);
        }
      } else {
        toast.error('Voice processing failed on backend.');
      }
    } catch (e) {
      console.error(e);
      toast.error('Network error. Could not transcribe audio.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getSeverityBadgeClass = (sev) => {
    switch (sev) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-700 backdrop-blur-md bg-opacity-80 transition-all duration-300">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3 text-white">
           <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
             <Mic size={24} className={isRecording ? 'animate-pulse text-red-300' : 'text-white'} />
           </div>
           <div>
             <h3 className="font-bold text-lg leading-tight">AI Voice Assistant</h3>
             <p className="text-blue-100 text-xs">Hands-free EMT Assessment</p>
           </div>
        </div>
        {severity && (
          <div className="flex items-center bg-white/20 px-3 py-1.5 rounded-full text-white text-sm font-semibold border border-white/30 shadow-inner">
             {severity === 'HIGH' ? <AlertCircle size={16} className="mr-1.5 text-red-300" /> : <CheckCircle size={16} className="mr-1.5 text-green-300" />}
             Severity: {severity}
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0">
            <button
              onClick={isProcessing ? null : toggleRecording}
              disabled={isProcessing}
              className={`relative flex items-center justify-center w-24 h-24 rounded-full text-white shadow-xl transition-all duration-300 transform group outline-none ${
                isRecording 
                  ? 'bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 animate-pulse scale-105 ring-4 ring-red-500/30' 
                  : isProcessing 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 hover:scale-105 hover:shadow-2xl ring-4 ring-blue-500/20'
              }`}
            >
              {isProcessing ? (
                <Loader2 size={36} className="animate-spin" />
              ) : isRecording ? (
                <div className="flex items-center justify-center">
                  <MicOff size={36} className="absolute transition-opacity duration-300" />
                  <span className="absolute -bottom-2 text-[10px] uppercase font-bold tracking-wider">Stop</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Mic size={36} className="absolute transition-transform duration-300 group-hover:scale-110" />
                  <span className="absolute -bottom-2 text-[10px] uppercase font-bold tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">Tap to Speak</span>
                </div>
              )}
            </button>
          </div>

          <div className="flex-grow w-full">
            <div className={`relative px-5 py-4 rounded-2xl min-h-[100px] border transition-colors duration-300 flex items-center ${transcript ? 'bg-indigo-50/50 dark:bg-gray-700/50 border-indigo-100 dark:border-indigo-900/50' : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 border-dashed'}`}>
              
              {!transcript && !isProcessing && !isRecording && (
                <div className="text-gray-400 dark:text-gray-500 flex flex-col items-center w-full">
                  <Mic size={24} className="mb-2 opacity-50" />
                  <p className="text-sm font-medium text-center">Press the microphone to begin dictating.<br/>We will transcribe and extract patient data automatically.</p>
                </div>
              )}

              {isRecording && (
                <div className="flex items-center justify-center w-full space-x-2 text-red-500">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
                  <span className="text-sm font-medium animate-pulse">Listening... Speak clearly.</span>
                </div>
              )}

              {isProcessing && (
                <div className="flex flex-col items-center justify-center w-full text-indigo-500 space-y-3">
                  <Loader2 size={28} className="animate-spin text-indigo-500" />
                  <span className="text-sm font-semibold tracking-wide">Processing Audio via AssemblyAI...</span>
                </div>
              )}

              {transcript && !isProcessing && (
                 <div className="w-full">
                   <p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed font-medium">"{transcript}"</p>
                 </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
