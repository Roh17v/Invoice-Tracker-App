import { Route, Routes } from "react-router-dom";
import "./App.css";
import LoginPage from "./pages/LoginPage";
import { Toaster } from "sonner";

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
      </Routes>

      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;
