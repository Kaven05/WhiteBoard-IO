import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Chat from "./Chat";
import OnlineUsers from "./OnlineUsers";
import WhiteBoard from "./WhiteBoard";

const RoomPage = ({ user, socket }) => {
  const { roomId } = useParams();
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const [tool, setTool] = useState("pencil");
  const [color, setColor] = useState("#000000");
  const [elements, setElements] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!socket || !roomId) return;

    console.log("Joining room:", roomId);

    socket.emit("userJoined", {
      userId: user?.userId || `user_${Math.random().toString(36).substr(2, 9)}`,
      name: user?.name || "Guest",
      roomCode: roomId,
    });

    socket.on("userIsJoined", (data) => {
      console.log("Successfully joined room:", data);
    });

    return () => {
      socket.off("userIsJoined");
    };
  }, [socket, roomId, user]);

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setElements([]);

    // BROADCAST CLEAR TO OTHER USERS
    if (socket && socket.connected) {
      socket.emit("whiteboard-data", {
        roomCode: roomId,
        elements: [],
      });
    }
  };

  const handleUndo = () => {
    if (elements.length === 0) return;

    const newElements = elements.slice(0, -1);
    setHistory((prev) => [...prev, elements[elements.length - 1]]);
    setElements(newElements);

    // BROADCAST UNDO TO ALL USERS
    if (socket && socket.connected) {
      socket.emit("whiteboard-data", {
        roomCode: roomId,
        elements: newElements,
      });
    }
  };

  const handleRedo = () => {
    if (history.length === 0) return;

    const last = history[history.length - 1];
    const newElements = [...elements, last];
    const newHistory = history.slice(0, -1);

    setElements(newElements);
    setHistory(newHistory);

    // BROADCAST REDO TO ALL USERS
    if (socket && socket.connected) {
      socket.emit("whiteboard-data", {
        roomCode: roomId,
        elements: newElements,
      });
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <h1 className="text-center py-4">
          White Board Sharing App{" "}
          <span className="text-primary">[Room: {roomId}]</span>
        </h1>

        {/* Toolbar */}
        <div className="col-md-12 gap-3 px-5 mt-2 mb-3 d-flex align-items-center justify-content-between">
          <div className="d-flex col-md-2 justify-content-between gap-1">
            <div className="d-flex gap-1 align-items-center">
              <label htmlFor="pencil">Pencil</label>
              <input
                type="radio"
                name="tool"
                id="pencil"
                value="pencil"
                checked={tool === "pencil"}
                className="mt-1"
                onChange={(e) => setTool(e.target.value)}
              />
            </div>
            <div className="d-flex gap-1 align-items-center">
              <label htmlFor="line">Line</label>
              <input
                type="radio"
                name="tool"
                id="line"
                value="line"
                checked={tool === "line"}
                className="mt-1"
                onChange={(e) => setTool(e.target.value)}
              />
            </div>
            <div className="d-flex gap-1 align-items-center">
              <label htmlFor="rect">Rectangle</label>
              <input
                type="radio"
                name="tool"
                id="rect"
                value="rect"
                checked={tool === "rect"}
                className="mt-1"
                onChange={(e) => setTool(e.target.value)}
              />
            </div>
          </div>

          <div className="col-md-2 mx-auto">
            <div className="d-flex align-items-center">
              <label htmlFor="color">Select Color:</label>
              <input
                type="color"
                id="color"
                name="color"
                value={color}
                className="mb-1 ms-3"
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
          </div>

          <div className="col-md-3 d-flex gap-2">
            <div className="btn btn-primary mt-1" onClick={handleUndo}>
              Undo
            </div>
            <div className="btn btn-outline-primary mt-1" onClick={handleRedo}>
              Redo
            </div>
          </div>

          <div className="col-md-2">
            <button className="btn btn-danger" onClick={handleClearCanvas}>
              Clear Canvas
            </button>
          </div>
        </div>

        <div className="row px-3">
          <div className="col-md-6 px-2">
            <WhiteBoard
              canvasRef={canvasRef}
              ctxRef={ctxRef}
              color={color}
              elements={elements}
              setElements={setElements}
              tool={tool}
              socket={socket}
            />
          </div>

          <div className="col-md-3 px-2">
            <div className="border border-dark" style={{ height: "500px" }}>
              <Chat socket={socket} user={user} />
            </div>
          </div>

          <div className="col-md-3 px-2">
            <OnlineUsers socket={socket} user={user} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomPage;
