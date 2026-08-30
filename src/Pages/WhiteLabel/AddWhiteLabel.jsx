import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FormBuilder from "../../components/Common/Reusables/FormBuilder";
import { WhiteLabelField } from "../../constants/FieldConst/WhiteLabelConst";
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
  WHITE_LABEL,
  SWITCH, SELECT,
} from "../../components/Common/Const";
import {
  addWhiteLabelToDb,
  updateSavedState,
} from "../../Features/Tabs/WhiteLabelSlice";
import axiosInstance from "../../Features/axios";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import { isEmpty } from "lodash";

const AddWhiteLabel = () => {
  const pageName = WHITE_LABEL;
  const finalizeRef = useRef(null);
  const [drp_up, setDrp_up] = useState(false);
  const [initialEditData, setInitialEditData] = useState(undefined);
  const [currentSaveAction, setCurrentSaveAction] = useState(undefined);
  const [masterData, setMasterData] = useState({});
  const { isSaved, isLoading } = useSelector(
    (state) => state.tabsData.whiteLabel
  );
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  const dispatch = useDispatch();
  let navigate = useNavigate();
  const location = useLocation();
  const [whiteLabelId, setwhiteLabelId] = useState(
    location.state?.whiteLabelId || "0"
  );

  useEffect(() => {
    if (whiteLabelId !== 0) {
      fetchData(whiteLabelId);
    }
  }, [whiteLabelId]);

  useEffect(() => {
    fetchMailSettings();
  }, []);

  const fetchMailSettings = async () => {
    await axiosInstance
      .post("/admin/mailSettings/all", {})
      .then((response) => {
        const mailSettingOptions = (response?.result || []).map((item) => ({
          label: item.email,
          value: item.id,
        }));
        setMasterData((preData) => ({
          ...preData,
          mailSettingId: mailSettingOptions,
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

  useEffect(() => {
    if (!isEmpty(permissionObj) && !checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard");
    }
  }, [permissionObj]);

  useEffect(() => {
    if (isSaved) {
      dispatch(updateSavedState(undefined));
      if (currentSaveAction === SAVE_AND_CLOSE) {
        navigate("/whiteLabel");
      } else if (currentSaveAction === SAVE_AND_NEW) {
        setInitialEditData({});
        setwhiteLabelId("0");
        finalizeRef.current.resetForm();
      }
      setCurrentSaveAction(undefined);
    }
  }, [isSaved]);

  const fetchData = async (whiteLabelId) => {
    await axiosInstance
      .post("/admin/whitelabel/byId", { id: whiteLabelId })
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

  const handleSaveClick = async (saveAction) => {
    const dataToSave = finalizeRef.current.finalizeData();
    if (dataToSave) {
      const extraData = {
        id: whiteLabelId,
        // isRecatchEnable: dataToSave?.isRecatchEnable || false,
        // isGoogleLogin: dataToSave?.isGoogleLogin || false,
        // isFacebookLogin: dataToSave?.isFacebookLogin || false,
        // isSendMobileOTP: dataToSave?.isSendMobileOTP || false,
        // isSendMailOTP: dataToSave?.isSendMailOTP || false,
        // isDemoClientLogin: dataToSave?.isDemoClientLogin || false,
        // isDemoClientEnableInIOS: dataToSave?.isDemoClientEnableInIOS || false,
        // isDefault: dataToSave?.isDefault || false,
      };

      const completeData = {};
      WhiteLabelField.forEach((field) => {
        const { name, type } = field;
        if (!name) return;
  
        let value = dataToSave[name];
        if (value === "" || value == null) {
          value = null;
        }
  
        if (type === SELECT) {
          completeData[name] = value ?? 0;
        } else if (type === SWITCH) {
          completeData[name] = value ?? false;
        } else {
          completeData[name] = value ?? null;
        }
      });
      dispatch(addWhiteLabelToDb({ ...completeData, ...extraData }));
      setCurrentSaveAction(saveAction);
    }
  };
  const handleBackClick = () => {
    navigate("/whiteLabel");
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Row>
            <Col xs={12} md={8} lg={9}>
              <h3 className="modal-header-title">White Label</h3>
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
                  fields={WhiteLabelField}
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
};

export default AddWhiteLabel;
