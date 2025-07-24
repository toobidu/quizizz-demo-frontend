import {useEffect, useState} from 'react';
import {Navigate, useLocation} from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import {toast} from 'react-toastify';
import Cookies from 'js-cookie';

function ProtectedRoute({children}) {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Check token from both localStorage and cookies for consistency
                const token = localStorage.getItem('accessToken') || Cookies.get('accessToken');

                if (!token) {
                    setIsAuthenticated(false);
                    setIsLoading(false);
                    return;
                }

                // Check if token is expired
                const decodedToken = jwtDecode(token);
                const currentTime = Date.now() / 1000; // Convert to seconds

                if (decodedToken.exp < currentTime) {
                    // Token is expired - clear from both localStorage and cookies
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    Cookies.remove('accessToken');
                    Cookies.remove('refreshToken');
                    setIsAuthenticated(false);
                    toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                } else {
                    setIsAuthenticated(true);
                    // You can also store user info in context/state here if needed
                }
            } catch (error) {
                // Clear from both localStorage and cookies
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                Cookies.remove('accessToken');
                Cookies.remove('refreshToken');
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    if (isLoading) {
        return (<div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8f9fa'
        }}>
            <div style={{
                textAlign: 'center',
                padding: '2rem',
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
                <div style={{
                    width: '50px',
                    height: '50px',
                    border: '5px solid #f3f3f3',
                    borderTop: '5px solid #007BFF',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 1rem',
                }}></div>
                <p style={{color: '#2c3e50', margin: 0}}>Đang xác thực...</p>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        </div>);
    }

    if (!isAuthenticated) {
        // Redirect to login page with the return URL
        return <Navigate to="/login" state={{from: location}} replace/>;
    }

    return children;
}

export default ProtectedRoute;
