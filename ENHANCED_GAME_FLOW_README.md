# Enhanced Game Flow Implementation

## Overview

This implementation adds comprehensive real-time game functionality with full backend API integration. The enhanced system includes:

- **Real-time WebSocket communication** with proper event handling
- **Advanced game session management** with persistent state
- **Live scoreboard updates** and player tracking
- **Enhanced question handling** with multimedia support
- **Comprehensive statistics tracking** and analytics
- **Improved error handling** and offline support
- **Modern UI/UX** with responsive design

## New Components

### Services

1. **enhancedGameFlowService.js** - Main game flow orchestration
2. **enhancedWebSocketEventHandler.js** - WebSocket event management
3. **gameSessions.api.js** - Game sessions API client
4. **questions.api.js** - Questions API client
5. **userAnswers.api.js** - User answers API client
6. **rankings.api.js** - Rankings API client
7. **socketConnections.api.js** - Socket connections API client

### Components

1. **EnhancedGameScreen.jsx** - Main game interface
2. **EnhancedQuestionScreen.jsx** - Question display and interaction
3. **EnhancedGamePage.jsx** - Full page game container
4. **LoadingSpinner.jsx** - Reusable loading indicator
5. **ErrorMessage.jsx** - Reusable error display

### Hooks

1. **useEnhancedGameState.js** - Comprehensive game state management

## API Integration

### Game Sessions API
```javascript
// Create game session
await createGameSession({
    roomId: 123,
    hostId: 456,
    gameState: 'waiting',
    totalQuestions: 10,
    timePerQuestion: 30
});

// Update session state
await updateGameSessionState(sessionId, {
    gameState: 'playing',
    currentQuestionIndex: 5
});
```

### Questions API
```javascript
// Get random questions from topics
const questions = await getRandomQuestionsFromTopics(10, [1, 2, 3]);

// Get question with answers
const questionData = await getQuestionWithAnswers(questionId);
```

### User Answers API
```javascript
// Submit answer
await submitUserAnswer({
    questionId: 123,
    selectedAnswerId: 456,
    timeTaken: 15.5,
    gameSessionId: 789
});

// Get session statistics
const stats = await getSessionStatistics(sessionId);
```

### Rankings API
```javascript
// Get global rankings
const rankings = await getGlobalRankings({ page: 1, limit: 10 });

// Get room rankings
const roomRankings = await getRoomRankings(roomId);
```

## WebSocket Events

### Game Flow Events

#### Game Start
```javascript
{
    "eventType": "game-start",
    "data": {
        "roomCode": "ABC123",
        "gameSessionId": 1,
        "totalQuestions": 10,
        "timePerQuestion": 30
    }
}
```

#### Next Question
```javascript
{
    "eventType": "next-question",
    "data": {
        "questionNumber": 1,
        "question": {
            "id": 123,
            "questionText": "What is the capital of Vietnam?",
            "options": [
                {"id": 1, "answerText": "Hanoi", "optionIndex": 0, "isCorrect": true},
                {"id": 2, "answerText": "Ho Chi Minh City", "optionIndex": 1, "isCorrect": false}
            ],
            "timeLimit": 30
        }
    }
}
```

#### Submit Answer
```javascript
{
    "eventType": "submit-answer",
    "data": {
        "userId": 456,
        "questionId": 123,
        "selectedAnswerId": 1,
        "timeTaken": 15.5
    }
}
```

#### Answer Result
```javascript
{
    "eventType": "answer-result",
    "data": {
        "userId": 456,
        "isCorrect": true,
        "correctAnswerId": 1,
        "pointsEarned": 100,
        "timeBonus": 50
    }
}
```

#### Scoreboard Update
```javascript
{
    "eventType": "scoreboard-update",
    "data": {
        "scoreboard": [
            {
                "userId": 456,
                "username": "Player1",
                "currentScore": 150,
                "rank": 1,
                "correctAnswers": 1,
                "totalAnswers": 1
            }
        ]
    }
}
```

#### Game End
```javascript
{
    "eventType": "game-end",
    "data": {
        "finalScoreboard": [...],
        "gameStats": {
            "totalQuestions": 10,
            "averageScore": 750,
            "playTime": "5:30"
        }
    }
}
```

## Usage Example

### Basic Integration

```jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import EnhancedGameScreen from '../components/gameScreen/EnhancedGameScreen';
import { useUserStore } from '../hooks/useUserStore';

const GamePage = () => {
    const { roomCode } = useParams();
    const { user } = useUserStore();
    const isHost = localStorage.getItem('isHost') === 'true';

    return (
        <EnhancedGameScreen
            roomCode={roomCode}
            isHost={isHost}
            currentUserId={user.userId}
            onLeaveGame={() => navigate('/')}
        />
    );
};
```

### Using Enhanced Game State Hook

