import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import socket from "../socket";
import {
  FaPhoneAlt,
  FaPhoneSlash,
  FaVideo,
  FaVideoSlash,
  FaMicrophone,
  FaMicrophoneSlash,
  FaVolumeUp,
  FaSync
} from "react-icons/fa";
import { requestCameraAndMicPermission, requestNotificationPermission } from "../utils/permissionAndDownloadUtils";

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
  const [facingMode, setFacingMode] = useState("user"); // user, environment
  const [callDuration, setCallDuration] = useState(0);

  // WebRTC streams
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const remoteStreamRef = useRef(null);
  const iceCandidatesQueueRef = useRef([]);

  useEffect(() => { remoteStreamRef.current = remoteStream; }, [remoteStream]);

  // Toast / Status notification
  const [toastMessage, setToastMessage] = useState(null);

  // Refs
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const soundIntervalRef = useRef(null);
  const timerRef = useRef(null);

  // Helper functions for safe ICE candidate processing
  const processIceQueue = async () => {
    if (!peerConnectionRef.current || !peerConnectionRef.current.remoteDescription) return;
    while (iceCandidatesQueueRef.current.length > 0) {
      const candidate = iceCandidatesQueueRef.current.shift();
      try {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error("Error adding queued ice candidate:", e);
      }
    }
  };

  const addIceCandidateSafely = async (candidate) => {
    const pc = peerConnectionRef.current;
    if (pc && pc.remoteDescription && pc.remoteDescription.type) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error("Error adding ice candidate:", e);
      }
    } else {
      iceCandidatesQueueRef.current.push(candidate);
    }
  };

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

  // Robust multi-STUN and TURN server config for Mobile LTE/5G and NAT traversal
  const ICE_SERVERS = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:stun3.l.google.com:19302" },
      { urls: "stun:stun4.l.google.com:19302" },
      { urls: "stun:global.stun.twilio.com:3478" },
      {
        urls: "turn:openrelay.metered.ca:80",
        username: "openrelayproject",
        credential: "openrelayproject"
      },
      {
        urls: "turn:openrelay.metered.ca:443",
        username: "openrelayproject",
        credential: "openrelayproject"
      },
      {
        urls: "turn:openrelay.metered.ca:443?transport=tcp",
        username: "openrelayproject",
        credential: "openrelayproject"
      }
    ],
    iceCandidatePoolSize: 10
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
        if (callPartnerRef.current && (callPartnerRef.current._id?.toString() === callerId?.toString())) {
          return;
        }
        socket.emit("call:busy", { callId });
        return;
      }

      setCurrentCallId(callId);
      setCallPartner({ _id: callerId, name: callerName, avatar: callerAvatar, role: "caller" });
      setCallType(type);
      setCallState("ringing");
      startSoundEffect("ringing");

      // Mobile Haptic Vibration
      if (navigator.vibrate) {
        try { navigator.vibrate([500, 300, 500, 300, 500]); } catch (e) {}
      }

      // Just-In-Time Notification request & trigger
      requestNotificationPermission().then(({ success }) => {
        if (success && document.hidden) {
          try {
            new Notification(`Incoming ${type === "video" ? "Video" : "Voice"} Call`, {
              body: `${callerName} is calling you...`,
              icon: callerAvatar || "/favicon.ico",
              tag: "incoming-call",
              requireInteraction: true
            });
          } catch (e) {}
        }
      });
    });

    socket.on("call:waiting", ({ callId }) => {
      setCurrentCallId(callId);
      showToast("Waiting for participant to join meeting...");
    });

    socket.on("call:accepted", async ({ callId, isHost, partner }) => {
      showToast("Participant connected");
      if (partner) {
        setCallPartner(partner);
      }
      setCallState("active");
      stopSoundEffect();
      
      if (!timerRef.current) {
        setCallDuration(0);
        timerRef.current = setInterval(() => {
          setCallDuration((prev) => prev + 1);
        }, 1000);
      }

      if (isHost) {
        await setupWebRTC(true);
      } else {
        await setupLocalStreamOnly(callTypeRef.current);
      }
    });

    socket.on("call:rejected", ({ reason, callId }) => {
      stopSoundEffect();
      setCallState("idle");
      setCurrentCallId(null);
      setCallPartner(null);
      if (reason === "busy") {
        showToast("User is busy");
      } else if (reason === "unavailable") {
        showToast("Waiting in room for participant");
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
      await processIceQueue();
    });

    socket.on("call:answer", async ({ senderId, answer }) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        await processIceQueue();
      }
    });

    socket.on("call:ice-candidate", async ({ senderId, candidate }) => {
      await addIceCandidateSafely(candidate);
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
    iceCandidatesQueueRef.current = [];
    remoteStreamRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);
    setIsMuted(false);
    setIsCamOff(false);
    setFacingMode("user");
    setCallDuration(0);
    stopSoundEffect();
  };

  const setupLocalStreamOnly = async (type = "video") => {
    try {
      if (localStreamRef.current) return localStreamRef.current;
      const res = await requestCameraAndMicPermission(type);
      if (res.success && res.stream) {
        localStreamRef.current = res.stream;
        setLocalStream(res.stream);
        return res.stream;
      } else {
        showToast(res.error || "Camera/Mic permission required");
        return null;
      }
    } catch (e) {
      console.error("Local media setup failed:", e);
      showToast("Could not access media devices");
    }
  };

  const toggleCameraFacing = async () => {
    const newMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(newMode);
    if (localStreamRef.current) {
      const oldVideoTrack = localStreamRef.current.getVideoTracks()[0];
      if (oldVideoTrack) oldVideoTrack.stop();

      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: newMode, width: { ideal: 640 }, height: { ideal: 480 } },
          audio: true
        });
        const newVideoTrack = newStream.getVideoTracks()[0];
        if (oldVideoTrack) {
          localStreamRef.current.removeTrack(oldVideoTrack);
        }
        if (newVideoTrack) {
          localStreamRef.current.addTrack(newVideoTrack);
        }

        if (peerConnectionRef.current) {
          const sender = peerConnectionRef.current.getSenders().find(s => s.track && s.track.kind === "video");
          if (sender && newVideoTrack) {
            sender.replaceTrack(newVideoTrack);
          }
        }
        setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
      } catch (e) {
        console.error("Error toggling camera facing mode:", e);
      }
    }
  };

  const setupWebRTC = async (isCaller, remoteOffer = null) => {
    try {
      if (!isCaller && !remoteOffer) {
        await setupLocalStreamOnly(callTypeRef.current);
        return;
      }
      let stream = localStreamRef.current;
      if (!stream) {
        stream = await setupLocalStreamOnly(callTypeRef.current);
      }
      if (!stream) return;

      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionRef.current = pc;

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          const incomingStream = event.streams[0];
          setRemoteStream(new MediaStream(incomingStream.getTracks()));
          incomingStream.onaddtrack = () => {
            setRemoteStream(new MediaStream(incomingStream.getTracks()));
          };
          incomingStream.onremovetrack = () => {
            setRemoteStream(new MediaStream(incomingStream.getTracks()));
          };
        } else if (event.track) {
          setRemoteStream((prev) => {
            if (prev) {
              const existingTracks = prev.getTracks().filter(t => t.id !== event.track.id);
              return new MediaStream([...existingTracks, event.track]);
            }
            return new MediaStream([event.track]);
          });
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

  const startCall = async (receiver, type) => {
    if (!receiver || !receiver._id) return;
    if (receiver._id.toString() === currentUserId?.toString()) {
      showToast("Cannot call yourself");
      return;
    }
    if (callState !== "idle" && callState !== "ringing") return;

    const perm = await requestCameraAndMicPermission(type);
    if (!perm.success) {
      showToast(perm.error || "Permission required to make call");
      return;
    }

    setCallPartner(receiver);
    setCallType(type);
    setCallState("active");
    stopSoundEffect();

    localStreamRef.current = perm.stream;
    setLocalStream(perm.stream);

    socket.emit("call:initiate", {
      receiverId: receiver._id,
      type
    });
  };

  const acceptCall = async () => {
    if (callState !== "ringing" || !currentCallId) return;

    const perm = await requestCameraAndMicPermission(callTypeRef.current);
    if (!perm.success) {
      showToast(perm.error || "Permission required to accept call");
      return;
    }

    stopSoundEffect();
    setCallState("active");

    setCallDuration(0);
    if (!timerRef.current) {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }

    localStreamRef.current = perm.stream;
    setLocalStream(perm.stream);
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
  const localVideoMainRef = useRef(null);
  const localVideoPipRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const hasRemoteVideo = Boolean(
    remoteStream &&
    remoteStream.getVideoTracks().length > 0 &&
    remoteStream.getVideoTracks()[0].readyState === "live" &&
    !remoteStream.getVideoTracks()[0].muted
  );

  useEffect(() => {
    if (localStream) {
      if (localVideoMainRef.current && localVideoMainRef.current.srcObject !== localStream) {
        localVideoMainRef.current.srcObject = localStream;
        localVideoMainRef.current.play().catch(() => {});
      }
      if (localVideoPipRef.current && localVideoPipRef.current.srcObject !== localStream) {
        localVideoPipRef.current.srcObject = localStream;
        localVideoPipRef.current.play().catch(() => {});
      }
    }
  }, [localStream, callState, hasRemoteVideo]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      if (remoteVideoRef.current.srcObject !== remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
      const playPromise = remoteVideoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("Mobile autoplay failed, attaching interaction listeners:", err);
          const handleTouch = () => {
            if (remoteVideoRef.current) remoteVideoRef.current.play().catch(() => {});
            window.removeEventListener("touchstart", handleTouch);
            window.removeEventListener("click", handleTouch);
          };
          window.addEventListener("touchstart", handleTouch);
          window.addEventListener("click", handleTouch);
        });
      }
    }
  }, [remoteStream, callState, hasRemoteVideo]);

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
        facingMode,
        localStream,
        remoteStream,
        startCall,
        acceptCall,
        rejectCall,
        cancelCall,
        endCall,
        toggleMute,
        toggleCamera,
        toggleCameraFacing
      }}
    >
      {children}

      {/* Global Toast Notifier */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-[#0F172A] border border-white/10 text-white font-bold text-xs py-3 px-6 rounded-full shadow-2xl z-[99999] animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Incoming Call Modal (WhatsApp Style Fullscreen Alert) */}
      {callState === "ringing" && callPartner && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center z-[99999] select-none p-4 animate-fadeIn">
          <div className="relative bg-slate-900/90 border border-white/10 p-8 rounded-3xl w-full max-w-sm text-center shadow-2xl overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Ripple Avatar Container */}
            <div className="relative w-28 h-28 mx-auto mb-6 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
              <div className="absolute -inset-3 rounded-full border border-emerald-500/40 animate-pulse" />
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#7C3AED] via-[#6366F1] to-[#38BDF8] flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-emerald-500/20 z-10 overflow-hidden border-2 border-white/20">
                {callPartner.avatar ? (
                  <img src={callPartner.avatar} alt={callPartner.name} className="w-full h-full object-cover" />
                ) : (
                  callPartner.name?.charAt(0).toUpperCase()
                )}
              </div>
            </div>

            <h3 className="text-white font-extrabold text-xl tracking-tight">{callPartner.name}</h3>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mt-2">
              {callType === "video" ? <FaVideo className="text-xs" /> : <FaPhoneAlt className="text-xs" />}
              <span>Incoming {callType === "video" ? "Video Call" : "Voice Call"}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center items-center gap-10 mt-8">
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={rejectCall}
                  className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 transition hover:scale-110 active:scale-95 cursor-pointer"
                  title="Decline Call"
                >
                  <FaPhoneSlash className="text-xl" />
                </button>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Decline</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={acceptCall}
                  className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 transition hover:scale-110 active:scale-95 cursor-pointer animate-bounce"
                  title="Accept Call"
                >
                  <FaPhoneAlt className="text-xl" />
                </button>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Accept</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Outgoing Calling Modal */}
      {callState === "calling" && callPartner && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center z-[99999] select-none p-4 animate-fadeIn">
          <div className="relative bg-slate-900/90 border border-white/10 p-8 rounded-3xl w-full max-w-sm text-center shadow-2xl overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Ripple Avatar Container */}
            <div className="relative w-28 h-28 mx-auto mb-6 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-ping" />
              <div className="absolute -inset-3 rounded-full border border-purple-500/40 animate-pulse" />
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#7C3AED] via-[#6366F1] to-[#38BDF8] flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-purple-500/30 z-10 overflow-hidden border-2 border-white/20">
                {callPartner.avatar ? (
                  <img src={callPartner.avatar} alt={callPartner.name} className="w-full h-full object-cover" />
                ) : (
                  callPartner.name?.charAt(0).toUpperCase()
                )}
              </div>
            </div>

            <h3 className="text-white font-extrabold text-xl tracking-tight">{callPartner.name}</h3>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold mt-2">
              {callType === "video" ? <FaVideo className="text-xs" /> : <FaPhoneAlt className="text-xs" />}
              <span>{callType === "video" ? "Outgoing Video Call" : "Outgoing Voice Call"}</span>
            </div>

            <p className="text-slate-400 text-xs font-semibold tracking-wider mt-4 flex items-center justify-center gap-1.5">
              <span>Calling</span>
              <span className="inline-flex gap-1 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </span>
            </p>

            <div className="mt-8 flex flex-col items-center gap-2">
              <button
                onClick={cancelCall}
                className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 transition hover:scale-110 active:scale-95 cursor-pointer"
                title="Cancel Call"
              >
                <FaPhoneSlash className="text-xl" />
              </button>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cancel Call</span>
            </div>
          </div>
        </div>
      )}

      {/* Active Call Interface (WhatsApp Dual Video View / Voice Call) */}
      {callState === "active" && callPartner && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-2xl flex flex-col justify-between p-3 sm:p-6 z-[99999] select-none animate-fadeIn">
          {/* Call Header */}
          <div className="flex items-center justify-between bg-slate-900/80 border border-white/10 rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3 max-w-xl mx-auto w-full backdrop-blur-md shadow-xl z-30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#38BDF8] flex items-center justify-center text-white font-bold text-xs sm:text-sm overflow-hidden border border-white/20 shrink-0">
                {callPartner.avatar ? (
                  <img src={callPartner.avatar} alt={callPartner.name} className="w-full h-full object-cover" />
                ) : (
                  callPartner.name?.charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <h4 className="text-white font-bold text-xs sm:text-sm leading-tight truncate">{callPartner.name}</h4>
                <p className="text-slate-400 text-[10px] font-semibold flex items-center gap-1.5 mt-0.5 truncate">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span>{callType === "video" ? "Video Call" : "Voice Call"}</span>
                </p>
              </div>
            </div>

            <div className="px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-slate-800/80 border border-white/10 text-cyan-400 text-xs font-mono font-bold tracking-widest shadow-inner shrink-0">
              {formatDuration(callDuration)}
            </div>
          </div>

          {/* Call Body Stream / Dual Video View */}
          {callType === "video" ? (
            <div className="relative flex-1 bg-slate-900/80 border border-white/10 my-3 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center max-w-4xl mx-auto w-full">
              {/* Main Remote Video Stream (Always mounted in DOM to prevent play reset) */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className={`w-full h-full object-cover ${hasRemoteVideo ? "block" : "hidden"}`}
              />

              {/* Connecting / Local Stream Preview when remote video is not active */}
              {!hasRemoteVideo && (
                <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
                  {isCamOff ? (
                    <div className="w-full h-full bg-slate-900 text-xs font-extrabold text-slate-400 flex flex-col items-center justify-center gap-2 uppercase">
                      <FaVideoSlash className="text-3xl text-slate-500" />
                      <span>Camera Off</span>
                    </div>
                  ) : (
                    <video
                      ref={localVideoMainRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover ${facingMode === "user" ? "transform scale-x-[-1]" : ""}`}
                    />
                  )}
                  {/* Floating Status Pill Banner */}
                  <div className="absolute top-4 inset-x-4 bg-slate-950/80 border border-white/10 backdrop-blur-md rounded-2xl p-3 text-center z-10 max-w-md mx-auto">
                    <h3 className="text-white font-extrabold text-xs sm:text-sm tracking-tight flex items-center justify-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                      Connecting Video Call...
                    </h3>
                    <p className="text-purple-300 text-[10px] sm:text-xs font-bold mt-0.5">
                      Waiting for {callPartner.name} to connect media
                    </p>
                  </div>
                </div>
              )}

              {/* Floating PIP (Picture-In-Picture) Local Camera Box (WhatsApp Style Dual Camera View) */}
              <div className="absolute bottom-4 right-4 w-28 sm:w-44 h-40 sm:h-56 bg-slate-950 border-2 border-white/20 rounded-2xl overflow-hidden shadow-2xl z-20 group transition-all">
                {isCamOff ? (
                  <div className="w-full h-full bg-slate-900 text-[9px] sm:text-[10px] font-extrabold text-slate-400 flex flex-col items-center justify-center gap-1 uppercase">
                    <FaVideoSlash className="text-sm text-slate-500" />
                    <span>Camera Off</span>
                  </div>
                ) : (
                  <video
                    ref={localVideoPipRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${facingMode === "user" ? "transform scale-x-[-1]" : ""}`}
                  />
                )}
                <button
                  onClick={toggleCameraFacing}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition cursor-pointer text-xs backdrop-blur-sm shadow-md"
                  title="Flip Camera (Front / Back)"
                >
                  <FaSync className="text-xs" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center my-6">
              <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-ping" />
                <div className="absolute -inset-4 rounded-full border border-purple-500/30 animate-pulse" />
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-[#7C3AED] via-[#6366F1] to-[#38BDF8] flex items-center justify-center text-white text-4xl sm:text-5xl font-black shadow-2xl shadow-purple-500/30 z-10 overflow-hidden border-4 border-white/20">
                  {callPartner.avatar ? (
                    <img src={callPartner.avatar} alt={callPartner.name} className="w-full h-full object-cover" />
                  ) : (
                    callPartner.name?.charAt(0).toUpperCase()
                  )}
                </div>
              </div>

              {/* Animated Sound Wave Visualizer */}
              <div className="flex items-end gap-1.5 h-8 mt-8">
                {[40, 70, 30, 90, 50, 80, 40, 60, 100, 40].map((h, i) => (
                  <span
                    key={i}
                    className="w-1.5 bg-gradient-to-t from-purple-500 to-cyan-400 rounded-full animate-pulse"
                    style={{
                      height: `${h}%`,
                      animationDuration: `${0.6 + (i % 4) * 0.2}s`
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Floating Pill Control Bar */}
          <div className="flex items-center justify-center gap-3 sm:gap-5 bg-slate-900/90 border border-white/15 backdrop-blur-xl px-4 sm:px-6 py-3 rounded-full shadow-2xl max-w-fit mx-auto mb-2 z-30">
            <button
              onClick={toggleMute}
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition cursor-pointer border ${
                isMuted
                  ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                  : "bg-white/10 border-white/15 text-white hover:bg-white/20"
              }`}
              title={isMuted ? "Unmute Mic" : "Mute Mic"}
            >
              {isMuted ? <FaMicrophoneSlash className="text-base sm:text-lg" /> : <FaMicrophone className="text-base sm:text-lg" />}
            </button>

            {callType === "video" && (
              <>
                <button
                  onClick={toggleCamera}
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition cursor-pointer border ${
                    isCamOff
                      ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                      : "bg-white/10 border-white/15 text-white hover:bg-white/20"
                  }`}
                  title={isCamOff ? "Turn Camera On" : "Turn Camera Off"}
                >
                  {isCamOff ? <FaVideoSlash className="text-base sm:text-lg" /> : <FaVideo className="text-base sm:text-lg" />}
                </button>
                <button
                  onClick={toggleCameraFacing}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/10 border border-white/15 text-white hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
                  title="Flip Camera (Front / Back)"
                >
                  <FaSync className="text-sm sm:text-base" />
                </button>
              </>
            )}

            <button
              onClick={endCall}
              className="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 transition hover:scale-110 active:scale-95 cursor-pointer"
              title="End Call"
            >
              <FaPhoneSlash className="text-lg sm:text-xl" />
            </button>
          </div>
        </div>
      )}
    </CallContext.Provider>
  );
};

