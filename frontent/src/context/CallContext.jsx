import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import socket from "../socket";

const CallContext = createContext(null);

export const useCall = () => useContext(CallContext);

export const CallProvider = ({ children }) => {
  const currentUserId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  // Call state
  const [callState, setCallState] = useState("idle"); // idle, calling, ringing, active, ending
  const [callType, setCallType] = useState("voice"); // voice, video
  const [currentCallId, setCurrentCallId] = useState(null);
  const [callPartner, setCallPartner] = useState(null); // { _id, name, avatar, role }
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // WebRTC streams
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  // Toast / Status notification
  const [toastMessage, setToastMessage] = useState(null);

  // Refs
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const soundIntervalRef = useRef(null);
  const timerRef = useRef(null);

  // Refs for tracking dynamic calling state inside socket listeners
  const callStateRef = useRef(callState);
  const callPartnerRef = useRef(callPartner);
  const callTypeRef = useRef(callType);
  const currentCallIdRef = useRef(currentCallId);
  const callDurationRef = useRef(callDuration);

  useEffect(() => { callStateRef.current = callState; }, [callState]);
  useEffect(() => { callPartnerRef.current = callPartner; }, [callPartner]);
  useEffect(() => { callTypeRef.current = callType; }, [callType]);
  useEffect(() => { currentCallIdRef.current = currentCallId; }, [currentCallId]);
  useEffect(() => { callDurationRef.current = callDuration; }, [callDuration]);

  // Robust multi-STUN server config for Mobile LTE/5G and NAT traversal
  const ICE_SERVERS = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:stun3.l.google.com:19302" },
      { urls: "stun:stun4.l.google.com:19302" },
      { urls: "stun:global.stun.twilio.com:3478" }
    ]
  };

  // Helper for Sound Synthesis using Web Audio API
  const startSoundEffect = (type) => {
    stopSoundEffect();
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      if (type === "calling") {
        soundIntervalRef.current = setInterval(() => {
          if (ctx.state === "suspended") ctx.resume();
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();

          osc1.frequency.value = 440;
          osc2.frequency.value = 480;

          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);

          osc1.start();
          osc2.start();
          osc1.stop(ctx.currentTime + 1.2);
          osc2.stop(ctx.currentTime + 1.2);
        }, 2000);
      } else if (type === "ringing") {
        soundIntervalRef.current = setInterval(() => {
          if (ctx.state === "suspended") ctx.resume();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.frequency.value = 320;
          gain.gain.setValueAtTime(0.12, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start();
          osc.stop(ctx.currentTime + 0.8);
        }, 1500);
      }
    } catch (e) {
      console.warn("AudioContext failed to start:", e);
    }
  };

  const stopSoundEffect = () => {
    if (soundIntervalRef.current) {
      clearInterval(soundIntervalRef.current);
      soundIntervalRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Socket Connection and Global Listeners
  useEffect(() => {
    if (!token) return;

    socket.auth = { token };
    if (!socket.connected) {
      socket.connect();
    }

    socket.on("call:incoming", ({ callId, callerId, callerName, callerAvatar, type }) => {
      if (callStateRef.current !== "idle") {
        socket.emit("call:busy", { callId });
        return;
      }

      setCurrentCallId(callId);
      setCallPartner({ _id: callerId, name: callerName, avatar: callerAvatar, role: "caller" });
      setCallType(type);
      setCallState("ringing");
      startSoundEffect("ringing");
    });

    socket.on("call:accepted", async ({ callId }) => {
      showToast("Call Accepted");
      setCallState("active");
      stopSoundEffect();
      
      setCallDuration(0);
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);

      await setupWebRTC(true);
    });

    socket.on("call:rejected", ({ reason, callId }) => {
      stopSoundEffect();
      setCallState("idle");
      setCurrentCallId(null);
      setCallPartner(null);
      if (reason === "busy") {
        showToast("User is busy");
      } else if (reason === "unavailable") {
        showToast("User is offline");
      } else {
        showToast("Call Declined");
      }
      cleanupMedia();
      window.dispatchEvent(new CustomEvent("call:history-updated"));
    });

    socket.on("call:cancelled", () => {
      stopSoundEffect();
      setCallState("idle");
      setCurrentCallId(null);
      setCallPartner(null);
      showToast("Call Cancelled");
      cleanupMedia();
      window.dispatchEvent(new CustomEvent("call:history-updated"));
    });

    socket.on("call:ended", () => {
      stopSoundEffect();
      setCallState("idle");
      setCurrentCallId(null);
      setCallPartner(null);
      showToast("Call ended");
      cleanupMedia();
      window.dispatchEvent(new CustomEvent("call:history-updated"));
    });

    socket.on("call:offer", async ({ senderId, offer }) => {
      await setupWebRTC(false, offer);
    });

    socket.on("call:answer", async ({ senderId, answer }) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socket.on("call:ice-candidate", async ({ senderId, candidate }) => {
      if (peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error("Error adding ice candidate:", e);
        }
      }
    });

    return () => {
      socket.off("call:incoming");
      socket.off("call:accepted");
      socket.off("call:rejected");
      socket.off("call:cancelled");
      socket.off("call:ended");
      socket.off("call:offer");
      socket.off("call:answer");
      socket.off("call:ice-candidate");
    };
  }, [token]);

  const cleanupMedia = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
    setIsMuted(false);
    setIsCamOff(false);
    setCallDuration(0);
    stopSoundEffect();
  };

  const setupWebRTC = async (isCaller, remoteOffer = null) => {
    try {
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: callTypeRef.current === "video" ? {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        } : false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      setLocalStream(stream);

      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionRef.current = pc;

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
        } else if (event.track) {
          const inboundStream = new MediaStream([event.track]);
          setRemoteStream(inboundStream);
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate && callPartnerRef.current) {
          socket.emit("call:ice-candidate", {
            receiverId: callPartnerRef.current._id,
            candidate: event.candidate
          });
        }
      };

      if (isCaller) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        if (callPartnerRef.current) {
          socket.emit("call:offer", {
            receiverId: callPartnerRef.current._id,
            offer
          });
        }
      } else {
        await pc.setRemoteDescription(new RTCSessionDescription(remoteOffer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        if (callPartnerRef.current) {
          socket.emit("call:answer", {
            receiverId: callPartnerRef.current._id,
            answer
          });
        }
      }
    } catch (e) {
      console.error("WebRTC Setup failed:", e);
      if (e.name === "NotAllowedError" || e.name === "PermissionDeniedError") {
        showToast("Mic/Camera permission denied");
      } else {
        showToast("Failed to initialize calling media");
      }
      rejectCall();
    }
  };

  const startCall = (receiver, type) => {
    if (callState !== "idle") return;

    setCallPartner(receiver);
    setCallType(type);
    setCallState("calling");
    startSoundEffect("calling");

    socket.emit("call:initiate", {
      receiverId: receiver._id,
      type
    });
  };

  const acceptCall = () => {
    if (callState !== "ringing" || !currentCallId) return;

    stopSoundEffect();
    setCallState("active");

    setCallDuration(0);
    timerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    socket.emit("call:accept", { callId: currentCallId });
  };

  const rejectCall = () => {
    stopSoundEffect();
    cleanupMedia();
    setCallState("idle");

    if (currentCallIdRef.current) {
      socket.emit("call:reject", { callId: currentCallIdRef.current });
    }
    setCurrentCallId(null);
    setCallPartner(null);
    window.dispatchEvent(new CustomEvent("call:history-updated"));
  };

  const cancelCall = () => {
    stopSoundEffect();
    cleanupMedia();
    setCallState("idle");

    if (currentCallIdRef.current) {
      socket.emit("call:cancel", { callId: currentCallIdRef.current });
    }
    setCurrentCallId(null);
    setCallPartner(null);
    window.dispatchEvent(new CustomEvent("call:history-updated"));
  };

  const endCall = () => {
    stopSoundEffect();
    if (currentCallIdRef.current) {
      socket.emit("call:end", { callId: currentCallIdRef.current, duration: callDurationRef.current });
    }
    cleanupMedia();
    setCallState("idle");
    setCurrentCallId(null);
    setCallPartner(null);
    window.dispatchEvent(new CustomEvent("call:history-updated"));
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleCamera = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCamOff(!videoTrack.enabled);
      }
    }
  };

  const formatDuration = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Video Ref mounts & Playback execution
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(() => {});
    }
  }, [localStream, callState]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(() => {});
    }
  }, [remoteStream, callState]);

  return (
    <CallContext.Provider
      value={{
        socket,
        callState,
        callType,
        callPartner,
        callDuration,
        isMuted,
        isCamOff,
        localStream,
        remoteStream,
        startCall,
        acceptCall,
        rejectCall,
        cancelCall,
        endCall,
        toggleMute,
        toggleCamera
      }}
    >
      {children}

      {/* Global Toast Notifier */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-[#0F172A] border border-white/10 text-white font-bold text-xs py-3 px-6 rounded-full shadow-2xl z-[99999] animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Incoming Call Modal */}
      {callState === "ringing" && callPartner && (
        <div className="fixed inset-0 bg-[#070b13]/85 backdrop-blur-md flex items-center justify-center z-[99999] select-none">
          <div className="bg-[#0f172a] border border-white/10 p-8 rounded-3xl w-80 text-center shadow-2xl relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#38BDF8] flex items-center justify-center mx-auto mb-6 text-white text-3xl font-black shadow-lg shadow-[#7C3AED]/20 animate-pulse">
              {callPartner.name.charAt(0).toUpperCase()}
            </div>
            <h3 className="text-white font-extrabold text-lg">{callPartner.name}</h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
              Incoming {callType === "video" ? "Video Call" : "Voice Call"}
            </p>

            <div className="flex justify-center gap-6 mt-8">
              <button
                onClick={rejectCall}
                className="bg-rose-600 hover:bg-rose-500 text-white font-black px-6 py-3 rounded-2xl text-xs tracking-wider transition hover:scale-105 cursor-pointer shadow-md shadow-rose-600/20"
              >
                Reject
              </button>
              <button
                onClick={acceptCall}
                className="bg-green-600 hover:bg-green-500 text-white font-black px-6 py-3 rounded-2xl text-xs tracking-wider transition hover:scale-105 cursor-pointer shadow-md shadow-green-600/20"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Outgoing Calling Modal */}
      {callState === "calling" && callPartner && (
        <div className="fixed inset-0 bg-[#070b13]/85 backdrop-blur-md flex items-center justify-center z-[99999] select-none">
          <div className="bg-[#0f172a] border border-white/10 p-8 rounded-3xl w-80 text-center shadow-2xl relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#38BDF8] flex items-center justify-center mx-auto mb-6 text-white text-3xl font-black shadow-lg shadow-[#7C3AED]/20">
              {callPartner.name.charAt(0).toUpperCase()}
            </div>
            <h3 className="text-white font-extrabold text-lg">{callPartner.name}</h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1 animate-pulse">
              Calling... ({callType === "video" ? "Video Call" : "Voice Call"})
            </p>

            <div className="mt-8">
              <button
                onClick={cancelCall}
                className="bg-rose-600 hover:bg-rose-500 text-white font-black px-6 py-3 rounded-2xl text-xs tracking-wider transition hover:scale-105 cursor-pointer shadow-md shadow-rose-600/20"
              >
                Cancel Call
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Call Interface */}
      {callState === "active" && callPartner && (
        <div className="fixed inset-0 bg-[#070b13]/90 backdrop-blur-lg flex items-center justify-center z-[99999] select-none">
          <div className="bg-[#0f172a] border border-white/10 p-6 md:p-8 rounded-3xl w-full max-w-md mx-4 text-center shadow-2xl relative overflow-hidden flex flex-col justify-between h-[520px]">
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                Ongoing {callType === "video" ? "Video Call" : "Voice Call"}
              </p>
              <h3 className="text-white font-extrabold text-lg mt-2">{callPartner.name}</h3>
              <p className="text-[#38BDF8] text-xs font-bold font-mono tracking-wider mt-1">
                {formatDuration(callDuration)}
              </p>
            </div>

            {callType === "video" ? (
              <div className="relative flex-1 bg-slate-950 my-4 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center">
                {/* Remote Video Stream */}
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />

                {/* Local Video Preview (Picture-in-Picture) */}
                <div className="absolute bottom-3 right-3 w-28 h-36 bg-slate-900 border border-white/20 rounded-xl overflow-hidden shadow-2xl">
                  {isCamOff ? (
                    <div className="w-full h-full bg-slate-900 text-[10px] font-extrabold text-slate-400 flex items-center justify-center uppercase">
                      Cam Off
                    </div>
                  ) : (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover transform scale-x-[-1]"
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center my-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#38BDF8] flex items-center justify-center text-white text-4xl font-black shadow-lg shadow-[#7C3AED]/15 animate-pulse">
                  {callPartner.name.charAt(0).toUpperCase()}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center items-center gap-4 mt-2">
              <button
                onClick={toggleMute}
                className={`px-4 py-3 rounded-2xl text-xs font-extrabold transition cursor-pointer border flex items-center gap-2 ${
                  isMuted
                    ? "bg-amber-600/20 border-amber-500/40 text-amber-400"
                    : "bg-white/10 border-white/15 text-white hover:bg-white/20"
                }`}
                title={isMuted ? "Unmute Mic" : "Mute Mic"}
              >
                <span>🎤</span> {isMuted ? "Muted" : "Mic"}
              </button>

              {callType === "video" && (
                <button
                  onClick={toggleCamera}
                  className={`px-4 py-3 rounded-2xl text-xs font-extrabold transition cursor-pointer border flex items-center gap-2 ${
                    isCamOff
                      ? "bg-amber-600/20 border-amber-500/40 text-amber-400"
                      : "bg-white/10 border-white/15 text-white hover:bg-white/20"
                  }`}
                  title={isCamOff ? "Turn Cam On" : "Turn Cam Off"}
                >
                  <span>📷</span> {isCamOff ? "Cam Off" : "Cam"}
                </button>
              )}

              <button
                onClick={endCall}
                className="bg-rose-600 hover:bg-rose-500 text-white font-black px-6 py-3.5 rounded-2xl text-xs tracking-wider transition hover:scale-105 cursor-pointer shadow-md shadow-rose-600/20"
              >
                End Call
              </button>
            </div>
          </div>
        </div>
      )}
    </CallContext.Provider>
  );
};
