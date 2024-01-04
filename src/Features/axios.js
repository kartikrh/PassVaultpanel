import axios from 'axios';
import { getToken, isUserLogout } from '../helpers/api_helper';
import { decryptData, encryptData } from '../Pages/Utility/encryptionUtils';
import { LOGOUT } from '../components/Common/Const';

const axiosInstance = axios.create({
    baseURL: `${process.env.REACT_APP_BASE_URL}`,
    headers: {
        "Content-Type": "application/json",
    }
});

let authToken = null;
export const setAuthToken = (token) => {
    authToken = token;
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
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

axiosInstance.interceptors.response.use(
    response => {
        if (response.data?.token) {
            const newToken = response.data.token;
            const encryptedAuth = localStorage.getItem("authUser");
            setAuthToken(newToken);
            if (encryptedAuth) {
                const decryptedAuth = decryptData(encryptedAuth);
                decryptedAuth.token = newToken;
                localStorage.setItem("authUser", encryptData(decryptedAuth));
            }
        }
        return response.data ? response.data : response;
    },
    error => {
        // Any status codes that falls outside the range of 2xx cause this function to trigger
        let message;
        switch (error.response.status) {
            case 500:
                message = "Internal Server Error";
                break;
            case 401:
                message = "Invalid credentials";
                const ignoreMessage = ["SignIn", "SignOut"]
                if (!ignoreMessage.includes(error?.response?.data?.title)) {
                    window.location.href = LOGOUT
                }
                break;
            case 404:
                message = "Sorry! the data you are looking for could not be found";
                break;
            default:
                message = error?.message || error;
        }
        if (error?.response?.data) error = error.response.data;
        return Promise.reject(error);
    }
);

export default axiosInstance;
