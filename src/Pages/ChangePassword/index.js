import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  CardBody,
  Card,
  Alert,
  Container,
  Input,
  Label,
  Form,
  FormFeedback,
} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";
import { useSelector, useDispatch } from "react-redux";

const Register = (props) => {
  document.title = "Register | Upzet - React Admin & Dashboard Template";

  const dispatch = useDispatch();
  const { isSaved, isLoading, error } = useSelector(
    (state) => state.tabsData.changePassword
  );
  const [showPassword, setShowPassword] = useState(false);
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,
    initialValues: {
      userId: "",
      password: "",
    },
    validationSchema: Yup.object({
      userId: Yup.string().required("Please Enter Your Username"),
      password: Yup.string().required("Please Enter Your Password"),
    }),
  });

  useEffect(() => {
    // dispatch(apiError(""));
  }, [dispatch]);

  return (
    <div className="mt-5" style={{}}>
      <div className="account-pages pt-5">
        <Container fluid={true}>
        <Breadcrumbs title="ScoreCard" breadcrumbItem="Change Password" />
          <Row className="justify-content-center">
            <Col lg={6} md={8} xl={4}>
              <Card className="mt-5">
                <CardBody className="p-4">
                  {/* <h4 className="font-size-18 text-muted text-center mt-2 mb-5">
                    Change Password
                  </h4> */}
                  {/* <p className="text-muted text-center mb-4">Get your free Upzet account now.</p> */}
                  <Form
                    className="form-horizontal"
                    onSubmit={(e) => {
                      e.preventDefault();
                      validation.handleSubmit();
                      return false;
                    }}
                  >
                    <Row>
                      <Col md={12}>
                        <div className="mb-4">
                          <Label className="form-label">User ID</Label>
                          <Input
                            name="username"
                            type="text"
                            placeholder="Enter UserId"
                            invalid={
                              validation.touched.username &&
                              validation.errors.username
                                ? true
                                : false
                            }
                          />
                          {validation.touched.username &&
                          validation.errors.username ? (
                            <FormFeedback type="invalid">
                              <div>{validation.errors.username}</div>
                            </FormFeedback>
                          ) : null}
                        </div>
                        <div className="mb-4">
                          <Label className="form-label">New Password</Label>
                          <Input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            id="password"
                            placeholder="New Password"
                            invalid={
                              validation.touched.password &&
                              validation.errors.password
                            }
                          />
                          {validation.touched.password &&
                          validation.errors.password ? (
                            <FormFeedback type="invalid">
                              <div>{validation.errors.password}</div>
                            </FormFeedback>
                          ) : null}
                        </div>
                        <div className="d-grid mt-4">
                          <button
                            className="btn btn-primary waves-effect waves-light"
                            type="submit"
                          >
                            Change Password
                          </button>
                        </div>
                      </Col>
                    </Row>
                  </Form>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default Register;
