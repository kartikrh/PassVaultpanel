import axios from 'axios';
import { getToken } from '../helpers/api_helper';

const axiosInstance = axios.create({
    baseURL: `${process.env.REACT_APP_BASE_URL}`
});

let authToken = null;
export const setAuthToken = (token) => {
    authToken = token;
};

axiosInstance.interceptors.request.use(async config => {
    if (!authToken) {
        try {
            authToken = await getToken();
            config.headers.Authorization = `Bearer ${authToken}`;
        } catch (error) {
            console.error('Error fetching auth token', error);
            return Promise.reject(error);
        }
    } else {
        config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export default axiosInstance;
