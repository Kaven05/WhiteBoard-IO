// OnlineUsers.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const OnlineUsers = ({ socket, user }) => {
  const { roomId } = useParams();
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!socket) return;

    // Listen for users list updates
    socket.on("users-in-room", (users) => {
      console.log("Users in room:", users);
      setOnlineUsers(users);
    });

    // Listen for user joined
    socket.on("user-joined-notification", (data) => {
      console.log("User joined:", data);
    });

    // Listen for user left
    socket.on("user-left-notification", (data) => {
      console.log("User left:", data);
    });

    return () => {
      socket.off("users-in-room");
      socket.off("user-joined-notification");
      socket.off("user-left-notification");
    };
  }, [socket]);

  return (
    <div className="border border-dark bg-white" style={{ height: "500px" }}>
      <div className="bg-success text-white p-2 text-center">
        <h5 className="mb-0">
          <i className="bi bi-people-fill me-2"></i>
          Online Users ({onlineUsers.length})
        </h5>
      </div>

      <div className="p-3 overflow-auto" style={{ maxHeight: "450px" }}>
        {onlineUsers.length === 0 ? (
          <div className="text-center text-muted mt-5">
            <p>Loading users...</p>
          </div>
        ) : (
          <div className="list-group">
            {onlineUsers.map((u, index) => {
              const isCurrentUser = u.userId === user?.userId;
              return (
                <div
                  key={u.socketId || index}
                  className={`list-group-item d-flex align-items-center ${
                    isCurrentUser ? "list-group-item-primary" : ""
                  }`}
                >
                  <div
                    className="rounded-circle bg-success me-2"
                    style={{ width: "10px", height: "10px" }}
                  ></div>
                  <div className="flex-grow-1">
                    <div className="fw-bold">
                      {u.name || "Guest"}
                      {isCurrentUser && (
                        <span className="badge bg-primary ms-2">You</span>
                      )}
                    </div>
                    <small className="text-muted">
                      ID: {u.userId?.substring(0, 8)}...
                    </small>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OnlineUsers;