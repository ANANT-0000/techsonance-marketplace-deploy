import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isCartOpen: false,
};
const cartSidebarSlice = createSlice({
    name: "cartSidebar",
    initialState,
    reducers: {
        toggleCartSidebar: (state, action) => {
            switch (action.payload) {
                case 'open':
                    state.isCartOpen = true;
                    break;
                case 'close':
                    state.isCartOpen = false;
                    break;
                default:
                    state.isCartOpen = !state.isCartOpen;
            }
        },
    },
});

export const { toggleCartSidebar } = cartSidebarSlice.actions;
export const cartSidebarReducer = cartSidebarSlice.reducer;