import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import io from "socket.io-client";
import { useSelector } from "react-redux";

export default function Drawing() {
  const { lineColor, lineWidth } = useSelector(({ lineStyle }) => lineStyle);

  const canvasRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const colorElement = document.querySelector(".colorChange");
    const widthElement = document.querySelector(".widthChange");
    const currentStyle = {
      color: lineColor,
      width: lineWidth,
    };

    let drawing = false;

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
    };

    canvas.addEventListener("mousedown", onMouseDown, false);
    canvas.addEventListener("mouseup", onMouseUp, false);
    canvas.addEventListener("mouseout", onMouseUp, false);
    canvas.addEventListener("mousemove", onMouseMove, false);

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
      <canvas ref={canvasRef} />
    </DrawingContainer>
  );
}

const DrawingContainer = styled.div`
  canvas {
    position: absolute;
    top: 0;
    left: -20vw;
    border: 2px solid black;
  }
`;
