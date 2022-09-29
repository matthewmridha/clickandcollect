import React, {useEffect, createContext, useState} from 'react';
import logo from './logo.svg';
import './App.css';
import {api_call} from './Api'

import {
	Routes,
	Route,
	Link,
	useNavigate,
	useLocation,
	Navigate,
	Outlet, } from "react-router-dom";

import Navigation from './Navbar';
import Login from './auth/Login';
import Home from './Home';
import TransitionAlert from './Alert';

import Container from '@mui/material/Container';
import { FormControlUnstyledContext } from '@mui/base';


export const StateContext = createContext();
export const ThemeContext = createContext();
export const FunctionContext = createContext();

const theme = {
	colors : {
		primary : '#007DBC',
		secondary: '#17BEBB',
		neutral : '#FFC857',
		secondary1 : '#E9724C',
		warning : '#AB0009'
	},
	defaults : {
		spacing : 2,
		padding : '10px',
		gap : 5,
		shadow : '1px 1px 5px grey'
	},
  	link : {
    muted : {
      color : 'black',
      textDecoration : 'none'
    }
  }
};

const defaultAlertMessage = '';
const defaultAlertSeverity = 'info';

function App() {
  
    const [state, setState] = useState({
      user : null,
      profile : null,
      alert : {
        message : defaultAlertMessage,
        severity : defaultAlertSeverity, //error\\warning\\info\\success
        showAlert : false
      },
      //MODAL COMPONENT STATE
      modal : {
        showModal : false,
        modalContent : "",
        modalHeader : ""
      },
      //SNACKBAR COMPONENT STATE
      snackbar : {
        openSnackbar : false,
        snackbarContent : ""
      },
    });
  
    function RequireAuth({ children }) {
      let location = useLocation();
      if (!localStorage.getItem('user') && !sessionStorage.getItem('user')) {
        return <Navigate to="/login" state={{ from: location }} replace />;
      }
      return children;
    };
  
    function NoAuth({ children }) {
      let location = useLocation();
      if (!localStorage.getItem('user') && !sessionStorage.getItem('user')) {
        return children;
      }
      return <Navigate to={'/'} />;
    };
  
    ///string=error||warning||info||success
    const toggleAlert = (message='', severity=state.alert.severity) => {
      setState({...state, alert : {
        message : message,
        severity : severity,
        showAlert : !state.alert.showAlert,
      }});
    };
  
    //MODAL COMPONENT SHOW||HIDE. ARGS=header(string), content(string)
    const toggleModal = (header="", content="") => {
      setState({...state, modal : {
        modalHeader : header,
        modalContent : content,
        showModal : !state.modal.showModal
      }});
    };
  
    //SNACKBAR COMPONENT SHOW. ARGS=content(string)
    const openSnackbar = (content="") => {
      setState({...state, snackbar : {
        openSnackbar : true,
        snackbarContent : content
      }});
    };
  
    //SNACKBAR COMPONENT HIDE.
    const handleSnackbarClose = (event, reason) => {
      if (reason === 'clickaway') {
        return;
      }
      setState({...state, snackbar : {
        openSnackbar : false,
        snackbarContent : ""
      }});
    };
  
  
    const updateUser = (passedUser) => {
      if (passedUser){
        setState({...state, user:passedUser})
      }
      else{
        setState({...state, user:null})
      }
    };
  
    const logout = () => {
          localStorage.clear();
          sessionStorage.clear();
          api_call({
            url:'auth/logout/', 
            method:'post'
          }).then(
              response => {
                toggleAlert(response.data.detail, 'info');
                updateUser(null);
              }
          )
      };
  
    useEffect( () => {
      const user = JSON.parse( localStorage.getItem( 'user' )) || null
      if ( user ){
        setState({...state, user : user});
      }
    }, []);
  
    
    return (
      <Container className='App'>
        <StateContext.Provider value={{ data:state }}>
        <ThemeContext.Provider value={ theme }>
        <FunctionContext.Provider value={{
          toggleAlert : toggleAlert,
          toggleModal : toggleModal,
          openSnackbar : openSnackbar,
          handleSnackbarClose : handleSnackbarClose,
          updateUser : updateUser,
          logout : logout,
          
        }}>
        <Navigation />
        <TransitionAlert />
        <Container style={{ paddingTOp:'20px' }}>
          <Routes>
            <Route path='/' element={
              <RequireAuth>
                <Home />
              </ RequireAuth>
            } />
            <Route path="/login" element={
              <NoAuth>
                <Login />
              </NoAuth>
            } />
            
          </Routes>
        </Container>
        
        </ FunctionContext.Provider >
        </ ThemeContext.Provider >
        </ StateContext.Provider>
      </Container>
    );
  
}

export default App;
