// components/NewMessageModal.jsx
import React, { useEffect, useState } from "react";
import { useMessage } from "../../../../context/MessageContext";
import notificationSound from "/messageSound.mp3"
const NewMessageModal = () => {
  const { newMessage, showModal, closeModal } = useMessage();
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (showModal) {
      const timeout = setTimeout(() => {
        handleClose();
      }, 2000); // Auto close after 5 seconds

      return () => clearTimeout(timeout);
    }
  }, [showModal]);

  useEffect(() => {
    if (showModal) {
      const audio = new Audio(notificationSound);
      audio.play();
    }
  }, [showModal]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      closeModal();
      setIsClosing(false);
    }, 200); // Duration of the fadeOut animation
  };

  if (!showModal || !newMessage) return null;

  return (
    <div
      className={`z-20 fixed bottom-4 right-4 flex items-center justify-center ${
        isClosing ? "animate-fadeOut" : "animate-fadeIn"
      }`}
    >
      <div className="bg-white p-4 rounded shadow-lg w-64">
        <h2 className="text-lg font-semibold mb-2 truncate">{newMessage.senderId}</h2>
        <p className="text-sm mb-4 truncate">{newMessage.message}</p>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={handleClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default NewMessageModal;
