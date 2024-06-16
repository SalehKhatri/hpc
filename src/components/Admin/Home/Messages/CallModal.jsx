import React from "react";
import ReactPlayer from "react-player";

const CallModal = ({
  callingTo,
  callerName,
  myStream,
  isIncommingCall,
  isCallAccepted,
  remoteStream,
  acceptCall,
  leaveCall

}) => {
  console.log("Is incoming?", isIncommingCall);
  return (
    <>
      {/* Ui for when call is coming and not accepted yet! */}
      {isIncommingCall && !isCallAccepted && (
        <>
          <div className="z-10 modal_wrapper fixed inset-0 bg-[rgba(0,0,0,0.5)]"></div>

          <div className="z-20 modal_container fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-[48%] p-6 rounded-lg bg-white shadow-lg">
            <div className="modal_heading text-gray-800 font-semibold mb-4 text-center text-xl">
              <p>{callerName}</p>
            </div>
            {myStream && (
              <div className="w-full flex justify-center items-center mb-4">
                <ReactPlayer
                  url={myStream}
                  playing
                  muted
                  height={"100%"}
                  width={"100%"}
                  className="rounded-lg overflow-hidden"
                />
              </div>
            )}
            <div className="buttons flex justify-between items-center mt-6">
              <button
                className="bg-red-500 hover:bg-red-600 w-1/2 mx-2 p-3 rounded-lg text-base font-semibold text-white"
                onClick={leaveCall} // Replace with a proper reject function
              >
                Reject
              </button>
              <button
                className="bg-green-500 hover:bg-green-600 w-1/2 mx-2 p-3 rounded-lg text-base font-semibold text-white"
                onClick={acceptCall}
              >
                Accept
              </button>
            </div>
          </div>
        </>
      )}
      {/* UI to show caller when call is not accepted yet */}
      {!isIncommingCall && !isCallAccepted && (
        <>
          <div className="z-10 modal_wrapper fixed inset-0 bg-[rgba(0,0,0,0.5)]"></div>

          <div className="z-20 modal_container fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-[48%] p-6 rounded-lg bg-white shadow-lg">
            <div className="modal_heading text-gray-800 font-semibold mb-4 text-center text-xl">
              <p>{callingTo}</p>
            </div>
            {myStream && (
              <div className="w-full flex justify-center items-center mb-4">
                <ReactPlayer
                  url={myStream}
                  playing
                  muted
                  height={"100%"}
                  width={"100%"}
                  className="rounded-lg overflow-hidden"
                />
              </div>
            )}
            <div className="buttons flex justify-center items-center mt-6">
              <button
                className="bg-red-500 hover:bg-red-600 w-1/2 mx-2 p-3 rounded-lg text-base font-semibold text-white"
                onClick={leaveCall} // Replace with a proper reject function
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      {/* UI to show when call is ongoing */}
      {isCallAccepted  && (
        <>
  <div className="z-10 modal_wrapper fixed inset-0 bg-[rgba(0,0,0,0.5)]"></div>

  <div className="z-20 modal_container fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-[48%] p-6 rounded-lg bg-white shadow-lg">
    <div className="relative w-full aspect-w-16 aspect-h-9 mb-4">
      {/* Remote Stream (Caller's Stream) */}
      {remoteStream && (
        <ReactPlayer
          url={remoteStream}
          playing
          muted
          height={"100%"}
          width={"100%"}
          className="rounded-lg overflow-hidden"
        />
      )}

      {/* Your Stream (Local Stream) */}
      {myStream && (
        <div className="absolute top-2 right-2 w-1/4 z-30">
          <ReactPlayer
            url={myStream}
            playing
            muted
            height={"auto"}
            width={"100%"}
            className="rounded-lg overflow-hidden"
          />
        </div>
      )}
    </div>

    {/* Buttons Container */}
    <div className="buttons flex justify-between items-center mt-4">
      <button
        className="bg-red-500 hover:bg-red-600 w-full mx-2 p-3 rounded-lg text-base font-semibold text-white"
        onClick={leaveCall}
      >
        Leave
      </button>
    </div>
  </div>
</>

      )}
    </>
  );
};

export default CallModal;
