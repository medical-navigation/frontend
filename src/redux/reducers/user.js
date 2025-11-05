import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isLoggedIn : false,
    user : null
}

const userSlice = createSlice({
    name: 'user',
    initialState: initialState,
    reducers: {
        login_success(state, action) {
            state.isLoggedIn = true
            state.user = action.payload
        },
        login_fail(state, action) {
            state.isLoggedIn = false
            state.user = null
        },
        logout(state, action) {
            state.isLoggedIn = false
            state.user = null
        },
    }
})

export const {login_success, login_fail, logout} = userSlice.actions;

export default userSlice.reducer;
