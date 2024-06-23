import { createContext, useContext, useEffect, useState } from "react";
import { useSocket } from "./SocketProvider";

const MessageContext = createContext()


const MessageProvider = ({children})=>{
  const socket = useSocket()
  const [newMessage,setNewMessage] = useState()
  const [showModal,setShowModal] = useState(false)


  useEffect(()=>{
    socket.off("newMessage");
    socket.on("newMessage", (message) => {
      console.log(message);
      setNewMessage(message)
      setShowModal(true)
    });
    // Clean up the socket connection on component unmount
    return () => {
      socket.off("newMessage");
      socket.disconnect();
    };
  },[socket])

  const closeModal = () => {
    setShowModal(false)
  }

  return (<MessageContext.Provider value={{newMessage, showModal, closeModal}}>
    {children}
  </MessageContext.Provider>)
}

export const useMessage = () => useContext(MessageContext)
export default MessageProvider