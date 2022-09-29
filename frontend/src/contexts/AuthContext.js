import React, { createContext, useState  } from 'react';
import  { useNavigate } from 'react-router-dom';
import axios, { AxiosInstance } from 'axios';

import authHeader from  './sevices/authHeader';
import AuthService from  './services/AuthService';
import UserModel from './services/Users';

const DefaultProps = {
    login: () => null,
    logout: () => null,
    authAxios : axios,
    user : null,
}

export default AuthProps = {
    login : ( username, password ) 
}