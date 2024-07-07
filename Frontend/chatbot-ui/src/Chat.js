import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Chat.css'; 

const Chat = () => {
  const [query, setQuery] = useState('');
  const [conversationId, setConversationId] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/api/chat', {
        query,
        conversationId,
      });

      console.log(response.chatCompletion.choices[0].text)
      setMessages([...messages, { role: 'user', content: query }, { role: 'assistant', content: response.chatCompletion.choices[0].text }]);
      setConversationId(response.chatCompletion.conversationId);
      setQuery('');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-box">
        {messages.map((message, index) => (
          <div key={index} className={`chat-message ${message.role}`}>
            <p>{message.content}</p>
          </div>
        ))}
        {loading && <p>Loading...</p>}
      </div>
      <form onSubmit={handleSubmit} className="chat-form">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type your message..."
          required
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;
