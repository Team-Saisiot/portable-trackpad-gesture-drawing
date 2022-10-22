import React from "react";
import styled from "styled-components";
import SideBarTool from "../SidebarTool";

export default function SideBar() {
  const tools = [
    { name: "select", icon: "north_west" },
    { name: "drawing", icon: "draw" },
    { name: "figure", icon: "category" },
  ];

  return (
    <SideBarContainer>
      <div className="sidebar-title">
        <div>Gesture</div>
        <div>Drawing</div>
      </div>
      {tools.map((value, index) => {
        return <SideBarTool key={index} tool={value} />;
      })}
    </SideBarContainer>
  );
}

const SideBarContainer = styled.div`
  position: fixed;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: column;
  left: 0;
  height: 100vh;
  width: 13vw;
  background-color: hsl(0, 0%, 80%);
  z-index: 1;

  .sidebar-title {
    margin: 5vmin 0;
    font-size: 3vmin;
    user-select: none;

    div {
      margin: 1vmin 0;
    }
  }
`;
