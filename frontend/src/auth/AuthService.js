import {axiosInstance, baseURL} from '../api/api.js';
const axios = require('axios');

export const setUser = (data=null) => {
    if (data) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', JSON.stringify(data.access_token));
        localStorage.setItem('refresh_token', JSON.stringify(data.refresh_token));
    } else {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
    }
};

export const getCurrentUser = () => {
    const user = localStorage.getItem('user') || null;
    if (user) {
        return JSON.parse(user);
    } else {
        return null;
    }
};

export const setUserInLocalStorage = (user) => {
    if (user) {
        localStorage.setItem('user', user)
    } else {
        localStorage.removeItem('user')
    }
};

export async function login(username, password) {
    return axiosInstance.post('/auth/login/', {username:username, password:password})
};

export const logout = () => {
    axiosInstance.post('/auth/logout/')
    .then( () => {return} )
    .catch( (error) => console.log(error)); 
};

export async function tokenValidOrRefresh() {
    user = getCurrentUser();
    if (user) {
        axios.post(`${baseURL}auth/token/verify/`, {token: JSON.parse(localStorage.getItem('token'))})
        .then((response) => {
            let token = JSON.stringify(response.data.access_token);
            localStorage.setItem('token', token);
        })
        .catch((error) => {
            if (error.response.status === 401) {
                axios.post(`${baseURL}auth/token/refresh/`, {refresh: JSON.parse(localStorage.getItem('refresh_token'))})
                .then((response) => {return response})
                .catch((error) => {logout()})
            } else {
                console.log(error);
            }
        })
    } else {
        return;
    }
};

export const passwordReset = ( email ) => {
    axiosInstance.post('/auth/password/reset/', { email : email })
    .then( response => { return response.json() })
    .catch( error => console.log('err'))
};

export async function passwordResetConfirm( uid, token, new_password1, new_password2 ) {
    axiosInstance.post('/auth/password/reset/', { 
        uid : uid, 
        token : token, 
        new_password1 : new_password1, 
        new_password2 : new_password2
    }).then( response => {
        return response;
    }).catch( error => {
        console.log( error );
    })
};

export async function getUser(){
    axiosInstance.get('/auth/user')
    .then( response => {
        return response.json();
    }).catch( error => {
        console.log( error );
    })
};

// pass opject with key value pairs
export async function updateUser( userData ){
    axiosInstance.put( './auth/user/', userData )
    .then( response => { return response.json() })
    .catch( error => { console.log( error ) })
};

//username password1 password2 email
//export async function registerUser(){
 //   axiosInstance.
//}
