import { Navigate, Route as ReactRoute, Routes as Switch, useLocation} from 'react-router-dom'
import routes from './index'
import { useKeycloak } from '@react-keycloak/web'
import Waiting from '../components/Waiting';
import {useHasRealmRole} from '../hooks/useHasRole';
import { NotAuthorized } from '../pages/NotAuthorized';

const AppRouter = () => {
    const {initialized} = useKeycloak();
    const location = useLocation()

    if(!initialized){
        return <Waiting/>
    }

    return (
        <Switch>
            {
                routes.map(
                    (route, key) => (
                      <ReactRoute 
                            key={key}
                            path={route.path}
                            element={
                                <RequiredAuth 
                                    element={route.element} 
                                    redirectTo={"/login"} 
                                    isRequiredAuth={route.auth} 
                                    location={location}
                                />
                            }
                        />   
                ))
            }
        </Switch>
    )
}

function RequiredAuth({element, redirectTo, isRequiredAuth, location}) {
    const {keycloak} = useKeycloak()
    const hasCatalogAdmin = useHasRealmRole('catalog-admin')

    if( isRequiredAuth !== true) {
        return element
    }

    if(keycloak.authenticated) {
        return  hasCatalogAdmin ? element : <NotAuthorized/>  
    }

    return <Navigate 
            to={redirectTo}
            state={{from : location}}
          />
}

export default AppRouter