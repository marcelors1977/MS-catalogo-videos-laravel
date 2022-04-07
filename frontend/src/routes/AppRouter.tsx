import { Route, Routes as Switch} from 'react-router-dom'
import routes from './index'

const AppRouter = () => {
    return (
        <Switch>
            {
                routes.map(
                    (route, key) => (
                        <Route
                            key={key}
                            path={route.path}
                            element={route.element}
                        />
                    )
                )
            }
        </Switch>
    )
}

export default AppRouter