import React, { useEffect, useRef } from "react";
import styled from "styled-components";

export default function Figure() {
  const canvasRef = useRef(null);
  const initialPosition = useRef([0, 0]);
  const objects = useRef([]);
  const objectActualIndex = useRef(null);
  const objectActual = useRef({});

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    const onResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", onResize, false);
    onResize();

    function visualizer() {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, window.innerWidth, window.innerHeight);

      for (var i = 0; i < objects.current.length; i++) {
        if (objects.current[i].type === "Rect") {
          context.fillStyle = objects.current[i].color;
          context.fillRect(
            objects.current[i].x,
            objects.current[i].y,
            objects.current[i].width,
            objects.current[i].height,
          );
        }
      }
    }

    visualizer();

    const onMouseDown = function (event) {
      for (var i = 0; i < objects.current.length; i++) {
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

    const onMouseMove = function (event) {
      if (objectActual.current != null) {
        objectActual.current.x = event.clientX - initialPosition.current[0];
        objectActual.current.y = event.clientY - initialPosition.current[1];
      }

      visualizer();
    };

    const onMouseUp = function () {
      objectActual.current = null;
    };

    canvas.addEventListener("mousedown", onMouseDown, false);
    canvas.addEventListener("mouseup", onMouseUp, false);
    canvas.addEventListener("mouseout", onMouseUp, false);
    canvas.addEventListener("mousemove", onMouseMove, false);
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

  button {
    position: absolute;
    right: 18vw;
    bottom: 10vh;
  }
`;
