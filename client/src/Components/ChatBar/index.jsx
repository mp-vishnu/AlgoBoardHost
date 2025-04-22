import React, { useState, useEffect } from "react";

const ChatBar = ({ user, socket, roomId, onClose }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!socket || !roomId) return;

    // Load persisted messages from localStorage for the room
    const savedMessages = localStorage.getItem(`messages-${roomId}`);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }

    // Listen for incoming messages
    socket.on("receiveMessage", (data) => {
      setMessages((prev) => {
        const updatedMessages = [...prev, data];
        // Persist messages to localStorage
        localStorage.setItem(`messages-${roomId}`, JSON.stringify(updatedMessages));
        return updatedMessages;
      });
    });

    // Optional: clean up
    return () => {
      socket.off("receiveMessage");
    };
  }, [socket, roomId]);

  const handleSend = () => {
    if (!message.trim()) return;

    const messageData = {
      user: user?.name || "Anonymous",
      message,
      time: new Date().toLocaleTimeString(),
    };

    // Emit the message to the room only
    socket.emit("sendMessage", { roomId, messageData });

    setMessage(""); // Clear the input
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: "300px",
        height: "100vh",
        backgroundColor: "#f8f9fa",
        borderLeft: "1px solid #ccc",
        zIndex: 999,
        padding: "10px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="mb-0">Chat</h5>
        <button className="btn btn-sm btn-outline-danger" onClick={onClose}>
          ✕
        </button>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          border: "1px solid #ccc",
          padding: "5px",
          marginBottom: "10px",
          background: "white",
        }}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              marginBottom: "8px",
              textAlign: msg.user === user?.name ? "right" : "left", // Align based on the sender
            }}
          >
            <strong>{msg.user}:</strong> {msg.message}{" "}
            <small className="text-muted">({msg.time})</small>
          </div>
        ))}
      </div>

      <div className="d-flex gap-2">
        <input
          type="text"
          className="form-control"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button className="btn btn-primary" onClick={handleSend}>
          Send 
        </button>
      </div>
    </div>
  );
};

export default ChatBar;
