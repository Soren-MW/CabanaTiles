import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./fonts/fonts.css"; // ✅ THIS is where the import belongs

import "./index.css";

createRoot(document.getElementById("root")).render(<App />);
