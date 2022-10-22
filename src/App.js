import React from "react";
import Header from "./components/Header";
import MainCanvas from "./components/MainCanvas";
import SideBar from "./components/Sidebar";

const App = () => {
  return (
    <>
      <SideBar />
      <Header />
      <MainCanvas />
    </>
  );
};

export default App;
