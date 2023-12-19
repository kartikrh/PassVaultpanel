import axios from "axios";
import config from "../config";
import { decryptData } from '../Pages/Utility/encryptionUtils'

// default
axios.defaults.baseURL = config.API_URL;

// content type
axios.defaults.headers.post["Content-Type"] = "application/json";

// intercepting to capture errors
axios.interceptors.response.use(
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
        message = error.message || error;
    }
    return Promise.reject(message);
  }
);

/**
 * Sets the default authorization
 * @param {*} token
 */
const setAuthorization = (token) => {
  axios.defaults.headers.common["Authorization"] = "Bearer " + token;
};

class APIClient {
  /**
   * Fetches data from given url
   */
  get = (url, params) => {
    return axios.get(url, params);
  };

  /**
   * post given data to url
   */
  create = (url, data) => {
    return axios.post(url, data);
  };

  /**
   * Updates data
   */
  update = (url, data) => {
    return axios.put(url, data);
  };

  /**
   * Delete
   */
  delete = (url, config) => {
    return axios.delete(url, { ...config });
  };
}

const getToken = () => {
  const encryptedAuth = localStorage.getItem("authUser");
  const decryptedAuth = decryptData(encryptedAuth);
  return decryptedAuth.token;
}
const getLoggedinUser = () => {
  const encryptedAuth = localStorage.getItem("authUser");
  const decryptedAuth = decryptData(encryptedAuth);
  if (!decryptedAuth.token) {
    return null;
  } else {
    return decryptedAuth;
  }
};

const changeDisplayOrder = async (tabdisplayOrder, apiName) => {
  console.log("this is tabDisplayOrder ---->>>>", tabdisplayOrder)
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_BASE_URL}/admin/${apiName}/changeDisplayOrder`,

      tabdisplayOrder, // Send the updated order data to the API
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );

    return response?.data?.result || [];
  } catch (error) {
    throw Error(error);
  }
}
export { APIClient, setAuthorization, getLoggedinUser, getToken, changeDisplayOrder };