```jsx
import React from 'react';
import useEnhancedGameState from '../hooks/useEnhancedGameState';

const CustomGameComponent = ({ roomCode, isHost, userId }) => {
    const {
        gameState,
        currentQuestion,
        scoreboard,
        startGame,
        submitAnswer,
        loading,
        error
    } = useEnhancedGameState(roomCode, isHost, userId);

    const handleStartGame = async () => {
        await startGame({
            questionCount: 15,
            timeLimit: 45,
            selectedTopicIds: [1, 2, 3]
        });
    };

    const handleAnswerSubmit = async (answerId, time) => {
        await submitAnswer(currentQuestion.id, answerId, time);
    };

    return (
        <div>
            <h1>Game State: {gameState}</h1>
            {/* Your custom UI */}
        </div>
    );
};
```

## Advanced Features

### Real-time Answer Tracking

```javascript
// Track answers in real-time during question
const trackingData = enhancedWebSocketEventHandler.startAnswerTracking(
    questionId, 
    timeLimit
);

// Listen for tracking updates
eventEmitter.on('enhanced-answer-tracking-update', (data) => {
    console.log(`${data.totalAnswered} players have answered`);
});
```

### Game Statistics

```javascript
// Start comprehensive game statistics
const stats = enhancedWebSocketEventHandler.startGameStatistics();

// Listen for stats updates
eventEmitter.on('enhanced-game-stats-update', (data) => {
    console.log('Accuracy:', data.correctAnswers / data.totalAnswers);
    console.log('Player performance:', data.playerPerformance);
});
```

### Error Handling

```javascript
// Enhanced error handling with retry logic
try {
    await enhancedGameFlowService.submitAnswer(questionId, answerId, time);
} catch (error) {
    if (error.code === 'NETWORK_ERROR') {
        // Queue for retry when connection restored
        console.log('Answer queued for retry');
    } else {
        // Handle other errors
        console.error('Failed to submit answer:', error);
    }
}
```

## Routes

Add to your routes configuration:

```jsx
import EnhancedGamePage from '../pages/EnhancedGamePage';

const routes = [
    // ... other routes
    {
        path: "/enhanced-game/:roomCode",
        element: <ProtectedRoute><EnhancedGamePage /></ProtectedRoute>
    }
];
```

## Styling

The enhanced components come with comprehensive CSS:

- **EnhancedGameScreen.css** - Main game interface styles
- **EnhancedQuestionScreen.css** - Question display styles
- **EnhancedGamePage.css** - Page-level styles
- **LoadingSpinner.css** - Loading indicator styles
- **ErrorMessage.css** - Error message styles

All styles are responsive and include:
- Mobile-first design
- Dark mode support
- Accessibility features
- Smooth animations
- Modern gradients and effects

## Testing

To test the enhanced game flow:

1. Start your backend server with the new APIs
2. Navigate to `/enhanced-game/ROOM_CODE?isHost=true`
3. Test real-time features with multiple browser tabs
4. Verify WebSocket events in browser dev tools
5. Test error scenarios (network disconnection, etc.)

## Configuration

Update your API configuration:

```javascript
// constants/api.js
export const API_ENDPOINTS = {
    // ... existing endpoints
    GAME_SESSIONS: {
        BASE: '/game-sessions',
        BY_ROOM: (roomId) => `/game-sessions/room/${roomId}`,
        UPDATE_STATE: (id) => `/game-sessions/${id}/state`
    },
    QUESTIONS: {
        BY_TOPIC: (topicId) => `/questions/topic/${topicId}`,
        WITH_ANSWERS: (id) => `/questions/${id}/with-answers`,
        RANDOM: (count, topicId) => `/questions/random/${count}/topic/${topicId}`
    },
    USER_ANSWERS: {
        SUBMIT: '/user-answers/submit',
        BY_SESSION: (userId, sessionId) => `/user-answers/user/${userId}/session/${sessionId}`,
        STATISTICS: (sessionId) => `/user-answers/session/${sessionId}/statistics`
    },
    RANKINGS: {
        GLOBAL: '/rankings/global',
        BY_ROOM: (roomId) => `/rankings/room/${roomId}`
    }
};
```

## Performance Considerations

1. **WebSocket Connection Pooling** - Reuse connections efficiently
2. **State Management** - Minimal re-renders with optimized state updates
3. **Lazy Loading** - Components and data loaded on demand
4. **Caching** - Question data and user answers cached locally
5. **Debouncing** - WebSocket events debounced to prevent spam

## Browser Support

- **Modern browsers** (Chrome 70+, Firefox 65+, Safari 12+, Edge 79+)
- **WebSocket support** required
- **ES6+ features** (async/await, destructuring, etc.)
- **CSS Grid and Flexbox** for layouts

This enhanced implementation provides a solid foundation for real-time quiz gaming with comprehensive feature coverage and professional-grade code quality.
