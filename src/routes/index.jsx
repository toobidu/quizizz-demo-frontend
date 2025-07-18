import { createBrowserRouter, Navigate } from "react-router-dom";
import WelcomePage from "../pages/WelcomePage";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import VerifyEmail from "../pages/auth/VerifyEmail";
import VerifyOTP from "../pages/auth/VerifyOTP";
import NewPassword from "../pages/auth/NewPassword";
import MainPage from "../pages/MainPage";
import Profile from "../pages/Profile";
import RoomsPage from "../pages/RoomsPage";
import WaitingRoom from "../pages/WaitingRoom";
import ProtectedRoute from "./ProtectedRoute";
import ModalContainer from "../layouts/ModalContainer";

// Layout components
const AuthLayout = ({ children }) => (
  <div className="auth-layout">
    {children}
  </div>
);

const MainLayout = ({ children }) => (
  <div className="main-layout">
    {children}
    <ModalContainer />
  </div>
);

// Public routes - accessible to all users
const publicRoutes = [
  {
    path: "/",
    element: <WelcomePage />,
  },
  {
    path: "/login",
    element: (
      <AuthLayout>
        <Login />
      </AuthLayout>
    ),
  },
  {
    path: "/register",
    element: (
      <AuthLayout>
        <Register />
      </AuthLayout>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <AuthLayout>
        <ForgotPassword />
      </AuthLayout>
    ),
  },
  {
    path: "/verify-email",
    element: (
      <AuthLayout>
        <VerifyEmail />
      </AuthLayout>
    ),
  },
  {
    path: "/verify-otp",
    element: (
      <AuthLayout>
        <VerifyOTP />
      </AuthLayout>
    ),
  },
  {
    path: "/new-password",
    element: (
      <AuthLayout>
        <NewPassword />
      </AuthLayout>
    ),
  },
];

// Protected routes - require authentication
const protectedRoutes = [
  {
    path: "/dashboard",
    element: (
      <MainLayout>
        <MainPage />
      </MainLayout>
    ),
  },
  {
    path: "/rooms",
    element: <RoomsPage />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "/profile/search/:username",
    element: <Profile />,
  },

  {
    path: "/settings",
    element: <div>Settings Page - Coming Soon</div>,
  },
  {
    path: "/games",
    element: <div>Games Page - Coming Soon</div>,
  },
  {
    path: "/leaderboard",
    element: <div>Leaderboard Page - Coming Soon</div>,
  },
  {
    path: "/waiting-room/:roomCode",
    element: <WaitingRoom />,
  },
];

// Combine all routes
export const router = createBrowserRouter([
  // Public routes
  ...publicRoutes,

  // Protected routes individually wrapped with ProtectedRoute
  ...protectedRoutes.map(route => ({
    path: route.path,
    element: <ProtectedRoute>{route.element}</ProtectedRoute>,
  })),

  // 404 page
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
