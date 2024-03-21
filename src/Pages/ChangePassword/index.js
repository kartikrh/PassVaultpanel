import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  CardBody,
  Card,
  Container,
  Input,
  Label,
} from "reactstrap";
import axiosInstance from "../../Features/axios";
import { useDispatch } from "react-redux";
import { decryptData } from "../Utility/encryptionUtils";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { updateToastData } from "../../Features/toasterSlice";
import { LOGOUT, ERROR, SUCCESS } from "../../components/Common/Const";
import { useNavigate } from "react-router-dom";

const Index = (props) => {
  document.title = "Change Password | scoreNode - React Admin & Dashboard Template";
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const [data, setData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const changePassword = async () => {
    setIsLoading(true);
    if (data.oldPassword === data.newPassword) {
      dispatch(
        updateToastData({
          data: "New password cannot be same as old password",
          title: "Password Mismatch",
          type: ERROR,
        })
      );
      setIsLoading(false);
      return;
    }
    if (data.newPassword !== data.confirmPassword) {
      dispatch(updateToastData({ data: "New password and confirm password do not match", title: "Password Mismatch", type: ERROR }));
      setIsLoading(false);
      return;
    }
    await axiosInstance.post(`/admin/user/changePassword`, { ...data })
      .then((response) => {
        dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
        navigate(LOGOUT)
      })
      .catch((error) => {
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
        setIsLoading(false);
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((preValue) => {
      return {
        ...preValue,
        [name]: value,
      };
    });
  };
  useEffect(() => {
    const authUser = localStorage.getItem('authUser')
    const user = decryptData(authUser)
  }, [])
  return (
    <div className="mt-5" style={{}}>
      <div className="account-pages pt-5">
        <Container fluid={true}>
          {isLoading && <SpinnerModel />}
          <Row className="justify-content-center">
            <Col lg={6} md={8} xl={4}>
              <Card className="mt-5">
                <CardBody className="p-4">
                  <h4 className="font-size-18 text-muted text-center mt-2 ">
                    Change Password
                  </h4>
                  <p className="text-muted text-center mb-4">
                    The change will not be revertible.
                  </p>
                  <div className="form-horizontal">
                    <Row>
                      <Col md={12}>
                        <div className="mb-4">
                          <Label className="form-label">Current Password</Label>
                          <Input
                            name="oldPassword"
                            type="password"
                            placeholder="Enter Current Password"
                            value={data.oldPassword}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="mb-4">
                          <Label className="form-label">New Password</Label>
                          <Input
                            type={"password"}
                            name="newPassword"
                            id="newPassword"
                            placeholder="New Password"
                            value={data.newPassword}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="mb-4">
                          <Label className="form-label">
                            Confirm Password
                          </Label>
                          <Input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            value={data.confirmPassword}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="d-grid mt-4">
                          <button
                            className="btn btn-primary waves-effect waves-light"
                            type="submit"
                            onClick={() => { changePassword() }}
                          >
                            Change Password
                          </button>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default Index;
