import { configureStore, combineReducers } from "@reduxjs/toolkit"
import upload from "./upload"
import createSagaMiddleware from "@redux-saga/core"
import rootSaga from "./root-saga"

const sagaMiddleware = createSagaMiddleware()

const store = configureStore({
    reducer: combineReducers({
        upload
    }),
    middleware: [sagaMiddleware]
})

sagaMiddleware.run(rootSaga)

export default store