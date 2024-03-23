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
  TAB_EVENT_MARKETS,
} from "../../components/Common/Const";
import {
  addEventMarketToDb,
  updateSavedState,
} from "../../Features/Tabs/eventMarketSlice";
import axiosInstance from "../../Features/axios";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { updateToastData } from "../../Features/toasterSlice";
import { convertObjtoFormData } from "../../components/Common/utilities";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import { EventMarketFields } from "../../constants/FieldConst/EventMarketConst";

function AddEventMarket() {
  const pageName = TAB_EVENT_MARKETS;
  const finalizeRef = useRef(null);
  const [drp_up, setDrp_up] = useState(false);
  const [initialEditData, setInitialEditData] = useState(undefined);
  const [masterData, setMasterData] = useState({});
  const [currentSaveAction, setCurrentSaveAction] = useState(undefined);
  const [disabledFields, setDisabledFields] = useState({});
  // const [selectedDropdown, setSelectedDropdwon] = useState({});
  const [matchType, setMatchType] = useState(undefined);
  const [commentryType, setCommentryType] = useState(undefined);
  const [commentryList, setCommentryList] = useState([]);
  // const [marketTemplate, setMarketTemplate] = useState([]);
  const { isSaved, isLoading, error } = useSelector(
    (state) => state.tabsData.eventMarket
  );
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  const dispatch = useDispatch();
  let navigate = useNavigate();
  const location = useLocation();
  const [id, setId] = useState(location.state?.userId || "0");
  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard");
    }
    fetchMasterData();
  }, []);
  // useEffect(() => {
  //   if (selectedDropdown.field === "commentaryId") {
  //     const matchTypeId = commentryList.find(
  //       (item) => item.commentaryId === selectedDropdown.value
  //     )?.matchTypeId;
  //     setMatchTypeId(matchTypeId);
  //   }
  //   if (selectedDropdown.field === "matchTypeID") {
  //     const selectedMarketList = marketTemplate.find(
  //       (item) => item.marketTemplateId === selectedDropdown?.value
  //     );
  //     setInitialEditData({
  //       ...selectedMarketList,
  //     });
  //   }
  // }, [selectedDropdown?.value]);
  // console.log("initialEditData",initialEditData);
  // useEffect(() => {
  //   fetchMasterData();
  // }, [matchTypeId]);

  useEffect(() => {
    if (id !== "0") {
      fetchData(id);
    }
  }, [id]);

  useEffect(() => {
    if (isSaved) {
      dispatch(updateSavedState(undefined));
      if (currentSaveAction === SAVE) {
      } else if (currentSaveAction === SAVE_AND_CLOSE)
        navigate("/eventMarkets");
      else if (currentSaveAction === SAVE_AND_NEW) {
        setDisabledFields({});
        setInitialEditData({});
        setId("0");
        finalizeRef.current.resetForm();
      }
      setCurrentSaveAction(undefined);
    }
  }, [isSaved]);

  // useEffect(()=>{
  //    if (newFormData.marketTemplateId !== 0 && marketTemplate.length > 0) {
  //     const selectedMarketList = marketTemplate.find(
  //       (item) => item.marketTemplateId === newFormData.marketTemplateId
  //     );
  //     setMasterData((preData) => ({
  //       ...preData,
  //       ...selectedMarketList,
  //     }));
  //     finalizeRef.current.updateFormFromParent({...selectedMarketList})
  //   }

  // },[marketTemplate])

  const fetchData = async (id) => {
    await axiosInstance
      .post("/admin/eventMarket/byId", { eventMarketId: id })
      .then((response) => {
        setInitialEditData({
          ...response?.result,
        });
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
    axiosInstance
      .post("admin/eventMarket/commentaryTypeList", {})
      .then((response) => {
        setCommentryList(response?.result);
        setMasterData((prevData) => ({
          ...prevData,
          commentaryId: response?.result?.map((item) => {
            return { label: item.eventName, value: item.commentaryId };
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
    // axiosInstance
    //   .post("/admin/marketTemplate/getByMatchTypeId", {
    //     matchTypeId: matchTypeId,
    //   })
    //   .then((response) => {
    //     setMarketTemplate(response?.result);
    //     setMasterData((prevData) => ({
    //       ...prevData,
    //       matchTypeID: response?.result?.map((item) => {
    //         return { label: item.templateName, value: item.marketTemplateId };
    //       }),
    //     }));
    //   })
    //   .catch((error) => {
    //     dispatch(
    //       updateToastData({
    //         data: error?.message,
    //         title: error?.title,
    //         type: ERROR,
    //       })
    //     );
    //   });
  };

  const handleSaveClick = async (saveAction) => {
    const dataToSave = finalizeRef.current.finalizeData();
    if (dataToSave) {
      const extraData = {
        eventMarketId: id,
      };
      setCurrentSaveAction(saveAction);
      dispatch(addEventMarketToDb({ ...dataToSave, ...extraData }));
    }
  };
  const onFormDataChange = (newFormData) => {
    if (newFormData.commentaryId !== 0) {
      // const newMatchType = commentryList.find(
      //   (item) => item.commentaryId === newFormData.commentaryId
      // );
      if (newFormData?.commentaryId !== commentryType?.commentaryId) {
        const newCommentryType = commentryList.find(
          (item) => item.commentaryId === newFormData.commentaryId
        );
        // setMatchType(newMatchType)
        setCommentryType(newCommentryType);
        axiosInstance
          .post("/admin/marketTemplate/getByMatchTypeId", {
            matchTypeId: newCommentryType?.matchTypeId,
          })
          .then((response) => {
            let marketData = response?.result;
            // setMarketTemplate(response?.result)
            if (newFormData.marketTemplateId !== 0 && marketData.length > 0) {
              const selectedMarketList = marketData.find(
                (item) => item.marketTemplateId === newFormData.marketTemplateId
              );
              // setMasterData((preData) => ({
              //   ...preData,
              //   ...selectedMarketList,
              // }));
              finalizeRef.current.updateFormFromParent({
                ...selectedMarketList,
              });
            }
            setMasterData((prevData) => ({
              ...prevData,
              marketTemplateId: response?.result?.map((item) => {
                return {
                  label: item.templateName,
                  value: item.marketTemplateId,
                };
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
      }
    }
  };
  const handleBackClick = () => {
    navigate("/eventMarkets");
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Row>
            <Col xs={12} md={8} lg={9}>
              <h3>Event Markets</h3>
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
                  fields={EventMarketFields}
                  editFormData={initialEditData}
                  masterData={masterData}
                  onFormDataChange={onFormDataChange}
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

export default AddEventMarket;
