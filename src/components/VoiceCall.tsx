import React, { useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { X } from "lucide-react";

const SIGNALR_URL = "http://mazadpalestine.runasp.net/callHub"; // عدل الرابط إذا لزم

interface VoiceCallProps {
  currentUserId: number;
  targetUserId: number;
  token: string | null;
  onEndCall?: () => void;
}

// دالة استخراج UserId من التوكن
function getUserIdFromToken(token: string | null): string | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || null;
  } catch {
    return null;
  }
}

const VoiceCall: React.FC<VoiceCallProps> = ({ currentUserId, targetUserId, token, onEndCall }) => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [callIncoming, setCallIncoming] = useState(false);
  const [callAccepted, setCallAccepted] = useState(false);
  const localStream = useRef<HTMLAudioElement>(null);
  const remoteStream = useRef<HTMLAudioElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);

  // إعداد SignalR
  useEffect(() => {
    if (!token) return;
    const conn = new signalR.HubConnectionBuilder()
      .withUrl(SIGNALR_URL, {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build();

    // طباعة UserId للطرف الحالي والطرف الآخر
    const myUserId = getUserIdFromToken(token);
    console.log('VoiceCall: myUserId:', myUserId, 'targetUserId:', targetUserId);

    conn.on("ReceiveCall", (fromUserId) => {
      setCallIncoming(true);
    });

    conn.on("CallAccepted", async (fromUserId) => {
      setCallAccepted(true);
      await startWebRTC(true); // أنت المتصل
    });

    conn.on("CallRejected", () => {
      alert("تم رفض المكالمة");
      endCall();
    });

    conn.on("CallEnded", () => {
      alert("تم إنهاء المكالمة");
      endCall();
    });

    conn.on("ReceiveSignal", async (fromUserId, signalData) => {
      const data = JSON.parse(signalData);
      if (data.sdp) {
        console.log("Received SDP from", fromUserId, data.sdp);
        await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(data.sdp));
        if (data.sdp.type === "offer") {
          const answer = await peerConnection.current?.createAnswer();
          if (answer) {
            await peerConnection.current?.setLocalDescription(answer);
            sendSignal(targetUserId, { sdp: answer });
          }
        }
      } else if (data.candidate) {
        console.log("Received ICE candidate from", fromUserId, data.candidate);
        await peerConnection.current?.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

    conn.start().then(() => setConnection(conn));
    return () => {
      conn.stop();
    };
    // eslint-disable-next-line
  }, [token]);

  // بدء مكالمة
  const startCall = async () => {
    if (connection) {
      await connection.invoke("StartCall", targetUserId);
    }
  };

  // قبول مكالمة
  const acceptCall = async () => {
    if (connection) {
      await connection.invoke("AcceptCall", targetUserId);
      setCallAccepted(true);
      await startWebRTC(false); // أنت المستقبل
    }
  };

  // إنهاء مكالمة
  const endCall = async () => {
    if (connection) {
      await connection.invoke("EndCall", targetUserId);
    }
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    setCallAccepted(false);
    setCallIncoming(false);
    if (onEndCall) onEndCall();
  };

  // إرسال بيانات WebRTC عبر SignalR
  const sendSignal = async (toUserId: number, data: any) => {
    if (connection) {
      console.log("Sending signal to", toUserId, data);
      await connection.invoke("SendSignal", toUserId, JSON.stringify(data));
    }
  };

  // إعداد WebRTC
  const startWebRTC = async (isCaller: boolean) => {
    peerConnection.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("Sending ICE candidate", event.candidate);
        sendSignal(targetUserId, { candidate: event.candidate });
      }
    };

    peerConnection.current.ontrack = (event) => {
      if (remoteStream.current) {
        remoteStream.current.srcObject = event.streams[0];
      }
    };

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    console.log("Local stream:", stream);
    if (localStream.current) {
      localStream.current.srcObject = stream;
    }
    stream.getTracks().forEach((track) => {
      peerConnection.current?.addTrack(track, stream);
    });

    if (isCaller) {
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      sendSignal(targetUserId, { sdp: offer });
    }
  };

  return (
    <div className="voice-call-modal">
      {/* عنوان وأيقونة */}
      <div className="header">
        <span className="icon">📞</span>
        <span className="title">مكالمة صوتية</span>
      </div>
      <audio ref={localStream} autoPlay muted style={{ display: 'none' }} />
      <audio ref={remoteStream} autoPlay style={{ display: 'none' }} />
      {/* زر بدء مكالمة أو حالة المكالمة */}
      {!callAccepted && !callIncoming && (
        <button className="start-call-btn" onClick={startCall}>بدء مكالمة</button>
      )}
      {callIncoming && !callAccepted && (
        <div className="flex flex-col items-center gap-2 mt-4">
          <span>مكالمة واردة...</span>
          <button className="accept-btn" onClick={acceptCall}>قبول</button>
          <button className="end-btn" onClick={endCall}>رفض</button>
        </div>
      )}
      {callAccepted && (
        <button className="end-btn mt-4" onClick={endCall}>إنهاء المكالمة</button>
      )}
    </div>
  );
};

export default VoiceCall; 