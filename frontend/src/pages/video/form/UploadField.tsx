
import {
    Button,
    FormControl,
    FormControlProps,
} from '@material-ui/core'
import * as React from 'react'
import InputFile, { InputFileComponent } from '../../../components/InputFile'
import CloudUploadIcon from '@material-ui/icons/CloudUpload'

interface UploadFieldProps {
    accept: string,
    label: string,
    setValue: (value) => void
    disabled?: boolean
    errors?: any
    FormControlProps?: FormControlProps
} 

const UploadField: React.FC<UploadFieldProps> = (props) => {
    const fileRef = React.useRef() as React.MutableRefObject<InputFileComponent>
    const {accept, label, setValue, disabled, errors} = props
    const [errType, setErrType] = React.useState<boolean>(true)

    return (
        <FormControl 
            margin='normal'
            error={errors !== undefined && errType}
            disabled={disabled === true}
            fullWidth
            {...props.FormControlProps}
        >
            <InputFile
                ref={fileRef}
                TextFieldProps={{
                    label: label,
                    InputLabelProps: {shrink: true},
                    style: {backgroundColor: '#ffffff'}
                }}
                InputFileProps={{
                    accept,
                    onChange( event ) {
                        const files = event.target.files as any
                        files.length && setValue(files[0])
                        setErrType(false)
                    }
                }}
                ButtonFile={
                    <Button
                        endIcon={<CloudUploadIcon/>}
                        variant={"contained"}
                        color={"primary"}
                        onClick={ () => fileRef.current.openWindow()}
                    >
                        Adicionar
                    </Button>
                }
            />
        </FormControl>
    )
}

export default UploadField