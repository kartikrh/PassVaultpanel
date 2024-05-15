import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FormBuilder from "../../components/Common/Reusables/FormBuilder";
import { TeamFields } from '../../constants/FieldConst/TeamConst'
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
import { ERROR, PERMISSION_ADD, PERMISSION_EDIT, PERMISSION_VIEW, SAVE, SAVE_AND_CLOSE, SAVE_AND_NEW, TAB_TEAMS } from '../../components/Common/Const';
import { addTeamToDb, updateSavedState } from "../../Features/Tabs/teamSlice";
import axiosInstance from "../../Features/axios";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { convertObjtoFormData } from "../../components/Common/utilities";
import { checkPermission } from '../../components/Common/Reusables/reusableMethods';
import { updateToastData } from "../../Features/toasterSlice";

const formatMultiSelectDataPlayers = (inputList) => {
  const outputList = [];

  inputList.forEach((item) =>
    item.displayOrder !== undefined
      ? (outputList[item.displayOrder - 1] = item.playerId)
      : outputList.push(item.playerId)
  );

  return outputList;
};

const formatMultiSelectDataCompetitions = (inputList) => {
  const outputList = [];

  inputList.forEach((item) =>
    item.displayOrder !== undefined
      ? (outputList[item.displayOrder - 1] = item.competitionId)
      : outputList.push(item.competitionId)
  );

  return outputList;
};

function AddTeams() {
  const pageName = TAB_TEAMS
  const finalizeRef = useRef(null);
  const [drp_up, setDrp_up] = useState(false);
  const [initialEditData, setInitialEditData] = useState(undefined);
  const [currentSaveAction, setCurrentSaveAction] = useState(undefined);
  const [eventType, setEventType] = useState(undefined);
  const [eventTypeList, setEventTypeList] = useState([]);
  const [masterData, setMasterData] = useState({});
  const [disabledFields, setDisabledFields] = useState({});
  const { isSaved, isLoading } = useSelector(
    (state) => state.tabsData.team
  );
  const permissionObj = useSelector(state => state.auth?.tabPermissionList);
  const dispatch = useDispatch();
  let navigate = useNavigate();
  const location = useLocation();
  const [teamId, setTeamId] = useState(location.state?.userId || "0");

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard")
    }
    fetchMasterData();
  }, []);

  useEffect(() => {
    if (teamId !== "0") {
      fetchData(teamId);
      setDisabledFields({
        // eventTypeId: true,
        // teamName: true,
        // teamShortName: true,
      });
    }
  }, [teamId]);

  useEffect(() => {
    if (isSaved) {
      dispatch(updateSavedState(undefined))
      if (currentSaveAction === SAVE_AND_CLOSE) navigate("/teams");
      else if (currentSaveAction === SAVE_AND_NEW) {
        setDisabledFields({})
        setInitialEditData({})
        setTeamId("0")
        finalizeRef.current.resetForm();
      }
      setCurrentSaveAction(undefined)
    }
  }, [isSaved]);

  const fetchData = async (id) => {
    await axiosInstance
      .post("/admin/team/byId", { teamId })
      .then((response) => {
        setInitialEditData({
          ...response?.result,
          playerId: formatMultiSelectDataPlayers(response?.result?.players),
          competitionId: formatMultiSelectDataCompetitions(response?.result?.competition)
        });
      })
      .catch((error) => {
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
      });
  };

  const fetchMasterData = async () => {
    await axiosInstance
      .post("/admin/team/eventTypeList", {})
      .then((response) => {
        setEventTypeList(response?.result)
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

    await axiosInstance
      .post("/admin/team/playerList", {})
      .then((response) => {
        setMasterData((preData) => ({
          ...preData,
          playerId: response.result?.map((item) => {
            return { label: item.playerName, value: item.playerId };
          }),
        }));
      })
      .catch((error) => {
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
      });
  };

  const onFormDataChange = (newFormData) => {
    if(newFormData?.eventTypeId && newFormData?.eventTypeId !== "0" && newFormData?.eventTypeId !== eventType?.eventTypeId) {
      const newEventType = eventTypeList.find(
        (item) => item.eventTypeId === newFormData.eventTypeId
      );
      setEventType(newEventType)
      if(newEventType?.eventTypeId) {
      axiosInstance
      .post("/admin/team/competitionListByEventTypeId", {isActive: true, eventTypeId: newEventType?.eventTypeId})
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

  }
  const handleSaveClick = async (saveAction) => {
    const dataToSave1 = finalizeRef.current.finalizeData()
    if (dataToSave1) {
      const extraData = {
        teamId
      }
      const dataToSave = {
        ...dataToSave1,
        teamColor: dataToSave1?.teamColor ? dataToSave1.teamColor : "#1677FF",
        backgroundColor: dataToSave1?.backgroundColor ? dataToSave1.backgroundColor : "#1677FF" 
      }
      setCurrentSaveAction(saveAction);
      dispatch(addTeamToDb(convertObjtoFormData({ ...dataToSave, ...extraData })))
    }
  };
  const handleBackClick = () => {
    navigate("/teams");
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Row>
            <Col xs={12} md={8} lg={9}>
              <h3>Teams </h3>
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
                  fields={TeamFields}
                  editFormData={initialEditData}
                  masterData={masterData}
                  disabledFields={disabledFields}
                  onFormDataChange={onFormDataChange}
                />
              </CardBody>
            </Card>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
}

export default AddTeams;
