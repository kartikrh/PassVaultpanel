import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FormBuilder from "../../components/Common/Reusables/FormBuilder";
import { UserFields } from "../../constants/FieldConst/UserConst";
import SpinnerModel from "../../components/Model/SpinnerModel";
import {
  Button,
  ButtonDropdown,
  Card,
  CardBody,
  Col,
  Container,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { ERROR, PERMISSION_ADD, PERMISSION_EDIT, PERMISSION_VIEW, SAVE, SAVE_AND_CLOSE, SAVE_AND_NEW, TAB_USERS } from '../../components/Common/Const';
import axiosInstance from "../../Features/axios";
import { addUserToDb, updateSavedState } from "../../Features/Tabs/usersSlice";
import { checkPermission } from '../../components/Common/Reusables/reusableMethods';
import { updateToastData } from "../../Features/toasterSlice";

function AddUsers() {
  const pageName = TAB_USERS
  const finalizeRef = useRef(null);
  const [drp_up, setDrp_up] = useState(false);
  const [initialEditData, setInitialEditData] = useState(undefined);
  const [currentSaveAction, setCurrentSaveAction] = useState(undefined);
  const [masterData, setMasterData] = useState({});
  const [disabledFields, setDisabledFields] = useState({});
  const { isSaved, isLoading, error } = useSelector(state => state.tabsData.user);
  const permissionObj = useSelector(state => state.auth?.tabPermissionList);
  const dispatch = useDispatch();
  let navigate = useNavigate();
  const location = useLocation();
  const [userId, setUserId] = useState(location.state?.userId || "0");

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard")
    }
    fetchMasterData();
  }, []);

  useEffect(() => {
    if (userId !== "0") {
      fetchData(userId);
      setDisabledFields({
        parentId: true,
        userType: true,
        userName: true
      });
    }
  }, [userId]);

  useEffect(() => {
    if (isSaved) {
      dispatch(updateSavedState(undefined))
      if (currentSaveAction === SAVE_AND_CLOSE) navigate("/users");
      else if (currentSaveAction === SAVE_AND_NEW) {
        setDisabledFields({})
        setInitialEditData({})
        setUserId("0")
        finalizeRef.current.resetForm();
      }
      setCurrentSaveAction(undefined)
    }
  }, [isSaved]);

  const fetchData = async (id) => {
    await axiosInstance
      .post("/admin/user/byId", { userId })
      .then((response) => {
        setInitialEditData(response?.result);
      })
      .catch((error) => {
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
      });
  };

  const fetchMasterData = async () => {
    await axiosInstance
      .post(`/admin/user/allWithCurrent`)
      .then((response) => {
        setMasterData((preData) => ({
          ...preData,
          parentId: response.result?.map((item) => {
            return { label: item.userName, value: item.userId };
          }),
        }));
        if (userId === "0") {
          setInitialEditData({
            parentId: response.result.find(value => value?.current).userId,
            roleId: "0",
            isActive: true,
          })
        }
      })
      .catch((error) => {
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
      });
    await axiosInstance
      .post("/admin/user/roleList")
      .then((response) => {
        setMasterData((preData) => ({
          ...preData,
          roleId: response.result?.map((item) => {
            return { label: item.roleName, value: item.roleId };
          }),
        }));
      })
      .catch((error) => {
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
      });
  };

  const handleSaveClick = async (saveAction) => {
    const dataToSave = finalizeRef.current.finalizeData()
    if (dataToSave) {
      const extraData = {
        userId: userId
      }
      setCurrentSaveAction(saveAction);
      dispatch(addUserToDb({ ...dataToSave, ...extraData }))
    }
  };

  const handleBackClick = () => {
    navigate("/users");
  };
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Row>
            <Col xs={12} md={8} lg={9}>
              <h3 className="modal-header-title">Users </h3>
            </Col>
            {isLoading && <SpinnerModel />}
            <Card>
              <CardBody>
                <Row>
                  <Col
                    className="mb-3"
                    xs={12}
                    md={{ span: 4, offset: 8 }}
                    lg={{ span: 3, offset: 9 }}
                  >
                    <button
                      className="btn btn-danger mx-1"
                      onClick={handleBackClick}
                    >
                      Back
                    </button>
                    <ButtonDropdown
                      direction="down"
                      isOpen={drp_up}
                      toggle={() => setDrp_up(!drp_up)}
                    >
                      <Button
                        disabled={
                          !(checkPermission(permissionObj, pageName, PERMISSION_ADD) ||
                            checkPermission(permissionObj, pageName, PERMISSION_EDIT))}
                        id="caret"
                        color="primary"
                        onClick={() => {
                          handleSaveClick(SAVE_AND_CLOSE);
                        }}
                      >
                        Save & Close
                      </Button>
                      <DropdownToggle caret color="primary">
                        <i className="mdi mdi-chevron-down" />
                      </DropdownToggle>
                      <DropdownMenu>
                        {checkPermission(permissionObj, pageName, PERMISSION_EDIT)
                          && <DropdownItem onClick={() => { handleSaveClick(SAVE) }}>Save</DropdownItem>
                        }
                        {checkPermission(permissionObj, pageName, PERMISSION_ADD)
                          && <DropdownItem onClick={() => { handleSaveClick(SAVE_AND_NEW) }}>Save & New</DropdownItem>
                        }
                      </DropdownMenu>
                    </ButtonDropdown>
                  </Col>
                </Row>
                <FormBuilder
                  ref={finalizeRef}
                  fields={UserFields}
                  editFormData={initialEditData}
                  masterData={masterData}
                  disabledFields={disabledFields}
                />
              </CardBody>
            </Card>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
}

export default AddUsers;
