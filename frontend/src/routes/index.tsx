
import { RouteProps } from "react-router-dom"
import CategoryList from "../pages/category/PageList"
import CategoryCreate from "../pages/category/PageForm"
import CastMemberList from "../pages/cast-member/PageList"
import CastMemberCreate from "../pages/cast-member/PageForm"
import GenderList from "../pages/gender/PageList"
import GendeCreate from "../pages/gender/PageForm"
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
        element: <CategoryCreate/>
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
        path: '/cast_members',
        element: <CastMemberList/>
    },
    {
        name: 'cast_member.create',
        label: 'Criar Membro de Elenco',
        path: '/cast_members/create',
        element: <CastMemberCreate/>
    },
    {
        name: 'genders.list',
        label: 'Listar Generos',
        path: '/genders',
        element: <GenderList/>
    },
    {
        name: 'genders.create',
        label: 'Criar Gênero',
        path: '/genders/create',
        element: <GendeCreate/>
    }
]

export default routes