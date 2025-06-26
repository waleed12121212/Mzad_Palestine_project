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
    const userId = payload.sub || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || null;
    console.log('VoiceCall - Extracted userId from token:', userId);
    console.log('VoiceCall - Full token payload:', payload);
    return userId;
  } catch (error) {
    console.error('VoiceCall - Error extracting userId from token:', error);
    return null;
  }
}

const VoiceCall: React.FC<VoiceCallProps> = ({ currentUserId, targetUserId, token, onEndCall }) => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [callIncoming, setCallIncoming] = useState(false);
  const [callAccepted, setCallAccepted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const localStream = useRef<HTMLAudioElement>(null);
  const remoteStream = useRef<HTMLAudioElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);

  // إعداد SignalR
  useEffect(() => {
    if (!token) {
      console.error('VoiceCall - No token provided');
      return;
    }

    const myUserId = getUserIdFromToken(token);
    console.log('VoiceCall - myUserId:', myUserId, 'targetUserId:', targetUserId);
    
    if (!myUserId) {
      console.error('VoiceCall - Could not extract userId from token');
      return;
    }

    const conn = new signalR.HubConnectionBuilder()
      .withUrl(SIGNALR_URL, {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect([0, 2000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Debug)
      .build();

    // تسجيل الأحداث
    conn.on("ReceiveCall", (fromUserId) => {
      console.log('VoiceCall - Received call from:', fromUserId);
      setCallIncoming(true);
    });

    conn.on("CallAccepted", async (fromUserId) => {
      console.log('VoiceCall - Call accepted by:', fromUserId);
      setCallAccepted(true);
      await startWebRTC(true); // أنت المتصل
    });

    conn.on("CallRejected", () => {
      console.log('VoiceCall - Call rejected');
      alert("تم رفض المكالمة");
      endCall();
    });

    conn.on("CallEnded", () => {
      console.log('VoiceCall - Call ended');
      alert("تم إنهاء المكالمة");
      endCall();
    });

    conn.on("ReceiveSignal", async (fromUserId, signalData) => {
      console.log('VoiceCall - Received signal from:', fromUserId, 'data:', signalData);
      const data = JSON.parse(signalData);
      if (data.sdp) {
        console.log("VoiceCall - Received SDP from", fromUserId, data.sdp);
        await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(data.sdp));
        if (data.sdp.type === "offer") {
          const answer = await peerConnection.current?.createAnswer();
          if (answer) {
            await peerConnection.current?.setLocalDescription(answer);
            sendSignal(targetUserId, { sdp: answer });
          }
        }
      } else if (data.candidate) {
        console.log("VoiceCall - Received ICE candidate from", fromUserId, data.candidate);
        await peerConnection.current?.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

    // معالجات حالة الاتصال
    conn.onreconnecting((error) => {
      console.log('VoiceCall - Reconnecting...', error);
      setIsConnected(false);
    });

    conn.onreconnected((connectionId) => {
      console.log('VoiceCall - Reconnected with connection ID:', connectionId);
      setIsConnected(true);
    });

    conn.onclose((error) => {
      console.log('VoiceCall - Connection closed:', error);
      setIsConnected(false);
    });

    // بدء الاتصال
    conn.start()
      .then(() => {
        console.log('VoiceCall - SignalR connected successfully');
        console.log('VoiceCall - Connection ID:', conn.connectionId);
        setConnection(conn);
        setIsConnected(true);
      })
      .catch((error) => {
        console.error('VoiceCall - Failed to start SignalR connection:', error);
      });

    return () => {
      console.log('VoiceCall - Cleaning up SignalR connection');
      conn.stop();
    };
    // eslint-disable-next-line
  }, [token, targetUserId]);

  // بدء مكالمة
  const startCall = async () => {
    if (!connection || !isConnected) {
      console.error('VoiceCall - Cannot start call: not connected');
      alert('لا يمكن بدء المكالمة: الاتصال غير متوفر');
      return;
    }
    
    // طباعة للتأكد من نوع وقيمة targetUserId
    console.log('targetUserId sent to StartCall:', targetUserId, typeof targetUserId);
    
    console.log('VoiceCall - Starting call to:', targetUserId);
    try {
      await connection.invoke("StartCall", targetUserId.toString());
      console.log('VoiceCall - Call started successfully');
    } catch (error) {
      console.error('VoiceCall - Error starting call:', error);
      alert('فشل في بدء المكالمة');
    }
  };

  // قبول مكالمة
  const acceptCall = async () => {
    if (!connection || !isConnected) {
      console.error('VoiceCall - Cannot accept call: not connected');
      alert('لا يمكن قبول المكالمة: الاتصال غير متوفر');
      return;
    }
    
    console.log('VoiceCall - Accepting call from:', targetUserId);
    try {
      await connection.invoke("AcceptCall", targetUserId);
      setCallAccepted(true);
      await startWebRTC(false); // أنت المستقبل
      console.log('VoiceCall - Call accepted successfully');
    } catch (error) {
      console.error('VoiceCall - Error accepting call:', error);
      alert('فشل في قبول المكالمة');
    }
  };

  // إنهاء مكالمة
  const endCall = async () => {
    console.log('VoiceCall - Ending call');
    if (connection && isConnected) {
      try {
        await connection.invoke("EndCall", targetUserId);
        console.log('VoiceCall - Call ended successfully');
      } catch (error) {
        console.error('VoiceCall - Error ending call:', error);
      }
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
    if (connection && isConnected) {
      console.log("VoiceCall - Sending signal to", toUserId, data);
      try {
        await connection.invoke("SendSignal", toUserId, JSON.stringify(data));
        console.log("VoiceCall - Signal sent successfully");
      } catch (error) {
        console.error("VoiceCall - Error sending signal:", error);
      }
    } else {
      console.error("VoiceCall - Cannot send signal: not connected");
    }
  };

  // إعداد WebRTC
  const startWebRTC = async (isCaller: boolean) => {
    console.log('VoiceCall - Starting WebRTC, isCaller:', isCaller);
    
    try {
      peerConnection.current = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
      });

      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("VoiceCall - Sending ICE candidate", event.candidate);
          sendSignal(targetUserId, { candidate: event.candidate });
        }
      };

      peerConnection.current.ontrack = (event) => {
        console.log("VoiceCall - Received remote track");
        if (remoteStream.current) {
          remoteStream.current.srcObject = event.streams[0];
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      console.log("VoiceCall - Local stream obtained:", stream);
      
      if (localStream.current) {
        localStream.current.srcObject = stream;
      }
      
      stream.getTracks().forEach((track) => {
        peerConnection.current?.addTrack(track, stream);
      });

      if (isCaller) {
        console.log("VoiceCall - Creating offer as caller");
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        sendSignal(targetUserId, { sdp: offer });
      }
      
      console.log('VoiceCall - WebRTC setup completed');
    } catch (error) {
      console.error('VoiceCall - Error setting up WebRTC:', error);
      alert('فشل في إعداد المكالمة الصوتية');
    }
  };

  return (
    <div className="voice-call-modal">
      {/* عنوان وأيقونة */}
      <div className="header">
        <span className="icon">📞</span>
        <span className="title">مكالمة صوتية</span>
        <div className="connection-status">
          {isConnected ? '🟢 متصل' : '🔴 غير متصل'}
        </div>
      </div>
      <audio ref={localStream} autoPlay muted style={{ display: 'none' }} />
      <audio ref={remoteStream} autoPlay style={{ display: 'none' }} />
      
      {/* زر بدء مكالمة أو حالة المكالمة */}
      {!callAccepted && !callIncoming && (
        <button 
          className="start-call-btn" 
          onClick={startCall}
          disabled={!isConnected}
        >
          {isConnected ? 'بدء مكالمة' : 'جاري الاتصال...'}
        </button>
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