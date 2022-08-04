import { MUIDataTableColumn } from "mui-datatables"
import React, { Reducer, useReducer, useState } from "react"
import reducer, { Creators } from '../store/filter'
import { Actions as FilterActions, State as FilterState } from "../store/filter/types"
import { useDebounce } from 'use-debounce'
import { useNavigate, NavigateFunction, useLocation, Location } from "react-router-dom"
import { isEqual } from "lodash"
import * as yup from '../util/vendor/yup'
// import {MuiDataTableRefComponent} from "../components/Table"

interface FilterManagerOptions {
    columns: MUIDataTableColumn[]
    rowsPerPage: number 
    rowsPerPageOptions: number[]
    debounceTime: number
    navigate: NavigateFunction
    location: Location
    // tableRef: React.MutableRefObject<MuiDataTableRefComponent>
    extraFilter?: ExtraFilter
}

interface ExtraFilter {
    getStateFromUrl: ( queryParams: URLSearchParams ) => any,
    formatSearchParams: ( debouncedState: FilterState) => any,
    createValidationSchema: () => any
}

interface UserFilterOptions extends Omit<FilterManagerOptions, 'navigate' | 'location'> {
}

export default function UseFilter(options: UserFilterOptions) {
    const navigate = useNavigate()
    const location = useLocation()
    const filterManager = new FilterManager({...options, navigate, location})
    const [totalRecords, setTotalRecords] = useState<number>(0)
    const INITIAL_STATE = filterManager.getStateFromUrl()
    const [filterState, dispatch] = useReducer<Reducer<FilterState, FilterActions>>(reducer, INITIAL_STATE)
    const [debounceFilterState] = useDebounce(filterState, options.debounceTime)
    filterManager.state = filterState
    filterManager.dispatch = dispatch
    filterManager.applyOrderInColumns()
    filterManager.debouncedState = debounceFilterState

    React.useEffect( () => {
        filterManager.replaceHistory()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])

    return {
        columns: filterManager.columns,
        filterManager,
        filterState,
        debounceFilterState,
        dispatch,
        totalRecords,
        setTotalRecords
    }
}

export class FilterManager {
    schema
    state: FilterState = null as any
    debouncedState: FilterState = null as any
    dispatch: React.Dispatch<FilterActions> = null as any
    columns: MUIDataTableColumn[]
    rowsPerPage: number 
    rowsPerPageOptions: number[]
    navigate: NavigateFunction
    location: Location
    extraFilter?: ExtraFilter

    constructor(options: FilterManagerOptions) {
        const { columns, rowsPerPage, rowsPerPageOptions, navigate, location, extraFilter} = options
        this.columns = columns
        this.rowsPerPage = rowsPerPage
        this.rowsPerPageOptions = rowsPerPageOptions
        this.navigate = navigate
        this.location = location
        this.extraFilter = extraFilter
        this.createValidationSchema()
    }

    changeSearch(value) {
        this.dispatch(Creators.setSearch({search: value as any}))
    } 
    
    changePage(page) {
        this.dispatch(Creators.setPage({page: page + 1}))
    }

    changeRowsPerPage(perPage) {
        this.dispatch(Creators.setPerPage({ per_page: perPage}))
    }

    changeColumnSort(changeColumn: string, direction: string) {
        this.dispatch( Creators.setOrder({
            sort: changeColumn,
            dir: direction.includes('desc') ? 'desc' : 'asc'
        }))
    }

    changeExtraFilter(data) {
        this.dispatch(Creators.updateExtraFilter(data))
    }

    resetFilter() {
        this.dispatch(Creators.resetExtraFilter())
    }

    applyOrderInColumns() {

        this.columns = this.columns.map( column => {
            return column.name === this.state.order.sort
            ? {
                ...column,
                options: {
                    ...column.options,
                    sortOrder: this.state.order.dir as any
                }
            } : column
        })
    }

    cleanSearchText(text) {
        let newText = text
        if (text && text.value !== undefined) {
            newText = text.value
        }
        return newText
    }

    replaceHistory() {
        const historyUrl = '?' + new URLSearchParams(this.formatSearchParams() as any)
            this.navigate(
            historyUrl, 
            {
                replace: true,
                state: this.state,
            })
    }

    pushHistory() {
        const historyUrl = '?' + new URLSearchParams(this.formatSearchParams() as any)

        this.navigate(
            historyUrl, 
            {
                state: { 
                    ...this.state,
                    search: this.cleanSearchText(this.state.search)
                }
            }
        )
        
        const oldState = this.location.state
        const nextState = this.state

        if(isEqual(oldState, nextState)){
            return
        }
    }

    getStateFromUrl() {
       const queryParams = new URLSearchParams(this.location.search.substring(1))
       return this.schema.cast( {
        search: queryParams.get('search'),
        pagination: {
            page: queryParams.get('page'),
            per_page: queryParams.get('per_page')
        },
        order: {
            sort: queryParams.get('sort'),
            dir: queryParams.get('dir'),
        },
        ...(
            this.extraFilter && {
                extraFilter: this.extraFilter.getStateFromUrl(queryParams)
            }
        )
       })
    }

    private formatSearchParams() {
        const search = this.cleanSearchText(this.state.search)
        return {
            ...(search && search !== '' && {search: search}),
            ...(this.state.pagination.page !== 1 && {page: this.state.pagination.page}),
            ...(this.state.pagination.per_page !== 15 && {per_page: this.state.pagination.per_page}),
            ...(
                this.state.order.sort && {
                    sort: this.state.order.sort,
                    dir: this.state.order.dir
                }
            ),
            ...(
                this.extraFilter && this.extraFilter.formatSearchParams(this.debouncedState)
            )

        }
    }

    private createValidationSchema() {
        this.schema = yup.object().shape( {
            search: yup.string()
                .transform( value => !value ? undefined : value )
                .default( '' ),
            pagination: yup.object().shape( {
                page: yup.number()
                    .transform( value => isNaN(value) || parseInt(value) < 1 ? undefined : value)
                    .default(1),
                per_page: yup.number()
                    .oneOf(this.rowsPerPageOptions)
                    .transform( value => isNaN(value) ? undefined : value)
                    .default(this.rowsPerPage)
            }),
            order: yup.object().shape( {
                sort: yup.string()
                    .nullable()
                    .transform( value => {
                        const columnsName = this.columns
                            .filter(column => !column.options || column.options.sort !== false)
                            .map(column => column.name)
                        return columnsName.includes(value) ? value: undefined
                    })
                    .default( null ),
                dir: yup.string()
                    .nullable()
                    .transform( value => !value || !['asc','desc'].includes(value.toLowerCase()) ? undefined : value)
                    .default( null )
            }),
            ...(
                this.extraFilter && {
                    extraFilter: this.extraFilter.createValidationSchema()
                }
            )
        })
    }

}