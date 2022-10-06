import * as React from 'react'
import format from 'date-fns/format'
import parseISO from 'date-fns/parseISO'
import { BadgeNo, BadgeYes } from '../../components/Badge'
import { Category, Gender, ListResponse } from '../../util/models'
import genderHttp from '../../util/http/gender-http'
import DefaultTable, { makeActionStyles, TableColumn } from '../../components/Table'
import { useSnackbar } from 'notistack'
import { IconButton, MuiThemeProvider } from '@material-ui/core'
import { Edit } from '@material-ui/icons'
import { Link } from 'react-router-dom'
import { MUIDataTableMeta } from 'mui-datatables'
import UseFilter from '../../hooks/useFilter'
import * as yup from '../../util/vendor/yup'
import  { Creators } from '../../store/filter'
import { FilterResetButton } from '../../components/Table/FilterResetButton'
import categoryHttp from '../../util/http/category-http'
import LoadingContext from '../../components/loading/LoadingContext'

const columnsDefinition: TableColumn[] = [
    {
        name: 'id',
        label: 'ID',
        width: '30%',
        options: {
            sort: false,
            filter: false
        }
    },
    {
        name: "name",
        label: "Nome",
        width: "20%",
        options: {
            filter: false
        }
    },
    {
        name: "categories",
        label: "Categorias",
        width: "23%",
        options: {
            sort: false,
            filterType: 'multiselect',
            filterOptions: {
                names: []
            },
            customBodyRender(value) {
            return  value.map( (value: any) => value.name ).join(', ') 
            } 
        }
    },
    {
        name: "is_active",
        label: "Ativo?",
        width: "4%",
        options: {
            filter: false,
            customBodyRender(value, tableMeta, updateValue) {
                return value ? <BadgeYes/> : <BadgeNo/> 
            }
        }
    },
    {
        name: "created_at",
        label: "Criado em",
        width: "13%",
        options: {
            filter: false,
            customBodyRender(value, tableMeta, updateValue) {
                return <span>{format(parseISO(value), 'dd/MM/yyyy')}</span>
            }
        }
    },
    {
        name: "actions",
        label: "Ações",
        width: "10%",
        options: {
            sort: false,
            filter: false,
            customBodyRender: (value, tableMeta: MUIDataTableMeta) => {
                return (
                    <IconButton
                        color={'secondary'}
                        component={Link}
                        to={`/genders/${tableMeta.rowData[0]}/edit`}
                    >
                        <Edit fontSize={'inherit'}/>
                    </IconButton>

                )
            }
        }
    }
]

type Props = {}

const debounceTime = 200
const debounceSearchTime = 200
const rowsPerPage = 15
const rowsPerPageOptions = [15, 25, 50]

