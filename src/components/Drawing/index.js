import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import io from "socket.io-client";
import _ from "lodash";
import { useDispatch, useSelector } from "react-redux";
import { setLineColor, setLineWidth } from "../../store";

export default function Drawing() {
  const { lineColor, lineWidth } = useSelector(({ lineStyle }) => lineStyle);
  const { selectedTool } = useSelector(({ selectedTool }) => selectedTool);

  const [isModalShow, setIsModalShow] = useState(false);

  const dispatch = useDispatch();

  const canvasRef = useRef(null);
  const socketRef = useRef(null);
  const lineObjects = useRef([]);
  const linePath = useRef([]);
  const undoStore = useRef([]);
  const redoStore = useRef([]);
  const historyIndex = useRef(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const colorElement = document.querySelector(".colorChange");
    const widthElement = document.querySelector(".widthChange");
    const undoElement = document.querySelector(".drawingUndoButton");
    const redoElement = document.querySelector(".drawingRedoButton");
    const clearElement = document.querySelector(".drawingClearButton");

    let drawing = false;
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
      if (historyIndex.current < 0) {
        window.alert("더이상 되돌아갈 작업이 없습니다.");
      } else if (historyIndex.current === 0) {
        const popUndoStore = _.cloneDeep(undoStore.current.pop());

        context.clearRect(0, 0, canvas.width, canvas.height);
        redoStore.current.unshift(popUndoStore);

        lineObjects.current.length = 0;
        historyIndex.current = -1;

        socketRef.current.emit("drawingHistory", {
          lineObjects: lineObjects.current,
          undoStore: undoStore.current,
          redoStore: redoStore.current,
          historyIndex: historyIndex.current,
        });
      } else {
        const popUndoStore = _.cloneDeep(undoStore.current.pop());

        context.clearRect(0, 0, canvas.width, canvas.height);
        redoStore.current.unshift(popUndoStore);

        historyIndex.current -= 1;
        lineObjects.current = _.cloneDeep(
          undoStore.current[historyIndex.current],
        );

        visualizer(lineObjects.current);

        socketRef.current.emit("drawingHistory", {
          lineObjects: lineObjects.current,
          undoStore: undoStore.current,
          redoStore: redoStore.current,
          historyIndex: historyIndex.current,
        });
      }
    };

    const redo = () => {
      if (redoStore.current.length > 0) {
        const shiftRedoStore = _.cloneDeep(redoStore.current.shift());

        context.clearRect(0, 0, canvas.width, canvas.height);
        undoStore.current.push(shiftRedoStore);

        historyIndex.current += 1;
        lineObjects.current = _.cloneDeep(
          undoStore.current[historyIndex.current],
        );

        visualizer(undoStore.current[historyIndex.current]);

        socketRef.current.emit("drawingHistory", {
          lineObjects: lineObjects.current,
          undoStore: undoStore.current,
          redoStore: redoStore.current,
          historyIndex: historyIndex.current,
        });
      }
    };

    const clear = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);

      undoStore.current.length = 0;
      redoStore.current.length = 0;
      historyIndex.current = -1;
      lineObjects.current = [];

      socketRef.current.emit("drawingHistory", {
        lineObjects: [],
        undoStore: [],
        redoStore: [],
        historyIndex: -1,
      });
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

    const visualizer = (path) => {
      for (let i = 0; i < path.length; i++) {
        for (let j = 0; j < path[i].length; j++) {
          drawLine(...path[i][j]);
        }
      }
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

      linePath.current.push([
        currentStyle.startPosition,
        [event.clientX, event.clientY],
        currentStyle.color,
        currentStyle.width,
        true,
      ]);

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
        historyIndex.current += 1;
        redoStore.current.length = 0;

        lineObjects.current.push(_.cloneDeep(linePath.current));
        undoStore.current.push(_.cloneDeep(lineObjects.current));

        socketRef.current.emit("drawingHistory", {
          lineObjects: lineObjects.current,
          undoStore: undoStore.current,
          redoStore: redoStore.current,
          historyIndex: historyIndex.current,
        });
      }

      linePath.current.length = 0;
    };

    canvas.addEventListener("mousedown", onMouseDown, false);
    canvas.addEventListener("mouseup", onMouseUp, false);
    canvas.addEventListener("mouseout", onMouseUp, false);
    canvas.addEventListener("mousemove", onMouseMove, false);

    clearElement.addEventListener("click", clear);
    redoElement.addEventListener("click", redo);
    undoElement.addEventListener("click", undo);

    const onResize = () => {
      canvas.width = 2560;
      canvas.height = 1600;
    };

    window.addEventListener("resize", onResize, false);
    onResize();

    const onDrawingEvent = (data) => {
      if (data.startPosition) {
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
      }
    };

    socketRef.current = io.connect(
      `http://${process.env.REACT_APP_PACKAGE_IPADDRESS}:${process.env.REACT_APP_PACKAGE_PORT}`,
      {
        secure: true,
        reconnect: true,
        rejectUnauthorized: false,
      },
    );

    socketRef.current.on("drawing", onDrawingEvent);
    socketRef.current.on("drawingHistory", (data) => {
      lineObjects.current = [...data.lineObjects];
      undoStore.current = [...data.undoStore];
      redoStore.current = [...data.redoStore];
      historyIndex.current = data.historyIndex;

      context.clearRect(0, 0, canvas.width, canvas.height);
      visualizer([...data.lineObjects]);
    });

    return () => {
      socketRef.current.off();
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
          display: selectedTool === "drawing" ? "flex" : "none",
        }}
      >
        <div
          className="drawing-floatingModal"
          style={{
            transform: !isModalShow
              ? ["translateX(100vmin)"]
              : ["translateX(0)"],
            display: isModalShow ? "flex" : "none",
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
