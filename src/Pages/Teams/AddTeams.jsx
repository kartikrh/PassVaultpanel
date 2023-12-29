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
import {
  SAVE,
  SAVE_AND_CLOSE,
  SAVE_AND_NEW,
} from "../../components/Common/Const";
import { addTeamToDb } from "../../Features/Tabs/teamSlice";
import axiosInstance from "../../Features/axios";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { convertObjtoFormData } from "../../components/Common/utilities";

const formatMultiSelectDataPlayers = (inputList) => {
  const outputList = [];

  inputList.forEach((item) =>
    item.displayOrder !== undefined
      ? (outputList[item.displayOrder - 1] = item.playerId)
      : outputList.push(item.playerId)
  );

  return outputList;
};

function AddTeams() {
  const finalizeRef = useRef(null);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [drp_up, setDrp_up] = useState(false);
  const [initialEditData, setInitialEditData] = useState(undefined);
  const [currentSaveAction, setCurrentSaveAction] = useState(undefined);
  const [masterData, setMasterData] = useState({});
  const [disabledFields, setDisabledFields] = useState({});
  const { isSaved, isLoading, error } = useSelector(
    (state) => state.tabsData.team
  );
  const dispatch = useDispatch();
  let navigate = useNavigate();
  const location = useLocation();
  const teamId = location.state?.userId || "0";

  useEffect(() => {
    fetchMasterData();
  }, []);

  useEffect(() => {
    if (teamId !== "0") {
      fetchData(teamId);
      setDisabledFields({
        parentId: true,
        displayType: true,
      });
    }
  }, [teamId]);

  useEffect(() => {
    if (isSaved) {
      if (currentSaveAction === SAVE)
        setSnackbarMessage("Data saved successfully!");
      else if (currentSaveAction === SAVE_AND_CLOSE) navigate("/teams");
      else if (currentSaveAction === SAVE_AND_NEW)
        finalizeRef.current.resetForm();
    }
  });

  const fetchData = async (id) => {
    await axiosInstance
      .post("/admin/team/byId", { teamId })
      .then((response) => {
        setInitialEditData({
          ...response?.result,
          players: formatMultiSelectDataPlayers(response?.result?.players)
        });
      })
      .catch((error) => {
        // setIsLoading(false)
      });
  };

  const fetchMasterData = async () => {
    await axiosInstance
      .post("/admin/eventType/all")
      .then((response) => {
        setMasterData((preData) => ({
          ...preData,
          eventTypeId: response.result?.map((item) => {
            return { label: item.eventType, value: item.eventTypeId };
          }),
        }));
      })
      .catch((error) => {
        // setIsLoading(false)
      });

    await axiosInstance
      .post("/admin/player/all")
      .then((response) => {
        setMasterData((preData) => ({
          ...preData,
          players: response.result?.map((item) => {
            return { label: item.playerName, value: item.playerId };
          }),
        }));
      })
      .catch((error) => {
        // setIsLoading(false)
      });
  };
  const handleSaveClick = async (saveAction) => {
    const dataToSave = finalizeRef.current.finalizeData()
    if (dataToSave) {
        const extraData = {
            teamId
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
                        <DropdownItem
                          onClick={() => {
                            handleSaveClick(SAVE);
                          }}
                        >
                          Save
                        </DropdownItem>
                        <DropdownItem
                          onClick={() => {
                            handleSaveClick(SAVE_AND_NEW);
                          }}
                        >
                          Save & New
                        </DropdownItem>
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
