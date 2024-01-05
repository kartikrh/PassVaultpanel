import axios from "axios";
import config from "../config";
import { decryptData } from '../Pages/Utility/encryptionUtils'

// default
// axios.defaults.baseURL = config.API_URL;

// content type
// axios.defaults.headers.post["Content-Type"] = "application/json";

// intercepting to capture errors


/**
 * Sets the default authorization
 * @param {*} token
 */

const setAuthorization = (token) => {
  axios.defaults.headers.common["Authorization"] = "Bearer " + token;
};

class APIClient {
  axiosInstance = axios.create({
    baseURL: `${process.env.REACT_APP_BASE_URL}`,
    headers: {
      "Content-Type": "application/json",
    }
  });
  constructor() {
    this.axiosInstance.interceptors.response.use(
      function (response) {
        return response.data ? response.data : response;
      },
      function (error) {
        // Any status codes that falls outside the range of 2xx cause this function to trigger
        let message;
        switch (error.status) {
          case 500:
            message = "Internal Server Error";
            break;
          case 401:
            message = "Invalid credentials";
            break;
          case 404:
            message = "Sorry! the data you are looking for could not be found";
            break;
          default:
            message = error?.message || error;
        }
        return Promise.reject(message);
      }
    );
  }
  /**
   * Fetches data from given url
   */
  get = (url, params) => {
    return this.axiosInstance.get(url, params);
  };

  /**
   * post given data to url
   */
  create = (url, data) => {
    return this.axiosInstance.post(url, data);
  };

  /**
   * Updates data
   */
  update = (url, data) => {
    return this.axiosInstance.put(url, data);
  };

  /**
   * Delete
   */
  delete = (url, config) => {
    return this.axiosInstance.delete(url, { ...config });
  };
}


const getToken = () => {
  if (!localStorage.getItem("authUser")) {
    return null
  }
  const encryptedAuth = localStorage.getItem("authUser");
  const decryptedAuth = decryptData(encryptedAuth);
  return decryptedAuth.token || null;
}


const getLoggedinUser = () => {
  if (localStorage.getItem("authUser") === null) {
    return null
  }
  const encryptedAuth = localStorage.getItem("authUser");
  const decryptedAuth = decryptData(encryptedAuth);
  if (!decryptedAuth.token) {
    return null;
  } else {
    return decryptedAuth;
  }
};

const isUserLogout = JSON.parse(localStorage.getItem('loggedIn') || false);

export { APIClient, setAuthorization, getLoggedinUser, getToken, isUserLogout };
