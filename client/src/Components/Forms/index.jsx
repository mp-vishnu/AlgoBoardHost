import CreateRoomForm from "./CreateRoomForm";
import JoinRoomForm from "./JoinRoomForm";
import "./index.css";

const Forms = ({ uuid, socket, setUser }) => {
  return (
    <div className="container" style={{ marginTop: "18vh" }}>
      <div className="row w-100 justify-content-center gap-4">
        <div className="col-md-5 bg-white p-4 shadow rounded">
          <h2 className="text-center text-primary mb-4">Create Room</h2>
          <CreateRoomForm uuid={uuid} socket={socket} setUser={setUser} />
        </div>
        <div className="col-md-5 bg-white p-4 shadow rounded">
          <h2 className="text-center text-primary mb-4">Join Room</h2>
          <JoinRoomForm uuid={uuid} socket={socket} setUser={setUser} />
        </div>
      </div>
    </div>
  );
};

export default Forms;