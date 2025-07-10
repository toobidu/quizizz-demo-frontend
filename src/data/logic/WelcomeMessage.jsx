import { useEffect, useState } from 'react';
import greetings from '../welcomeMessages.js';

export default function WelcomeMessage() {
    const [message, setMessage] = useState('');

    useEffect(() => {
        const username = localStorage.getItem('username') || 'Người dùng';
        const random = Math.floor(Math.random() * greetings.length);
        const greeting = greetings[random].replace('{username}', username);
        setMessage(greeting);
    }, []);

    return <div>{message}</div>;
}
