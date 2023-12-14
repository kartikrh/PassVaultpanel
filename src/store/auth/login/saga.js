import { call, put, takeEvery, takeLatest } from "redux-saga/effects";
import axios from "axios";
import { encryptData, decryptData } from "../../../Pages/Utility/encryptionUtils";
// Login Redux States
import {
  LOGIN_USER,
  LOGOUT_USER,
  SOCIAL_LOGIN,
} from "./actionTypes";
import {
  apiError,
  loginSuccess,
  logoutUserSuccess,
} from "./actions";

//Include Both Helper File with needed methods
import { getFirebaseBackend } from "../../../helpers/firebase_helper";
import {
  login,
  postJwtLogin,
  postSocialLogin,
} from "../../../helpers/fakebackend_helper";

const fireBaseBackend = getFirebaseBackend();
const loginApi = (userName, password) => {
  return axios.post(`${process.env.REACT_APP_BASE_URL}/signin`, {
    userName,
    password,
  });
};

function* LoginUser({ payload: { user, history } }) {
  try {
    if (process.env.REACT_APP_BASE_URL === "firebase") {
      // const response = yield call(
      //   fireBaseBackend.loginUser,
      //   user.email,
      //   user.password
      // );
      // yield put(loginSuccess(response));
    } else if (process.env.REACT_APP_BASE_URL === "jwt") {
      // const response = yield call(postJwtLogin, {
      //   email: user.email,
      //   password: user.password,
      // });
      // localStorage.setItem("authUser", JSON.stringify(response));
      // yield put(loginSuccess(response));
    } else if (
      process.env.REACT_APP_BASE_URL === "https://scorenodeapi.cloudd.live"
    ) {
      const response = yield call(loginApi, user.username, user.password);
      yield put(loginSuccess(response));
      // if (rememberMe) {
      response.result.password = user.password;
      localStorage.setItem("authUser", encryptData(response));
      // sidebarApi();
      // const response2 = yield call(sidebarApi);
      // console.log("this is response 2:", response2)
      // }
    }
    history("/dashboard");
  } catch (error) {
    // yield put(apiError(error));
    yield put(apiError("Incorrect Username and Password"));
  }
}

function* logoutUser() {
  try {
    // localStorage.removeItem("authUser");
    if (process.env.REACT_APP_DEFAULTAUTH === "firebase") {
      const response = yield call(fireBaseBackend.logout);
      yield put(logoutUserSuccess(LOGOUT_USER, response));
    } else {
      yield put(logoutUserSuccess(LOGOUT_USER, true));
      const authData = localStorage.getItem("authUser");
      const data = decryptData(authData);
      delete data?.result?.token
      localStorage.setItem("authUser", encryptData(data))
    }
  } catch (error) {
    yield put(apiError(LOGOUT_USER, error));
  }
}

function* socialLogin({ payload: { data, history, type } }) {
  try {
    if (process.env.REACT_APP_DEFAULTAUTH === "firebase") {
      const fireBaseBackend = getFirebaseBackend();
      const response = yield call(fireBaseBackend.socialLoginUser, data, type);
      localStorage.setItem("authUser", JSON.stringify(response));
      yield put(loginSuccess(response));
    } else {
      const response = yield call(postSocialLogin, data);
      localStorage.setItem("authUser", JSON.stringify(response));
      yield put(loginSuccess(response));
    }
    history("/dashboard");
  } catch (error) {
    yield put(apiError(error));
  }
}

function* authSaga() {
  yield takeEvery(LOGIN_USER, LoginUser);
  yield takeLatest(SOCIAL_LOGIN, socialLogin);
  yield takeEvery(LOGOUT_USER, logoutUser);
}

export default authSaga;
