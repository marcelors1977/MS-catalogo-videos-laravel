import { FormControl, FormControlProps, FormHelperText, Typography, useTheme } from '@material-ui/core'
import * as React from 'react'
import AsyncAutocomplete, { AsyncAutocompleteComponent } from '../../../components/AsyncAutocomplete'
import { GridSelected } from '../../../components/GridSelected'
import GridSelectedItem from '../../../components/GridSelectedItem'
import useCollectionManager from '../../../hooks/useCollectionManager'
import useHttpHandled from '../../../hooks/useHttpHandled'
import genderHttp from '../../../util/http/gender-http'
import { getGendersFromCategory } from '../../../util/model-filters'

interface GenderFieldProps {
    genders: any[],
    setGenders: (genders) => void,
    categories: any[],
    setCategories: (categories) => void,
    errors: any,
    disabled?: boolean,
    FormControlProps?: FormControlProps
}

export interface GenderFieldComponent {
    clear: () => void
}

const GenderField = React.forwardRef<GenderFieldComponent, GenderFieldProps>((props, ref) => {
    const {
        genders, 
        setGenders, 
        categories,
        setCategories,
        errors, 
        disabled
    } = props
    const autocompleteHttp = useHttpHandled()
    const {addItem, removeItem} = useCollectionManager(genders, setGenders)
    const {removeItem: removeCategory} = useCollectionManager(categories, setCategories)
    const autocompleteRef = React.useRef() as React.MutableRefObject<AsyncAutocompleteComponent>
    const theme = useTheme()
       
    const feachOptions = React.useCallback((searchText) => {
        return autocompleteHttp(
            genderHttp
                .list( {
                    queryOptions: {
                        search: searchText, all: ""
                }
            })
        ).then(data => data.data)
    }, [autocompleteHttp]) 

    React.useImperativeHandle(ref, () => ({
        clear: () => autocompleteRef.current.clear()
    }))

    return (
        <>
            <AsyncAutocomplete 
                ref={autocompleteRef}
                fetchOptions={feachOptions}
                AutocompleteProps={{
                    clearOnEscape: true,
                    freeSolo: true,
                    getOptionLabel: option => option.name,
                    isOptionEqualToValue: (option, value) => option.id === value.id,
                    onChange: (event, value) => addItem(value)
                }}
                TextFieldProps={{
                    label: 'Gêneros',
                    error: errors !== undefined
                }}
            />
            <FormHelperText style={{height: theme.spacing(3)}}>
                Escolha os gêneros do vídeo
            </FormHelperText>
            <FormControl
                fullWidth
                margin='normal'
                error={errors !== undefined }
                disabled={disabled === true}
                {...props.FormControlProps}
            > 
                <GridSelected>
                    {
                        genders.map( (gender, key) => (
                            <GridSelectedItem
                                key={key}
                                onDelete={() => {
                                    const categoryWithGenders = categories
                                        .filter(category => {
                                            const gendersFromCategory = getGendersFromCategory(genders, category)
                                            return gendersFromCategory.length === 1 && genders[0].id === gender.id
                                        }) 
                                    categoryWithGenders.forEach(cat => removeCategory(cat))
                                    removeItem(gender)}} 
                                    xs={12}
                            >
                                <Typography noWrap={true}>
                                    {gender.name}
                                </Typography> 
                            </GridSelectedItem>                        
                        ))
                    }
                </GridSelected>
                {
                    errors && <FormHelperText>{errors.message}</FormHelperText>
                }
            </FormControl>
        </>
    )
})

export default GenderField