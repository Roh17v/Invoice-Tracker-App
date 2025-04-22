import { Route, Routes } from "react-router-dom";
import "./App.css";
import LoginPage from "./pages/LoginPage";
import { Toaster } from "sonner";
import Home from "./pages/Home";
import { UserProvider } from "./context/UserContext";

function App() {
  return (
    <>
      <UserProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Home />} />
        </Routes>

        
      </UserProvider>
    </>
  );
}

export default App;
