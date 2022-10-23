import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import io from "socket.io-client";

export default function Figure() {
  const canvasRef = useRef(null);
  const initialPosition = useRef([0, 0]);
  const objects = useRef([]);
  const objectActualIndex = useRef(null);
  const objectActual = useRef({});
  const socketRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    socketRef.current = io.connect(
      `http://${process.env.REACT_APP_PACKAGE_IPADDRESS}:${process.env.REACT_APP_PACKAGE_PORT}`,
    );

    socketRef.current.on("drawing", (data) => {
      if (Array.isArray(data)) {
        objects.current = data;
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
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, window.innerWidth, window.innerHeight);

      for (let i = 0; i < objects.current.length; i++) {
        if (objects.current[i].type === "Rect") {
          context.fillStyle = objects.current[i].color;
          context.fillRect(
            objects.current[i].x,
            objects.current[i].y,
            objects.current[i].width,
            objects.current[i].height,
          );
        } else if (objects.current[i].type === "Circle") {
          context.beginPath();
          context.arc(
            objects.current[i].x,
            objects.current[i].y,
            objects.current[i].height,
            0,
            2 * Math.PI,
          );

          context.stroke();
          context.fillStyle = objects.current[i].color;
          context.fill();
        } else if (objects.current[i].type === "Triangle") {
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
    };

    canvas.addEventListener("mousedown", onMouseDown, false);
    canvas.addEventListener("mouseup", onMouseUp, false);
    canvas.addEventListener("mouseout", onMouseUp, false);
    canvas.addEventListener("mousemove", onMouseMove, false);

    socketRef.current.on("drawing", (data) => {
      if (data === "triangle") {
        objects.current.push({
          x: 250,
          y: 300,
          width: 100,
          height: 50,
          color: "black",
          type: "Triangle",
        });
      } else if (data === "circle") {
        objects.current.push({
          x: 320,
          y: 250,
          width: 50,
          height: 50,
          color: "black",
          type: "Circle",
        });
      } else if (data === "square") {
        objects.current.push({
          x: 320,
          y: 250,
          width: 50,
          height: 50,
          color: "black",
          type: "Rect",
        });
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  return (
    <FigureContainer>
      <canvas ref={canvasRef} />
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
      <div className="buttonBox">
        <button
          onClick={() => {
            objects.current.push({
              x: 320,
              y: 250,
              width: 50,
              height: 50,
              color: "black",
              type: "Rect",
            });
          }}
        >
          사각형 생성
        </button>
        <button
          onClick={() => {
            objects.current.push({
              x: 320,
              y: 250,
              width: 50,
              height: 50,
              color: "black",
              type: "Circle",
            });
          }}
        >
          원 생성
        </button>
        <button
          onClick={() => {
            objects.current.push({
              x: 250,
              y: 300,
              width: 100,
              height: 50,
              color: "black",
              type: "Triangle",
            });
          }}
        >
          삼각형 생성
        </button>
      </div>
    </FigureContainer>
  );
}

const FigureContainer = styled.div`
  canvas {
    position: absolute;
    top: 0;
    left: -20vw;
    border: 2px solid black;
  }

  .controlBox {
    position: absolute;
    right: 5vw;
    bottom: 10vh;
  }

  .buttonBox {
    position: absolute;
    right: 18vw;
    bottom: 10vh;
  }
`;
