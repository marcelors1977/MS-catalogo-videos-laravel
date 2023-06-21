
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
import UploadPage from "../pages/uploads"
import Login from "../pages/video/Login"

export interface MyRouteProps extends RouteProps{
    name: string
    label: string
    auth?: boolean
}

const routes: MyRouteProps[] = [
    {
        name: 'login',
        label: 'Login',
        path: '/login',
        element: <Login/>,
        auth: false
    },
    {
        name: 'dashboard',
        label: 'Dashboard',
        path: '/',
        element: <Dashboard/>,
        auth: true
    },
    {
        name: 'categories.list',
        label: 'Categorias',
        path: '/categories',
        element: <CategoryList/>,
        auth: true
    },
    {
        name: 'categories.create',
        label: 'Criar categoria',
        path: '/categories/create',
        element: <CategoryForm/>,
        auth: true
    },
    {
        name: 'categories.edit',
        label: 'Editar Categoria',
        path: '/categories/:id/edit',
        element: <CategoryForm/>,
        auth: true
    },    
    {
        name: 'cast_member.list',
        label: 'Membros de elenco',
        path: '/cast-members',
        element: <CastMemberList/>,
        auth: true
    },
    {
        name: 'cast_member.create',
        label: 'Criar Membro de Elenco',
        path: '/cast-members/create',
        element: <CastMemberForm/>,
        auth: true
    },
    {
        name: 'cast_member.edit',
        label: 'Editar Membro de Elenco',
        path: '/cast-members/:id/edit',
        element: <CastMemberForm/>,
        auth: true
    },
    {
        name: 'genders.list',
        label: 'Gêneros',
        path: '/genders',
        element: <GenderList/>,
        auth: true
    },
    {
        name: 'genders.create',
        label: 'Criar Gênero',
        path: '/genders/create',
        element: <GendeForm/>,
        auth: true
    },
    {
        name: 'genders.edit',
        label: 'Editar Gênero',
        path: '/genders/:id/edit',
        element: <GendeForm/>,
        auth: true
    },
    {
        name: 'videos.list',
        label: 'Videos',
        path: '/videos',
        element: <VideoList/>,
        auth: true
    },
    {
        name: 'videos.create',
        label: 'Criar Video',
        path: '/videos/create',
        element: <VideoForm/>,
        auth: true
    },
    {
        name: 'videos.edit',
        label: 'Editar Video',
        path: '/videos/:id/edit',
        element: <VideoForm/>,
        auth: true
    },
    {
        name: 'uploads',
        label: 'Uploads',
        path: '/uploads',
        element: <UploadPage/>,
        auth: true
    }
]

export default routes