import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { io } from "socket.io-client";
import "./App.css";
import Forms from "./component/Forms";
import RoomPage from "./component/RoomPage";

const uuid = () => {
  let S4 = () => {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return (
    S4() +
    "_" +
    S4() +
    S4() +
    S4() +
    S4() +
    S4() +
    S4() +
    "_" +
    S4() +
    S4() +
    S4() +
    S4() +
    S4() +
    S4()
  );
};

function App() {
  const [user, setUser] = useState(null);

  const server = "https://white-io.onrender.com";

  const connectionOptions = {
    "force new connection": true,
    reconnectionAttempts: "Infinity",
    timeout: 10000,
    transports: ["websocket"],
  };
  const socket = io(server, connectionOptions);

  useEffect(() => {
    socket.on("userIsJoined", (data) => {
      console.log(data);
    });
  }, [socket]);
  return (
    <>
      <div className="">
        <Routes>
          <Route
            path="/"
            element={<Forms uuid={uuid} socket={socket} setUser={setUser} />}
          />
          <Route
            path="/:roomId"
            element={<RoomPage user={user} socket={socket} />}
          />
        </Routes>
      </div>
    </>
  );
}

export default App;