const Table = (props: Props) => {

    const snackbar = useSnackbar()
    const subscribed = React.useRef( true )
    const [data, setData] = React.useState<Gender[]>([])
    const [, setCategories] = React.useState<Category[]>()
    const loading = React.useContext(LoadingContext)
    const { 
        columns,
        filterManager,
        filterState,
        debounceFilterState,
        dispatch,
        totalRecords,
        setTotalRecords
    } = UseFilter({
        columns: columnsDefinition,
        debounceTime: debounceTime,
        rowsPerPage: rowsPerPage,
        rowsPerPageOptions: rowsPerPageOptions,
        extraFilter: {
            createValidationSchema: () => {
                return yup.object().shape( {
                    categories: yup.mixed()
                        .nullable()
                        .transform( value => {
                            return !value || value === '' ? undefined : value.split(',')
                        })
                        .default(null)
                })
            },
            formatSearchParams:  ( debouncedState ) => {
                return debouncedState.extraFilter ? {
                    ...(
                        debouncedState.extraFilter.categories &&
                        {categories: debouncedState.extraFilter.categories.join(',')}
                    )
                }: undefined
            },
            getStateFromUrl: (queryParams) => {
                return {
                    categories: queryParams.get('categories')
                }
            }
        }
    })

    const cleanFunSearch = filterManager.cleanSearchText(debounceFilterState.search);
    const cleanFunExtraFiltr = JSON.stringify(debounceFilterState.extraFilter)

    const indexColumnCategories = columns.findIndex(c => c.name === 'categories');
    const columnsCategories = columns[indexColumnCategories];
    const categoriesFilterValue = filterState.extraFilter && filterState.extraFilter.categories;
    (columnsCategories.options as any).filterList = categoriesFilterValue ? categoriesFilterValue : [];

    React.useEffect ( () => {
        let isSubscribed = true;
        (async () => {
            try {
                const {data} = await categoryHttp.list( { queryOptions : {all: ''}})
                if (isSubscribed) {
                    setCategories(data.data);
                    (columnsCategories.options as any).filterOptions.names = data.data.map(category => category.name)  
                }  
            } catch (error) {
                console.log(error)
                snackbar.enqueueSnackbar(
                    'Não foi possível carregar as informações',
                    {variant: 'error'}
                )
            }
        })()
        return () => { isSubscribed = false }
    }, [
        columnsCategories.options,
        snackbar
    ])

    React.useEffect ( () => {
        subscribed.current = true;
        filterManager.pushHistory()
        getData()
        return () => {
            subscribed.current = true;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        cleanFunSearch,
        debounceFilterState.pagination.page,
        debounceFilterState.pagination.per_page,
        debounceFilterState.order,
        cleanFunExtraFiltr
    ])

    async function getData() {
        try {
            const {data} = await genderHttp.list<ListResponse<Gender>>({
                queryOptions: {
                    search: filterManager.cleanSearchText(filterState.search),
                    page: filterState.pagination.page,
                    per_page: filterState.pagination.per_page,
                    sort: filterState.order.sort,
                    dir: filterState.order.dir,
                    ...(
                        debounceFilterState.extraFilter &&
                        debounceFilterState.extraFilter.categories  &&
                        {categories: debounceFilterState.extraFilter.categories.join(',') }
                    )
                }
            })

            if (subscribed.current) {
                setData(data.data)    
                setTotalRecords(data.meta.total)   
            }               
        } catch (error) {
            console.error(error)
            if (genderHttp.isCancelledRequest(error)) {
                return
            }
            snackbar.enqueueSnackbar(
                'Não foi possível carregar as informações',
                {variant: 'error'}
            )
        } 
    }

    return (
        <MuiThemeProvider theme={makeActionStyles(columnsDefinition.length - 1)}>
            <DefaultTable 
                title="Listagem de gêneros"
                columns={columns}
                data={data}
                loading={loading}
                debouncedSearchTime={debounceSearchTime}
                options= {{
                    serverSide: true,
                    searchText: filterState.search as any,
                    page: filterState.pagination.page - 1,
                    rowsPerPage: filterState.pagination.per_page,
                    rowsPerPageOptions,
                    count: totalRecords,
                    onFilterChange: ( column, filterList, type ) => {
                        const columnIndex = columns.findIndex( c => c.name === column )

                        if (type === 'reset' ){
                            filterManager.resetFilter()
                        } else {
                            filterManager.changeExtraFilter({
                                [column as any] : filterList[columnIndex].length  ? filterList[columnIndex] : null
                            })
                        }
                    },
                    customToolbar:  () => (
                        <FilterResetButton 
                            handleClick={ () => dispatch( Creators.setReset())
                                }
                        />                        
                    ),
                    onSearchChange: (searchText) => filterManager.changeSearch(searchText),
                    onChangePage: (page) => filterManager.changePage(page),
                    onChangeRowsPerPage: (perPage) => filterManager.changeRowsPerPage(perPage),
                    onColumnSortChange: (changeColumn: string, direction: string) => 
                        filterManager.changeColumnSort(changeColumn, direction)
                }}
            />
        </MuiThemeProvider>

    )
}

export default Table