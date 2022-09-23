import * as React from 'react'
import { useParams } from 'react-router'
import { Page } from '../../components/Page'
import { Form } from '../video/form/index'

const PageForm = () => {
    const {id} = useParams();
    return (
        <Page title={!id ? 'Criar video' : 'Editar video'}>
            <Form/>
        </Page>
    )
}

export default PageForm