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
import axiosInstance from "../../Features/axios";
import Toaster from "../../components/Toaster/index";
import { useSelector, useDispatch } from "react-redux";
import { decryptData } from "../Utility/encryptionUtils";
import SpinnerModel from "../../components/Model/SpinnerModel";
const Index = (props) => {
  document.title = "Change Password | scoreNode - React Admin & Dashboard Template";

  const dispatch = useDispatch();
  const [data, setData] = useState({
    userId: "",
    newPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({
    message: "",
    color: "",
    header: "",
  });
  const [toastStatus, setToastStatus] = useState(false);
  const { isSaved, error } = useSelector(
    (state) => state.tabsData.changePassword
  );
  const changePassword = async () => {
    setIsLoading(true);
    await axiosInstance.post(`/admin/user/changePassword`,{...data})
      .then((response) => {
        setToastStatus(true);
      })
      .catch((error) => {
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
  useEffect(()=>{
    const authUser = localStorage.getItem('authUser')
    const user = decryptData(authUser)
  },[])
  return (
    <div className="mt-5" style={{}}>
      <div className="account-pages pt-5">
        <Container fluid={true}>
          {isLoading && <SpinnerModel />}
          <Toaster
            toast={toast}
            setToast={setToast}
            toastStatus={toastStatus}
            setToastStatus={setToastStatus}
          />
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
                          <Label className="form-label">User ID</Label>
                          <Input
                            name="userId"
                            type="text"
                            placeholder="Enter UserId"
                            onChange={handleChange}
                          />
                        </div>
                        <div className="mb-4">
                          <Label className="form-label">New Password</Label>
                          <Input
                            type={showPassword ? "text" : "newPassword"}
                            name="newPassword"
                            id="newPassword"
                            placeholder="New Password"
                            onChange={handleChange}
                          />
                        </div>
                        <div className="d-grid mt-4">
                          <button
                            className="btn btn-primary waves-effect waves-light"
                            type="submit"
                            onClick={()=>{changePassword()}}
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
