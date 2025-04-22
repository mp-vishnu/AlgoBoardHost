import { useState } from "react";
import { useNavigate } from "react-router-dom";
const JoinRoomForm=({uuid,socket,setUser})=>{
  
  const [roomId,setRoomId]=useState("");
  const [name,setName]=useState("");

  const navigate=useNavigate();

  const handleRoomJoin=(e)=>{
    e.preventDefault();
    const roomData={
      name,
      roomId,
      userId:uuid(),
      host:false,
      presenter:false,
    };
    setUser(roomData);
    navigate(`/${roomId}`);
    socket.emit("userJoined",roomData);
  }
    return (<form className="w-100 mt-4">
    <div className="form-group mb-3">
      {/* <label className="form-label">Your Name</label> */}
      <input
        type="text"
        className="form-control"
        placeholder="Enter your name"
        onChange={(e)=>setName(e.target.value)}
      />
    </div>
  
    <div className="form-group mb-3">
      {/* <label className="form-label">Room Code</label> */}
      <input
        type="text"
        className="form-control"
        placeholder="Enter your room code"
        onChange={(e)=>setRoomId(e.target.value)}
      />
    </div>
  
    <button type="submit" onClick={handleRoomJoin} className="btn btn-primary w-100 mt-3">
          Join Room
        </button>
  </form>
  )
}
export default JoinRoomForm;