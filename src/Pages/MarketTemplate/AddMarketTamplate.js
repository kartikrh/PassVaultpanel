import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FormBuilder from "../../components/Common/Reusables/FormBuilder";
import { MarketTemplateFileds } from "../../constants/FieldConst/MarketTemplateConst";
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
  TAB_MARKET_TEMPLATE,
} from "../../components/Common/Const";
import {
  addMarketTemplateToDb,
  updateSavedState,
} from "../../Features/Tabs/marketTemplateSlice";
import axiosInstance from "../../Features/axios";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";

const fetchResult = (response) => {
  return Array.isArray(response.result) ? response?.result : [response?.result]
}

function AddMarketTemaplate() {
  const pageName = TAB_MARKET_TEMPLATE;
  const finalizeRef = useRef(null);
  const [savedFormState, setSavedFormState] = useState({});
  const [drp_up, setDrp_up] = useState(false);
  const [initialEditData, setInitialEditData] = useState(undefined);
  const [currentSaveAction, setCurrentSaveAction] = useState(undefined);
  const [masterData, setMasterData] = useState({});
  const [disabledFields, setDisabledFields] = useState({});
  const [fields, setFields] = useState([]);
  const { isSaved, isLoading, error } = useSelector(
    (state) => state.tabsData.marketTemplate
  );
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  const dispatch = useDispatch();
  let navigate = useNavigate();
  const location = useLocation();
  const [marketTemplateId, setMarketTemplateId] = useState(
    location.state?.marketTemplateId || "0"
  );
  const [isOverMarket, setIsOverMarket] = useState(undefined);
  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard");
    }
    fetchMasterData();
  }, []);

  useEffect(() => {
    if (marketTemplateId !== "0") {
      fetchData(marketTemplateId);
      setDisabledFields({
        parentId: true,
        displayType: true,
      });
    }
  }, [marketTemplateId]);

  useEffect(() => {
    if (isSaved) {
      dispatch(updateSavedState(undefined));
      if (currentSaveAction === SAVE_AND_CLOSE) navigate("/marketTemplate");
      else if (currentSaveAction === SAVE_AND_NEW) {
        setInitialEditData({});
        setMarketTemplateId("0");
        finalizeRef.current.resetForm();
      }
      setCurrentSaveAction(undefined);
    }
  }, [isSaved]);

  const fetchData = async (id) => {
    await axiosInstance
      .post("/admin/marketTemplate/byId", { marketTemplateId: id })
      .then((response) => {
        const data = {
          ...response?.result,
          create : response?.result?.create === 0 ? "0.00" : response?.result?.create,
          autoOpen :  response?.result?.autoOpen === 0 ? "0.00" : response?.result?.autoOpen,
        }
        setInitialEditData({ ...data});
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

  const fetchMasterData = async () => {
    await axiosInstance
      .post("admin/matchType/all", {})
      .then((response) => {
        setMasterData((preData) => ({
          ...preData,
          matchTypeID: response.result?.map((item) => {
            return { label: item.matchType, value: item.matchTypeId };
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
    await axiosInstance
      .post("admin/marketTemplate/markeTypeList", {})
      .then((response) => {
        setMasterData((preData) => ({
          ...preData,
          marketTypeId: response.result?.map((item) => {
            return { label: item.marketTypeName, value: item.marketTypeId };
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

  const handleFormADataChange = async (newFormData) => {
    setSavedFormState(newFormData);
    if (newFormData["marketTypeId"] !== savedFormState["marketTypeId"]) {
      setMasterData((preData) => ({
        ...preData,
        "marketTypeCategoryId": [],
      }));
      if (newFormData["marketTypeId"] && newFormData["marketTypeId"] !== "0") {
        axiosInstance.post('/admin/marketTemplate/getCategoryByMarketType', { marketTypeId: newFormData["marketTypeId"] })
          .then((response) => {
            const resultData = fetchResult(response)
            const formattedData = resultData?.map(item => {
              return { label: item?.categoryName, value: item?.marketTypeCategoryId }
            })
            setMasterData((preData) => ({
              ...preData,
              "marketTypeCategoryId": formattedData,
            }));
          }).catch((error) => {
            dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
          });
      }
    }
    if (newFormData?.isOver === true) {
      setIsOverMarket(true);
      setDisabledFields({
        isPlayer: true,
        player: true,
      });
    } else if (newFormData?.isPlayer === true) {
      setIsOverMarket(false);
      setDisabledFields({
        isOver: true,
        over: true,
      });
    } else if (newFormData?.isPlayer === false) {
      setDisabledFields({
        isOver: false,
        over: false,
      });
    } else if (newFormData?.isOver === false) {
      setDisabledFields({
        isPlayer: false,
        player: false,
      });
    }
    if (newFormData?.isPlayer === true) {
      setIsOverMarket(newFormData?.isOver);
      const filterFields = MarketTemplateFileds.filter((value) => {
        return value?.name !== "isOver";
      });
      setFields(filterFields);
    }
  };
  const handleSaveClick = async (saveAction) => {
    const impKeys = {
      playerName: "",
      marketTemplateId: 0,
      templateName: "",
      isActive: false,
      isAutoCancel: false,
      isAutoResultSet: false,
      isBallStart: false,
      isOver: false,
      isPlayer: false,
      isPredefineMarket: false,
      isPreMatchMarket: false,
      isPreMatchOnly: false,
      isDefaultBetAllowed: false,
      isDefaultMarketActive: false,
      isPerEvent: false,
      isShowInAdvanceMarket: false,
      defaultIsSendData: false,
      defaultBackSize: 100,
      defaultLaySize: 100,
      rateDiff: 1,
      howManyOpenMarkets: 1,
      // beforeSuspendMin: null,
      // beforeCloseMin: null,
    };
    const dataToSave = finalizeRef.current.finalizeData();
    if (dataToSave) {
      const finalData = {
        ...impKeys,
        ...dataToSave,
      };
      setCurrentSaveAction(saveAction);
      dispatch(addMarketTemplateToDb(finalData));
    }
  };

  const handleBackClick = () => {
    navigate("/marketTemplate");
  };
  useEffect(() => {
    setFields(MarketTemplateFileds);
  }, []);
  return (
    <React.Fragment>
      <div className="page-content overflow-scroll">
        <Container fluid={true}>
          <Row>
            <Col xs={12} md={8} lg={9}>
              <h3 className="modal-header-title">Market Template </h3>
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
                  fields={MarketTemplateFileds}
                  editFormData={initialEditData}
                  masterData={masterData}
                  disabledFields={disabledFields}
                  onFormDataChange={handleFormADataChange}
                />
              </CardBody>
            </Card>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
}

export default AddMarketTemaplate;
