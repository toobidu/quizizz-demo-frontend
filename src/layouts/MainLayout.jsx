import React from 'react';
import {useNavigate} from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ModalContainer from './ModalContainer';
import '../style/layouts/MainLayout.css';
import { ensureUsername } from '../utils/usernameUtils.js';

function MainLayout({children}) {
    const navigate = useNavigate();

    // ✅ ENHANCED: Use username utility for guaranteed username
    const finalUserName = ensureUsername();

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('username');
        navigate('/login');
    };

    return (<div className="main-layout">
        <Header userName={finalUserName} handleLogout={handleLogout}/>
        <main className="main-content">
            {children}
        </main>
        <Footer/>
        <ModalContainer/>
    </div>);
}

export default MainLayout;
