import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Provider } from "react-redux";
import store from "./Redux/store.js";
import { SocketProvider } from "./context/SocketProvider.jsx";
import CallProvider from "./context/CallContext.jsx";
import MessageProvider from "./context/MessageContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    {/* <React.StrictMode> */}
    <SocketProvider>
      <MessageProvider>
        <CallProvider>
          <App />
        </CallProvider>
        </MessageProvider>
    </SocketProvider>
    {/* </React.StrictMode> */}
  </Provider>
);
