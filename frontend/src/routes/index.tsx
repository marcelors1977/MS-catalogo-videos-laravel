
import { RouteProps } from "react-router-dom"
import CategoryList from "../pages/category/PageList"
import CastMemberList from "../pages/castMember/PageList"
import GenderList from "../pages/genders/PageList"
import Dashboard from "../pages/Dashboard"

export interface MyRouteProps extends RouteProps{
    name: string
    label: string
}

const routes: MyRouteProps[] = [
    {
        name: 'dashboard',
        label: 'Dashboard',
        path: '/',
        element: <Dashboard/>
    },
    {
        name: 'categories.list',
        label: 'Listar Categorias',
        path: '/categories',
        element: <CategoryList/>
    },
    {
        name: 'categories.create',
        label: 'Criar categoria',
        path: '/categories/create',
        element: <CategoryList/>
    },
    {
        name: 'categories.edit',
        label: 'Editar Categorias',
        path: '/categories/:id/edit',
        element: <CategoryList/>
    },    
    {
        name: 'cast_member.list',
        label: 'Listar Elenco',
        path: '/cast_member',
        element: <CastMemberList/>
    },
    {
        name: 'genders.list',
        label: 'Listar Generos',
        path: '/genders',
        element: <GenderList/>
    }
]

export default routes