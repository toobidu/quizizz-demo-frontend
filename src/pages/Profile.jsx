import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../layouts/Header';
import Footer from '../layouts/Footer';
import profileApi from '../config/api/profile.api';
import authApi from '../config/api/auth.api';
import { FiUser, FiUsers, FiTarget, FiCalendar, FiLoader, FiEdit, FiSave, FiX } from 'react-icons/fi';
import '../style/pages/Profile.css';
import { FaRunning } from 'react-icons/fa';

function Profile() {
    const { username } = useParams();
    const navigate = useNavigate();
    const currentUser = localStorage.getItem('username');
    const token = localStorage.getItem('accessToken');
    const isOwnProfile = !username || username === currentUser;

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
                
                if (data.Status === 200) {
                    setProfileData(data.Data);
                    setFormData({
                        fullName: data.Data.FullName || '',
                        phoneNumber: data.Data.PhoneNumber || '',
                        address: data.Data.Address || ''
                    });
                } else {
                    setError(data.Message || 'Không thể tải thông tin profile');
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
            
            if (result.Status === 200) {
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
                alert(`Lỗi: ${result.Message || 'Không thể cập nhật thông tin'}`);
            }
        } catch (error) {
            console.error('Update profile error:', error);
            alert(`Lỗi: ${error.message || 'Không thể cập nhật thông tin'}`);
        } finally {
            setUpdateLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="profile-layout">
                <Header userName={currentUser} handleLogout={handleLogout} />
                <div className="loading-container">
                    <FiLoader className="loading-spinner" />
                    <p>Đang tải thông tin...</p>
                </div>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-layout">
                <Header userName={currentUser} handleLogout={handleLogout} />
                <div className="error-container">
                    <p className="error-message">{error}</p>
                    <button onClick={() => navigate('/dashboard')} className="back-button">
                        Quay lại trang chủ
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="profile-layout">
            <Header userName={currentUser} handleLogout={handleLogout} />

            <main className="profile-content">
                {successMessage && (
                    <div className="success-toast">
                        <span>{successMessage}</span>
                    </div>
                )}
                <div className="profile-header">
                    <div className="profile-avatar">
                        {profileData?.Username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="profile-info">
                        <div className="profile-title">
                            <h1>{profileData?.Username || 'Unknown User'}</h1>
                            <div className="profile-actions">
                                {isOwnProfile && !isEditing ? (
                                    <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
                                        <FiEdit className="btn-icon" /> Cập nhật thông tin
                                    </button>
                                ) : (isOwnProfile && isEditing ? (
                                    <div className="edit-actions">
                                        <button 
                                            className="save-btn" 
                                            onClick={handleUpdateProfile} 
                                            disabled={updateLoading}
                                        >
                                            {updateLoading ? <FiLoader className="spin" /> : <FiSave />} Lưu
                                        </button>
                                        <button 
                                            className="cancel-btn" 
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
                        <div className="info-grid">
                            <div className="info-item">
                                <p className="info-label">Họ tên:</p>
                                {isOwnProfile && isEditing ? (
                                    <input 
                                        type="text" 
                                        className="edit-input" 
                                        value={formData.fullName} 
                                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                        placeholder="Nhập họ tên"
                                    />
                                ) : (
                                    <p className="info-value">{profileData?.FullName && profileData.FullName.trim() !== '' ? profileData.FullName : 'Chưa cập nhật'}</p>
                                )}
                            </div>
                            <div className="info-item">
                                <p className="info-label">Email:</p>
                                <p className="info-value">{profileData?.Email || 'Chưa cập nhật'}</p>
                            </div>
                            <div className="info-item">
                                <p className="info-label">Số điện thoại:</p>
                                {isOwnProfile && isEditing ? (
                                    <input 
                                        type="text" 
                                        className="edit-input" 
                                        value={formData.phoneNumber} 
                                        onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                                        placeholder="Nhập số điện thoại"
                                    />
                                ) : (
                                    <p className="info-value">{profileData?.PhoneNumber && profileData.PhoneNumber.trim() !== '' ? profileData.PhoneNumber : 'Chưa cập nhật'}</p>
                                )}
                            </div>
                            <div className="info-item">
                                <p className="info-label">Địa chỉ:</p>
                                {isOwnProfile && isEditing ? (
                                    <input 
                                        type="text" 
                                        className="edit-input" 
                                        value={formData.address} 
                                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                                        placeholder="Nhập địa chỉ"
                                    />
                                ) : (
                                    <p className="info-value">{profileData?.Address || 'Chưa cập nhật'}</p>
                                )}
                            </div>
                            <div className="info-item">
                                <p className="info-label">Tham gia từ:</p>
                                <p className="info-value"><FiCalendar className="icon" /> {profileData?.CreatedAt ? new Date(profileData.CreatedAt).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="profile-stats">
                    <div className="stat-card">
                        <FiTarget className="stat-icon" />
                        <div className="stat-value">{profileData?.HighestScore?.toLocaleString() || 0}</div>
                        <div className="stat-label">Điểm cao nhất</div>
                    </div>
                    <div className="stat-card">
                        <FiUsers className="stat-icon" />
                        <div className="stat-value">#{profileData?.HighestRank || 'N/A'}</div>
                        <div className="stat-label">Xếp hạng cao nhất</div>
                    </div>
                    <div className="stat-card">
                        <FiUser className="stat-icon" />
                        <div className="stat-value">{profileData?.FastestTime || 'N/A'}</div>
                        <div className="stat-label">Thời gian nhanh nhất</div>
                    </div>
                    <div className="stat-card">
                        <FaRunning className="stat-icon" />
                        <div className="stat-value">{profileData?.BestTopic || 'N/A'}</div>
                        <div className="stat-label">Chủ đề tốt nhất</div>
                    </div>
                </div>

                <div className="achievements-section">
                    <h2>Thành tích</h2>
                    <div className="achievements-grid">
                        {profileData?.achievements?.length > 0 ? (
                            profileData.achievements.map((achievement, index) => (
                                <div
                                    key={index}
                                    className={`achievement-card ${achievement.earned ? 'earned' : 'locked'}`}
                                >
                                    <div className="achievement-icon">
                                        <FiTrophy />
                                    </div>
                                    <h3>{achievement.name}</h3>
                                    <p>{achievement.desc}</p>
                                </div>
                            ))
                        ) : (
                            <div className="no-achievements">
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
