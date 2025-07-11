import React, { useState, useEffect } from 'react';
import { FiSettings, FiLock, FiUnlock, FiCopy, FiX, FiCheck, FiUsers, FiClock, FiHelpCircle, FiBookOpen, FiZap } from 'react-icons/fi';
import createRoomApi from '../config/api/createroom.api';
import useUIStore from '../hooks/useUIStore';
import '../style/components/CreateRoomModal.css';

function CreateRoomModal() {
  const { isCreateRoomModalOpen, closeCreateRoomModal } = useUIStore();
  
  console.log('CreateRoomModal rendered, isCreateRoomModalOpen:', isCreateRoomModalOpen);
  const [roomData, setRoomData] = useState({
    name: '',
    isPrivate: false,
    maxPlayers: 2,
    timeLimit: 60,
    questionCount: 10,
    topic: 'general',
    gameMode: '1vs1'
  });
  const [loading, setLoading] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Hiệu ứng khi modal mở
  useEffect(() => {
    if (isCreateRoomModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isCreateRoomModalOpen]);
  
  if (!isCreateRoomModalOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'gameMode') {
      // Nếu chọn chế độ 1vs1, đặt số người chơi tối đa là 2
      if (value === '1vs1') {
        setRoomData({
          ...roomData,
          gameMode: value,
          maxPlayers: 2
        });
      } 
      // Nếu chọn chế độ battle, đặt số người chơi tối đa là 3 nếu đang là 2
      else if (value === 'battle' && roomData.maxPlayers < 3) {
        setRoomData({
          ...roomData,
          gameMode: value,
          maxPlayers: 3
        });
      } else {
        setRoomData({
          ...roomData,
          gameMode: value
        });
      }
    } else {
      setRoomData({
        ...roomData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await createRoomApi.createRoom({
        name: roomData.name,
        isPrivate: roomData.isPrivate,
        settings: {
          maxPlayers: parseInt(roomData.maxPlayers),
          timeLimit: parseInt(roomData.timeLimit),
          questionCount: parseInt(roomData.questionCount),
          topic: roomData.topic,
          gameMode: roomData.gameMode
        }
      });
      
      if (response.data && response.data.Data) {
        setRoomCode(response.data.Data.roomCode);
      }
    } catch (err) {
      setError(err.response?.data?.Message || 'Có lỗi xảy ra khi tạo phòng');
    } finally {
      setLoading(false);
    }
  };



  const handleClose = () => {
    closeCreateRoomModal();
    // Reset form khi đóng modal
    if (roomCode) {
      setRoomCode('');
      setRoomData({
        name: '',
        isPrivate: false,
        maxPlayers: 2,
        timeLimit: 60,
        questionCount: 10,
        topic: 'general',
        gameMode: '1vs1'
      });
      setError('');
    }
  };
  
  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="crm-overlay">
      <div className="crm-container">
        <div className="crm-header">
          <h2 className="crm-title">Tạo phòng thử thách mới</h2>
          <button className="crm-close" onClick={handleClose}>
            <FiX />
          </button>
        </div>
        
        {error && <div className="crm-error">{error}</div>}
        
        {roomCode ? (
          <div className="crm-success">
            <h2>Phòng đã được tạo thành công!</h2>
            <p>Chia sẻ mã phòng với bạn bè để họ có thể tham gia</p>
            <div className="crm-room-code">
              <span>Mã phòng: </span>
              <strong>{roomCode}</strong>
              <button onClick={copyRoomCode} className="crm-copy-btn">
                {copied ? <FiCheck /> : <FiCopy />}
              </button>
            </div>
            <button 
              className="crm-button crm-primary-btn"
              onClick={handleClose}
            >
              Đóng
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="crm-form">
            <div className="crm-form-group">
              <label htmlFor="name">Tên phòng</label>
              <input
                type="text"
                id="name"
                name="name"
                value={roomData.name}
                onChange={handleChange}
                required
                placeholder="Nhập tên phòng"
                className="crm-input"
              />
            </div>
            
            <div className="crm-form-group crm-toggle-group">
              <label htmlFor="isPrivate" className="crm-toggle-label">
                {roomData.isPrivate ? (
                  <><FiLock /> Phòng riêng tư</>
                ) : (
                  <><FiUnlock /> Phòng công khai</>
                )}
              </label>
              <label className="crm-toggle">
                <input
                  type="checkbox"
                  id="isPrivate"
                  name="isPrivate"
                  checked={roomData.isPrivate}
                  onChange={handleChange}
                />
                <span className="crm-toggle-slider"></span>
                <span className="crm-toggle-status">
                  {roomData.isPrivate ? 'Bật' : 'Tắt'}
                </span>
              </label>
            </div>
            
            <div className="crm-settings">
              <h3 className="crm-settings-title">
                <FiSettings /> Cài đặt phòng
              </h3>
              
              <div className="crm-form-group">
                <label htmlFor="topic">
                  <FiBookOpen style={{marginRight: '8px'}} />
                  Chủ đề câu hỏi
                </label>
                <select
                  id="topic"
                  name="topic"
                  value={roomData.topic}
                  onChange={handleChange}
                  className="crm-input"
                >
                  <option value="general">Kiến thức chung</option>
                  <option value="science">Khoa học</option>
                  <option value="history">Lịch sử</option>
                  <option value="geography">Địa lý</option>
                  <option value="literature">Văn học</option>
                  <option value="math">Toán học</option>
                  <option value="technology">Công nghệ</option>
                  <option value="sports">Thể thao</option>
                  <option value="entertainment">Giải trí</option>
                </select>
              </div>
              
              <div className="crm-form-group">
                <label htmlFor="gameMode">
                  <FiZap style={{marginRight: '8px'}} />
                  Chế độ chơi
                </label>
                <select
                  id="gameMode"
                  name="gameMode"
                  value={roomData.gameMode}
                  onChange={handleChange}
                  className="crm-input"
                >
                  <option value="1vs1">1 vs 1</option>
                  <option value="battle">Battle Royale</option>
                </select>
              </div>
              
              <div className="crm-form-group">
                <label htmlFor="maxPlayers">
                  <FiUsers style={{marginRight: '8px'}} /> 
                  Số người chơi tối đa
                </label>
                <input
                  type="number"
                  id="maxPlayers"
                  name="maxPlayers"
                  min={roomData.gameMode === '1vs1' ? 2 : 3}
                  max="20"
                  value={roomData.maxPlayers}
                  onChange={handleChange}
                  className="crm-input"
                  disabled={roomData.gameMode === '1vs1'}
                />
              </div>
              
              <div className="crm-form-group">
                <label htmlFor="timeLimit">
                  <FiClock style={{marginRight: '8px'}} />
                  Thời gian trả lời (giây)
                </label>
                <input
                  type="number"
                  id="timeLimit"
                  name="timeLimit"
                  min="10"
                  max="300"
                  value={roomData.timeLimit}
                  onChange={handleChange}
                  className="crm-input"
                />
              </div>
              
              <div className="crm-form-group">
                <label htmlFor="questionCount">
                  <FiHelpCircle style={{marginRight: '8px'}} />
                  Số câu hỏi
                </label>
                <input
                  type="number"
                  id="questionCount"
                  name="questionCount"
                  min="5"
                  max="50"
                  value={roomData.questionCount}
                  onChange={handleChange}
                  className="crm-input"
                />
              </div>
            </div>
            
            <div className="crm-form-actions">
              <button 
                type="button" 
                className="crm-button crm-secondary-btn"
                onClick={handleClose}
              >
                Hủy
              </button>
              <button 
                type="submit" 
                className="crm-button crm-primary-btn"
                disabled={loading}
              >
                {loading ? 'Đang tạo...' : 'Tạo phòng'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default CreateRoomModal;