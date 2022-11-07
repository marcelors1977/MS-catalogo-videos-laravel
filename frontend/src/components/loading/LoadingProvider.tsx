import * as React from 'react'
import { addGlobalRequestInterceptor, addGlobalResponseInterceptor, removeGlobalRequestInterceptor, removeGlobalResponseInterceptor } from '../../util/http'
import LoadingContext from './LoadingContext'

export const LoadingProvider = (props) => {
    const [loading, setLoading] = React.useState(false)
    const [countRequest, setCountRequest] = React.useState(0)

    React.useMemo( () =>{
        let isSubscribed = true
        const requestIds = addGlobalRequestInterceptor(
            (config) => {
                if ( isSubscribed && !config.headers?.hasOwnProperty('x-ignore-loading')
                    ) {
                    setLoading(true)
                    setCountRequest( (prevCountRequest) => prevCountRequest + 1)
                } 
                return config
            }
        )
        const responseIds =addGlobalResponseInterceptor(
            (response) => {
                if ( isSubscribed && !response.config.headers?.hasOwnProperty('x-ignore-loading')) {
                    decrementCountRequest()
                }
                return response
            },
            (error) => {
                if ( isSubscribed && !error.config.headers?.hasOwnProperty('x-ignore-loading')) {
                    decrementCountRequest()
                }
                return Promise.reject(error)
            }
        )

        return () => {
            isSubscribed = false
            removeGlobalRequestInterceptor(requestIds)
            removeGlobalResponseInterceptor(responseIds)
        }
    }, [])

    React.useEffect( () => {
        if (!countRequest) {
            setLoading(false)
        }
    }, [countRequest])
    
    function decrementCountRequest() {
        setCountRequest( (prevCountRequest) => prevCountRequest - 1)
    }

    return (
        <LoadingContext.Provider value={loading}>
            {props.children}
        </LoadingContext.Provider>
    )
}