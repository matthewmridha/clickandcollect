import React, { Fragment, useState, useContext } from 'react';
import {api, api_call} from './Api'
//PROMISE TRACKER - LOADING SPINNER
import { trackPromise} from 'react-promise-tracker';
import { axiosInstance } from './api/api.js'


//DECODE RESPONSE JWT
import jwt_decode from "jwt-decode";

//ROUTER
import {
	useHistory,
	useLocation,
	useNavigate,
	Link
} from "react-router-dom";

/// IMPORT GLOBAL VARIABLES
//import { ContextLibrary, URLContext } from '.';

//MATERIAL UI
import {
	Box,
	Avatar,
	IconButton,
	Button,
	Grid,
	Container,
	InputAdornment,
	OutlinedInput,
	Paper,
	Divider,
	FormControl,
	InputLabel,
	FormHelperText,
	Typography
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Checkbox from '@mui/material/Checkbox';
import Tooltip from '@mui/material/Tooltip';
import FormControlLabel from '@mui/material/FormControlLabel';

import {ThemeContext, FunctionContext, StateContext} from './App'


//VALIDATES INPUT TYPE
let validator = require('validator');

/// COMPONENT

export default function LogIn() {

	const theme = useContext(ThemeContext);
	const stateContext = useContext(StateContext);
	const functionContext = useContext(FunctionContext);

	//STATE 
	const [ username, setUsername ] = useState( '' );
	const [ password, setPassword ] = useState( '' );
	const [ showPassword, setShowPassword ] = useState( false );
    const [ usernameError, setUsernameError ] = useState( false );
	const [ usernameHelperText, setUsernameHelperText ] = useState( '' );	
	const [ passwordError, setPasswordError ] = useState( false );
	const [ passwordHelperText, setPasswordHelperText ] = useState( '' );
	const [ rememberMe, setRememberMe] = React.useState(true);

	let navigate = useNavigate();
    let location = useLocation();
    let from = "/";

	const changeRememberMe = (event) => {
		setRememberMe(event.target.checked);
	};
		
	//HANDLE INPUT CHANGE
	const changeInput = ( e, arg ) => {
		//arg=setState hook eg: setEmail
		if( usernameError || passwordError ){
			clearInputErrors();
		}
		arg( e.target.value );
	};

	const clearInputErrors = () => {
		setUsernameError( false );
		setPasswordError( false );
		setUsernameHelperText( '' );
	};

	//PASSWORD SHOW/HIDE TOGGLE
	const handleClickShowPassword = () => {
		setShowPassword( !showPassword );
	};
	
	const handleMouseDownPassword = ( event ) => {
		event.preventDefault();
	};

	const badCredentials = () => {
		functionContext.toggleAlert( 'Wrong Username or Password', 'warning' );
	};

	//LOGIN API CALL WITH EMAIL AND PASSWORD; 
	//REQUEST=>USERNAME(EMAIL), PASSWORD, RESPONSE=>ACCESS_TOKEN, REFRESH_TOKEN, PK, USERNAME

	const login = () => {

		axiosInstance.post('auth/login', { username: username, password: password })
		api_call({ 
				url : 'auth/login/', 
				method : 'post', 
				params : { username: username, password: password }
			}).then( res => {
				if ( res ) {
					let expiry = jwt_decode(res.data.access_token).exp;
				
					if ( rememberMe ) {
						localStorage.setItem( 'user', JSON.stringify( res.data.user ));
						localStorage.setItem( 'token', JSON.stringify( res.data.access_token ));
						localStorage.setItem( 'refresh', JSON.stringify( res.data.refresh_token ));
						localStorage.setItem( 'expiry', JSON.stringify( expiry ));
					} else {
						sessionStorage.setItem( 'user', JSON.stringify( res.data.user ));
						sessionStorage.setItem( 'token', JSON.stringify( res.data.access_token ));
						sessionStorage.setItem( 'refresh', JSON.stringify( res.data.refresh_token ));
						sessionStorage.setItem( 'expiry', JSON.stringify( expiry ) );
					}
					functionContext.updateUser( res.data.user );
					navigate( from, { replace: true });
				} else {
					badCredentials();
				};
			}
		);
	};

	
	//LOGIN API CALL, CLEAR FORM
	const submitLoginForm = ( e ) => {
		e.preventDefault();
		if( password.length <= 1 ) {
			setPasswordError( true );
			setPasswordHelperText( "*Password Required" );
			return 1;
		}
		else if( username.length <=1 ) {
			setUsernameHelperText( "Valid Username Required" );
			setUsernameError( true );
			return 1;
		}
		else{
			setPasswordError( false );
			setPasswordHelperText( "" );
			setUsernameHelperText( "" );
			setUsernameError( false );
			login();
			setUsername( "" );
			setPassword( "" );
		}
	};

	return (
		<Fragment>
			<Container maxWidth="xs">
				<Paper elevation={5} style={{padding:'25px'}}>
					<Grid container spacing={3}>
						<Grid item xs={12} style={{display : "flex", justifyContent : "center", alignItems : "center", flexDirection : "column",}}>
							<Avatar style={{backgroundColor : theme.colors.warning}}>
								<LockOutlinedIcon />
							</Avatar>
						</Grid>
						<Grid item xs={ 12 }>
							<Divider><Typography>Sign In</Typography></Divider>
						</Grid>
						<Grid item xs={12}>
							<Box component='form'>
								<Grid container spacing={2.5}>
									<Grid item xs={12}>
										<FormControl fullWidth variant="outlined">
										<InputLabel htmlFor="outlined-username">Username</InputLabel>
											<OutlinedInput
												variant="outlined"
												margin="dense"
												required
												type="text"
												id="username"
												label="Username"
												name="username"
												autoComplete="username"
												autoFocus
												value={username}
												onChange = {(e) => changeInput(e, setUsername)}
												
											/>
											<FormHelperText><span style={{color: theme.colors.warning}}>{usernameHelperText}</span></FormHelperText>
										</FormControl>
										
									</Grid>
									<Grid item xs={12}>
										<FormControl fullWidth variant="outlined">
											<InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
											<OutlinedInput
												id="outlined-adornment-password"
												type={showPassword ? 'text' : 'password'}
												value = {password}
												label="Password"
												onChange = {(e) => changeInput(e, setPassword)}
												required
												error = { passwordError }
												endAdornment={
												<InputAdornment position="end">
													<IconButton
													aria-label="toggle password visibility"
													onClick={handleClickShowPassword}
													onMouseDown={handleMouseDownPassword}
													edge="end"
													>
													{showPassword ? <Visibility /> : <VisibilityOff />}
													</IconButton>
												</InputAdornment>
												}
											/>
											<FormHelperText><span style={{color: theme.colors.warning}}>{passwordHelperText}</span></FormHelperText>
										</FormControl>
									</Grid>
									<Grid item xs={6}>
									<Tooltip title='Stay logged in on this browser'>
										<FormControlLabel
											label='Remember Me'
											control={
												<Checkbox
													id='remeber_me_box'
													checked={rememberMe}
													onChange={changeRememberMe}
													inputProps={{ 'aria-label': 'remeber me' }}
													/>
											}
										>
										</FormControlLabel>
									</Tooltip>
									
									</Grid>
                                    <Grid item xs={6}>
                                        <Link to="/password_reset"  style={theme.link.muted}>
                                            <Typography>Forgot password?</Typography>
                                        </Link>
                                    </Grid>
									<Grid item xs={12}>
										<Button
											type="submit"
											onClick={submitLoginForm}
											fullWidth
											variant="contained"
											size="large"
											style={{backgroundColor:theme.colors.primary}}
										>
											Sign In
										</Button>
									</Grid>
								</Grid>
							</Box>
						</Grid>
						
					</Grid>
				</Paper>
			</Container>
		</Fragment>
	);
}