import { useEffect, useState, useLayoutEffect } from "react";
import rough from "roughjs";

const roughGenerator = rough.generator();

const WhiteBoard = ({
  canvasRef,
  ctxRef,
  elements,
  setElements,
  tool,
  color,
  history,
  setHistory,
  user,
  socket,
  roomId,
}) => {
  const [img, setImg] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Load elements from localStorage if they exist, and rejoin the room after refresh
  useEffect(() => {
    // Check if user and roomId are in localStorage
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const storedRoomId = localStorage.getItem("roomId");

    if (storedUser && storedRoomId) {
      // Rejoin the room on refresh
      socket.emit("joinRoom", storedRoomId);
    }

    // Load elements from localStorage
    const storedElements = localStorage.getItem(`whiteboard-${storedRoomId || roomId}`);
    if (storedElements) {
      setElements(JSON.parse(storedElements));
    }

    socket.on("whiteBoardDataResponse", (data) => {
      setImg(data.imgURL);
    });

    socket.on("loadWhiteboard", (data) => {
      setElements(data);
    });

    return () => {
      socket.off("whiteBoardDataResponse");
      socket.off("loadWhiteboard");
    };
  }, [roomId, setElements, socket]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const ctx = canvas.getContext("2d");
      ctxRef.current = ctx;
    }
  }, [canvasRef]);

  useLayoutEffect(() => {
    if (!canvasRef?.current || !ctxRef?.current) return;

    const roughCanvas = rough.canvas(canvasRef.current);
    ctxRef.current.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );

    elements.forEach((element) => {
      const stroke = element.stroke || "black";

      if (element.type === "pencil") {
        roughCanvas.linearPath(element.path, { stroke });
      } else if (element.type === "line") {
        roughCanvas.line(
          element.offsetX,
          element.offsetY,
          element.width,
          element.height,
          { stroke }
        );
      } else if (element.type === "rect") {
        const x = Math.min(element.offsetX, element.width);
        const y = Math.min(element.offsetY, element.height);
        const width = Math.abs(element.width - element.offsetX);
        const height = Math.abs(element.height - element.offsetY);
        roughCanvas.rectangle(x, y, width, height, { stroke });
      } else if (element.type === "circle") {
        const radius = Math.sqrt(
          Math.pow(element.width - element.offsetX, 2) +
            Math.pow(element.height - element.offsetY, 2)
        );
        roughCanvas.circle(element.offsetX, element.offsetY, radius * 2, {
          stroke,
        });
      }
    });

    const canvasImage = canvasRef.current.toDataURL();
    socket.emit("whiteboardData", { imgURL: canvasImage, roomId });

    // Save elements to localStorage
    localStorage.setItem(`whiteboard-${roomId}`, JSON.stringify(elements));
  }, [elements, canvasRef, ctxRef, socket, roomId]);

  const handleMouseDown = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;

    const baseElement = {
      offsetX,
      offsetY,
      width: offsetX,
      height: offsetY,
      stroke: color,
    };

    let newElement;
    if (tool === "pencil") {
      newElement = {
        type: "pencil",
        offsetX,
        offsetY,
        path: [[offsetX, offsetY]],
        stroke: color,
      };
    } else {
      newElement = { ...baseElement, type: tool };
    }

    setElements((prev) => [...prev, newElement]);
    setIsDrawing(true);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || elements.length === 0) return;

    const { offsetX, offsetY } = e.nativeEvent;
    const lastIndex = elements.length - 1;

    if (tool === "pencil") {
      const { path } = elements[lastIndex];
      const newPath = [...path, [offsetX, offsetY]];

      setElements((prev) =>
        prev.map((el, index) =>
          index === lastIndex ? { ...el, path: newPath } : el
        )
      );
    } else {
      setElements((prev) =>
        prev.map((el, index) =>
          index === lastIndex
            ? { ...el, width: offsetX, height: offsetY }
            : el
        )
      );
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    if (typeof setHistory === "function") {
      setHistory([]); // Reset redo stack
    }
  };

  if (!user?.presenter) {
    return (
      <div className="border border-dark border-2 h-100 w-100 overflow-hidden">
        {img ? (
          <img
            src={img}
            alt="Real-time whiteboard image shared by presenter"
            className="w-100 h-100"
          />
        ) : (
          <div className="text-center text-muted p-3">
            Waiting for presenter...
          </div>
        )}
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="border border-dark border-2 h-100 w-100"
    />
  );
};

export default WhiteBoard;
