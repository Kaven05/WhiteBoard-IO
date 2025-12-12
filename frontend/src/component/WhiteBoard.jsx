import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import rough from "roughjs/bundled/rough.esm";

const gen = rough.generator();

const WhiteBoard = ({
  canvasRef: outerCanvasRef,
  ctxRef: outerCtxRef,
  color,
  setElements,
  elements,
  tool,
  socket
}) => {
  const { roomId } = useParams();
  
  const internalCanvasRef = useRef(null);
  const canvasRef = outerCanvasRef || internalCanvasRef;
  const internalCtxRef = useRef(null);
  const ctxRef = outerCtxRef || internalCtxRef;

  const [isDrawing, setIsDrawing] = useState(false);
  const isRemoteUpdate = useRef(false);

  useEffect(() => {
    if (!socket) return;
    const handler = (data) => {
      if (!data) return;

      isRemoteUpdate.current = true;

      if (Array.isArray(data.elements)) {
        setElements(data.elements);
        return;
      }

      if (data.element) {
        setElements((prev) => {
          const newEl = data.element;
          
          const existingIndex = prev.findIndex(el => el.id === newEl.id);
          
          if (existingIndex !== -1) {
            const updated = [...prev];
            updated[existingIndex] = newEl;
            return updated;
          }
          
          return [...prev, newEl];
        });
      }
    };

    socket.on("whiteboard-data", handler);
    return () => socket.off("whiteboard-data", handler);
  }, [socket, setElements]);

  // init canvas once
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.style.width = "100%";
    canvas.style.height = "100%";

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = rect.width || 800;
    const height = rect.height || 500;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = "round";
    ctx.lineWidth = 5;
    ctx.strokeStyle = color;

    ctxRef.current = ctx;
  }, []);

  useEffect(() => {
    if (ctxRef.current) ctxRef.current.strokeStyle = color;
  }, [color]);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pid = e.pointerId ?? e.nativeEvent?.pointerId;
    canvas.setPointerCapture?.(pid);

    const { x, y } = getPos(e);
    isRemoteUpdate.current = false;

    const id = `${Date.now()}_${Math.random()}`;

    if (tool === "pencil") {
      setElements((p) => [
        ...p,
        { id, element: "pencil", stroke: color, path: [[x, y]] },
      ]);
    } else if (tool === "rect") {
      setElements((p) => [
        ...p,
        { id, element: "rect", stroke: color, x, y, width: 0, height: 0 },
      ]);
    } else if (tool === "line") {
      setElements((p) => [
        ...p,
        { id, element: "line", stroke: color, x1: x, y1: y, x2: x, y2: y },
      ]);
    }

    setIsDrawing(true);
  };

  const handleMove = (e) => {
    if (!isDrawing) return;
    const { x, y } = getPos(e);
    isRemoteUpdate.current = false;

    setElements((prev) =>
      prev.map((el, i) =>
        i !== prev.length - 1
          ? el
          : el.element === "rect"
          ? { ...el, width: x - el.x, height: y - el.y }
          : el.element === "line"
          ? { ...el, x2: x, y2: y }
          : el.element === "pencil"
          ? { ...el, path: [...el.path, [x, y]] }
          : el
      )
    );
  };

  const handleUp = (e) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const pid = e?.pointerId ?? e?.nativeEvent?.pointerId;
      canvas.releasePointerCapture?.(pid);
    }
    setIsDrawing(false);
  };

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const rc = rough.canvas(canvas);

    elements.forEach((el) => {
      if (el.element === "rect") {
        rc.draw(
          gen.rectangle(el.x, el.y, el.width, el.height, {
            stroke: el.stroke,
            roughness: 0,
            strokeWidth: 5,
          })
        );
      } else if (el.element === "line") {
        rc.draw(
          gen.line(el.x1, el.y1, el.x2, el.y2, {
            stroke: el.stroke,
            roughness: 0,
            strokeWidth: 5,
          })
        );
      } else if (el.element === "pencil") {
        rc.linearPath(el.path, {
          stroke: el.stroke,
          roughness: 0,
          strokeWidth: 5,
        });
      }
    });

    if (!isRemoteUpdate.current && socket && socket.connected) {
      const last = elements[elements.length - 1];
      if (last) {
        socket.emit("whiteboard-data", { roomCode: roomId, element: last });
      }
    }

    // reset remote flag
    isRemoteUpdate.current = false;
  }, [elements, socket, roomId]);

return (
  <div
    className="overflow-hidden border border-dark px-0 mx-auto mt-3"
    style={{ height: "500px" }}
  >
    <canvas
      ref={canvasRef}
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onPointerCancel={handleUp}
      style={{
        width: "100%",
        height: "100%",
        touchAction: "none",
        display: "block",
      }}
    />
  </div>
);
};

export default WhiteBoard;