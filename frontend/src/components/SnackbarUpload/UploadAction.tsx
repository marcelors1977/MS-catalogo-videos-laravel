import { 
    Fade, 
    IconButton, 
    ListItemSecondaryAction, 
    makeStyles, 
    Theme 
} from '@material-ui/core'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import ErrorIcon from '@material-ui/icons/Error'
import DeleteIcon from '@material-ui/icons/Delete'
import * as React from 'react'
import { Upload } from '../../store/upload/types'
import { useDispatch } from 'react-redux'
import { Creators } from '../../store/upload'
import { hasError, isFinished } from '../../store/upload/getters'
import { useDebounce } from 'use-debounce'

const useStyles = makeStyles( (theme: Theme) => ({
    successIcon: {
        color: theme.palette.success.main
    },
    errorIcon: {
        color: theme.palette.error.main
    },
    deleteIcon: {
        color: theme.palette.primary.main
    }
}))

interface UploadActionProps {
    upload: Upload
    hover: boolean
}

const UploadAction: React.FC<UploadActionProps> = (props) => {
    const { upload, hover } = props
    const classes = useStyles()
    const dispatch = useDispatch()
    const [show, setShow] = React.useState(false)
    const[debounceShow] = useDebounce(show, 2000)
    const error = hasError(upload)

    React.useEffect( () => {
        setShow(isFinished(upload))
    },[upload])

    return (
        debounceShow
        ? (
            <Fade in={show} timeout={{enter: 1000}}>
                <ListItemSecondaryAction>
                    <span hidden={hover}>
                        {
                            upload.progress === 1 && !error && (
                                <IconButton className={classes.successIcon} edge={"end"} >
                                    <CheckCircleIcon/>
                                </IconButton>
                            )
                        }
                        {
                            error && (
                                <IconButton className={classes.errorIcon} edge={"end"} >
                                    <ErrorIcon/>
                                </IconButton>
                            )
                        }
                    </span>
                    <span hidden={!hover}>
                        <IconButton 
                            color='primary'
                            edge={"end"} 
                            onClick={() => dispatch(Creators.removeUpload({ id: upload.video.id }))}
                        >
                            <DeleteIcon/>
                        </IconButton>
                    </span>
                </ListItemSecondaryAction>
            </Fade>
        )
        : null

    )
}

export default UploadAction