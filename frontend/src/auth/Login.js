import React, {useState, Fragment} from 'react';
import {AuthService, login} from './AuthService';

//ROUTER
import {
	useHistory,
	useLocation,
	useNavigate,
	Link
} from "react-router-dom";

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


export default function Login(){
    const [ username, setUsername ] = useState( '' );
	const [ password, setPassword ] = useState( '' );
	const [ showPassword, setShowPassword ] = useState( false );
    const [ usernameError, setUsernameError ] = useState( false );
	const [ usernameHelperText, setUsernameHelperText ] = useState( '' );	
	const [ passwordError, setPasswordError ] = useState( false );
	const [ passwordHelperText, setPasswordHelperText ] = useState( '' );
	

    let navigate = useNavigate();
    let location = useLocation();
    let from = "/";

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

    async function x(username, password){
        let data = await login(username, password);
        if (data){
            console.log(data)
        } else {
            console.log('no data')
        }
    }

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
			x(username, password);
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
							<Avatar color="error">
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
											<FormHelperText><span >{usernameHelperText}</span></FormHelperText>
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
											<FormHelperText><span >{passwordHelperText}</span></FormHelperText>
										</FormControl>
									</Grid>
									
                                    <Grid item xs={6}>
                                        <Link to="/password_reset"  >
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
