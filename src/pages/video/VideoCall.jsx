import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { createSignalingSocket } from "../../lib/webrtc/signaling";
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff } from 'lucide-react';

export default function VideoCall() {
  const { rdvId } = useParams();
  const navigate = useNavigate();
  const roomId = useMemo(() => String(rdvId), [rdvId]);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const canvasRef = useRef(null); // Reference for the audio visualizer
  
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const signalingRef = useRef(null);
  const animationRef = useRef(null);

  const [status, setStatus] = useState("Initialisation...");
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  const rtcConfig = useMemo(() => ({
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" }
    ]
  }), []);

  // --- AUDIO VISUALIZER LOGIC ---
  const startVisualizer = (stream) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    analyser.fftSize = 256;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const draw = () => {
      if (!ctx) return;
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#3b82f6'; // Blue color
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);

        x += sliceWidth;
      }
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };
    draw();
  };

  const cleanup = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (signalingRef.current?.socket) signalingRef.current.socket.close();
    if (pcRef.current) pcRef.current.close();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
    }
  };

  useEffect(() => {
    let mounted = true;

    const start = async () => {
      try {
        setStatus("Accès média...");
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        
        if (!mounted) return;
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        
        // Start the visualizer line
        startVisualizer(stream);

        const signaling = createSignalingSocket(async (msg) => {
          if (msg.roomId !== roomId) return;
          const pc = pcRef.current;
          if (!pc) return;

          try {
            if (msg.type === "offer") {
              await pc.setRemoteDescription(new RTCSessionDescription(msg.offer));
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              signaling.send({ roomId, type: "answer", answer });
            } else if (msg.type === "answer") {
              await pc.setRemoteDescription(new RTCSessionDescription(msg.answer));
              setStatus("✅ Session en cours");
            } else if (msg.type === "ice" && msg.candidate) {
              await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
            }
          } catch (err) { console.error(err); }
        });

        signaling.send({ type: "join", roomId: roomId });
        signalingRef.current = signaling;

        const pc = new RTCPeerConnection(rtcConfig);
        pcRef.current = pc;
        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        pc.ontrack = (event) => {
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
        };

        pc.onicecandidate = (event) => {
          if (event.candidate) signaling.send({ roomId, type: "ice", candidate: event.candidate });
        };

        setTimeout(async () => {
          if (mounted && pc.signalingState === "stable" && !pc.remoteDescription) {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            signaling.send({ roomId, type: "offer", offer });
          }
        }, 1000);

      } catch (e) {
        setStatus("❌ Erreur caméra/micro");
      }
    };

    start();
    return () => { mounted = false; cleanup(); };
  }, [roomId, rtcConfig]);

  const toggleMic = () => {
    const track = localStreamRef.current.getAudioTracks()[0];
    track.enabled = !track.enabled;
    setMicOn(track.enabled);
  };

  const toggleCam = () => {
    const track = localStreamRef.current.getVideoTracks()[0];
    track.enabled = !track.enabled;
    setCamOn(track.enabled);
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-4 lg:p-6">
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Consultation en direct</h1>
            <p className="text-xs text-blue-600 font-bold uppercase tracking-widest">{status}</p>
          </div>
          <button onClick={() => navigate(-1)} className="bg-red-50 text-red-600 p-3 rounded-xl hover:bg-red-100 transition-colors">
            <PhoneOff size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* DISTANT */}
          <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-xl aspect-video relative group">
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md text-white text-[10px] px-3 py-1 rounded-full font-bold">Flux Patient</div>
          </div>

          {/* LOCAL */}
          <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-xl aspect-video relative">
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md text-white text-[10px] px-3 py-1 rounded-full font-bold">Vous</div>
            
            {/* THE VOICE VISUALIZER LINE */}
            <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-md p-2 rounded-xl border border-white/10">
              <p className="text-[8px] text-white/60 mb-1 text-center font-bold">AUDIO TEST</p>
              <canvas ref={canvasRef} width="100" height="30" className="w-24 h-8" />
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-6">
          <button onClick={toggleMic} className={`p-5 rounded-2xl shadow-lg transition-all ${micOn ? 'bg-white text-slate-700' : 'bg-red-500 text-white animate-pulse'}`}>
            {micOn ? <Mic size={24} /> : <MicOff size={24} />}
          </button>
          <button onClick={toggleCam} className={`p-5 rounded-2xl shadow-lg transition-all ${camOn ? 'bg-white text-slate-700' : 'bg-red-500 text-white animate-pulse'}`}>
            {camOn ? <VideoIcon size={24} /> : <VideoOff size={24} />}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}