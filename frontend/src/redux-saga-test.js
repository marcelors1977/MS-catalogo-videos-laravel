const { configureStore } = require('@reduxjs/toolkit')
const {default: createSagaMiddleware} = require('redux-saga')
const { take, put, call, actionChannel, debounce, all } = require('redux-saga/effects')
const axios = require('axios')

function reducer(state, action) {
    if(action.type === 'acaoX'){
        return { value: action.value}
    }
    return state
    
}

function* searchData(action) {
    // console.log('helloWordSaga')
    // const channel = yield actionChannel('acaoY')
    // while (true){
        console.log('antes acao Y')
        // const action = yield take(channel)
        const search = action.value
        try {
            const {data} = yield call( 
                () => axios.get('http://nginx/api/videos?search=' + search)
            )
            console.log(search)
            yield put( {
                type: 'acaoX',
                value: data
            })            
        } catch (error) {
            yield put( {
                type: 'acaoX',
                value: error
            }) 
            
        }
    // }   
}

function* debounceSearch() {
    yield debounce(1000, 'acaoY', searchData)
}


const sagaMiddleware = createSagaMiddleware()
// const sagaMiddleware = store => next => action => {
//     console.log('Hello World')
//     next(action)
// }

const store = configureStore({
    reducer: reducer,
    middleware: [sagaMiddleware]
})
sagaMiddleware.run(debounceSearch)

const action = (type, value) => store.dispatch( {type, value})

action ('acaoY', 'a')
action ('acaoY', 'au')
console.log(store.getState() )
