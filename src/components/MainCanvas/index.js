import React from "react";
import styled from "styled-components";
import Drawing from "../Drawing";
import { useSelector } from "react-redux";
import Figure from "../Figure";

export default function MainCanvas() {
  const { selectedTool } = useSelector(({ selectedTool }) => selectedTool);

  return (
    <MainCanvasContainer>
      {selectedTool === "drawing" ? (
        <Drawing />
      ) : selectedTool === "figure" ? (
        <Figure />
      ) : null}
    </MainCanvasContainer>
  );
}

const MainCanvasContainer = styled.div`
  position: fixed;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex-direction: column;
  padding-bottom: 3vmin;
  right: 0;
  height: 100vh;
  width: 80vw;
  background-color: transparent;

  canvas {
    position: absolute;
    top: 0;
    left: -20vw;
    border: 2px solid black;
  }
`;
