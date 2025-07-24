import React from 'react';
import {useNavigate} from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ModalContainer from './ModalContainer';
import '../style/layouts/MainLayout.css';

function MainLayout({children}) {
    const navigate = useNavigate();

    const userName = localStorage.getItem('username');

    // Nếu không có username, thử lấy từ token
    let finalUserName = userName;
    if (!finalUserName) {
        try {
            const token = localStorage.getItem('accessToken');
            if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]));
                finalUserName = payload.username || payload.name || payload.username || payload.Name;

                // Lưu lại vào localStorage để lần sau không cần decode token
                if (finalUserName) {
                    localStorage.setItem('username', finalUserName);
                }
            }
        } catch (error) {
            
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('username');
        navigate('/login');
    };

    return (<div className="main-layout">
        <Header userName={finalUserName || 'User'} handleLogout={handleLogout}/>
        <main className="main-content">
            {children}
        </main>
        <Footer/>
        <ModalContainer/>
    </div>);
}

export default MainLayout;
