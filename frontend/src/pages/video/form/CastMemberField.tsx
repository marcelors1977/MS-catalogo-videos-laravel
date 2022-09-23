import { FormControl, FormControlProps, FormHelperText, Typography } from '@material-ui/core'
import * as React from 'react'
import AsyncAutocomplete from '../../../components/AsyncAutocomplete'
import { GridSelected } from '../../../components/GridSelected'
import GridSelectedItem from '../../../components/GridSelectedItem'
import useCollectionManager from '../../../hooks/useCollectionManager'
import useHttpHandled from '../../../hooks/useHttpHandled'
import castMemberHttp from '../../../util/http/cast-member-http'

interface CastMemberFieldProps {
    cast_members: any[],
    setCastMembers: (cast_members) => void,
    errors: any,
    disabled?: boolean,
    FormControlProps?: FormControlProps
}

const CastMemberField: React.FC<CastMemberFieldProps> = (props) => {
    const {
        cast_members, 
        setCastMembers, 
        errors, 
        disabled
    } = props
    const autocompleteHttp = useHttpHandled()
    const {addItem, removeItem} = useCollectionManager(cast_members, setCastMembers)
    function feachOptions (searchText){
        return autocompleteHttp(
            castMemberHttp
                .list( {
                    queryOptions: {
                        search: searchText, all: ""
                }
            })
        ).then(data => data.data)
    }

    return (
        <>
            <AsyncAutocomplete 
                fetchOptions={feachOptions}
                AutocompleteProps={{
                    clearOnEscape: true,
                    freeSolo: true,
                    getOptionLabel: option => option.name,
                    isOptionEqualToValue: (option, value) => option.id === value.id,
                    onChange: (event, value) => addItem(value)
                }}
                TextFieldProps={{
                    label: 'Elenco',
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
                        cast_members.map( (cast_member) => (
                            <GridSelectedItem
                                onDelete={() => {
                                    removeItem(cast_member)}} 
                                    xs={12}
                            >
                                <Typography noWrap={true}>
                                    {cast_member.name}
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
}

export default CastMemberField