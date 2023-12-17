import axios from 'axios';
import store from '../store'; // Import your Redux store

const axiosInstance = axios.create({
    baseURL: 'https://scorenodeapi.cloudd.live',
});

axiosInstance.interceptors.request.use(config => {
    const token = store.getState().login.token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export default axiosInstance;
