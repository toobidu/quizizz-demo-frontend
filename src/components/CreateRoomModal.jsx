import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiSettings, FiLock, FiUnlock, FiCopy, FiX, FiCheck,
  FiUsers, FiClock, FiHelpCircle, FiBookOpen, FiZap
} from 'react-icons/fi';
import createRoomApi from '../config/api/createroom.api';
import topicsApi from '../config/api/topics.api';
import useUIStore from '../hooks/useUIStore';
import useRoomStore from '../stores/useRoomStore';
import '../style/components/CreateRoomModal.css';

function CreateRoomModal({ onClose, onSuccess, onNavigateToRoom }) {
  const navigate = useNavigate();
  const { isCreateRoomModalOpen, closeCreateRoomModal } = useUIStore();
  const { joinRoom } = useRoomStore();

  const isOpen = onClose ? true : isCreateRoomModalOpen;
  const handleModalClose = onClose || closeCreateRoomModal;

  const [roomData, setRoomData] = useState({
    name: '',
    isPrivate: false,
    maxPlayers: 2,
    timeLimit: 60,
    questionCount: 10,
    topic: '',
    gameMode: '1vs1'
  });
  const [loading, setLoading] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [hasExistingRoom, setHasExistingRoom] = useState(false);
  const [topics, setTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      checkExistingRoom();
      loadTopics();
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const checkExistingRoom = async () => {
    try {
      const response = await createRoomApi.getMyCurrentRoom();
      if (response?.Status === 200) {
        setHasExistingRoom(true);
        setError('Bạn đã có phòng. Mỗi người chơi chỉ được tạo 1 phòng.');
      } else {
        setHasExistingRoom(false);
        setError('');
      }
    } catch (error) {
      if (error.response?.status === 404) {
        // 404 là expected - user không có phòng hiện tại
        setHasExistingRoom(false);
        setError('');
        console.log('✅ User không có phòng hiện tại (404 expected)');
      } else {
        console.error('Check existing room error:', error);
      }
    }
  };

  const loadTopics = async () => {
    setLoadingTopics(true);
    try {
      const response = await topicsApi.getAllTopics();
      if (response?.Status === 200 && response?.Data && Array.isArray(response.Data)) {
        const formattedTopics = response.Data.map(topic => ({
          id: topic.Id.toString(),
          name: topic.Name
        }));
        setTopics(formattedTopics);
      } else {
        console.error('Topics API failed:', response);
        setError('Không thể tải danh sách chủ đề');
      }
    } catch (error) {
      console.error('Topics API error:', error);
      setError('Lỗi khi tải danh sách chủ đề');
    } finally {
      setLoadingTopics(false);
    }
  };

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'gameMode') {
      if (value === '1vs1') {
        setRoomData({
          ...roomData,
          gameMode: value,
          maxPlayers: 2
        });
      } else if (value === 'battle' && roomData.maxPlayers < 3) {
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

    // Ngăn chặn gửi request trùng lặp
    if (loading) {
      console.log('⚠️ Request đang được xử lý, bỏ qua click');
      return;
    }

    if (hasExistingRoom) {
      setError('Bạn đã có phòng. Mỗi người chơi chỉ được tạo 1 phòng.');
      return;
    }

    if (!roomData.topic) {
      setError('Vui lòng chọn chủ đề câu hỏi');
      return;
    }

    console.log('🚀 Bắt đầu tạo phòng...');
    setLoading(true);
    setError('');

    const payload = {
      name: roomData.name,
      isPrivate: roomData.isPrivate,
      settings: {
        maxPlayers: parseInt(roomData.maxPlayers),
        timeLimit: parseInt(roomData.timeLimit),
        questionCount: parseInt(roomData.questionCount),
        topicId: parseInt(roomData.topic),
        gameMode: roomData.gameMode
      }
    };

    console.log('📤 Payload gửi đi:', payload);
    console.log('📋 Topic được chọn:', roomData.topic);
    console.log('🏷️ Topic name:', topics.find(t => t.id === roomData.topic)?.name);

    try {
      console.log('📡 Gửi API createRoom...');
      const response = await createRoomApi.createRoom(payload);
      console.log('📨 API Response:', response);

      if (response?.Status === 200 && response?.Data) {
        const roomInfo = response.Data;
        const roomCode = roomInfo.Code || roomInfo.code;

        console.log('✅ Tạo phòng thành công!');
        console.log('🏠 Room Code:', roomCode);
        console.log('👤 Host tự động là thành viên của phòng');

        // Tự động join vào phòng sau khi tạo thành công
        if (roomCode) {
          handleClose();
          // Người tạo phòng tự động join vào phòng
          await joinRoomAfterCreate(roomCode);
          return;
        }

        setRoomCode(roomCode);

        if (onSuccess) {
          onSuccess(roomInfo);
        }
      } else {
        const errorMsg = response?.Message || 'Tạo phòng thất bại';
        console.error('❌ Tạo phòng thất bại:', errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.Message ||
        err.response?.data ||
        err.message ||
        'Có lỗi xảy ra khi tạo phòng';

      console.error('Lỗi khi tạo phòng:', err);

      if (err.response?.status === 500) {
        if (onSuccess) {
          onSuccess();
        }
        handleClose();
      } else {
        setError(`Lỗi tạo phòng: ${errorMsg}`);
      }
    } finally {
      setLoading(false);
      console.log('Kết thúc quá trình tạo phòng');
    }
  };

  const handleClose = () => {
    handleModalClose();
    if (roomCode) {
      setRoomCode('');
      setRoomData({
        name: '',
        isPrivate: false,
        maxPlayers: 2,
        timeLimit: 60,
        questionCount: 10,
        topic: '',
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

  const joinRoomAfterCreate = async (roomCode) => {
    console.log('🎯 Bắt đầu join vào phòng vừa tạo:', roomCode);

    try {
      // Log thông tin phòng sau khi tạo
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] === THÔNG TIN PHÒNG SAU KHI TẠO ===`);
      console.log(`[${timestamp}] Mã phòng: ${roomCode}`);
      console.log(`[${timestamp}] Host đã tự động là thành viên của phòng`);
      console.log(`[${timestamp}] Phòng ${roomCode}: 1 người chơi (chỉ có host)`);
      console.log(`[${timestamp}] KHÔNG gọi thêm join API để tránh duplicate`);
      console.log(`[${timestamp}] Chỉ navigate trực tiếp đến waiting room`);
      console.log(`[${timestamp}] ==========================================`);

      // Không gọi join API, chỉ navigate trực tiếp
      // Vì người tạo phòng đã tự động là thành viên của phòng
      // Điều này tránh việc tạo "ghost player"

      console.log(`Room created: ${roomCode}`);

      // Use React Router navigation
      setTimeout(() => {
        navigate(`/waiting-room/${roomCode}`);
      }, 100);
    } catch (error) {
      const timestamp2 = new Date().toISOString();
      console.error(`[${timestamp2}] 💥 Lỗi khi navigate đến phòng:`, error);
    }
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

        {error && (
          <div className="crm-error">
            <strong>Lỗi:</strong> {error}
            <br />
            <small>Vui lòng kiểm tra lại thông tin hoặc liên hệ quản trị viên.</small>
          </div>
        )}

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
              disabled={loading}
            >
              Đóng
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="crm-form">
            <div className="crm-debug-info" style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
              🔍 Debug: {loading ? '⏳ Đang xử lý...' : '✅ Sẵn sàng'}
            </div>
            {hasExistingRoom && (
              <div className="crm-warning">
                <strong>Chú ý:</strong> Bạn đã có phòng. Mỗi người chơi chỉ được tạo 1 phòng.
              </div>
            )}
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
              <label className="crm-toggle-switch">
                <input
                  type="checkbox"
                  id="isPrivate"
                  name="isPrivate"
                  checked={roomData.isPrivate}
                  onChange={handleChange}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="crm-settings">
              <h3 className="crm-settings-title">
                <FiSettings /> Cài đặt phòng
              </h3>

              <div className="crm-form-group">
                <label htmlFor="topic">
                  <FiBookOpen style={{ marginRight: '8px' }} />
                  Chủ đề câu hỏi
                </label>
                <select
                  id="topic"
                  name="topic"
                  value={roomData.topic}
                  onChange={handleChange}
                  className="crm-input"
                  disabled={loadingTopics}
                  required
                >
                  {loadingTopics ? (
                    <option value="">Đang tải...</option>
                  ) : (
                    <>
                      <option value="" disabled>Hãy chọn chủ đề</option>
                      {topics.length > 0 ? (
                        topics.map((topic) => (
                          <option key={`topic-${topic.id}`} value={topic.id}>
                            {topic.name}
                          </option>
                        ))
                      ) : (
                        <option value="general">Kiến thức chung</option>
                      )}
                    </>
                  )}
                </select>
              </div>

              <div className="crm-form-group">
                <label htmlFor="gameMode">
                  <FiZap style={{ marginRight: '8px' }} />
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
                  <FiUsers style={{ marginRight: '8px' }} />
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
                  <FiClock style={{ marginRight: '8px' }} />
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
                  <FiHelpCircle style={{ marginRight: '8px' }} />
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

            <button
              type="submit"
              className="crm-button crm-primary-btn"
              disabled={loading || hasExistingRoom}
            >
              {loading ? 'Đang tạo...' : hasExistingRoom ? 'Không thể tạo' : 'Tạo phòng'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default CreateRoomModal;
