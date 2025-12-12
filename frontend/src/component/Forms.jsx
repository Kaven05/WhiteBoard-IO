import CreateRoomForm from "./CreateRoomForm/";

import JoinRoomForm from "./JoinRoomForm";
const Forms = ({ uuid, socket, setUser }) => {
  return (
    <div className="row h-100 p-5">
      <div className="col-md-4 mt-5 p-3 form-box border border-primary rounded-2 mx-auto d-flex flex-column align-items-center  ">
        <h1 className="text-primary fw-bold">Create room</h1>
        <CreateRoomForm uuid={uuid} socket={socket} setUser={setUser} />
      </div>
      <div className="col-md-4 mt-5 p-3 form-box border border-primary rounded-2 mx-auto d-flex flex-column align-items-center  ">
        <h1 className="text-primary fw-bold">Join room</h1>
        <JoinRoomForm uuid={uuid} socket={socket} setUser={setUser} />
      </div>
    </div>
  );
};

export default Forms;
