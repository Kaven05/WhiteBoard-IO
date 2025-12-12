import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const JoinRoomForm = ({ socket, uuid, setUser }) => {
  const [roomCode, setRoomCode] = useState("");
  const [name, setName] = useState("");
  const navigator = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!name.trim() || !roomCode.trim()) {
      alert("Please enter both name and room code");
      return;
    }

    const userId = uuid();
    
    const roomData = {
      name,
      roomCode,
      userId,
      host: false,
      presenter: false,
    };

    setUser({
      userId,
      name,
    });
    
    navigator(`/${roomCode}`);
  };

  return (
    <form className="w-100 mt-4" onSubmit={handleSubmit}>
      <div className="form-group">
        <input 
          type="text" 
          className="form-control" 
          id="name" 
          placeholder="Enter your name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
        />
      </div>
      <div className="form-group">
        <input 
          type="text" 
          className="form-control mt-3" 
          id="roomCode" 
          placeholder="Enter room code" 
          value={roomCode} 
          onChange={(e) => setRoomCode(e.target.value)} 
          required 
        />
      </div>
      <button type="submit" className="btn btn-primary mt-4 w-100">
        Join Room
      </button>
    </form>
  );
};

export default JoinRoomForm;
