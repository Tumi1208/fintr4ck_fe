// File này là điểm khởi đầu của React (entry point)
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// ReactDOM.createRoot giúp render toàn bộ app vào thẻ <div id="root"> trong index.html
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
