import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import io from "socket.io-client";
import { useSelector } from "react-redux";

export default function Figure() {
  const { selectedTool } = useSelector(({ selectedTool }) => selectedTool);

  const [isModalShow, setIsModalShow] = useState(false);

  const canvasRef = useRef(null);
  const initialPosition = useRef([0, 0]);
  const objects = useRef([]);
  const objectActualIndex = useRef(null);
  const objectActual = useRef({});
  const socketRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const undoElement = document.querySelector(".figureUndoButton");
    const redoElement = document.querySelector(".figureRedoButton");
    const clearElement = document.querySelector(".figureClearButton");

    let undoStore = [];
    let redoStore = [];
    let historyIndex = -1;
    let scaleCount = 0;

    socketRef.current = io.connect(
      `http://${process.env.REACT_APP_PACKAGE_IPADDRESS}:${process.env.REACT_APP_PACKAGE_PORT}`,
    );

    socketRef.current.on("drawing", (data) => {
      if (Array.isArray(data)) {
        objects.current = data;

        visualizer();
      } else if (data === "triangle") {
        objects.current.push({
          x: 250,
          y: 300,
          width: 50,
          height: (Math.sqrt(3) / 2) * 50,
          color: "black",
          type: "triangle",
        });

        visualizer();
      } else if (data === "circle") {
        objects.current.push({
          x: 320,
          y: 250,
          width: 50,
          height: 50,
          color: "black",
          type: "circle",
        });

        visualizer();
      } else if (data === "square") {
        objects.current.push({
          x: 320,
          y: 250,
          width: 50,
          height: 50,
          color: "black",
          type: "square",
        });

        visualizer();
      } else if (data === "scaleUp") {
        scaleCount++;
        const selectedFigure = objects.current[objectActualIndex.current];

        if (scaleCount === 2) {
          if (selectedFigure.type === "triangle") {
            selectedFigure.width += 1;
            selectedFigure.height += Math.sqrt(3) / 2;
          } else {
            selectedFigure.width += 1;
            selectedFigure.height += 1;
          }

          scaleCount = 0;
        }

        visualizer();
      } else if (data === "scaleDown") {
        const selectedFigure = objects.current[objectActualIndex.current];

        if (selectedFigure.width < 11 || selectedFigure.height < 11) {
          return;
        }

        scaleCount++;

        if (scaleCount === 2) {
          if (selectedFigure.type === "triangle") {
            selectedFigure.width -= 1;
            selectedFigure.height -= Math.sqrt(3) / 2;
          } else {
            selectedFigure.width -= 1;
            selectedFigure.height -= 1;
          }

          scaleCount = 0;
        }

        visualizer();
      }
    });

    const onResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", onResize, false);
    onResize();

    const visualizer = () => {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      context.beginPath();

      for (let i = 0; i < objects.current.length; i++) {
        if (objects.current[i].type === "square") {
          context.fillStyle = objects.current[i].color;
          context.fillRect(
            objects.current[i].x,
            objects.current[i].y,
            objects.current[i].width,
            objects.current[i].height,
          );
        } else if (objects.current[i].type === "circle") {
          context.beginPath();
          context.arc(
            objects.current[i].x,
            objects.current[i].y,
            objects.current[i].height / 2,
            0,
            2 * Math.PI,
          );

          context.stroke();
          context.fillStyle = objects.current[i].color;
          context.fill();
        } else if (objects.current[i].type === "triangle") {
          context.beginPath();
          context.moveTo(objects.current[i].x, objects.current[i].y);
          context.lineTo(
            objects.current[i].x + objects.current[i].width / 2,
            objects.current[i].y - objects.current[i].height,
          );

          context.lineTo(
            objects.current[i].x + objects.current[i].width,
            objects.current[i].y,
          );

          context.closePath();
          context.fillStyle = objects.current[i].color;
          context.fill();
        }
      }
    };

    visualizer();

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
      objects.current = [];
      historyIndex = -1;
    };

    const onMouseDown = (event) => {
      for (let i = 0; i < objects.current.length; i++) {
        const { x, y, height, width } = objects.current[i];

        if (
          x < event.clientX &&
          width + x > event.clientX &&
          y < event.clientY &&
          height + y > event.clientY
        ) {
          objectActualIndex.current = i;
          objectActual.current = objects.current[i];
          initialPosition.current = [event.clientX - x, event.clientY - y];

          break;
        }
      }
    };

    const onMouseMove = (event) => {
      if (objectActual.current != null) {
        objectActual.current.x = event.clientX - initialPosition.current[0];
        objectActual.current.y = event.clientY - initialPosition.current[1];
      }

      socketRef.current.emit("drawing", objects.current);

      visualizer();
    };

    const onMouseUp = () => {
      objectActual.current = null;

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

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  return (
    <FigureContainer>
      <canvas ref={canvasRef} className="figureCanvas" />
      <div
        className="figure-floatingBox"
        style={{
          zIndex: selectedTool === "figure" ? 1 : -1,
        }}
      >
        <div
          className="figure-floatingModal"
          style={{
            transform: !isModalShow
              ? ["translateX(100vmin)"]
              : ["translateX(0)"],
            display: selectedTool === "figure" ? "flex" : "none",
          }}
        >
          <h1>Figure</h1>
          <div className="figure-toolBox">
            <div className="controlBox">
              <div>
                <h4>높이</h4>
                <input
                  onChange={(event) => {
                    objects.current[objectActualIndex.current].height =
                      event.target.value;
                  }}
                />
              </div>
              <div>
                <h4>폭</h4>
                <input
                  onChange={(event) => {
                    objects.current[objectActualIndex.current].width =
                      event.target.value;
                  }}
                />
              </div>
              <div>
                <h4>색상</h4>
                <input
                  type="color"
                  onChange={(event) => {
                    objects.current[objectActualIndex.current].color =
                      event.target.value;
                  }}
                />
              </div>
            </div>
          </div>
          <div className="buttonBox">
            <h4>도형 추가</h4>
            <div>
              <button
                onClick={() => {
                  objects.current.push({
                    x: 320,
                    y: 250,
                    width: 50,
                    height: 50,
                    color: "black",
                    type: "square",
                  });
                }}
              >
                <span className="material-symbols-outlined">square</span>
              </button>
              <button
                onClick={() => {
                  objects.current.push({
                    x: 320,
                    y: 250,
                    width: 50,
                    height: 50,
                    color: "black",
                    type: "circle",
                  });
                }}
              >
                <span className="material-symbols-outlined">circle</span>
              </button>
              <button
                onClick={() => {
                  objects.current.push({
                    x: 250,
                    y: 300,
                    width: 50,
                    height: (Math.sqrt(3) / 2) * 50,
                    color: "black",
                    type: "triangle",
                  });
                }}
              >
                <span className="material-symbols-outlined">
                  change_history
                </span>
              </button>
            </div>
          </div>
          <div className="figure-historyBox">
            <h4>히스토리</h4>
            <div>
              <button className="figureUndoButton figure-historyButton">
                undo
              </button>
              <button className="figureRedoButton figure-historyButton">
                redo
              </button>
              <button className="figureClearButton figure-historyButton">
                clear
              </button>
            </div>
          </div>
          <div
            onClick={() => {
              setIsModalShow(false);
            }}
            className="figure-closeButton"
          >
            close
          </div>
        </div>
        <div
          className="figure-floatButton"
          style={{
            transform: isModalShow
              ? ["translateY(100vmin)"]
              : ["translateY(0)"],
            display: selectedTool === "figure" ? "flex" : "none",
            zIndex: selectedTool === "figure" ? 1 : -1,
          }}
          onClick={() => {
            setIsModalShow(true);
          }}
        >
          +
        </div>
      </div>
    </FigureContainer>
  );
}

