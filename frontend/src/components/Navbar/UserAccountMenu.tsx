
import * as React from 'react';
import { IconButton, Menu as MuiMenu, MenuItem, Divider, Link } from '@material-ui/core'
import MenuIcon from '@material-ui/icons/AccountBox'
import { useHasRealmRole, useHasClient} from '../../hooks/useHasRole';
import { keycloakLinks } from '../../util/auth';

const UserAccountMenu = () => {
    const [anchorEl, setAnchorEl] = React.useState(null)
    const handleOpen = (event: any) => setAnchorEl(event.currentTarget)
    const handleClose = () => setAnchorEl(null)
    const open = Boolean(anchorEl)
    const hasCatalogAdmin = useHasRealmRole('catalog-admin')
    const hasAdminRealm = useHasClient('realm-management')

    if (!hasCatalogAdmin) {
        return null
    }

    return (
        <React.Fragment>
            <IconButton
                edge="end"
                color="inherit"
                aria-label="open drawer"
                aria-controls="menu-user-account"
                aria-haspopup="true"
                onClick={handleOpen}
            >
                <MenuIcon/>
            </IconButton>
            <MuiMenu
                id="menu-user-account"
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
                transformOrigin={{vertical: 'top', horizontal: 'center'}}
                getContentAnchorEl={null}
            >
                <MenuItem disabled={true}>Full Cycle</MenuItem>
                <Divider/>
                {hasAdminRealm && (<MenuItem 
                    component={Link} 
                    href={keycloakLinks.adminConsole}
                    target='_blank'
                    rel='noopener'
                    onClick={handleClose}
                >
                    Admin Users
                </MenuItem>
                )}
                <MenuItem 
                    component={Link} 
                    href={keycloakLinks.accountConsole}
                    target='_blank'
                    rel='noopener'
                    onClick={handleClose}
                >
                    Minha Conta
                </MenuItem>
                <MenuItem>Logout</MenuItem>
            </MuiMenu>
        </React.Fragment>
    )
}

export default  UserAccountMenu
