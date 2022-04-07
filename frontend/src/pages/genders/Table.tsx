import { Chip } from '@material-ui/core'
import MUIDataTable, { MUIDataTableColumn } from 'mui-datatables'
import * as React from 'react'
import { httpVideo } from '../../util/http'
import format from 'date-fns/format'
import parseISO from 'date-fns/parseISO'

const columnsDefinition: MUIDataTableColumn[] = [
    {
        name: "name",
        label: "Nome"
    },
    {
        name: "categories",
        label: "Categorias",
        options: {
            customBodyRender(value) {
              return  value.map( (category: any) => { return category.name  }).join(' , ') 
            } 
        }
    },
    {
        name: "is_active",
        label: "Ativo?",
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return value ? <Chip label="Sim" color="primary"/> : <Chip label="Não" color="secondary"/>
            }
        }
    },
    {
        name: "created_at",
        label: "Criado em",
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return <span>{format(parseISO(value), 'dd/MM/yyyy')}</span>
            }
        }
    }
]


type Props = {}

const Table = (props: Props) => {

    const [data, setData] = React.useState([])
    React.useEffect( () => {
        httpVideo.get( 'genders').then(
            response => setData(response.data.data)
        )
    }, [])

    return (
            <MUIDataTable 
                title="Listagem de gêneros"
                columns={columnsDefinition}
                data={data}
            />
    )
}

export default Table