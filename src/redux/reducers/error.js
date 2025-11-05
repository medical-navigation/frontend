import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    visible: false,
    errorCode: "",
    errorMessage: "",
}

const viewSlice = createSlice({
    name: "modalError",
    initialState,
    reducers: {
        showModal: (state, action) => {
            state.visible = true
            state.errorCode = action.payload.errorCode
            state.errorMessage = action.payload.errorMessage ?? ""
        },
        closeModal: (state, action) => {
            state.visible = false
            state.errorCode = ""
            state.errorMessage = ""
        }
    }
})

export const {showModal, closeModal} = viewSlice.actions;

export default viewSlice.reducer;