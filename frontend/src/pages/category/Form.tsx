import * as React from 'react'
import { Box, Button, Checkbox, makeStyles, TextField, Theme } from '@material-ui/core'
import { ButtonProps } from '@material-ui/core/Button'
import { useForm } from "react-hook-form"
import categoryHttp from '../../util/http/category-http'

const useStyles = makeStyles( (theme: Theme) => {
    return {
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

    const {register, handleSubmit, getValues} = useForm({
        defaultValues: {
            name: null,
            description: null,
            is_active: true
        }
    })

    function onSubmit(formData) {
        categoryHttp
            .create(formData)
            .then( (response) => console.log(response))
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
                {...register("name")}
                label="Nome"
                fullWidth
                variant='outlined'
            />
            <TextField
                {...register("description")}
                label="Descrição"
                multiline
                maxRows={4}
                fullWidth
                variant='outlined'
                margin='normal'
            />
            <Checkbox
                {...register("is_active")}
                defaultChecked
            />
            Ativo?
            <Box dir='rtl'>
                <Button {...buttonProps} onClick={() => onSubmit(getValues())} >Salvar</Button>
                <Button {...buttonProps} type="submit">Salvar e continuar editando</Button>
            </Box>

        </form>
    )
}