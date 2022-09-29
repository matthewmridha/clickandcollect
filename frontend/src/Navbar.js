import * as React from 'react';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import PersonAdd from '@mui/icons-material/PersonAdd';
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';
import Login from '@mui/icons-material/Login';
import Link from '@mui/material/Link';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';

import logo from './decathlonc&clogo.png'

import {ThemeContext, FunctionContext, StateContext} from './App'


export default function Navigation(){
    const stateContext = React.useContext(StateContext);
    const functionContext = React.useContext(FunctionContext);
    const theme = React.useContext(ThemeContext);
    const [user, setUser] = React.useState(null)
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    React.useEffect(()=>{
        setUser(stateContext.data.user)
    },[stateContext.data.user])
    return (
        <React.Fragment>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'center' }}>
            <Box sx={{minWidth: 100}}><img src={logo} style={{ height : '50px'}}/></Box>
            
            <Tooltip title="Account settings">
            <IconButton
                onClick={handleClick}
                size="small"
                sx={{ ml: 2 }}
                aria-controls={open ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
            >
                <Avatar sx={{ width: 32, height: 32 }}>{user? user.username[0].toUpperCase() : null}</Avatar>
            </IconButton>
            </Tooltip>
        </Box>
        <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            PaperProps={{
            elevation: 0,
            sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
                },
                '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
                },
            },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
            <MenuItem>
            <Avatar /> {user ? user.username : 'Guest'}
            </MenuItem>
            { user && user.managed_profile ? 
                user.managed_profile.map(profile => {
                    return (
                        <MenuItem key={profile.id}>
                        <Avatar /> {profile.name}
                        </MenuItem>
                    );
                })
                
                :
                null
            }
            { user && user.is_staff ? 
                <MenuItem>
                    <ListItemIcon>
                        <SettingsRoundedIcon />
                    </ListItemIcon>
                    Settings
                </MenuItem>
                
                :
                null
            }
            <Divider />
            {user ? 
                <MenuItem onClick={ () => functionContext.logout()}>
                    <ListItemIcon>
                        <Logout  />
                    </ListItemIcon>
                    Logout
                </MenuItem>
                :
                <MenuItem >
                <Link href='/login' color='inherit' underline='none'>
                <ListItemIcon>
                    <Login fontSize="small" />
                </ListItemIcon>
                Login
                </Link>
                </MenuItem>
            }
            
        </Menu>
        </React.Fragment>
    );
    
}