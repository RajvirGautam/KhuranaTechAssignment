import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LandingPage } from "./LandingPage";

export const RegisterPage = () => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/applications" replace />;
  }

  return <LandingPage authModal="register" />;
};
