import {createBrowserRouter, Navigate} from "react-router-dom";
import WelcomePage from "../pages/WelcomePage";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import VerifyEmail from "../pages/auth/VerifyEmail";
import VerifyOTP from "../pages/auth/VerifyOTP";
import NewPassword from "../pages/auth/NewPassword";
import MainPage from "../pages/MainPage";
import Profile from "../pages/Profile";
import RoomsPage from "../pages/room/RoomsPage.jsx";
import WaitingRoom from "../pages/room/WaitingRoom.jsx";
import QuizGamePage from "../pages/room/QuizGamePage.jsx";
import AboutPage from "../pages/footer/AboutPage.jsx";
import GamesPage from "../pages/footer/GamesPage.jsx";
import BlogPage from "../pages/footer/BlogPage.jsx";
import ContactPage from "../pages/footer/ContactPage.jsx";
import HelpPage from "../pages/footer/HelpPage.jsx";
import FAQPage from "../pages/footer/FAQPage.jsx";
import PrivacyPage from "../pages/footer/PrivacyPage.jsx";
import TermsPage from "../pages/footer/TermsPage.jsx";
import FeedbackPage from "../pages/footer/FeedbackPage.jsx";
import ProtectedRoute from "./ProtectedRoute";
import MainLayout from "../layouts/MainLayout";

// Layout components
const AuthLayout = ({children}) => (<div className="auth-layout">
    {children}
</div>);

// Public routes - accessible to all users
const publicRoutes = [{
    path: "/", element: <WelcomePage/>,
}, {
    path: "/login", element: (<AuthLayout>
        <Login/>
    </AuthLayout>),
}, {
    path: "/register", element: (<AuthLayout>
        <Register/>
    </AuthLayout>),
}, {
    path: "/forgot-password", element: (<AuthLayout>
        <ForgotPassword/>
    </AuthLayout>),
}, {
    path: "/verify-email", element: (<AuthLayout>
        <VerifyEmail/>
    </AuthLayout>),
}, {
    path: "/verify-otp", element: (<AuthLayout>
        <VerifyOTP/>
    </AuthLayout>),
}, {
    path: "/new-password", element: (<AuthLayout>
        <NewPassword/>
    </AuthLayout>),
}, // Các trang mới thêm vào
    {
        path: "/about", element: (<MainLayout>
            <AboutPage/>
        </MainLayout>),
    }, {
        path: "/games", element: (<MainLayout>
            <GamesPage/>
        </MainLayout>),
    }, {
        path: "/blog", element: (<MainLayout>
            <BlogPage/>
        </MainLayout>),
    }, {
        path: "/contact", element: (<MainLayout>
            <ContactPage/>
        </MainLayout>),
    }, {
        path: "/help", element: (<MainLayout>
            <HelpPage/>
        </MainLayout>),
    }, {
        path: "/faq", element: (<MainLayout>
            <FAQPage/>
        </MainLayout>),
    }, {
        path: "/privacy", element: (<MainLayout>
            <PrivacyPage/>
        </MainLayout>),
    }, {
        path: "/terms", element: (<MainLayout>
            <TermsPage/>
        </MainLayout>),
    }, {
        path: "/feedback", element: (<MainLayout>
            <FeedbackPage/>
        </MainLayout>),
    },];

// Protected routes - require authentication
const protectedRoutes = [{
    path: "/dashboard", element: (<MainLayout>
        <MainPage/>
    </MainLayout>),
}, {
    path: "/rooms", element: <RoomsPage/>,
}, {
    path: "/profile", element: <Profile/>,
}, {
    path: "/profile/search/:username", element: <Profile/>,
},

    {
        path: "/settings", element: <div>Settings Page - Coming Soon</div>,
    }, {
        path: "/leaderboard", element: <div>Leaderboard Page - Coming Soon</div>,
    }, {
        path: "/waiting-room/:roomCode", element: <WaitingRoom/>,
    }, {
        path: "/game/:roomCode", element: <QuizGamePage/>,
    },];

// Combine all routes
export const router = createBrowserRouter([// Public routes
    ...publicRoutes,

    // Protected routes individually wrapped with ProtectedRoute
    ...protectedRoutes.map(route => ({
        path: route.path, element: <ProtectedRoute>{route.element}</ProtectedRoute>,
    })),

    // 404 page
    {
        path: "*", element: <Navigate to="/" replace/>,
    },]);
