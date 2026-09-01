import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import logolight from "../../assets/images/logo-light.png";
import logodark from "../../assets/images/logo-dark.png";

import {
  Row,
  Col,
  CardBody,
  Card,
  Container,
  Form,
  Input,
  FormFeedback,
  Label,
  Alert,
} from "reactstrap";

//redux
import { useSelector, useDispatch } from "react-redux";

import { Link, useNavigate } from "react-router-dom";
import withRouter from "../../components/Common/withRouter";

// Formik validation
import * as Yup from "yup";
import { useFormik } from "formik";

//Social Media Imports
import { GoogleLogin } from "react-google-login";
// import TwitterLogin from "react-twitter-auth"
import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props";

// actions
// import { loginUser, socialLogin, } from "../../store/actions";

//Import config
import { facebook, google } from "../../config";
import { loginUser, verifyOtp, cancelOtpChallenge } from "../../Features/Authentication/userSlice";
import { REMEMBER_ME_KEY, USER_DATA_KEY } from "../../components/Common/Const";
import { OTPType } from "../../components/Common/otpConstants";

const Login = (props) => {
  const _rememberMe = JSON.parse(localStorage.getItem(REMEMBER_ME_KEY) || null);
  const [rememberMe, setRememberMe] = useState(_rememberMe || false)
  document.title = "Login ";
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { error, token, isUserLogout, otpRequired, otpType, qrCode, pendingToken, isLoading } = useSelector((state) => state.user);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState(null);
  const getInitialValues = () => {
    const userData = JSON.parse(localStorage.getItem(USER_DATA_KEY) || null);
    if (userData) return userData
    return {
      userName: "",
      password: "",
    }
  }
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,
    initialValues: getInitialValues(),
    validationSchema: Yup.object({
      userName: Yup.string().required("Please Enter Your Username"),
      password: Yup.string().required("Please Enter Your Password"),
    }),
    onSubmit: (values) => {
      dispatch(loginUser(values));
    },
  });


  useEffect(() => {
    if (token && !isUserLogout) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, [token])

  const handleRememberMe = () => {
    if (rememberMe === true) {
      localStorage.setItem(REMEMBER_ME_KEY, false)
      setRememberMe(false)
    } else if (rememberMe === false) {
      localStorage.setItem(REMEMBER_ME_KEY, true)
      setRememberMe(true)
    }
  };
  const signIn = (res, type) => {
    if (type === "google" && res) {
      const postData = {
        name: res.profileObj.name,
        userName: res.profileObj.userName,
        token: res.tokenObj.access_token,
        idToken: res.tokenId,
      };
      // dispatch(socialLogin(postData, props.router.navigate, type));
    } else if (type === "facebook" && res) {
      const postData = {
        name: res.name,
        userName: res.userName,
        token: res.accessToken,
        idToken: res.tokenId,
      };
      // dispatch(socialLogin(postData, props.router.navigate, type));
    }
  };

  //handleGoogleLoginResponse
  const googleResponse = (response) => {
    signIn(response, "google");
  };

  //handleTwitterLoginResponse
  // const twitterResponse = e => {}

  //handleFacebookLoginResponse
  const facebookResponse = (response) => {
    signIn(response, "facebook");
  };

  useEffect(() => {
    // const AuthUse  r = localStorage.getItem("rememberMe");
    // if (AuthUser == "true") {
    //   setRememberMe(true)
    //   const userAuth = decryptData(localStorage.getItem("authUser"));
    //   const { userName, password } = userAuth?.result;
    //   validation.setValues({
    //     userName: userName, // Replace with your saved userName logic
    //     password: password, // Replace with your saved password logic
    //   });
    // }
    document.body.className = "bg-pattern";
    // remove classname when component will unmount
    return function cleanup() {
      document.body.className = "";
    };
  }, []);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    validation.handleSubmit();
    return false;
  }

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    setOtpError(null);
    if (!otpCode) {
      setOtpError("Please enter the 6-digit code");
      return;
    }
    dispatch(verifyOtp({ pendingToken, code: otpCode }))
      .unwrap()
      .catch((message) => setOtpError(message));
  };

  const handleCancelOtp = () => {
    setOtpCode("");
    setOtpError(null);
    dispatch(cancelOtpChallenge());
  };

  return (
    <React.Fragment>
      <div className="account-pages my-5 pt-5">
        <Container>
          <Row className="justify-content-center">
            <Col lg={6} md={8} xl={4}>
              <Card>
                <CardBody className="p-4">
                  <div>
                    <div className="text-center">
                      {/* <Link to="/">
                        <img
                          src={logodark}
                          alt=""
                          height="24"
                          className="auth-logo logo-dark mx-auto"
                        />
                        <img
                          src={logolight}
                          alt=""
                          height="24"
                          className="auth-logo logo-light mx-auto"
                        />
                      </Link> */}
                    </div>
                    {otpRequired ? (
                      <>
                        <h4 className="font-size-18 text-muted mt-2 text-center">
                          Two-Factor Authentication
                        </h4>
                        <p className="mb-4 text-center">
                          {qrCode
                            ? "Scan this QR code with Google Authenticator, then enter the 6-digit code below."
                            : otpType === OTPType.MAIL
                              ? "Enter the code we emailed you."
                              : "Enter the 6-digit code from your authenticator app."}
                        </p>
                        {qrCode ? (
                          <div className="text-center mb-4">
                            <img src={qrCode} alt="Scan with Google Authenticator" style={{ width: 200, height: 200 }} />
                          </div>
                        ) : null}
                        <Form className="form-horizontal" onSubmit={handleOtpSubmit}>
                          {otpError ? (
                            <Alert color="danger">
                              <div className="text-center">{otpError}</div>
                            </Alert>
                          ) : null}
                          <div className="mb-4">
                            <Label className="form-label">Authentication code</Label>
                            <Input
                              name="otpCode"
                              className="form-control"
                              placeholder="Enter 6-digit code"
                              type="text"
                              inputMode="numeric"
                              maxLength={6}
                              value={otpCode}
                              onChange={(e) => setOtpCode(e.target.value)}
                              autoFocus
                            />
                          </div>
                          <div className="d-grid mt-4">
                            <button
                              className="btn btn-primary waves-effect waves-light"
                              type="submit"
                              disabled={isLoading}
                            >
                              {isLoading ? "Verifying..." : "Verify"}
                            </button>
                          </div>
                          <div className="d-grid mt-2">
                            <button
                              className="btn btn-link waves-effect"
                              type="button"
                              onClick={handleCancelOtp}
                            >
                              Back to sign in
                            </button>
                          </div>
                        </Form>
                      </>
                    ) : (
                      <>
                    <h4 className="font-size-18 text-muted mt-2 text-center">
                      Welcome Back !
                    </h4>
                    <p className="mb-5 text-center">
                      Sign in to continue to Scorepanel.
                    </p>
                    <Form
                      className="form-horizontal"
                      onSubmit={handleFormSubmit}
                    >
                      {/* {error ? (
                        <Alert color="danger">
                          <div className="text-center">{error}</div>
                        </Alert>
                      ) : null} */}
                      <Row>
                        <Col md={12}>
                          <div className="mb-4">
                            <Label className="form-label">Username</Label>
                            <Input
                              name="userName"
                              className="form-control"
                              placeholder="Enter userName"
                              type="userName"
                              onChange={validation.handleChange}
                              onBlur={validation.handleBlur}
                              value={validation.values.userName || ""}
                              invalid={
                                validation.touched.userName &&
                                  validation.errors.userName
                                  ? true
                                  : false
                              }
                            />
                            {validation.touched.userName &&
                              validation.errors.userName ? (
                              <FormFeedback type="invalid">
                                <div>{validation.errors.userName}</div>
                              </FormFeedback>
                            ) : null}
                          </div>
                          <div className="mb-4">
                            <Label className="form-label">Password</Label>
                            <Input
                              name="password"
                              value={validation.values.password || ""}
                              type="password"
                              placeholder="Enter Password"
                              onChange={validation.handleChange}
                              onBlur={validation.handleBlur}
                              invalid={
                                validation.touched.password &&
                                  validation.errors.password
                                  ? true
                                  : false
                              }
                            />
                            {validation.touched.password &&
                              validation.errors.password ? (
                              <FormFeedback type="invalid">
                                <div> {validation.errors.password} </div>
                              </FormFeedback>
                            ) : null}
                          </div>

                          <Row>
                            <Col>
                              <div className="form-check">
                                <input
                                  checked={rememberMe}
                                  onClick={handleRememberMe}
                                  type="checkbox"
                                  className="form-check-input"
                                  id="customControlInline"
                                  readOnly
                                />
                                <label
                                  className="form-label form-check-label"
                                  htmlFor="customControlInline"
                                >
                                  Remember me
                                </label>
                              </div>
                            </Col>
                            {/* <Col className="col-7"> */}
                            {/* <div className="text-md-end mt-3 mt-md-0">
                                <Link
                                  to="/auth-recoverpw"
                                  className="text-muted"
                                >
                                  <i className="mdi mdi-lock"></i> Forgot your
                                  password?
                                </Link>
                              </div> */}
                            {/* </Col> */}
                          </Row>
                          <div className="d-grid mt-4">
                            <button
                              className="btn btn-primary waves-effect waves-light"
                              type="submit"
                            >
                              Log In
                            </button>
                          </div>
                          {/* <div className="mt-4 text-center">
                            <h5 className="font-size-14 mb-3">Sign in with</h5>

                            <ul className="list-inline">
                              <li className="list-inline-item">
                                <FacebookLogin
                                  appId={facebook.APP_ID}
                                  autoLoad={false}
                                  callback={facebookResponse}
                                  render={(renderProps) => (
                                    <Link
                                      to="#"
                                      className="social-list-item bg-primary text-white border-primary"
                                      onClick={renderProps.onClick}
                                    >
                                      <i className="mdi mdi-facebook" />
                                    </Link>
                                  )}
                                />
                              </li>

                              <li className="list-inline-item">
                                <GoogleLogin
                                  clientId={google.CLIENT_ID}
                                  render={(renderProps) => (
                                    <Link
                                      to="#"
                                      className="social-list-item bg-danger text-white border-danger"
                                      onClick={renderProps.onClick}
                                    >
                                      <i className="mdi mdi-google" />
                                    </Link>
                                  )}
                                  onSuccess={googleResponse}
                                  onFailure={() => {}}
                                />
                              </li>
                            </ul>
                          </div> */}
                        </Col>
                      </Row>
                    </Form>
                      </>
                    )}
                  </div>
                </CardBody>
              </Card>
              <div className="mt-5 text-center">
                {/* <p className="text-white-50">
                  Don't have an account ?{" "}
                  <Link to="/register" className="fw-medium text-primary">
                    {" "}
                    Register{" "}
                  </Link>{" "}
                </p> */}
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default withRouter(Login);

Login.propTypes = {
  history: PropTypes.object,
};
