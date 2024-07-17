import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FormBuilder from "../../components/Common/Reusables/FormBuilder";
import { NotificationConst } from "../../constants/FieldConst/NotificationConst";
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
import {
  ERROR,
  PERMISSION_ADD,
  PERMISSION_EDIT,
  PERMISSION_VIEW,
  SAVE,
  SAVE_AND_CLOSE,
  SAVE_AND_NEW,
  TAB_NOTIFICATION,
} from "../../components/Common/Const";
import {
  addNotificationToDb,
  updateSavedState,
} from "../../Features/Tabs/addNotificationSlice";
import axiosInstance from "../../Features/axios";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { checkPermission, convertDateUTCToLocal } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";

function AddNotification() {
  const pageName = TAB_NOTIFICATION;
  const finalizeRef = useRef(null);
  const [drp_up, setDrp_up] = useState(false);
  const [initialEditData, setInitialEditData] = useState(undefined);
  const [masterData, setMasterData] = useState({});
  const [currentSaveAction, setCurrentSaveAction] = useState(undefined);
  const { isSaved, isLoading } = useSelector(
    (state) => state.tabsData.notification
  );
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  const dispatch = useDispatch();
  let navigate = useNavigate();
  const location = useLocation();
  const [notificationId, setdisplayStatusId] = useState(
    location.state?.notificationId || "0"
  );

  useEffect(() => {
    if (notificationId !== "0") {
      fetchData(notificationId);
    }
  }, [notificationId]);

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard");
    }
    fetchMasterData()
  }, []);

  useEffect(() => {
    if (isSaved) {
      dispatch(updateSavedState(undefined));
      if (currentSaveAction === SAVE_AND_CLOSE) navigate("/notification");
      else if (currentSaveAction === SAVE_AND_NEW) {
        setInitialEditData({});
        setdisplayStatusId("0");
        finalizeRef.current.resetForm();
      }
      setCurrentSaveAction(undefined);
    }
  }, [isSaved]);

  const fetchData = async (notificationId) => {
    await axiosInstance
      .post("/admin/notification/byId", { notificationId })
      .then((response) => {
        setInitialEditData(response?.result);
      })
      .catch((error) => {
        dispatch(
          updateToastData({
            data: error?.message,
            title: error?.title,
            type: ERROR,
          })
        );
      });
  };

  const fetchMasterData = async () => {
    axiosInstance
      .post("admin/notification/eventList", {})
      .then((response) => {
        setMasterData((prevData) => ({
          ...prevData,
          commentaryId: response?.result?.map((item) => {
            return { label: `${item.eventName} - ${item.eventRefId} - ${convertDateUTCToLocal(item?.eventDate, "index")}`, value: item.commentaryId };
          }),
        }));
      })
      .catch((error) => {
        dispatch(
          updateToastData({
            data: error?.message,
            title: error?.title,
            type: ERROR,
          })
        );
      });
  };

  const handleSaveClick = async (saveAction) => {
    const dataToSave = finalizeRef.current.finalizeData();
    if (dataToSave) {
      const extraData = {
        notificationId: notificationId,
        "isSendNow": dataToSave?.isSendNow ? dataToSave.isSendNow : false,
      };
      dispatch(addNotificationToDb({ ...dataToSave, ...extraData }));
      setCurrentSaveAction(saveAction);
    }
  };

  const handleBackClick = () => {
    navigate("/notification");
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Row>
            <Col xs={12} md={8} lg={9}>
              <h3>Notification</h3>
            </Col>
            <Card>
              <CardBody>
                {isLoading && <SpinnerModel />}
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
                          !(
                            checkPermission(
                              permissionObj,
                              pageName,
                              PERMISSION_ADD
                            ) ||
                            checkPermission(
                              permissionObj,
                              pageName,
                              PERMISSION_EDIT
                            )
                          )
                        }
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
                        {checkPermission(
                          permissionObj,
                          pageName,
                          PERMISSION_EDIT
                        ) && (
                          <DropdownItem
                            onClick={() => {
                              handleSaveClick(SAVE);
                            }}
                          >
                            Save
                          </DropdownItem>
                        )}
                        {checkPermission(
                          permissionObj,
                          pageName,
                          PERMISSION_ADD
                        ) && (
                          <DropdownItem
                            onClick={() => {
                              handleSaveClick(SAVE_AND_NEW);
                            }}
                          >
                            Save & New
                          </DropdownItem>
                        )}
                      </DropdownMenu>
                    </ButtonDropdown>
                  </Col>
                </Row>
                <FormBuilder
                  ref={finalizeRef}
                  fields={NotificationConst}
                  editFormData={initialEditData}
                  masterData={masterData}
                />
              </CardBody>
            </Card>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
}

export default AddNotification;
