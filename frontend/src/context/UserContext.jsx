import axios from "axios";
import { createContext, useContext, useState, useEffect } from "react";
import {
  AUTH_ROUTES,
  HOST,
  LOGIN_ROUTE,
  LOGOUT_ROUTE,
} from "../utils/constants";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${HOST}${AUTH_ROUTES}/me`, {
          withCredentials: true,
        });

        if (response.status === 200 && response.data) {
          setUser(response.data);
          navigate("/");
        } else {
          setUser(null);
        }
      } catch (error) {
        console.log("Error checking user!", error);
        setUser(null);
      } finally {
        setIsLoading(false);
        console.log(user);
      }
    };

    checkAuth();
  }, []);

  const login = async (userData, navigate) => {
    console.log("Inside login");
    try {
      const response = await axios.post(`${HOST}${LOGIN_ROUTE}`, userData, {
        withCredentials: true,
      });

      if (response.status === 200) {
        setUser(response.data);
        toast.success("Logged In Successfully.", { id: "login-success" });
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
      console.log(error);
    }
  };

  const logout = async () => {
    try {
      const response = await axios.post(`${HOST}/${LOGOUT_ROUTE}`, {
        withCredentials: "true",
      });

      if (response.status === 200) {
        setUser(null);
        toast.success("Logged Out Successfully!", { id: "logout-success" });
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
      console.log(error);
    }
  };

  return (
    <UserContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};
