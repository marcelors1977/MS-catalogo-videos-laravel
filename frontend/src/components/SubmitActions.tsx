import * as React from 'react'
import { Box, Button, makeStyles, Theme } from '@material-ui/core'
import { ButtonProps } from '@material-ui/core/Button'

const useStyles = makeStyles( (theme: Theme) => {
    return {
        submit: {
            margin: theme.spacing(1),
        }
    }
})

interface SubnitActionsProps{
    disableButtons?: boolean
    handleSave: () => void
}

const SubmitActions: React.FC<SubnitActionsProps> = (props) => {
    const classes = useStyles()

    const buttonProps: ButtonProps = {
        className: classes.submit,
        color: 'secondary',
        variant: 'contained',
        disabled: props.disableButtons === undefined ? false : props.disableButtons
    }

    return (
        <Box dir='rtl'>
        <Button color='primary' {...buttonProps} onClick={props.handleSave}>
            Salvar
        </Button>
        <Button {...buttonProps} type="submit">Salvar e continuar editando</Button>
    </Box>
    )
}

export default SubmitActions