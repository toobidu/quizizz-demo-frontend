import apiInstance from './apiInstance';

/**
 * Questions API Service
 * Handles all question-related API calls
 */

/**
 * Get questions by topic ID
 * @param {number} topicId - Topic ID
 * @returns {Promise<Object>} - Questions data
 */
export const getQuestionsByTopic = async (topicId) => {
    try {
        const response = await apiInstance.get(`/questions/topic/${topicId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Get question with answers by question ID
 * @param {number} questionId - Question ID
 * @returns {Promise<Object>} - Question with answers
 */
export const getQuestionWithAnswers = async (questionId) => {
    try {
        const response = await apiInstance.get(`/questions/${questionId}/with-answers`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Get all questions of a topic with answers
 * @param {number} topicId - Topic ID
 * @returns {Promise<Object>} - Questions with answers
 */
export const getTopicQuestionsWithAnswers = async (topicId) => {
    try {
        const response = await apiInstance.get(`/questions/topic/${topicId}/with-answers`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Get random questions from a topic
 * @param {number} count - Number of questions to get
 * @param {number} topicId - Topic ID
 * @returns {Promise<Object>} - Random questions
 */
export const getRandomQuestions = async (count, topicId) => {
    try {
        const response = await apiInstance.get(`/questions/random/${count}/topic/${topicId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Get random questions from multiple topics
 * @param {number} count - Number of questions to get
 * @param {number[]} topicIds - Array of topic IDs
 * @returns {Promise<Object>} - Random questions from multiple topics
 */
export const getRandomQuestionsFromTopics = async (count, topicIds) => {
    try {
        // If multiple topics, we'll need to get questions proportionally
        if (topicIds.length === 1) {
            return await getRandomQuestions(count, topicIds[0]);
        }
        
        // For multiple topics, distribute questions evenly
        const questionsPerTopic = Math.ceil(count / topicIds.length);
        const allQuestions = [];
        
        for (const topicId of topicIds) {
            try {
                const response = await getRandomQuestions(questionsPerTopic, topicId);
                if (response.questions && Array.isArray(response.questions)) {
                    allQuestions.push(...response.questions);
                }
            } catch (error) {
            }
        }
        
        // Shuffle and limit to requested count
        const shuffled = allQuestions.sort(() => Math.random() - 0.5);
        return {
            questions: shuffled.slice(0, count),
            total: shuffled.length
        };
    } catch (error) {
        throw error.response?.data || error;
    }
};
