import { Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './App.css';
import Forms from './Components/Forms';
import RoomPage from './Pages/Room';
import CodeEditor from "./Pages/Editor/CodeEditor";

const server = "http://localhost:8000";
const connectionOptions = {
  "force new connection": true,
  reconnectionAttempts: "Infinity",
  timeout: 1000,
  transports: ["websocket"],
};

const socket = io(server, connectionOptions);

const App = () => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [roomId, setRoomId] = useState(null);

  useEffect(() => {
    socket.on("userIsJoined", (data) => {
      if (data.success) {
        setUsers(data.users);
      }
    });

    socket.on("userJoinedMessageBroadcasted", (name) => {
      toast.info(`${name} joined the room`);
    });

    socket.on("userLeftMessageBroadcasted", (name) => {
      toast.warn(`${name} left the room`);
    });

    // Try to reconnect to the room if roomId is in localStorage
    const savedRoomId = localStorage.getItem("roomId");
    if (savedRoomId) {
      setRoomId(savedRoomId);
    }

    return () => {
      socket.off("userIsJoined");
      socket.off("userJoinedMessageBroadcasted");
      socket.off("userLeftMessageBroadcasted");
    };
  }, []);

  const uuid = () => {
    const S4 = () => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    return `${S4()}${S4()}-${S4()}-${S4()}-${S4()}-${S4()}${S4()}${S4()}`;
  };

  return (
    <div className="Container">
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Forms uuid={uuid} socket={socket} setUser={setUser} />} />
        <Route
          path="/:roomId"
          element={<RoomPage user={user} socket={socket} users={users} roomId={roomId} />}
        />
        <Route path="/codeeditor" element={<CodeEditor />} />
      </Routes>
    </div>
  );
};

export default App;
