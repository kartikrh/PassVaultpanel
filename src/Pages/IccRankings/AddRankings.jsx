import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FormBuilder from "../../components/Common/Reusables/FormBuilder";
import { IccRankingsFields } from '../../constants/FieldConst/IccRankingsListConst'
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
import { ERROR, PERMISSION_ADD, PERMISSION_EDIT, PERMISSION_VIEW, SAVE, SAVE_AND_CLOSE, SAVE_AND_NEW, TAB_COMPETITION, TAB_ICC_RANKINGS } from '../../components/Common/Const';
import { addCompetitionToDb, updateSavedState } from "../../Features/Tabs/competitionSlice";
import axiosInstance from "../../Features/axios";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { convertObjtoFormData2 } from "../../components/Common/utilities";
import { checkPermission, convertDateLocalToUTC } from '../../components/Common/Reusables/reusableMethods';
import { updateToastData } from "../../Features/toasterSlice";
import { isEmpty } from "lodash";
import { addIccRankingToDb } from "../../Features/Tabs/addRankings";

function AddRankings() {
  const pageName = TAB_ICC_RANKINGS
  const finalizeRef = useRef(null);
  const [drp_up, setDrp_up] = useState(false);
  const [savedFormState, setSavedFormState] = useState({});
  const [initialEditData, setInitialEditData] = useState(undefined);
  const [currentSaveAction, setCurrentSaveAction] = useState(undefined);
  const [masterData, setMasterData] = useState({});
  const [disabledFields, setDisabledFields] = useState({});
  const { isSaved, isLoading } = useSelector(
    (state) => state.tabsData.iccRankings
  );
  const permissionObj = useSelector(state => state.auth?.tabPermissionList);
  const dispatch = useDispatch();
  let navigate = useNavigate();
  const location = useLocation();
  const [id, setId] = useState(location.state?.userId || "0");

  console.log("savedFormState", savedFormState)

  useEffect(() => {
    if (!isEmpty(permissionObj) && !checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard")
    }
    matchList();
  }, [permissionObj]);

  useEffect(() => {
    if (id !== "0") {
        fetchData(id);
    }
  }, [])


  useEffect(() => {
    if (isSaved) {
      dispatch(updateSavedState(undefined))
      if (currentSaveAction === SAVE_AND_CLOSE){
        navigate("/iccRanking")
      }
      else if (currentSaveAction === SAVE_AND_NEW) {
        setInitialEditData({})
        setId("0")
        finalizeRef.current.resetForm();
      }
      setCurrentSaveAction(undefined)
    }
  }, [isSaved]);

  const fetchData = async (id) => {
    await axiosInstance
      .post("admin/iccRanking/byId", { id })
      .then((response) => {
        setInitialEditData(response?.result);
      })
      .catch((error) => {
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
      });
  };
  
  const handleSaveClick = async (saveAction) => {
    const dataToSave = finalizeRef.current.finalizeData()
      setCurrentSaveAction(saveAction);
      dispatch(addIccRankingToDb({ ...dataToSave, id: id }))
    //   dispatch(addIccRankingToDb(convertObjtoFormData2({ ...dataToSave })))
  };

  const handleBackClick = () => {
    navigate("/iccRanking");
  };

  const updateSavedFormState = (newFormData) => {
    setSavedFormState(prevState => {
        const merged = { ...prevState, ...newFormData };
        return merged;
    });
  };

  const handleFormDataChange = (newFormData) => {
    console.log("newFormData", newFormData)
      // setSavedFormState({...savedFormState, ...newFormData});
      const allowedFields = IccRankingsFields.map(field => field.name).filter(Boolean);
          const filteredData = Object.fromEntries(
              Object.entries(newFormData).filter(([key]) => allowedFields.includes(key))
          );
      updateSavedFormState(filteredData);
      if (newFormData["sportId"] !== savedFormState["sportId"]) {
          // setIsApiLoading(true);
          axiosInstance.post('/admin/list/teamList', { 'eventTypeId' : newFormData["sportId"] })
          .then((response) => {
              console.log("teamList", response)
              const formattedData = response?.result?.map(item => {
                  return { label: item?.teamName, value: item?.teamId }
              }).filter(element => element.value);
              setMasterData((preData) => ({
                  ...preData,
                  "teamId": formattedData,
              }));
              // setIsApiLoading(false);
          }).catch((error) => {
              dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
              // setIsApiLoading(false);
          });
      }    
      if (newFormData["teamId"] && (newFormData["teamId"] !== savedFormState["teamId"]) && newFormData["type"] == 2) {
          // setIsApiLoading(true);
          axiosInstance.post('/admin/list/playerList', { 'eventTypeId' : newFormData["sportId"] })
          .then((response) => {
              console.log("playerList", response)
              const formattedData = response?.result?.map(item => {
                  return { label: item?.playerName, value: item?.playerId }
              }).filter(element => element.value);
              setMasterData((preData) => ({
                  ...preData,
                  "playerId": formattedData,
              }));
              // setIsApiLoading(false);
          }).catch((error) => {
              dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
              // setIsApiLoading(false);
          });
      }    
        
  }

  const matchList = async () =>{
    axiosInstance.post('/admin/list/matchTypeList')
        .then((response) => {
            const formattedData = response?.result?.map(item => {
                return { label: item?.matchType, value: item?.matchTypeId }
            })
            console.log("formattedData", formattedData)
            setMasterData((preData) => ({
                ...preData,
                "matchTypeId": formattedData
            }));
            // setIsApiLoading(false);
        }).catch((error) => {
            dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
            // setIsApiLoading(false);
        });

        await axiosInstance
            .post("/admin/list/eventTypeList", {})
            .then((response) => {
                console.log("sportId", response)
                setMasterData((preData) => ({
                ...preData,
                sportId: response.result?.map((item) => {
                    return { label: item.eventType, value: item.eventTypeId };
                }),
                }));
            })
            .catch((error) => {
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
            });
  }

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Row>
            <Col xs={12} md={8} lg={9}>
              <h3 className="modal-header-title">ICC Rankings </h3>
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
                          && <DropdownItem onClick={() => { handleSaveClick(SAVE_AND_NEW); }}>Save & New</DropdownItem>
                        }
                      </DropdownMenu>
                    </ButtonDropdown>
                  </Col>
                </Row>
                <FormBuilder
                  ref={finalizeRef}
                  fields={IccRankingsFields}
                  editFormData={initialEditData}
                  masterData={masterData}
                  onFormDataChange={handleFormDataChange}
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

export default AddRankings;
