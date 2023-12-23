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
import {
  SAVE,
  SAVE_AND_CLOSE,
  SAVE_AND_NEW,
} from "../../components/Common/Const";
import { addEventToDb } from "../../Features/Events/eventsSlice";
import axiosInstance from "../../Features/axios";

function AddEvents() {
  const finalizeRef = useRef(null);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [drp_up, setDrp_up] = useState(false);
  const [initialEditData, setInitialEditData] = useState(undefined);
  const [currentSaveAction, setCurrentSaveAction] = useState(undefined);
  const [masterData, setMasterData] = useState({});
  const [disabledFields, setDisabledFields] = useState({});
  const { isSaved, isLoading, error } = useSelector(
    (state) => state.eventsData.event
  );
  const dispatch = useDispatch();
  let navigate = useNavigate();
  const location = useLocation();
  const eventId = location.state?.userId || "0";

  useEffect(() => {
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
      if (currentSaveAction === SAVE)
        setSnackbarMessage("Data saved successfully!");
      else if (currentSaveAction === SAVE_AND_CLOSE) navigate("/events");
      else if (currentSaveAction === SAVE_AND_NEW)
        finalizeRef.current.resetForm();
    }
  });

  const fetchData = async (id) => {
    await axiosInstance
      .post("/admin/events/byId", { eventId })
      .then((response) => {
        setInitialEditData(response?.result);
      })
      .catch((error) => {
        // setIsLoading(false)
      });
  };

  const fetchMasterData = async () => {
    await axiosInstance
      .post("/admin/events/all")
      .then((response) => {
        console.log("response", response);
        setMasterData((preData)=>({
            ...preData,
            eventId: response.result?.map((item) => {
            return { label: item.eventType, value: item.eventTypeId };
          }),
        }));
      })
      .catch((error) => {
        // setIsLoading(false)
      });
    await axiosInstance
      .post("/admin/competition/all")
      .then((response) => {
        console.log("response", response);
        setMasterData((preData)=>({
            ...preData,
            competitionId: response.result?.map((item) => {
            return { label: item.competition, value: item.competitionId };
          }),
        }));
        // setMasterData((preData) => ({
        //     ...preData,
        //     "team1Id": formattedData,
        //     "team2Id": formattedData
        // }));
      })
      .catch((error) => {
        // setIsLoading(false)
      });
  };
  const handleSaveClick = async (saveAction) => {
    setCurrentSaveAction(saveAction);
    dispatch(addEventToDb({ ...finalizeRef.current.finalizeData(), eventId }));
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
              <h3>Events </h3>
            </Col>

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
                  fields={EventFields}
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

export default AddEvents;
