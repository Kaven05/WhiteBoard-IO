// Chat.jsx
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

const Chat = ({ socket, user }) => {
  const { roomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (data) => {
      console.log("Received message:", data);
      setMessages((prev) => [...prev, data]);
    };

    socket.on("chat-message", handleMessage);

    return () => {
      socket.off("chat-message", handleMessage);
    };
  }, [socket]);

  const sendMessage = (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || !socket) return;

    const messageData = {
      roomCode: roomId,
      message: inputMessage,
      username: user?.name || user?.username || `User_${(user?.userId || '').substring(0, 4)}`,
      userId: user?.userId || socket?.id || "unknown",
      timestamp: new Date().toISOString(),
    };

    // Add to local state immediately
    setMessages((prev) => [...prev, messageData]);

    // Emit to server
    socket.emit("chat-message", messageData);

    // Clear input
    setInputMessage("");
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="d-flex flex-column h-100" style={{ maxHeight: "500px" }}>
      <div className="bg-primary text-white p-2 text-center">
        <h5 className="mb-0">Chat Room</h5>
      </div>

      <div 
        className="flex-grow-1 overflow-auto p-3 bg-light"
        style={{ minHeight: "350px", maxHeight: "350px" }}
      >
        {messages.length === 0 ? (
          <div className="text-center text-muted mt-5">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isOwnMessage = msg.userId === user?.userId;
            return (
              <div
                key={index}
                className={`mb-2 d-flex ${isOwnMessage ? "justify-content-end" : "justify-content-start"}`}
              >
                <div
                  className={`p-2 rounded ${
                    isOwnMessage
                      ? "bg-primary text-white"
                      : "bg-white border"
                  }`}
                  style={{ maxWidth: "70%" }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <small className={`fw-bold ${isOwnMessage ? "text-white" : "text-primary"}`}>
                      {isOwnMessage ? "You" : msg.username}
                    </small>
                    <small className={`ms-2 ${isOwnMessage ? "text-white-50" : "text-muted"}`}>
                      {formatTime(msg.timestamp)}
                    </small>
                  </div>
                  <div>{msg.message}</div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-2 bg-white border-top">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Type a message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            maxLength={500}
          />
          <button 
            className="btn btn-primary" 
            type="submit"
            disabled={!inputMessage.trim()}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;