import { createSlice } from "@reduxjs/toolkit";
export type MenuState = {
  isMenuOpen: boolean;
};
const initialState: MenuState = {
  isMenuOpen: false,
};
const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {
    toggleMenu: (state) => {
      state.isMenuOpen = !state.isMenuOpen;
    },
  },
});
export const { toggleMenu } = menuSlice.actions;
export const menuReducer = menuSlice.reducer;
