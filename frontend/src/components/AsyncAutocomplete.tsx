import { CircularProgress, TextField, TextFieldProps } from '@material-ui/core'
import { Autocomplete } from '@mui/material'
import * as React from 'react'
import { useDebounce } from 'use-debounce'
import LoadingContext from './loading/LoadingContext'

interface AsyncAutocompleteProps extends React.RefAttributes<AsyncAutocompleteComponent>{
    fetchOptions: (searchText) => Promise<any>
    debounceTime?: number
    TextFieldProps?: TextFieldProps
    AutocompleteProps?: any
}

export interface AsyncAutocompleteComponent {
    clear: () => void
}

const AsyncAutocomplete = React.forwardRef<AsyncAutocompleteComponent, AsyncAutocompleteProps>((props, ref) => {
    const {AutocompleteProps, debounceTime = 300, fetchOptions} = props
    const {freeSolo, onInputChange} = AutocompleteProps
    const subscribed = React.useRef( true )
    const [open, setOpen] = React.useState(false)
    const [searchText, setSearchText] = React.useState("")
    const [debounceSearchText] = useDebounce(searchText, debounceTime)
    const loading = React.useContext(LoadingContext)
    const [options, setOptions] = React.useState([])

    const textFieldProps: TextFieldProps = {
        margin: 'normal',
        variant: 'outlined',
        fullWidth: true,
        InputLabelProps: {shrink: true},
        ...(props.TextFieldProps && {...props.TextFieldProps})
    }

    const autocompleteProps = {
        loadingText: 'Carregando',
        noOptionsText: 'Nenhum item encontrado',
        ...(props.AutocompleteProps && {...props.AutocompleteProps}),
        open,
        options,
        loading: loading,
        inputValue: searchText,
        onOpen() {
            setOpen(true)
        },
        onClose() {
            setOpen(false)
        },
        onInputChange(event, value) {
            setSearchText(value)
            onInputChange && onInputChange()
        },
        renderInput: params => (
            <TextField
                {...params}
                {...textFieldProps}
                InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                        <>
                            {loading && <CircularProgress color={"inherit"} size={20}/>}
                            {params.InputProps.endAdornment}
                        </>
                    )
                }}
            />
        )
    }

    React.useEffect( () =>{
        if (!open && !freeSolo) {
            setOptions([])
        }
    }, [open, freeSolo])

    React.useEffect( () => {
        subscribed.current = true
        if (!open || ( debounceSearchText === "" && freeSolo ) ){
            return
        }

        (async () => {
            try {
                const data = await fetchOptions(debounceSearchText)
                if (subscribed.current) {
                    setOptions(data) 
                }    
            } finally {
            }   
                           
        })()

        return () => { subscribed.current = true }
    }, [freeSolo, debounceSearchText, open, fetchOptions])

    React.useImperativeHandle( ref, () => ({
        clear: () => {
            setSearchText("")
            setOptions([])
        }
    }))

    return (
        <Autocomplete {...autocompleteProps}/>
    )
})

export default AsyncAutocomplete