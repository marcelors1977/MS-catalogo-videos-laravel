import { 
    Box, 
    Button, 
    FormControl, 
    FormControlLabel, 
    FormLabel,
    makeStyles, 
    Radio, 
    RadioGroup, 
    TextField, 
    Theme 
} from '@material-ui/core'
import { ButtonProps } from '@material-ui/core/Button'
import { useForm } from "react-hook-form"
import * as React from 'react'
import castMemberHttp from '../../util/http/cast-member-http'

const CastMemberTypeMap = {
    'director': '1',
    'actor': '2'
}

const useStyles = makeStyles( (theme: Theme) => {
    return {
        formControl: {
            margin: theme.spacing(4),
          },
        submit: {
            margin: theme.spacing(1)
        }
    }
})

export const Form = () => {

    const classes = useStyles()

    const buttonProps: ButtonProps = {
        className: classes.submit,
        variant: 'outlined'
    }

    const [value, setValue] = React.useState(CastMemberTypeMap["actor"])

    const {register, handleSubmit, getValues} = useForm()

    function onSubmit(formData) {
        castMemberHttp
            .create(formData)
            .then( (response) => console.log(response))
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue((event.target as HTMLInputElement).value)
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
                {...register("name")}
                label= "Nome"
                fullWidth
                variant='outlined'
            />
            <FormControl className={classes.formControl}>
                <FormLabel>Tipo</FormLabel>
                <RadioGroup value={value} onChange={handleChange}>
                    <FormControlLabel value={CastMemberTypeMap["actor"]} {...register("type")} control={<Radio />} label="Ator" />
                    <FormControlLabel value={CastMemberTypeMap["director"]}  {...register("type")} control={<Radio />} label="Diretor" />
                </RadioGroup>
            </FormControl>
            <Box dir='rtl'>
                <Button {...buttonProps} onClick={() => onSubmit(getValues())} >Salvar</Button>
                <Button {...buttonProps} type="submit">Salvar e continuar editando</Button>
            </Box>
        </form>
    )
}