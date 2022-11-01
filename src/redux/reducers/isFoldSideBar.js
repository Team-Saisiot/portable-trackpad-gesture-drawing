import { createSlice } from "@reduxjs/toolkit";

const isFoldSideBar = createSlice({
  name: "isFoldSideBar",
  initialState: { isFoldSideBar: false },
  reducers: {
    setIsFoldSideBar(state, action) {
      state.isFoldSideBar = action.payload;
    },
  },
});

export const { setIsFoldSideBar } = isFoldSideBar.actions;

export default isFoldSideBar.reducer;
