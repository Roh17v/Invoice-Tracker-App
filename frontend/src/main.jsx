import { BrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { StrictMode } from "react";
import { Toaster } from "sonner";
import { UserProvider } from "./context/UserContext.jsx";
import { InvoiceProvider } from "./context/InvoiceContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <UserProvider>
        <InvoiceProvider>
          <App />
          <Toaster position="top-right" richColors />
        </InvoiceProvider>
      </UserProvider>
    </BrowserRouter>
  </StrictMode>
);
