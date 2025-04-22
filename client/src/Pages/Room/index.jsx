import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MonacoEditor from "react-monaco-editor";
import "./index.css";
import WhiteBoard from "../../Components/Whiteboard";
import ChatBar from "../../Components/ChatBar"; 

const RoomPage = ({ user, socket, users }) => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const [tool, setTool] = useState("pencil");
  const [color, setColor] = useState("black");
  const [elements, setElements] = useState([]);
  const [history, setHistory] = useState([]);
  const [openedUserTab, setopenedUserTab] = useState(false);
  const [showUserList, setShowUserList] = useState(false);
  const [showChatBar, setShowChatBar] = useState(false); 

  const { roomId } = useParams();

  const handleUndo = () => {
    if (elements.length === 0) return;
    const last = elements[elements.length - 1];
    setHistory((prev) => [...prev, last]);
    setElements((prev) => prev.slice(0, -1));
  };

  const handleRedo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setElements((prev) => [...prev, last]);
    setHistory((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setElements([]);
    setHistory([]);
  };

  const navigateToCodeEditor = () => {
    navigate("/codeeditor");
  };

  return (
    <div className="container">
      {/* AlgoBoard Button */}
      {!openedUserTab && (
        <button
          type="button"
          onClick={() => setopenedUserTab(true)}
          className="btn btn-dark"
          style={{
            position: "fixed",
            top: "10px",
            left: "10px",
            height: "40px",
            width: "120px",
            zIndex: 999,
            borderTopRightRadius: "8px",
            borderBottomRightRadius: "8px"
          }}
        >
          AlgoBoard &gt;
        </button>
      )}

      {/* Sidebar */}
      <div className={`sidebar ${openedUserTab ? "open" : ""}`}>
        <button
          type="button"
          onClick={() => setopenedUserTab(false)}
          className="btn btn-light w-100 mt-4"
        >
          ← Close
        </button>

        <div className="w-100 mt-5 pt-3 px-3">
          <div
            onClick={() => setShowUserList((prev) => !prev)}
            className="d-flex justify-content-between align-items-center btn btn-secondary w-100"
          >
            <span>Users</span>
            <span>{showUserList ? "▲" : "▼"}</span>
          </div>

          {showUserList && (
            <div className="mt-2">
              {users.map((usr, index) => (
                <p key={index * 999} className="my-2 text-center w-100">
                  {usr.name}
                  {user && user.userId === usr.userId && " (You)"}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Navigate to Code Editor */}
        <button
          onClick={navigateToCodeEditor}
          className="btn btn-success w-100 mt-4"
        >
          Code Editor
        </button>

        {/* Chats Button */}
        <button
          type="button"
          className="btn btn-success w-100 mt-4"
          onClick={() => setShowChatBar(true)} 
        >
          Chats
        </button>
      </div>

      {/* Header */}
      <div className="text-center pt-4 py-4 fs-3">
        AlgoCanvas{" "}
        <span className="text-primary">[Users Online: {users.length}]</span>
      </div>

      {/* Drawing Tools (presenter only) */}
      {user?.presenter && (
        <div className="row align-items-center justify-content-center gap-3 mb-5">
          <div className="d-flex gap-3 flex-wrap col-auto">
            {["pencil", "line", "rect", "circle"].map((t) => (
              <div
                className="form-check d-flex align-items-center gap-1"
                key={t}
              >
                <input
                  className="form-check-input"
                  type="radio"
                  name="tool"
                  id={t}
                  value={t}
                  checked={tool === t}
                  onChange={(e) => setTool(e.target.value)}
                />
                <label className="form-check-label text-capitalize" htmlFor={t}>
                  {t}
                </label>
              </div>
            ))}
          </div>

          <div className="d-flex align-items-center gap-2 col-auto">
            <label htmlFor="color" className="mb-0">
              Select Color:
            </label>
            <input
              type="color"
              id="color"
              value={color}
              className="form-control form-control-color"
              onChange={(e) => setColor(e.target.value)}
              title="Choose your color"
            />
          </div>

          <div className="d-flex gap-2 col-auto">
            <button className="btn btn-primary" onClick={handleUndo}>
              Undo
            </button>
            <button className="btn btn-outline-primary" onClick={handleRedo}>
              Redo
            </button>
          </div>

          <div className="col-auto">
            <button className="btn btn-danger" onClick={handleClear}>
              Clear Canvas
            </button>
          </div>
        </div>
      )}

      {/* Whiteboard + ChatBar Layout */}
      <div className="d-flex justify-content-center align-items-start gap-4 px-2">
        {/* Whiteboard */}
        <div className="col-md-10 canvas-box">
          <WhiteBoard
            canvasRef={canvasRef}
            ctxRef={ctxRef}
            elements={elements}
            setElements={setElements}
            tool={tool}
            color={color}
            user={user}
            socket={socket}
            history={history}
            setHistory={setHistory}
            roomId={roomId}
          />
        </div>

        {/* ChatBar */}
        {showChatBar && (
          <div style={{ width: "300px", maxHeight: "85vh", overflowY: "auto" }}>
            <ChatBar
              user={user}
              socket={socket}
              roomId={roomId}
              onClose={() => setShowChatBar(false)} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomPage;
