const axios = require('axios');
import {AuthService} from '../auth/AuthService';


const baseURL = 'http://localhost:8000/'

const axiosInstance = axios.create({
    withCredentials: true,
    baseURL: baseURL,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
    }
});

export { axiosInstance, baseURL }




