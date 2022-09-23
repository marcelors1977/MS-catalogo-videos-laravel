
import { RouteProps } from "react-router-dom"
import Dashboard from "../pages/Dashboard"
import CategoryList from "../pages/category/PageList"
import CategoryForm from "../pages/category/PageForm"
import CastMemberList from "../pages/cast-member/PageList"
import CastMemberForm from "../pages/cast-member/PageForm"
import GenderList from "../pages/gender/PageList"
import GendeForm from "../pages/gender/PageForm"
import VideoList from "../pages/video/PageList"
import VideoForm from "../pages/video/PageForm"

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
        label: 'Categorias',
        path: '/categories',
        element: <CategoryList/>
    },
    {
        name: 'categories.create',
        label: 'Criar categoria',
        path: '/categories/create',
        element: <CategoryForm/>
    },
    {
        name: 'categories.edit',
        label: 'Editar Categoria',
        path: '/categories/:id/edit',
        element: <CategoryForm/>
    },    
    {
        name: 'cast_member.list',
        label: 'Membros de elenco',
        path: '/cast-members',
        element: <CastMemberList/>
    },
    {
        name: 'cast_member.create',
        label: 'Criar Membro de Elenco',
        path: '/cast-members/create',
        element: <CastMemberForm/>
    },
    {
        name: 'cast_member.edit',
        label: 'Editar Membro de Elenco',
        path: '/cast-members/:id/edit',
        element: <CastMemberForm/>
    },
    {
        name: 'genders.list',
        label: 'Gêneros',
        path: '/genders',
        element: <GenderList/>
    },
    {
        name: 'genders.create',
        label: 'Criar Gênero',
        path: '/genders/create',
        element: <GendeForm/>
    },
    {
        name: 'genders.edit',
        label: 'Editar Gênero',
        path: '/genders/:id/edit',
        element: <GendeForm/>
    },
    {
        name: 'videos.list',
        label: 'Videos',
        path: '/videos',
        element: <VideoList/>
    },
    {
        name: 'videos.create',
        label: 'Criar Video',
        path: '/videos/create',
        element: <VideoForm/>
    },
    {
        name: 'videos.edit',
        label: 'Editar Video',
        path: '/videos/:id/edit',
        element: <VideoForm/>
    }
]

export default routes