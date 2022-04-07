// @flow 
import { AppBar, Toolbar, Button, Theme, Typography, makeStyles } from '@material-ui/core'
import * as React from 'react'
import logo from "../../static/logo.png"
import { Menu } from './Menu';

//xs, sm, md, lg e xl
const useStyles = makeStyles( (theme: Theme) => ({
    tollbar: {
        backgroundColor: '#000000'
    },
    title: {
        flexGrow: 1,
        textAlign: 'center'
    },
    logo: {
        width: 100,
        [theme.breakpoints.up('sm')]: {
            width: 170
        }
    }
}))

export const Navbar: React.FC = () => {
    const classes = useStyles();
    return (
        <AppBar>
            <Toolbar className={classes.tollbar}>
                <Menu/>
                <Typography className={classes.title}>
                    <img src={logo} alt="Codeflix" className={classes.logo}/>
                </Typography>
                <Button color="inherit">Login</Button>
            </Toolbar>
        </AppBar>
    );
};
