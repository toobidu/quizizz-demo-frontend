import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useUserStore from '../hooks/useUserStore';
import useDocumentTitle from '../hooks/useDocumentTitle';
import HeroSection from '../components/main/HeroSection';
import StatsSection from '../components/main/StatsSection';
import QuickActionsSection from '../components/main/QuickActionsSection';
import '../style/pages/MainPage.css';

function MainPage() {
    const navigate = useNavigate();
    const { userName, stats, loading, fetchUserProfile, logout } = useUserStore();
    
    // Sử dụng hook để đặt title cho trang chủ
    useDocumentTitle('Trang chủ');

    useEffect(() => {
        fetchUserProfile();

        // Không cần return cleanup vì websocketService.disconnect()
        // sẽ được xử lý trong logout action
    }, [fetchUserProfile]);

    const handleLogout = () => {
        logout(navigate);
    };



    return (
        <div className="mp-main-layout">
            <main className="mp-main-content">
                <HeroSection userName={userName} stats={stats} />
                <StatsSection stats={stats} loading={loading} />
                <QuickActionsSection />
            </main>
        </div>
    );
}

export default MainPage;
