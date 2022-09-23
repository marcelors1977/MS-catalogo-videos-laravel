
import {
    Box,
    FormControl,
    FormControlLabel,
    FormControlProps,
    FormHelperText,
    FormLabel,
    Radio,
    RadioGroup
} from '@material-ui/core'
import * as React from 'react'
import Rating from '../../../components/Rating'
import {  FormControlLabelProps } from "@material-ui/core/FormControlLabel"

interface RatingFieldProps {
    value: string
    setValue: (value) => void
    disabled?: boolean
    errors: any
    FormControlProps?: FormControlProps
} 

const ratings: FormControlLabelProps[] = [
    {value: 'L', control : <Radio color={"primary"}/>, label: <Rating rating={"L"}/>, labelPlacement: 'top'},
    {value: '10', control : <Radio color={"primary"}/>, label: <Rating rating={"10"}/>, labelPlacement: 'top'},
    {value: '12', control : <Radio color={"primary"}/>, label: <Rating rating={"12"}/>, labelPlacement: 'top'},
    {value: '14', control : <Radio color={"primary"}/>, label: <Rating rating={"14"}/>, labelPlacement: 'top'},
    {value: '16', control : <Radio color={"primary"}/>, label: <Rating rating={"16"}/>, labelPlacement: 'top'},
    {value: '18', control : <Radio color={"primary"}/>, label: <Rating rating={"18"}/>, labelPlacement: 'top'}
]

export const RatingField: React.FC<RatingFieldProps> = (props) => {
    const {value, setValue, disabled, errors} = props
    const [errType, setErrType] = React.useState<boolean>(true)

    return (
        <FormControl 
                // className={classes.formControl} 
                margin='normal'
                error={errors !== undefined && errType}
                disabled={disabled === true}
                {...props.FormControlProps}
            > 
                <FormLabel component={'legend'}>Classificação</FormLabel>
                <Box padding={1}>
                    <RadioGroup
                        name="rating"
                        onChange={(e) => {
                            setValue(e.target.value)
                            setErrType(false)
                        }}
                        value={value}
                        row
                    >
                        {
                            ratings.map(
                                (props, key ) => <FormControlLabel key={key} {...props}/>
                            )
                        }
                    </RadioGroup>
                </Box>
                <FormHelperText >
                    {errors !== undefined && errType && errors.message}
                </FormHelperText>
        </FormControl>
    )
}

