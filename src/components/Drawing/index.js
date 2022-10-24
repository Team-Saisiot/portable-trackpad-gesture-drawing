import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import io from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { setLineColor, setLineWidth } from "../../store";

export default function Drawing() {
  const { lineColor, lineWidth } = useSelector(({ lineStyle }) => lineStyle);
  const { selectedTool } = useSelector(({ selectedTool }) => selectedTool);

  const [isModalShow, setIsModalShow] = useState(false);

  const dispatch = useDispatch();

  const canvasRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const colorElement = document.querySelector(".colorChange");
    const widthElement = document.querySelector(".widthChange");
    const undoElement = document.querySelector(".drawingUndoButton");
    const redoElement = document.querySelector(".drawingRedoButton");
    const clearElement = document.querySelector(".drawingClearButton");

    let drawing = false;
    let undoStore = [];
    let redoStore = [];
    let historyIndex = -1;
    let currentStyle = {
      color: lineColor,
      width: lineWidth,
    };

    colorElement.addEventListener(
      "change",
      (event) => {
        currentStyle.color = event.target.value;
      },
      false,
    );

    widthElement.addEventListener(
      "change",
      (event) => {
        currentStyle.width = event.target.value;
      },
      false,
    );

    const undo = () => {
      if (historyIndex < 0) {
        context.clearRect(0, 0, canvas.width, canvas.height);

        undoStore = [];
        historyIndex = -1;
      } else if (historyIndex === 0) {
        window.alert("전부 지우시려면 clear를 눌러주세요!");
      } else {
        historyIndex -= 1;

        redoStore.unshift(undoStore.pop());
        context.putImageData(undoStore[historyIndex], 0, 0);
      }
    };

    const redo = () => {
      if (redoStore.length > 0) {
        historyIndex += 1;
        undoStore.push(redoStore.shift());
        context.putImageData(undoStore[historyIndex], 0, 0);
      }
    };

    const clear = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      undoStore = [];
      historyIndex = -1;
    };

    const drawLine = (startPosition, endPosition, color, width, emit) => {
      context.beginPath();
      context.moveTo(...startPosition);
      context.lineTo(...endPosition);
      context.strokeStyle = color;
      context.lineWidth = width;
      context.lineCap = "round";
      context.stroke();
      context.closePath();

      if (!emit) {
        return;
      }

      socketRef.current.emit("drawing", {
        startPosition: [
          startPosition[0] / canvas.width,
          startPosition[1] / canvas.height,
        ],
        endPosition: [
          endPosition[0] / canvas.width,
          endPosition[1] / canvas.height,
        ],
        color,
        width,
      });
    };

    const onMouseDown = (event) => {
      drawing = true;
      currentStyle.startPosition = [event.clientX, event.clientY];
    };

    const onMouseMove = (event) => {
      if (!drawing) {
        return;
      }

      drawLine(
        currentStyle.startPosition,
        [event.clientX, event.clientY],
        currentStyle.color,
        currentStyle.width,
        true,
      );

      currentStyle.startPosition = [event.clientX, event.clientY];
    };

    const onMouseUp = (event) => {
      if (!drawing) {
        return;
      }

      drawing = false;

      drawLine(
        currentStyle.startPosition,
        [event.clientX, event.clientY],
        currentStyle.color,
        currentStyle.width,
        true,
      );

      if (event.type !== "mouseout") {
        undoStore.push(context.getImageData(0, 0, canvas.width, canvas.height));
        historyIndex += 1;
      }
    };

    canvas.addEventListener("mousedown", onMouseDown, false);
    canvas.addEventListener("mouseup", onMouseUp, false);
    canvas.addEventListener("mouseout", onMouseUp, false);
    canvas.addEventListener("mousemove", onMouseMove, false);

    clearElement.addEventListener("click", clear);
    redoElement.addEventListener("click", redo);
    undoElement.addEventListener("click", undo);

    const onResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", onResize, false);
    onResize();

    const onDrawingEvent = (data) => {
      drawLine(
        [
          data.startPosition[0] * canvas.width,
          data.startPosition[1] * canvas.height,
        ],
        [
          data.endPosition[0] * canvas.width,
          data.endPosition[1] * canvas.height,
        ],
        data.color,
        data.width,
      );
    };

    socketRef.current = io.connect(
      `http://${process.env.REACT_APP_PACKAGE_IPADDRESS}:${process.env.REACT_APP_PACKAGE_PORT}`,
    );

    socketRef.current.on("drawing", onDrawingEvent);

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  return (
    <DrawingContainer>
      <canvas
        ref={canvasRef}
        className="drawingCanvas"
        style={{ zIndex: selectedTool === "drawing" ? 1 : 0 }}
      />
      <div
        className="drawing-floatingBox"
        style={{
          zIndex: selectedTool === "drawing" ? 1 : -1,
        }}
      >
        <div
          className="drawing-floatingModal"
          style={{
            transform: !isModalShow
              ? ["translateX(100vmin)"]
              : ["translateX(0)"],
            display: selectedTool === "drawing" ? "flex" : "none",
          }}
        >
          <h1>Drawing</h1>
          <div className="drawing-toolBox">
            <div className="drawing-tool">
              <p>선 색상변경</p>
              <input
                type="color"
                className="colorChange"
                onChange={(event) => {
                  dispatch(setLineColor(event.target.value));
                }}
              />
              <h5>{lineColor}</h5>
            </div>
            <div className="drawing-tool">
              <p>선 굵기</p>
              <input
                type="range"
                min="1"
                max="200"
                defaultValue="5"
                className="widthChange"
                onChange={(event) => {
                  dispatch(setLineWidth(event.target.value));
                }}
              />
              <h5>{lineWidth}</h5>
            </div>
          </div>
          <div>
            <button className="drawingUndoButton drawing-historyButton">
              undo
            </button>
            <button className="drawingRedoButton drawing-historyButton">
              redo
            </button>
            <button className="drawingClearButton drawing-historyButton">
              clear
            </button>
          </div>
          <div
            onClick={() => {
              setIsModalShow(false);
            }}
            className="drawing-closeButton"
          >
            close
          </div>
        </div>
        <div
          className="drawing-floatButton"
          style={{
            transform: isModalShow
              ? ["translateY(100vmin)"]
              : ["translateY(0)"],
            display: selectedTool === "drawing" ? "flex" : "none",
            zIndex: selectedTool === "drawing" ? 1 : -1,
          }}
          onClick={() => {
            setIsModalShow(true);
          }}
        >
          +
        </div>
      </div>
    </DrawingContainer>
  );
}

