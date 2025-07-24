import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import '../../style/components/gameScreen/CountdownScreen.css';

/**
 * Màn hình đếm ngược trước khi bắt đầu game
 */
const CountdownScreen = ({value}) => {
  const [animationClass, setAnimationClass] = useState('');

  // Thêm hiệu ứng animation khi giá trị đếm ngược thay đổi
  useEffect(() => {
    setAnimationClass('animate');
    const timer = setTimeout(() => {
      setAnimationClass('');
    }, 900);

    return () => clearTimeout(timer);
  }, [value]);

  return (<div className="countdown-screen">
    <div className="countdown-content">
      <h2>Trò chơi sẽ bắt đầu sau</h2>
      <div className={`countdown-value ${animationClass}`}>
        {value}
      </div>
      <p>Chuẩn bị...</p>
    </div>
  </div>);
};

CountdownScreen.propTypes = {
  value: PropTypes.number
};

CountdownScreen.defaultProps = {
  value: 3
};

export default CountdownScreen;
