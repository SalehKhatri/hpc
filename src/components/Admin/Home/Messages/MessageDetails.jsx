// MessageDetails.jsx
import React, { useState, useEffect } from "react";
import { getMessages, getPatients } from "../../../../services/api";
import { FaVideo } from "react-icons/fa";
import { useCall } from "../../../../context/CallContext";
import { useSocket } from "../../../../context/SocketProvider";

const MessageDetails = () => {
  const {
    handleCallUser,
  } = useCall();
  const socket = useSocket()

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
      setReceiverData({
        id: contactsData[0]._id,
        name: contactsData[0].userName,
      });
    }
  };

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

  useEffect(() => {
    fetchMessages();
  }, [receiverData]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === "" || receiverData.id === "") return;

    socket.emit("sendMessage", {
      receiverId: receiverData.id,
      message: newMessage.trim(),
    });

    setMessages((prevMessages) => [
      ...prevMessages,
      { senderId: localStorage.getItem("id"), message: newMessage.trim() },
    ]);
    setNewMessage("");
  };

  const selectContact = (contact) => {
    setReceiverData({ id: contact._id, name: contact.userName });
  };

  const getInitials = (name) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="w-full flex justify-between items-start p-4 gap-8">
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
                onClick={(e) => handleCallUser(contact, e)}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="w-2/3 flex flex-col h-[90vh] bg-[#D9D9D9] rounded-lg shadow-lg overflow-hidden">
        <div className="bg-[#92a8c6] text-white py-2 px-4 rounded-t-lg">
          <h2 className="text-lg font-semibold">
            {receiverData?.name || "Select a contact to start chatting"}
          </h2>
        </div>
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
