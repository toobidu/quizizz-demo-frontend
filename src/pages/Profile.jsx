import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../layouts/Header';
import Footer from '../layouts/Footer';
import profileApi from '../config/api/profile.api';
import authApi from '../config/api/auth.api';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { FiUser, FiUsers, FiTarget, FiCalendar, FiLoader, FiEdit, FiSave, FiX } from 'react-icons/fi';
import '../style/pages/Profile.css';
import { FaRunning } from 'react-icons/fa';

function Profile() {
    const { username } = useParams();
    const navigate = useNavigate();
    const currentUser = localStorage.getItem('username');
    const token = localStorage.getItem('accessToken');
    const isOwnProfile = !username || username === currentUser;
    
    // Sử dụng hook để đặt title cho trang profile
    useDocumentTitle(isOwnProfile ? 'Hồ sơ của tôi' : `Hồ sơ của ${username}`);

    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        address: ''
    });
    const [updateLoading, setUpdateLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                let data;

                if (isOwnProfile) {
                    data = await profileApi.getMyProfile();
                } else {
                    data = await profileApi.searchUser(username);
                }

                if (data.status === 200) {
                    setProfileData(data.data);
                    setFormData({
                        fullName: data.data.FullName || '',
                        phoneNumber: data.data.PhoneNumber || '',
                        address: data.data.Address || ''
                    });
                } else {
                    setError(data.message || 'Không thể tải thông tin profile');
                }
            } catch (err) {
                setError(err.message || 'Lỗi kết nối đến server');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [username, isOwnProfile]);

    const handleLogout = async () => {
        await authApi.logout();
        localStorage.removeItem('username');
        navigate('/');
    };

    const handleUpdateProfile = async () => {
        try {
            setUpdateLoading(true);

            const updateData = {
                FullName: formData.fullName,
                PhoneNumber: formData.phoneNumber,
                Address: formData.address,
                Email: profileData.Email
            };

            const result = await profileApi.updateProfile(updateData);

            if (result.status === 200) {
                setProfileData(prev => ({
                    ...prev,
                    FullName: formData.fullName,
                    PhoneNumber: formData.phoneNumber,
                    Address: formData.address
                }));

                setIsEditing(false);
                setSuccessMessage('Cập nhật thông tin thành công!');
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                alert(`Lỗi: ${result.message || 'Không thể cập nhật thông tin'}`);
            }
        } catch (error) {
            
            alert(`Lỗi: ${error.message || 'Không thể cập nhật thông tin'}`);
        } finally {
            setUpdateLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="pf-layout">
                <Header userName={currentUser} handleLogout={handleLogout} />
                <div className="pf-loading-container">
                    <FiLoader className="pf-loading-spinner" />
                    <p>Đang tải thông tin...</p>
                </div>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="pf-layout">
                <Header userName={currentUser} handleLogout={handleLogout} />
                <div className="pf-error-container">
                    <p className="pf-error-message">{error}</p>
                    <button onClick={() => navigate('/dashboard')} className="pf-back-button">
                        Quay lại trang chủ
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="pf-layout">
            <Header userName={currentUser} handleLogout={handleLogout} />

            <main className="pf-content">
                {successMessage && (
                    <div className="pf-success-toast">
                        <span>{successMessage}</span>
                    </div>
                )}
                <div className="pf-header">
                    <div className="pf-avatar">
                        {profileData?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="pf-info">
                        <div className="pf-title">
                            <h1>{profileData?.username || 'Unknown User'}</h1>
                            <div className="pf-actions">
                                {isOwnProfile && !isEditing ? (
                                    <button className="pf-edit-btn" onClick={() => setIsEditing(true)}>
                                        <FiEdit className="pf-btn-icon" /> Cập nhật thông tin
                                    </button>
                                ) : (isOwnProfile && isEditing ? (
                                    <div className="pf-edit-actions">
                                        <button 
                                            className="pf-save-btn" 
                                            onClick={handleUpdateProfile} 
                                            disabled={updateLoading}
                                        >
                                            {updateLoading ? <FiLoader className="pf-spin" /> : <FiSave />} Lưu
                                        </button>
                                        <button 
                                            className="pf-cancel-btn" 
                                            onClick={() => setIsEditing(false)}
                                            disabled={updateLoading}
                                        >
                                            <FiX /> Hủy
                                        </button>
                                    </div>
                                ) : null
                                )}
                            </div>
                        </div>
                        <div className="pf-info-grid">
                            <div className="pf-info-item">
                                <p className="pf-info-label">Họ tên:</p>
                                {isOwnProfile && isEditing ? (
                                    <input 
                                        type="text" 
                                        className="pf-edit-input" 
                                        value={formData.fullName} 
                                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                        placeholder="Nhập họ tên"
                                    />
                                ) : (
                                    <p className="pf-info-value">{profileData?.FullName && profileData.FullName.trim() !== '' ? profileData.FullName : 'Chưa cập nhật'}</p>
                                )}
                            </div>
                            <div className="pf-info-item">
                                <p className="pf-info-label">Email:</p>
                                <p className="pf-info-value">{profileData?.Email || 'Chưa cập nhật'}</p>
                            </div>
                            <div className="pf-info-item">
                                <p className="pf-info-label">Số điện thoại:</p>
                                {isOwnProfile && isEditing ? (
                                    <input 
                                        type="text" 
                                        className="pf-edit-input" 
                                        value={formData.phoneNumber} 
                                        onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                                        placeholder="Nhập số điện thoại"
                                    />
                                ) : (
                                    <p className="pf-info-value">{profileData?.PhoneNumber && profileData.PhoneNumber.trim() !== '' ? profileData.PhoneNumber : 'Chưa cập nhật'}</p>
                                )}
                            </div>
                            <div className="pf-info-item">
                                <p className="pf-info-label">Địa chỉ:</p>
                                {isOwnProfile && isEditing ? (
                                    <input 
                                        type="text" 
                                        className="pf-edit-input" 
                                        value={formData.address} 
                                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                                        placeholder="Nhập địa chỉ"
                                    />
                                ) : (
                                    <p className="pf-info-value">{profileData?.Address || 'Chưa cập nhật'}</p>
                                )}
                            </div>
                            <div className="pf-info-item">
                                <p className="pf-info-label">Tham gia từ:</p>
                                <p className="pf-info-value"><FiCalendar className="pf-icon" /> {profileData?.CreatedAt ? new Date(profileData.CreatedAt).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pf-stats">
                    <div className="pf-stat-card">
                        <FiTarget className="pf-stat-icon" />
                        <div className="pf-stat-value">{profileData?.HighestScore?.toLocaleString() || 0}</div>
                        <div className="pf-stat-label">Điểm cao nhất</div>
                    </div>
                    <div className="pf-stat-card">
                        <FiUsers className="pf-stat-icon" />
                        <div className="pf-stat-value">#{profileData?.HighestRank || 'N/A'}</div>
                        <div className="pf-stat-label">Xếp hạng cao nhất</div>
                    </div>
                    <div className="pf-stat-card">
                        <FiUser className="pf-stat-icon" />
                        <div className="pf-stat-value">{profileData?.FastestTime || 'N/A'}</div>
                        <div className="pf-stat-label">Thời gian nhanh nhất</div>
                    </div>
                    <div className="pf-stat-card">
                        <FaRunning className="pf-stat-icon" />
                        <div className="pf-stat-value">{profileData?.BestTopic || 'N/A'}</div>
                        <div className="pf-stat-label">Chủ đề tốt nhất</div>
                    </div>
                </div>

                <div className="pf-achievements-section">
                    <h2>Thành tích</h2>
                    <div className="pf-achievements-grid">
                        {profileData?.achievements?.length > 0 ? (
                            profileData.achievements.map((achievement, index) => (
                                <div
                                    key={index}
                                    className={`pf-achievement-card ${achievement.earned ? 'earned' : 'locked'}`}
                                >
                                    <div className="pf-achievement-icon">
                                        <FiTrophy />
                                    </div>
                                    <h3>{achievement.name}</h3>
                                    <p>{achievement.desc}</p>
                                </div>
                            ))
                        ) : (
                            <div className="pf-no-achievements">
                                <p>Chưa có thành tích nào</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default Profile;