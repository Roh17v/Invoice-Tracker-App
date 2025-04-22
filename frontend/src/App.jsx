import { Route, Routes } from "react-router-dom";
import "./App.css";
import LoginPage from "./pages/LoginPage";
import Home from "./pages/Home";
import { UserProvider } from "./context/UserContext";
import ProtectedRoute from "./components/ProtectedRoutes";

function App() {
  return (
    <>
      <UserProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
        </Routes>
      </UserProvider>
    </>
  );
}

export default App;
