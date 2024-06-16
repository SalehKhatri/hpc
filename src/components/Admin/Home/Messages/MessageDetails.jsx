import { useEffect, useState, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { getMessages, getPatients } from "../../../../services/api";
import { FaVideo } from "react-icons/fa";
import peer from "../../../../services/peer";
import CallModal from "./CallModal";
const token = localStorage.getItem("token");

// Initialize Socket.io client with token for authentication
const socket = io("http://localhost:4000", {
  query: {
    token: token,
  },
});

const MessageDetails = () => {
  //States for messages
  const [contacts, setContacts] = useState([]);
  const [receiverData, setReceiverData] = useState({ id: "", name: "" });
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const getContacts = async () => {
    const response = await getPatients();
    const contactsData = response.filter(
      (contact) => contact._id !== localStorage.getItem("id")
    );
    setContacts(contactsData);
    if (contactsData.length > 0) {
      // Set the first contact as the default receiver
      setReceiverData({
        id: contactsData[0]._id,
        name: contactsData[0].userName,
      });
    }
  };

  // Function to fetch messages between the current user and the selected receiver
  const fetchMessages = async () => {
    const senderId = localStorage.getItem("id");
    const receiverId = receiverData.id;
    const response = await getMessages(senderId, receiverId);
    if (response) {
      setMessages(response);
    } else {
      console.log("An error occured!!");
    }
  };

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server");
    });

    // Ensure listener is only set once
    socket.off("newMessage");
    socket.on("newMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    getContacts();

    // Clean up the socket connection on component unmount
    return () => {
      socket.off("newMessage");
      socket.disconnect();
    };
  }, [socket]);

  // Effect to fetch messages whenever the receiver changes
  useEffect(() => {
    fetchMessages();
  }, [receiverData]);

  // Function to send a new message
  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === "" || receiverData.id === "") return;

    // Emit the message event to the server
    socket.emit("sendMessage", {
      receiverId: receiverData.id,
      message: newMessage.trim(),
    });

    // Update the local state with the new message
    setMessages((prevMessages) => [
      ...prevMessages,
      { senderId: localStorage.getItem("id"), message: newMessage.trim() },
    ]);
    setNewMessage("");
  };

  // Function to select a contact from the list
  const selectContact = (contact) => {
    setReceiverData({ id: contact._id, name: contact.userName });
  };

  // Function to get initials from a name
  const getInitials = (name) => {
    return name.charAt(0).toUpperCase();
  };

  // Everything of call functionality starts here

  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const [remoteSocketId, setRemoteSocketId] = useState();
  const [showModal, setShowModal] = useState(false);
  const [isIncommingCall, setIsIncommingCall] = useState(false);
  const [isCallAccepted, setIsCallAccepted] = useState(false);
  const [callerName, setCallerName] = useState("");
  const [callingTo, setCallingTo] = useState("");

  // Logic for ringing!
  const [ringingAudio] = useState(new Audio("/public/ringing.mp3"));
  const [waitingAudio] = useState(new Audio("/public/waiting.mp3"));

  const playRingingSound = useCallback(() => {
    ringingAudio.loop = true; // Loop the ringing sound
    ringingAudio.play();
  }, [ringingAudio]);

  // Function to stop ringing audio
  const stopRingingSound = useCallback(() => {
    ringingAudio.pause();
    ringingAudio.currentTime = 0; // Reset audio to beginning
    console.log("Sound stopped");
  }, [ringingAudio]);

  // Function to play waiting tone audio
  const playWaitingSound = useCallback(() => {
    waitingAudio.loop = true; // Loop the waiting tone
    waitingAudio.play();
  }, [waitingAudio]);

  // Function to stop waiting tone audio
  const stopWaitingSound = useCallback(() => {
    waitingAudio.pause();
    waitingAudio.currentTime = 0; // Reset audio to beginning
  }, [waitingAudio]);

  // Clean up audio resources on component unmount
  useEffect(() => {
    return () => {
      ringingAudio.pause();
      ringingAudio.currentTime = 0;
      waitingAudio.pause();
      waitingAudio.currentTime = 0;
    };
  }, [ringingAudio, waitingAudio]);

  // Logic for ringing ends here
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
    async (contact, e) => {
      e.stopPropagation();
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
        name: localStorage.getItem("account"),
        offer: offer,
      });
      setMyStream(stream);
    },
    [receiverData.id, socket]
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
    socket.emit("peer:nego:needed", { to: remoteSocketId, offer: offer });
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
      console.log("GOT TRACKS");
      if (!isIncommingCall && !isCallAccepted) {
        setIsCallAccepted(true);
        stopWaitingSound();
      } else {
        setIsCallAccepted(false);
        // playRingingSound()
      }

      const remoteStream = ev.streams[0];
      setRemoteStream(remoteStream);
    });
  }, [remoteStream, isIncommingCall, isCallAccepted]);

  const acceptCall = () => {
    stopRingingSound();
    sendStreams();
    setIsCallAccepted(true);
  };

  return (
    <div className="w-full flex justify-between items-start p-4 gap-8">
      {showModal && (
        <CallModal
          callingTo={callingTo}
          callerName={callerName}
          leaveCall={leaveCall}
          isIncommingCall={isIncommingCall}
          myStream={myStream}
          remoteStream={remoteStream}
          sendStreams={sendStreams}
          isCallAccepted={isCallAccepted}
          acceptCall={acceptCall}
        />
      )}
      {/* Contacts Section */}
      <div className="w-1/3 h-[90vh] flex flex-col bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="sticky top-0 bg-[#92A8C6] px-4 py-2 shadow-md rounded-t-lg">
          <h1 className="text-lg font-semibold text-white">Messages</h1>
        </div>
        <div className="flex-1 bg-[#D9D9D9] overflow-y-auto p-4">
          <h2 className="text-xl font-semibold mb-4">Contacts</h2>
          {contacts?.map((contact, key) => (
            <div
              key={key}
              className={`flex items-center justify-between mb-4 p-2 rounded-md cursor-pointer transition-colors ${
                receiverData.id === contact._id
                  ? "bg-[#92a8c6] text-white "
                  : "hover:bg-[#92a8c6] hover:text-white"
              }`}
              onClick={() => selectContact(contact)}
              role="button"
              tabIndex={0}
              aria-pressed={receiverData.id === contact._id}
            >
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 transition-colors ${
                    receiverData.id === contact._id
                      ? "bg-white text-[#92a8c6]"
                      : "bg-[#92a8c6] text-white"
                  } hover:bg-[#92a8c6] hover:text-white`}
                >
                  {getInitials(contact.userName)}
                </div>
                <span className="font-semibold text-lg">
                  {contact.userName}
                </span>
              </div>
              <FaVideo
                className={`text-3xl cursor-pointer ${
                  receiverData.id === contact._id
                    ? "text-white"
                    : "text-[#92a8c6] hover:text-white"
                }`}
                onClick={(e) => handleCallUser(contact, e)} // Call initiate function
              />{" "}
              {/* Call icon */}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Section */}
      <div className="w-2/3 flex flex-col h-[90vh] bg-[#D9D9D9] rounded-lg shadow-lg overflow-hidden">
        {/* Top Bar */}
        <div className="bg-[#92a8c6] text-white py-2 px-4 rounded-t-lg">
          <h2 className="text-lg font-semibold">
            {receiverData?.name || "Select a contact to start chatting"}
          </h2>
        </div>
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length > 0 && messages !== "NOMESSAGES" ? (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.senderId === localStorage.getItem("id")
                    ? "justify-end"
                    : "justify-start"
                } animate-fadeIn`}
              >
                <div
                  className={`p-3 rounded-lg max-w-xs shadow-md ${
                    msg.senderId === localStorage.getItem("id")
                      ? "bg-[#92a8c6] text-white"
                      : "bg-white text-black"
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 mt-4">
              No messages yet. Start the conversation!
            </div>
          )}
        </div>
        {/* Message Input Form */}
        {receiverData.id && (
          <div className="w-full bg-white rounded-b-lg p-4">
            <form className="w-full flex items-center" onSubmit={sendMessage}>
              <input
                type="text"
                className="flex-grow h-[2.5rem] p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#92a8c6]"
                placeholder="Enter your message..."
                aria-label="Enter your message"
                onChange={(e) => setNewMessage(e.target.value)}
                value={newMessage}
                required
              />
              <button
                type="submit"
                className="ml-2 px-4 py-2 text-white bg-[#92a8c6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#92a8c6]"
                aria-label="Send message"
              >
                Send
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageDetails;