const FigureContainer = styled.div`
  canvas {
    position: absolute;
    top: 0;
    left: -20vw;
    z-index: 0;
  }

  .figure-floatingBox {
    position: absolute;
    bottom: 4vmin;
    right: 5vmin;
    transition: all 0.2s ease-in-out;

    .figure-floatButton {
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

    .figure-floatingModal {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      height: 65vmin;
      width: 30vmin;
      background-color: hsl(0, 0%, 80%);
      border-radius: 3vmin;
      transition: all 0.4s ease-in-out;

      h1 {
        margin-bottom: 2vh;
      }

      .figure-toolBox {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;

        .figure-tool {
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

      .figure-historyButton {
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

      .figure-closeButton {
        margin-top: 4vh;
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

  .controlBox {
    div {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      margin-top: 2vh;

      input {
        width: 10vmin;
      }
    }
  }

  .buttonBox {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    margin-top: 2vh;

    button {
      margin: 0 0.5vmin;
      padding: 1vmin 1.4vmin;
      color: #777;
      font-size: 1.5vmin;
      border: none;
      border-radius: 1.5vmin;
      user-select: none;
      cursor: pointer;
      transition: all 0.2s ease-in-out;

      :hover {
        background-color: hsl(0, 0%, 80%);
      }

      :active {
        background-color: hsl(0, 0%, 60%);
      }
    }
  }

  .figure-historyBox {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    margin-top: 2vh;

    div {
      display: flex;
      justify-content: center;
      align-items: center;

      button {
        user-select: none;
        cursor: pointer;
      }
    }
  }
`;
