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
import { ERROR, PERMISSION_ADD, PERMISSION_EDIT, PERMISSION_VIEW, SAVE, SAVE_AND_CLOSE, SAVE_AND_NEW, TAB_COMPETITION } from '../../components/Common/Const';
import { addCompetitionToDb, updateSavedState } from "../../Features/Tabs/competitionSlice";
import axiosInstance from "../../Features/axios";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { convertObjtoFormData } from "../../components/Common/utilities";
import { checkPermission, convertDateLocalToUTC } from '../../components/Common/Reusables/reusableMethods';
import { updateToastData } from "../../Features/toasterSlice";
import { isEmpty } from "lodash";

function AddCompetitions() {
  const pageName = TAB_COMPETITION
  const finalizeRef = useRef(null);
  const [drp_up, setDrp_up] = useState(false);
  const [initialEditData, setInitialEditData] = useState(undefined);
  const [currentSaveAction, setCurrentSaveAction] = useState(undefined);
  const [masterData, setMasterData] = useState({});
  const [disabledFields, setDisabledFields] = useState({});
  const { isSaved, isLoading } = useSelector(
    (state) => state.tabsData.competition
  );
  const permissionObj = useSelector(state => state.auth?.tabPermissionList);
  const dispatch = useDispatch();
  let navigate = useNavigate();
  const location = useLocation();
  const [competitionId, setCompetitionId] = useState(location.state?.userId || "0");

  useEffect(() => {
    if (!isEmpty(permissionObj) && !checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard")
    }
    fetchMasterData();
  }, [permissionObj]);

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
      dispatch(updateSavedState(undefined))
      if (currentSaveAction === SAVE_AND_CLOSE) navigate("/competition");
      else if (currentSaveAction === SAVE_AND_NEW) {
        setInitialEditData({})
        setCompetitionId("0")
        finalizeRef.current.resetForm();
      }
      setCurrentSaveAction(undefined)
    }
  }, [isSaved]);

  const fetchData = async (id) => {
    await axiosInstance
      .post("/admin/competition/byId", { competitionId })
      .then((response) => {
        setInitialEditData(response?.result);
      })
      .catch((error) => {
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
      });
  };

  const fetchMasterData = async () => {
    await axiosInstance
      .post("/admin/competition/eventTypeList", {})
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

    await axiosInstance
    .post("/admin/competition/getMatchTypes", {})
    .then((response) => {
      setMasterData((preData) => ({
        ...preData,
        matchTypeId: response.result?.map((item) => {
          return { label: item?.matchType, value: item?.matchTypeId };
        }),
      }));
    })
    .catch((error) => {
      dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
    });

    await axiosInstance
    .post("/admin/competition/pythonAPIs", {})
    .then((response) => {
      setMasterData((preData) => ({
        ...preData,
        pythonId: response.result?.map((item) => {
          return { label: item?.developerName, value: item?.id };
        }),
      }));
    })
    .catch((error) => {
      dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
    });

    await axiosInstance
      .post("/admin/list/countryList", {})
      .then((response) => {
        setMasterData((preData) => ({
          ...preData,
          countryId: response.result?.map((item) => {
            return { label: item.countryName, value: item.countryId };
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
    const dataToSave = finalizeRef.current.finalizeData()
    if (dataToSave) {
      const extraData = {
        competitionId,
        // isTrending: dataToSave?.isTrending || false,
        // tpId: dataToSave?.tpId || null,
        // isVirtual: dataToSave?.isVirtual || false,
        // matchTypeId: dataToSave?.matchTypeId || null,
        // pythonId: dataToSave?.pythonId || null,
        // isMen: dataToSave?.isMen || false,
        // isEventSnap: dataToSave?.isEventSnap || false,
        // isPointTable: dataToSave?.isPointTable || false,
        // winPoint: dataToSave?.winPoint || null,
        // tiePoint: dataToSave?.tiePoint || null,
        // lossPoint: dataToSave?.lossPoint || null,
        // cancelPoint: dataToSave?.cancelPoint || null,
        // drsCount: dataToSave?.drsCount || null,
        endDate: convertDateLocalToUTC(dataToSave.endDate),
        startDate: convertDateLocalToUTC(dataToSave.startDate),
      }
      setCurrentSaveAction(saveAction);
      dispatch(addCompetitionToDb(convertObjtoFormData({ ...dataToSave, ...extraData })))
    }
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
              <h3 className="modal-header-title">Competitions </h3>
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
