import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../layouts/Header';
import Footer from '../layouts/Footer';
import useUserStore from '../hooks/useUserStore';
import HeroSection from '../components/main/HeroSection';
import StatsSection from '../components/main/StatsSection';
import QuickActionsSection from '../components/main/QuickActionsSection';
import '../style/pages/MainPage.css';

function MainPage() {
    const navigate = useNavigate();
    const { userName, stats, loading, fetchUserProfile, logout } = useUserStore();

    useEffect(() => {
        fetchUserProfile();

        // Không cần return cleanup vì socketService.disconnect()
        // sẽ được xử lý trong logout action
    }, [fetchUserProfile]);

    const handleLogout = () => {
        logout(navigate);
    };



    return (
        <div className="mp-main-layout">
            <Header userName={userName} handleLogout={handleLogout} />

            <main className="mp-main-content">
                <HeroSection userName={userName} stats={stats} />
                <StatsSection stats={stats} loading={loading} />
                <QuickActionsSection />
            </main>

            <Footer />
        </div>
    );
}

export default MainPage;
