import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FormBuilder from "../../components/Common/Reusables/FormBuilder";
import { CompetitionFields } from '../../constants/FieldConst/CompetitionConst'
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
import { addCompetitionToDb } from "../../Features/Tabs/competitionSlice";
import axiosInstance from "../../Features/axios";

const convertObjtoFormData = (obj) => {
  const formData = new FormData();
  for (const key in obj) {
    if (key === "image") {
      typeof obj[key] !== "string" && formData.append(key, obj[key]);
      continue;
    }
    formData.append(key, obj[key]);
  }
  return formData
}


function AddCompetitions() {
  const finalizeRef = useRef(null);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [drp_up, setDrp_up] = useState(false);
  const [initialEditData, setInitialEditData] = useState(undefined);
  const [currentSaveAction, setCurrentSaveAction] = useState(undefined);
  const [masterData, setMasterData] = useState({});
  const [disabledFields, setDisabledFields] = useState({});
  const { isSaved, isLoading, error } = useSelector(
    (state) => state.competitionsData.competition
  );
  const dispatch = useDispatch();
  let navigate = useNavigate();
  const location = useLocation();
  const competitionId = location.state?.userId || "0";

  useEffect(() => {
    fetchMasterData();
  }, []);

  useEffect(() => {
    if (competitionId !== "0") {
      fetchData(competitionId);
      setDisabledFields({
        parentId: true,
        displayType: true,
      });
    }
  }, [competitionId]);

  useEffect(() => {
    if (isSaved) {
      if (currentSaveAction === SAVE)
        setSnackbarMessage("Data saved successfully!");
      else if (currentSaveAction === SAVE_AND_CLOSE) navigate("/competition");
      else if (currentSaveAction === SAVE_AND_NEW)
        finalizeRef.current.resetForm();
    }
  });

  const fetchData = async (id) => {
    await axiosInstance
      .post("/admin/competition/byId", { competitionId })
      .then((response) => {
        setInitialEditData(response?.result);
      })
      .catch((error) => {
        // setIsLoading(false)
      });
  };

  const fetchMasterData = async () => {
    await axiosInstance
      .post("/admin/eventType/all")
      .then((response) => {
        console.log("response", response);
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
  };
  const handleSaveClick = async (saveAction) => {
    setCurrentSaveAction(saveAction);
    dispatch(addCompetitionToDb(convertObjtoFormData({ ...finalizeRef.current.finalizeData(), competitionId })));
  };
  const handleBackClick = () => {
    navigate("/competition");
  };
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Row>
            <Col xs={12} md={8} lg={9}>
              <h3>Competitions </h3>
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
                  fields={CompetitionFields}
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

export default AddCompetitions;
