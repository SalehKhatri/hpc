// CallContext.js
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import peer from "../services/peer"; // adjust the import path accordingly
import { useSocket } from "./SocketProvider";

const CallContext = createContext();

const CallProvider = ({ children }) => {
  const socket = useSocket()
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isIncommingCall, setIsIncommingCall] = useState(false);
  const [isCallAccepted, setIsCallAccepted] = useState(false);
  const [callerName, setCallerName] = useState("");
  const [callingTo, setCallingTo] = useState("");

  const [ringingAudio] = useState(new Audio("/ringing.mp3"));
  const [waitingAudio] = useState(new Audio("/waiting.mp3"));

  const playRingingSound = useCallback(() => {
    ringingAudio.loop = true;
    ringingAudio.play();
  }, [ringingAudio]);

  const stopRingingSound = useCallback(() => {
    ringingAudio.pause();
    ringingAudio.currentTime = 0;
  }, [ringingAudio]);

  const playWaitingSound = useCallback(() => {
    waitingAudio.loop = true;
    waitingAudio.play();
  }, [waitingAudio]);

  const stopWaitingSound = useCallback(() => {
    waitingAudio.pause();
    waitingAudio.currentTime = 0;
  }, [waitingAudio]);

  useEffect(() => {
    return () => {
      ringingAudio.pause();
      ringingAudio.currentTime = 0;
      waitingAudio.pause();
      waitingAudio.currentTime = 0;
    };
  }, [ringingAudio, waitingAudio]);

  const handleIncommingCall = useCallback(
    async ({ from, name, offer }) => {
      setCallerName(name);
      setShowModal(true);
      setIsIncommingCall(true);
      setRemoteSocketId(from);
      playRingingSound();
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const handleCallUser = useCallback(
    async (contact) => {
      setCallingTo(contact.userName);
      setIsIncommingCall(false);
      setShowModal(true);
      playWaitingSound();
      setRemoteSocketId(contact._id);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      const offer = await peer.getOffer();
      socket.emit("user:call", {
        to: contact._id,
        name: JSON.parse(localStorage.getItem("account")),
        offer,
      });
      setMyStream(stream);
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    async ({ from, ans }) => {
      peer.setLocalDescription(ans);
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { to: remoteSocketId, offer });
  }, [remoteSocketId, socket]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoFinal = useCallback(async ({ from, ans }) => {
    await peer.setLocalDescription(ans);
  });

  const leaveCall = useCallback(() => {
    socket.emit("leave:call", { to: remoteSocketId });
    if (myStream) {
      myStream.getTracks().forEach((track) => track.stop());
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
    }
    setShowModal(false);
    setMyStream(null);
    setRemoteStream(null);
    setRemoteSocketId(null);
    setIsCallAccepted(false);
    setIsIncommingCall(false);
    stopRingingSound();
    stopWaitingSound();
  }, [myStream, remoteStream, remoteSocketId, socket]);

  useEffect(() => {
    if (!socket) return;

    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoFinal);
    socket.on("call:ended", leaveCall);

    return () => {
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoFinal);
      socket.off("call:ended", leaveCall);
    };
  }, [
    socket,
    handleIncommingCall,
    leaveCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoFinal,
  ]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);

    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      if (!isIncommingCall && !isCallAccepted) {
        setIsCallAccepted(true);
        stopWaitingSound();
      } else {
        setIsCallAccepted(false);
      }

      const remoteStream = ev.streams[0];
      setRemoteStream(remoteStream);
    });
  }, [isIncommingCall, isCallAccepted]);

  const acceptCall = () => {
    stopRingingSound();
    sendStreams();
    setIsCallAccepted(true);
  };

  return (
    <CallContext.Provider
      value={{
        showModal,
        callerName,
        callingTo,
        leaveCall,
        isIncommingCall,
        myStream,
        remoteStream,
        sendStreams,
        isCallAccepted,
        acceptCall,
        handleCallUser,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => useContext(CallContext);

export default CallProvider;
