import { FormControl, FormControlProps, FormHelperText, makeStyles, Typography, useTheme } from '@material-ui/core'
import { grey } from '@material-ui/core/colors'
import * as React from 'react'
import AsyncAutocomplete, { AsyncAutocompleteComponent } from '../../../components/AsyncAutocomplete'
import { GridSelected } from '../../../components/GridSelected'
import GridSelectedItem from '../../../components/GridSelectedItem'
import useCollectionManager from '../../../hooks/useCollectionManager'
import useHttpHandled from '../../../hooks/useHttpHandled'
import categoryHttp from '../../../util/http/category-http'
import { getGendersFromCategory } from '../../../util/model-filters'
import { Gender } from '../../../util/models'

const useStyles = makeStyles(() => ({
    gendersSubtitle: {
        color: grey["800"],
        fontSize: "0.8rem"
    }
}))

interface CategoryFieldProps {
    categories: any[],
    setCategories: (categories) => void,
    genders: Gender[],
    errors: any,
    disabled?: boolean,
    FormControlProps?: FormControlProps
}

export interface CategoryFieldComponent {
    clear: () => void
}

const CategoryField = React.forwardRef<CategoryFieldComponent, CategoryFieldProps>((props, ref) => {
    const {categories, setCategories, genders,  errors, disabled} = props
    const classes = useStyles()
    const autocompleteHttp = useHttpHandled()
    const {addItem, removeItem} = useCollectionManager(categories, setCategories)
    const autocompleteRef = React.useRef() as React.MutableRefObject<AsyncAutocompleteComponent> 
    const theme = useTheme()

    const feachOptions = (searchText) => autocompleteHttp(
        categoryHttp
            .list( {
                queryOptions: {
                    genders: genders.map(gender => gender.id).join(','), 
                    all: ""
            }
        })
    ).then(data => data.data)

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
                    freeSolo: false,
                    getOptionLabel: option => option.name,
                    isOptionEqualToValue: (option, value) => option.id === value.id,
                    onChange: (event, value) => {addItem(value)},
                    disabled: !genders.length // avaliar esta lógica
                }}
                TextFieldProps={{
                    label: 'Categorias',
                    error: errors !== undefined
                }}
            />
            <FormHelperText style={{height: theme.spacing(3) }}>
                Escolha pelo menos uma categoria de cada gênero
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
                        categories.map( (category, key) => {
                            const gendersFromCategory = getGendersFromCategory(genders, category)
                                .map(gender => gender.name)
                                .join(',')
                            return (
                                <GridSelectedItem 
                                    key={key}
                                    onDelete={() => removeItem(category)} 
                                    xs={12}
                                >
                                    <Typography noWrap={true}>
                                        {category.name}
                                    </Typography> 
                                    <Typography noWrap={true} className={classes.gendersSubtitle}>
                                        Gêneros: {gendersFromCategory}
                                    </Typography> 
                                </GridSelectedItem>                        
                            )
                        })
                    }
                </GridSelected>
                {
                    errors && <FormHelperText>{errors.message}</FormHelperText>
                }
            </FormControl>
        </>
    )
})

export default CategoryField