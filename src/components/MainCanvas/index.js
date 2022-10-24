import React from "react";
import styled from "styled-components";
import Drawing from "../Drawing";
import Figure from "../Figure";

export default function MainCanvas() {
  return (
    <MainCanvasContainer>
      <Drawing />
      <Figure />
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
`;
