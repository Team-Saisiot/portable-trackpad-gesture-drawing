import React from "react";
import { useDispatch } from "react-redux";
import styled from "styled-components";
import { setSelectedTool } from "../../store";
import capitalizeFirstLetter from "../../utils/capitalizeFirstLetter";

export default function SideBarTool({ tool }) {
  const dispatch = useDispatch();

  return (
    <SideBarToolContainer
      onMouseDown={() => {
        dispatch(setSelectedTool(tool.name));
      }}
    >
      <span className="material-symbols-outlined sidebar-icon">
        {tool.icon}
      </span>
      {capitalizeFirstLetter(tool.name)}
    </SideBarToolContainer>
  );
}

const SideBarToolContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 5vh;
  padding: 1vh 0;
  width: 10vw;
  border-radius: 1vmin;
  user-select: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  .sidebar-icon {
    font-weight: bold;
    user-select: none;
    margin: 0 1vw;
  }

  :hover {
    background-color: hsl(0, 0%, 90%);
  }

  :active {
    background-color: hsl(0, 0%, 70%);
  }
`;
