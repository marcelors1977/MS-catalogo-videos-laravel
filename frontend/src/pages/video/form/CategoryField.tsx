import { FormControl, FormControlProps, FormHelperText, makeStyles, Typography } from '@material-ui/core'
import { grey } from '@material-ui/core/colors'
import * as React from 'react'
import AsyncAutocomplete from '../../../components/AsyncAutocomplete'
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

const CategoryField: React.FC<CategoryFieldProps> = (props) => {
    const {categories, setCategories, genders,  errors, disabled} = props
    const classes = useStyles()
    const autocompleteHttp = useHttpHandled()
    const {addItem, removeItem} = useCollectionManager(categories, setCategories)
    const feachOptions = (searchText) => autocompleteHttp(
        categoryHttp
            .list( {
                queryOptions: {
                    genders: genders.map(gender => gender.id).join(','), 
                    all: ""
            }
        })
    ).then(data => data.data).catch(error => console.log(error, 'testeeee'))

    return (
        <>
            <AsyncAutocomplete 
                fetchOptions={feachOptions}
                AutocompleteProps={{
                    clearOnEscape: true,
                    freeSolo: false,
                    getOptionLabel: option => option.name,
                    isOptionEqualToValue: (option, value) => option.id === value.id,
                    onChange: (event, value) => addItem(value),
                    disabled: disabled === true || !genders.length
                }}
                TextFieldProps={{
                    label: 'Categorias',
                    error: errors !== undefined
                }}
            />
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
                                    onDelete={() => {removeItem(category)}} 
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
}

export default CategoryField