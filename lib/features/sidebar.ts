import { createSlice } from "@reduxjs/toolkit";
export type isSidebarType = {
    isSidebarOpen: boolean
}
const initialState: isSidebarType = {
    isSidebarOpen: false,
};
const sidebarSlice = createSlice({
    name: "sidebar",
    initialState,
    reducers: {
        toggleSidebar: (state) => {
            state.isSidebarOpen = !state.isSidebarOpen;
        }
    }
});
export const { toggleSidebar } = sidebarSlice.actions;
export const sidebarReducer = sidebarSlice.reducer;