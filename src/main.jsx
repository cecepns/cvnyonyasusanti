import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "swiper/css";
import "swiper/css/navigation";
import "react-quill/dist/quill.snow.css";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3500,
        style: { borderRadius: "12px" },
      }}
    />
  </BrowserRouter>
);
