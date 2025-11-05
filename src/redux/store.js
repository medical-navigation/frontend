import {configureStore} from "@reduxjs/toolkit";
import errorModal from "./reducers/error";
import {loadState, saveState} from "./saveState";
import user from "./reducers/user";


const preloadedState = loadState();

export const store = configureStore({
    reducer: {
        errorModal: errorModal,
        user: user
    },
    preloadedState
})

store.subscribe(()=>{
    saveState(store.getState());
})

export default store