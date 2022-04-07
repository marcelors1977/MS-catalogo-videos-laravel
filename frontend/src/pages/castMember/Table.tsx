import MUIDataTable, { MUIDataTableColumn } from 'mui-datatables'
import * as React from 'react'
import { httpVideo } from '../../util/http'
import format from 'date-fns/format'
import parseISO from 'date-fns/parseISO'

enum TipoMember {
    'Diretor' = 1,
    'Ator',
  }

const columnsDefinition: MUIDataTableColumn[] = [
    {
        name: "name",
        label: "Nome"
    },
    {
        name: "type",
        label: "Tipo",
        options: {
            customBodyRender(value) {
              return TipoMember[value]
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
        httpVideo.get( 'cast_members').then(
            response => setData(response.data.data)
        )
    }, [])

    return (
            <MUIDataTable 
                title="Listagem de membros do elenco"
                columns={columnsDefinition}
                data={data}
            />
    )
}

export default Table