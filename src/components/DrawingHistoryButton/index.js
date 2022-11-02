import React from "react";
import styled from "styled-components";

const DrawingHistoryButton = () => {
  return (
    <DrawingHistoryButtonContainer>
      <h4>히스토리</h4>
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
    </DrawingHistoryButtonContainer>
  );
};

const DrawingHistoryButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin-bottom: 1vh;

  div {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 1vh;
  }
`;

export default DrawingHistoryButton;
