import { configureStore } from "@reduxjs/toolkit";
import reducer from "./upload";


const store = configureStore({
    reducer: reducer
})

export default store