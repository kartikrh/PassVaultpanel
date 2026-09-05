import React, { useRef, useState, useEffect } from 'react'
import { useLocation, useNavigate } from "react-router-dom";
import FormBuilder from "../../components/Common/Reusables/FormBuilder";
import { ConfigFields } from "../../constants/FieldConst/ConfigConst";
import { useDispatch, useSelector } from "react-redux";
import { ERROR, PERMISSION_ADD, PERMISSION_EDIT, PERMISSION_VIEW, SAVE, SAVE_AND_CLOSE, SAVE_AND_NEW, TAB_CONFIG, SELECT, SWITCH } from '../../components/Common/Const';
import { addConfigToDB, updateSavedState } from "../../Features/Tabs/ConfigSlice";
import axiosInstance from "../../Features/axios";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { convertObjtoFormData } from "../../components/Common/utilities";
import { checkPermission } from '../../components/Common/Reusables/reusableMethods';
import { updateToastData } from "../../Features/toasterSlice";
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
import { isEmpty } from 'lodash';
import RevealConfigValueModal from "../../components/Model/RevealConfigValueModal";

const AddConfig = () => {
  const finalizeRef = useRef(null);
  let navigate = useNavigate();
  const handleBackClick = () => {
    navigate("/config");
  };

  const pageName = TAB_CONFIG
  const [drp_up, setDrp_up] = useState(false);
  const [disabledFields, setDisabledFields] = useState({});
  const [initialEditData, setInitialEditData] = useState(undefined);
  const [currentSaveAction, setCurrentSaveAction] = useState(undefined);
  const { isSaved, isLoading } = useSelector(state => state.tabsData.config);
  const permissionObj = useSelector(state => state.auth?.tabPermissionList);
  const dispatch = useDispatch();
  const location = useLocation();
  const [configId, setconfigId] = useState(location.state?.configId || "0");
  // Editing an existing config's value requires the same LOADDATAPASSWORD
  // check the list view's reveal-eye uses -- a brand new config (id "0")
  // has no existing value to protect, so it skips this gate.
  const [isValueRevealed, setIsValueRevealed] = useState(configId === "0");
  const [revealModalVisible, setRevealModalVisible] = useState(configId !== "0");

  useEffect(() => {
    // if (id !== "0") {
    //   fetchData(id);
    // }
    if (configId !== "0") {
        fetchData(configId);
        setDisabledFields({
            key: true,
        });
      }
  }, [configId]);

  const handleRevealConfigValue = async (password) => {
    const response = await axiosInstance.post('/admin/config/reveal', { configId, password });
    return response?.result?.value;
  };

  const handleValueRevealed = (value) => {
    setInitialEditData((prev) => ({ ...(prev || {}), value }));
    setIsValueRevealed(true);
  };

  // Fires after the reveal modal closes. If it closed without a successful
  // reveal (Close/cancel, not the Ok path), there's nothing editable to show
  // -- go back rather than leave the page stuck. Runs after render, so
  // isValueRevealed already reflects whether handleValueRevealed ran.
  useEffect(() => {
    if (!revealModalVisible && !isValueRevealed && configId !== "0") {
      handleBackClick();
    }
  }, [revealModalVisible]);

  useEffect(() => {
    if (!isEmpty(permissionObj) && !checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard")
    }
  }, [permissionObj]);

  useEffect(() => {
    if (isSaved) {
      dispatch(updateSavedState(undefined))
      if (currentSaveAction === SAVE_AND_CLOSE){
        navigate("/config")
      }
      else if (currentSaveAction === SAVE_AND_NEW) {
        setInitialEditData({})
        setDisabledFields({})
        setconfigId("0")
        finalizeRef.current.resetForm()
      }
      setCurrentSaveAction(undefined)
    }
  }, [isSaved]);

  const fetchData = async (configId) => {
    await axiosInstance.post('/admin/config/byId', { configId })
      .then((response) => {
        setInitialEditData(response?.result);
      }).catch((error) => {
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
      });
  };

  const handleSaveClick = async (saveAction) => {
    const dataToSave = finalizeRef.current.finalizeData()
    if (dataToSave) {
      const extraData = {
        configId: configId
      }
      const completeData = {};
      ConfigFields.forEach((field) => {
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
      dispatch(addConfigToDB({ ...completeData, ...extraData }));
      setCurrentSaveAction(saveAction);
    }
  };


  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Row>
            <Col xs={12} md={8} lg={9}>
              <h3 className="modal-header-title">Config </h3>
            </Col>
            {/* {isLoading && <SpinnerModel />} */}
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
                          !isValueRevealed ||
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
                {isValueRevealed ? (
                  <FormBuilder
                    ref={finalizeRef}
                    fields={ConfigFields}
                    editFormData={initialEditData}
                  // masterData={masterData}
                   disabledFields={disabledFields}
                  />
                ) : (
                  <div className="d-flex flex-column align-items-center py-5">
                    <span className="mb-3">Enter the password to view and edit this config's value.</span>
                    <button
                      className="btn btn-primary"
                      onClick={() => setRevealModalVisible(true)}
                    >
                      Verify Password
                    </button>
                  </div>
                )}
              </CardBody>
            </Card>
          </Row>
        </Container>
      </div>
      {revealModalVisible &&
        <RevealConfigValueModal
          visible={revealModalVisible}
          setVisible={setRevealModalVisible}
          configKey={initialEditData?.key}
          onSubmitPassword={handleRevealConfigValue}
          onRevealed={handleValueRevealed}
        />}
    </React.Fragment>
  )
}

export default AddConfig


