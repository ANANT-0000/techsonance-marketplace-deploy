import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    theme: 'light',
};
export type ThemeState = typeof initialState;
export const adminThemeSlice = createSlice({
    name: 'adminTheme',
    initialState,
    reducers: {
        toggleTheme: (state) => {
            state.theme = state.theme === 'light' ? 'dark' : 'light';
        }
    }
})
export const { toggleTheme } = adminThemeSlice.actions;
export const adminThemeReducer = adminThemeSlice.reducer;