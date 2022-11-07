import { 
    Divider,
    Fade, 
    IconButton, 
    makeStyles, 
    Theme 
} from '@material-ui/core'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import ErrorIcon from '@material-ui/icons/Error'
import DeleteIcon from '@material-ui/icons/Delete'
import EditIcon from '@material-ui/icons/Edit'
import * as React from 'react'
import { FileUpload, Upload } from '../../store/upload/types'
import { useDispatch } from 'react-redux'
import { Creators } from '../../store/upload'
import { hasError, isFinished, isUploadType } from '../../store/upload/getters'
import { useDebounce } from 'use-debounce'

const useStyles = makeStyles( (theme: Theme) => ({
    successIcon: {
        color: theme.palette.success.main,
        marginLeft: theme.spacing(1)
    },
    errorIcon: {
        color: theme.palette.error.main,
        marginLeft: theme.spacing(1)
    },
    divider: {
        height: '20px',
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1)
    }
}))

interface UploadActionProps {
    uploadOrFile: Upload | FileUpload
}

const UploadAction: React.FC<UploadActionProps> = (props) => {
    const classes = useStyles()
    const {uploadOrFile} = props
    const dispatch = useDispatch()
    const [show, setShow] = React.useState(false)
    const[debounceShow] = useDebounce(show, 2000)
    const error = hasError(uploadOrFile)
    const videoId = (uploadOrFile as any).video?.id
    const activeActions = isUploadType(uploadOrFile)

    React.useEffect( () => { 
        setShow(isFinished(uploadOrFile))
    },[uploadOrFile])

    return (
        debounceShow 
        ? (
            <Fade in={show} timeout={{enter: 1000}}>
                <>
                    {
                        uploadOrFile.progress === 1 && 
                        !error &&
                        <CheckCircleIcon className={classes.successIcon}/>
                    } 
                    { error && <ErrorIcon className={classes.errorIcon}/> }
                    {
                        activeActions && (
                            <> 
                                <Divider className={classes.divider} orientation={'vertical'}/>
                                <IconButton
                                    onClick={() => dispatch(Creators.removeUpload({id: videoId}))}
                                >
                                    <DeleteIcon color={'primary'}/>
                                </IconButton>
                                <IconButton
                                    href={`/videos/${videoId}/edit`}
                                >
                                    <EditIcon color={'primary'}/>
                                </IconButton>
                            </> 
                        )

                    }
                </>
            </Fade>
        )
        : null
    )
}

export default UploadAction