const DrawingContainer = styled.div`
  canvas {
    position: absolute;
    top: 0;
    left: -20vw;
    z-index: 1;
  }

  .drawing-floatingBox {
    position: absolute;
    bottom: 4vmin;
    right: 5vmin;
    transition: all 0.2s ease-in-out;

    .drawing-floatButton {
      position: absolute;
      display: flex;
      justify-content: center;
      align-items: center;
      right: 0;
      bottom: 0;
      height: 4vmin;
      width: 4vmin;
      border-radius: 4vmin;
      color: white;
      background-color: #777;
      user-select: none;
      cursor: pointer;
      transition: all 0.4s ease-in-out;

      :hover {
        background-color: hsl(0, 0%, 80%);
      }

      :active {
        background-color: hsl(0, 0%, 60%);
      }
    }

    .drawing-floatingModal {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      height: 48vmin;
      width: 30vmin;
      background-color: hsl(0, 0%, 80%);
      border-radius: 3vmin;
      transition: all 0.4s ease-in-out;

      h1 {
        margin-bottom: 2vh;
      }

      .drawing-toolBox {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;

        .drawing-tool {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          margin-bottom: 1vh;
        }

        p {
          color: hsl(0, 0%, 10%);
          margin-top: 1vmin;
          margin-bottom: 0.5vmin;
        }
      }

      .drawing-historyButton {
        margin: 0 0.5vmin;
        padding: 1vmin 1.4vmin;
        color: #777;
        font-size: 1.5vmin;
        border: none;
        border-radius: 1.5vmin;
        transition: all 0.2s ease-in-out;

        :hover {
          background-color: hsl(0, 0%, 80%);
        }

        :active {
          background-color: hsl(0, 0%, 60%);
        }
      }

      .drawing-closeButton {
        margin-top: 2vh;
        padding: 0.5vmin 2vmin;
        color: hsl(0, 0%, 80%);
        background-color: hsl(0, 0%, 40%);
        border-radius: 1vmin;
        user-select: none;
        cursor: pointer;
        transition: all 0.2s ease-in-out;

        :hover {
          background-color: hsl(0, 0%, 50%);
        }

        :active {
          background-color: hsl(0, 0%, 30%);
        }
      }
    }
  }
`;
