import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import '../../style/components/gameScreen/QuestionScreen.css';

/**
 * Màn hình hiển thị câu hỏi
 */
const QuestionScreen = ({question, questionIndex, totalQuestions, timeRemaining, onSubmitAnswer}) => {
    const [selectedOption, setSelectedOption] = useState(null);
    const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
    const [timeTaken, setTimeTaken] = useState(0);
    const [startTime, setStartTime] = useState(null);

    // Khởi tạo thời gian bắt đầu khi câu hỏi được hiển thị
    useEffect(() => {
        if (question) {
            setStartTime(Date.now());
            setSelectedOption(null);
            setIsAnswerSubmitted(false);
        }
    }, [question]);

    // Cập nhật thời gian đã trôi qua
    useEffect(() => {
        if (!startTime || isAnswerSubmitted) return;

        const timer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            setTimeTaken(elapsed);
        }, 1000);

        return () => clearInterval(timer);
    }, [startTime, isAnswerSubmitted]);

    // Tự động gửi câu trả lời khi hết thời gian
    useEffect(() => {
        if (timeRemaining <= 0 && !isAnswerSubmitted && question) {
            handleSubmitAnswer();
        }
    }, [timeRemaining, isAnswerSubmitted, question]);

    // Xử lý khi chọn đáp án
    const handleOptionSelect = (option) => {
        if (isAnswerSubmitted) return;
        setSelectedOption(option);
    };

    // Xử lý khi gửi câu trả lời
    const handleSubmitAnswer = () => {
        if (isAnswerSubmitted || !question) return;

        const finalTimeTaken = Math.floor((Date.now() - startTime) / 1000);
        setTimeTaken(finalTimeTaken);
        setIsAnswerSubmitted(true);

        onSubmitAnswer(selectedOption, finalTimeTaken);
    };

    // Nếu không có câu hỏi, hiển thị màn hình loading
    if (!question) {
        return (<div className="qs-question-loading">
            <h3>Đang tải câu hỏi...</h3>
        </div>);
    }

    // Tính phần trăm thời gian còn lại
    const timePercentage = (timeRemaining / 30) * 100; // Giả sử mỗi câu hỏi có 30 giây
    const isTimeWarning = timeRemaining <= 10; // Cảnh báo khi còn 10 giây

    return (<div className="qs-question-screen">
        <div className="qs-question-header">
            <div className="qs-question-progress">
                Câu hỏi {questionIndex + 1}/{totalQuestions}
            </div>
            <div className="qs-question-timer">
                <div className="qs-timer-bar-container">
                    <div
                        className={`qs-timer-bar ${isTimeWarning ? 'qs-warning' : ''}`}
                        style={{width: `${timePercentage}%`}}
                    ></div>
                </div>
                <div className="qs-timer-value">{timeRemaining}s</div>
            </div>
        </div>

        <div className="qs-question-content">
            <h2 className="qs-question-text">{question.question}</h2>

            <div className="qs-options-container">
                {question.options.map((option, index) => (<div
                    key={index}
                    className={`qs-option-item ${selectedOption === option.id ? 'qs-selected' : ''}`}
                    onClick={() => handleOptionSelect(option.id)}
                >
                    <div className="qs-option-letter">{String.fromCharCode(65 + index)}</div>
                    <div className="qs-option-text">{option.text}</div>
                </div>))}
            </div>
        </div>

        <div className="qs-question-footer">
            <button
                className={`qs-submit-button ${selectedOption && !isAnswerSubmitted ? 'qs-active' : 'qs-disabled'}`}
                onClick={handleSubmitAnswer}
                disabled={!selectedOption || isAnswerSubmitted}
            >
                {isAnswerSubmitted ? 'Đã gửi câu trả lời' : 'Gửi câu trả lời'}
            </button>

            {isAnswerSubmitted && (<div className="qs-answer-submitted">
                Đã gửi câu trả lời! Đang chờ kết quả...
            </div>)}
        </div>
    </div>);
};

QuestionScreen.propTypes = {
    question: PropTypes.shape({
        questionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        question: PropTypes.string.isRequired,
        options: PropTypes.arrayOf(PropTypes.shape({
            id: PropTypes.string.isRequired,
            text: PropTypes.string.isRequired
        })).isRequired,
        correctAnswer: PropTypes.string,
        type: PropTypes.string,
        topic: PropTypes.string
    }),
    questionIndex: PropTypes.number.isRequired,
    totalQuestions: PropTypes.number.isRequired,
    timeRemaining: PropTypes.number.isRequired,
    onSubmitAnswer: PropTypes.func.isRequired
};

export default QuestionScreen;
