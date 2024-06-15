import { useState } from "react";
import { BiPhoneCall } from "react-icons/bi";

const CallModal = ({ callerName, onClose, onAcceptCall, onRejectCall }) => {
  const [showModal, setShowModal] = useState(true);

  const handleAccept = () => {
    onAcceptCall();
    setShowModal(false);
  };

  const handleReject = () => {
    onRejectCall();
    setShowModal(false);
  };

  return (
    <div
      className={`fixed top-0 left-0 w-full h-full flex items-center justify-center ${
        showModal ? "block" : "hidden"
      }`}
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="bg-white rounded-lg p-8 w-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Incoming Call</h2>
          <p className="text-lg">{callerName} is calling you.</p>
        </div>
        <div className="flex justify-center mt-8 space-x-4">
          <button
            onClick={handleAccept}
            className="px-4 py-2 bg-green-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Accept
          </button>
          <button
            onClick={handleReject}
            className="px-4 py-2 bg-red-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallModal;
