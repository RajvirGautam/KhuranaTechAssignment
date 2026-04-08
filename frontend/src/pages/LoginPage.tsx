import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LandingPage } from "./LandingPage";

export const LoginPage = () => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/applications" replace />;
  }

  return <LandingPage authModal="login" />;
};
