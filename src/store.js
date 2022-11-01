import { configureStore, createSlice } from "@reduxjs/toolkit";

const lineStyle = createSlice({
  name: "lineStyle",
  initialState: {
    lineColor: "black",
    lineWidth: 5,
  },
  reducers: {
    setLineColor(state, action) {
      state.lineColor = action.payload;
    },
    setLineWidth(state, action) {
      state.lineWidth = action.payload;
    },
  },
});

const selectedTool = createSlice({
  name: "selectedTool",
  initialState: { selectedTool: "drawing" },
  reducers: {
    setSelectedTool(state, action) {
      state.selectedTool = action.payload;
    },
  },
});

const isFoldSideBar = createSlice({
  name: "isFoldSideBar",
  initialState: { status: false },
  reducers: {
    setIsFoldSideBar(state, action) {
      state.isFoldSideBar = action.payload;
    },
  },
});

export const { setLineColor, setLineWidth } = lineStyle.actions;
export const { setSelectedTool } = selectedTool.actions;
export const { setIsFoldSideBar } = isFoldSideBar.actions;

export default configureStore({
  reducer: {
    lineStyle: lineStyle.reducer,
    selectedTool: selectedTool.reducer,
    isFoldSideBar: isFoldSideBar.reducer,
  },
});
