import { Box, Container, Theme, Typography, createStyles, makeStyles } from "@material-ui/core";
import { ExitToApp as ExitToAppIcon } from "@material-ui/icons";
import React from "react";
import { Link } from "react-router-dom";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        paragraph: {
            display: 'flex',
            margin: theme.spacing(2),
            alignItems: 'center'
        }
    })
)

export const NotAuthorized: React.FC = (props) => {
    const classes = useStyles();

    return (
        <Container>
            <Typography variant="h4" component={"h1"}>
                403 - Acesso não autorizado
            </Typography>

            <Box className={classes.paragraph}>
                <ExitToAppIcon/>
                <Typography>
                    Acesse o Codeflix pelo <Link to={'/'}>endereço</Link>
                </Typography>
            </Box>
        </Container>
    )
}