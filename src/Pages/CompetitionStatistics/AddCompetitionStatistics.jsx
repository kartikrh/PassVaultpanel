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
  TAB_BANNER,
  TAB_COMPETITION_STATISTICS_TYPE,
} from "../../components/Common/Const";
import { addCompetitionStatisticsToDb, updateSavedState } from "../../Features/Tabs/competitionStatsSlice";
import axiosInstance from "../../Features/axios";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { convertObjtoFormData } from "../../components/Common/utilities";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import { compStatsFields } from "../../constants/FieldConst/CompetitionStats";
import { isEmpty } from "lodash";

const AddCompetitionStatistics = () => {
  const pageName = TAB_COMPETITION_STATISTICS_TYPE;
  const finalizeRef = useRef(null);
  const [drp_up, setDrp_up] = useState(false);
  const [initialEditData, setInitialEditData] = useState(undefined);
  const [currentSaveAction, setCurrentSaveAction] = useState(undefined);
  const { isSaved, isLoading } = useSelector((state) => state.tabsData.banner);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  const dispatch = useDispatch();
  let navigate = useNavigate();
  const location = useLocation();
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [masterData, setMasterData] = useState({});
  const [competitionStatisticsTypeId, setCompetitionStatisticsTypeId] = useState(location.state?.competitionStatisticsTypeId || 0);
  const [fields, setFields] = useState(compStatsFields || [])
  useEffect(() => {
    if (competitionStatisticsTypeId !== 0) {
      fetchData(competitionStatisticsTypeId);
    }
  }, [competitionStatisticsTypeId]);

  useEffect(() => {
    if (!isEmpty(permissionObj) && !checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard");
    }
    fetchMasterData();
  }, [permissionObj]);

  useEffect(() => {
    if (isSaved) {
      dispatch(updateSavedState(undefined));
      if (currentSaveAction === SAVE_AND_CLOSE) {
        navigate("/competitionStatistics");
      } else if (currentSaveAction === SAVE_AND_NEW) {
        setInitialEditData({});
        setCompetitionStatisticsTypeId("0");
        finalizeRef.current.resetForm();
      }
      setCurrentSaveAction(undefined);
    }
  }, [isSaved]);

  const fetchData = async (competitionStatisticsTypeId) => {
    await axiosInstance
      .post("/admin/competitionStatisticsType/byId", { competitionStatisticsTypeId })
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

  useEffect(() => {
    fetchMasterData()
  }, [])

  const fetchMasterData = async () => {
    setIsApiLoading(true);
    setIsApiLoading(true);
    axiosInstance.post('/admin/commentary/eventTypeList', {})
        .then((response) => {
            const formattedData = response?.result?.map(item => {
                return { label: item?.eventType, value: item?.eventTypeId }
            })
            setMasterData((preData) => ({
                ...preData,
                "eventTypeId": formattedData,
            }));
            setIsApiLoading(false);
        }).catch((error) => {
            dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
            setIsApiLoading(false);
        });
    };
  
  const handleFormBDataChange = (val) => {
    if(val?.isPermanent){
      const filteredFields = compStatsFields.filter(obj => obj.name !== "startDate" && obj.name !== "endDate")
      setFields(filteredFields)
    }else if (!val?.isPermanent){
      setFields(compStatsFields)
    }
  };

  const handleSaveClick = async (saveAction) => {
    let dataToSave = finalizeRef.current.finalizeData();
    if(Number(dataToSave.displayOrder) == null){
        dispatch(
          updateToastData({
            data: "Display order should be integer",
            title: "Display order should be integer",
            type: ERROR,
          })
        );
    }
    if (dataToSave) {
        dataToSave = {
            ...dataToSave,
            displayOrder: Number(dataToSave.displayOrder),
        };
      const extraData = {
        competitionStatisticsTypeId: competitionStatisticsTypeId,
      };
      dispatch(
        addCompetitionStatisticsToDb({...dataToSave, ...extraData })
      );
      setCurrentSaveAction(saveAction);
    }
  };
  const handleBackClick = () => {
    navigate("/competitionStatistics");
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Row>
            <Col xs={12} md={8} lg={9}>
              <h3 className="modal-header-title">Competition Statistics</h3>
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
                  fields={fields}
                  masterData={masterData}
                  editFormData={initialEditData}
                  onFormDataChange={handleFormBDataChange}
                />
              </CardBody>
            </Card>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default AddCompetitionStatistics;
