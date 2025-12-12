import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateRoomForm = ({ socket, uuid, setUser }) => {
  const [name, setName] = useState("");
  const navigator = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert("Please enter your name");
      return;
    }

    const userId = uuid();
    const roomCode = uuid(); 
    
    const roomData = {
      name,
      roomCode,
      userId,
      host: true,
      presenter: true,
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
      <button type="submit" className="btn btn-primary mt-4 w-100">
        Create Room
      </button>
    </form>
  );
};

export default CreateRoomForm;