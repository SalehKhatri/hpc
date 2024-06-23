// App.jsx
import { BrowserRouter, Route, Routes } from "react-router-dom";
import DataProvider from "./context/DataProvider";
import SignUp from "./components/Auth/SignUp";
import SignIn from "./components/Auth/Signin";
import UserProfile from "./components/user/UserProfile";
import Admin from "./components/Admin/Admin";
import { useCall } from "./context/CallContext";
import CallModal from "./components/Admin/Home/Messages/CallModal";
import NewMessageModal from "./components/Admin/Home/Messages/NewMessageModal";
import MessageDetails from "./components/Admin/Home/Messages/MessageDetails";
import UserNavbar from "./components/user/UserNavbar";

const App = () => {
  const {
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
  } = useCall();

  return (
    <DataProvider>
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
      <NewMessageModal />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SignUp />} />
          <Route path="/login" element={<SignIn />} />
          <Route path="/messages" element={<>
            <UserNavbar/> <br />
            <div className="mt-10">
            <MessageDetails />
            </div>
            </>} />
          <Route path="/user" element={<UserProfile />} />
          <Route path="/admin/*" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </DataProvider>
  );
};

export default App;
