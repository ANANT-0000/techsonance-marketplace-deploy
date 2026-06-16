import { createSlice } from "@reduxjs/toolkit";
export type pageLoadingState = {
  isPageLoading: boolean;
};
const initialState: pageLoadingState = {
  isPageLoading: true,
};
const pageLoadingSlice = createSlice({
  name: "pageLoading",
  initialState,
  reducers: {
    startPageLoading: (state) => {
      state.isPageLoading = true;
    },
    stopPageLoading: (state) => {
      state.isPageLoading = false;
    },
  },
});
export const { startPageLoading, stopPageLoading } = pageLoadingSlice.actions;
export const pageLoadingReducer = pageLoadingSlice.reducer;
