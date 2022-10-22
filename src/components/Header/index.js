import React from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { setLineColor, setLineWidth } from "../../store";

export default function Header() {
  const { lineColor, lineWidth } = useSelector(({ lineStyle }) => lineStyle);

  const dispatch = useDispatch();

  return (
    <HeaderContainer>
      <div className="header-toolBox">
        <div>선 색상변경</div>
        <input
          type="color"
          className="colorChange"
          onChange={(event) => {
            dispatch(setLineColor(event.target.value));
          }}
        />
        <h5>{lineColor}</h5>
      </div>
      <div className="header-toolBox">
        <div>선 굵기</div>
        <input
          type="range"
          min="1"
          max="200"
          defaultValue="5"
          className="widthChange"
          onChange={(event) => {
            dispatch(setLineWidth(parseInt(event.target.value)));
          }}
        />
        <h5>{lineWidth}</h5>
      </div>
    </HeaderContainer>
  );
}

const HeaderContainer = styled.div`
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 0;
  right: 0;
  height: 12vh;
  width: 87vw;
  background-color: #777;
  z-index: 1;

  .header-title {
    margin: 5vmin 0;
    color: white;
    font-size: 3vmin;
    user-select: none;
  }

  .header-toolBox {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    user-select: none;

    div {
      color: white;
    }

    h5 {
      color: white;
    }
  }
`;
