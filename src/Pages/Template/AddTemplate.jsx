import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FormBuilder from "../../components/Common/Reusables/FormBuilder";
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
  TAB_TEMPLATE,
  SELECT, SWITCH,
} from "../../components/Common/Const";
import {
  addTemplateToDb,
  updateSavedState,
} from "../../Features/Tabs/addTemplateSlice";
import axiosInstance from "../../Features/axios";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import { TemplateConst } from "../../constants/FieldConst/TemplateConst";
import { isEmpty } from "lodash";

function AddTemplate() {
  const pageName = TAB_TEMPLATE;
  const finalizeRef = useRef(null);
  const [drp_up, setDrp_up] = useState(false);
  const [initialEditData, setInitialEditData] = useState(undefined);
  const [masterData, setMasterData] = useState({});
  const [currentSaveAction, setCurrentSaveAction] = useState(undefined);
  const { isSaved, isLoading } = useSelector(
    (state) => state.tabsData.template
  );
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  const dispatch = useDispatch();
  let navigate = useNavigate();
  const location = useLocation();
  const [templateId, setdisplayStatusId] = useState(
    location.state?.templateId || "0"
  );

  useEffect(() => {
    if (templateId !== "0") {
      fetchData(templateId);
    }
  }, [templateId]);

  useEffect(() => {
    if (!isEmpty(permissionObj) && !checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard");
    }
  }, [permissionObj]);

  useEffect(() => {
    if (isSaved) {
      dispatch(updateSavedState(undefined));
      if (currentSaveAction === SAVE_AND_CLOSE) navigate("/template");
      else if (currentSaveAction === SAVE_AND_NEW) {
        setInitialEditData({});
        setdisplayStatusId("0");
        finalizeRef.current.resetForm();
      }
      setCurrentSaveAction(undefined);
    }
  }, [isSaved]);

  const fetchData = async (templateId) => {
    await axiosInstance
      .post("/admin/template/byId", { templateId })
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

  const handleFormDataChange = async (newFormData) => {
    if (
      newFormData?.templateType != undefined &&
      newFormData?.templateType != 0
    ) {
      if (newFormData?.templateType == 1) {
        setMasterData((preData) => ({
          ...preData,
          type: [{ label: "Registration Otp", value: 1 }],
        }));
      } else if (newFormData?.templateType == 2) {
        setMasterData((preData) => ({
          ...preData,
          type: [
            { label: "Welcome", value: 1 },
            { label: "Sign In", value: 2 },
            { label: "Reset 2FA", value: 3 },
            { label: "Day-End Activity", value: 4 },
          ],
        }));
      }
    }
  };

  const handleSaveClick = async (saveAction) => {
    const dataToSave = finalizeRef.current.finalizeData();
    if (dataToSave) {
      const extraData = {
        templateId: templateId,
        // isDefault: dataToSave?.isDefault || false,
        // isActive: dataToSave?.isActive || false,
      };

      //to send all the keys in payload to db
      const completeData = {};
      TemplateConst.forEach((field) => {
        const { name, type } = field;
        if (!name) return;
        let value = dataToSave[name];
        if (value === "" || value === undefined) {
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
      
      dispatch(addTemplateToDb({...completeData,...extraData }));
      setCurrentSaveAction(saveAction);
    }
  };

  const handleBackClick = () => {
    navigate("/template");
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Row>
            <Col xs={12} md={8} lg={9}>
              <h3 className="modal-header-title">Template</h3>
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
                  fields={TemplateConst}
                  editFormData={initialEditData}
                  masterData={masterData}
                  onFormDataChange={handleFormDataChange}
                />
              </CardBody>
            </Card>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
}

export default AddTemplate;
