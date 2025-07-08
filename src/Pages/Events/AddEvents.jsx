import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FormBuilder from "../../components/Common/Reusables/FormBuilder";
import { EventFields } from "../../constants/FieldConst/EventConst";
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
import { ERROR, PERMISSION_ADD, PERMISSION_EDIT, PERMISSION_VIEW, SAVE, SAVE_AND_CLOSE, SAVE_AND_NEW, TAB_EVENT, SELECT, SWITCH } from '../../components/Common/Const';
import { addEventToDb, updateSavedState } from "../../Features/Tabs/eventsSlice";
import axiosInstance from "../../Features/axios";
import { convertDateLocalToUTC } from '../../components/Common/Reusables/reusableMethods';
import SpinnerModel from "../../components/Model/SpinnerModel";
import { checkPermission } from '../../components/Common/Reusables/reusableMethods';
import { updateToastData } from "../../Features/toasterSlice";
import moment from "moment";

function AddEvents() {
  const pageName = TAB_EVENT
  const finalizeRef = useRef(null);
  const [drp_up, setDrp_up] = useState(false);
  const [initialEditData, setInitialEditData] = useState(undefined);
  const [currentSaveAction, setCurrentSaveAction] = useState(undefined);
  const [masterData, setMasterData] = useState({});
  const [disabledFields, setDisabledFields] = useState({});
  const { isSaved, isLoading, error } = useSelector(
    (state) => state.tabsData.event
  );
  const permissionObj = useSelector(state => state.auth?.tabPermissionList);
  const dispatch = useDispatch();
  let navigate = useNavigate();
  const location = useLocation();
  const [eventId, setEventId] = useState(location.state?.userId || "0")
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard")
    }
    fetchMasterData();
  }, []);

  useEffect(() => {
    if (eventId !== "0") {
      fetchData(eventId);
      setDisabledFields({
        parentId: true,
        displayType: true,
      });
    }
  }, [eventId]);

  useEffect(() => {
    if (isSaved) {
      dispatch(updateSavedState(undefined))
      if (currentSaveAction === SAVE_AND_CLOSE) navigate("/events");
      else if (currentSaveAction === SAVE_AND_NEW) {
        setInitialEditData({})
        setEventId("0")
        finalizeRef.current.resetForm();
      }
      setCurrentSaveAction(undefined)
    }
  }, [isSaved]);

  const fetchData = async (id) => {
    await axiosInstance
      .post("/admin/events/byId", { eventId })
      .then((response) => {
        setInitialEditData({ ...response?.result });
      })
      .catch((error) => {
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
      });
  };

  const fetchMasterData = async () => {
    await axiosInstance
      .post("/admin/events/eventTypeList", {})
      .then((response) => {
        setMasterData((preData) => ({
          ...preData,
          eventTypeId: response.result?.map((item) => {
            return { label: item.eventType, value: item.eventTypeId };
          }),
        }));
      })
      .catch((error) => {
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
      });
  };
  const handleFormDataChange = async(newFormData) =>{
   if(newFormData?.eventTypeId != undefined && newFormData?.eventTypeId != 0){
    await axiosInstance
    .post("/admin/events/competitionList", {
      isActive:true,
      eventTypeId: newFormData?.eventTypeId
    })
    .then((response) => {
      setMasterData((preData) => ({
        ...preData,
        competitionId: response.result?.map((item) => {
          return { label: item.competition, value: item.competitionId };
        }),
      }));
    })
    .catch((error) => {
      dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
    });
   }
  }
  const handleSaveClick = async (saveAction) => {
    const dataToSave = finalizeRef.current.finalizeData()
    if (dataToSave) {
      const extraData = {
        eventId,
        eventDate: convertDateLocalToUTC(dataToSave.eventDate)
      }
      // const defaultData = {
      //   countryCode: "",
      //   timeZone: "",
      //   venue: ""
      // }
      const completeData = {};
      EventFields.forEach((field) => {
        const { name, type } = field;
        if (!name) return; 
        const value = dataToSave.hasOwnProperty(name) ? dataToSave[name] : null;
  
        if (type === SELECT) {
          completeData[name] = value ?? 0;
        } else if (type === SWITCH) {
          completeData[name] = value ?? false;
        } else {
          completeData[name] = value ?? null;
        }
      });
      setCurrentSaveAction(saveAction);
      dispatch(addEventToDb({ ...completeData, ...extraData }))
    }
  };

  const handleBackClick = () => {
    navigate("/events");
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Row>
            <Col xs={12} md={8} lg={9}>
              <h3 className="modal-header-title">Events </h3>
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
                  fields={EventFields}
                  editFormData={initialEditData}
                  masterData={masterData}
                  disabledFields={disabledFields}
                  onFormDataChange = {handleFormDataChange}
                />
              </CardBody>
            </Card>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
}

export default AddEvents;
