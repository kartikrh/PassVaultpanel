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
import { checkPermission, convertDateUTCToLocal } from "../../components/Common/Reusables/reusableMethods";
import { EventMarketFields } from "../../constants/FieldConst/EventMarketConst";

function AddEventMarket() {
  const pageName = TAB_EVENT_MARKETS;
  const finalizeRef = useRef(null);
  const [drp_up, setDrp_up] = useState(false);
  const [initialEditData, setInitialEditData] = useState(undefined);
  const [masterData, setMasterData] = useState({});
  const [currentSaveAction, setCurrentSaveAction] = useState(undefined);
  const [disabledFields, setDisabledFields] = useState({});
  const [commentryType, setCommentryType] = useState(undefined);
  const [commentryList, setCommentryList] = useState([]);
  const [marketTemplate, setMarketTemplate] = useState([]);
  const [marketTemplateList, setMarketTemplateList] = useState([]);
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

  useEffect(() => {
    if (id !== "0") {
      fetchData(id);
      setDisabledFields({
       "commentaryId":true,
       "marketTemplateId":true,
       "inningsId":true,
       "teamId":true
    })
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
            return { label: `${item.eventName} - ${item.eventRefId} - ${convertDateUTCToLocal(item?.eventDate, "index")}`, value: item.commentaryId };
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
    if (
      newFormData?.commentaryId &&
      newFormData?.commentaryId !== "0" &&
      newFormData?.commentaryId !== commentryType?.commentaryId
    ) {
      const newCommentryType = commentryList.find(
        (item) => item.commentaryId === newFormData.commentaryId
      );
      setCommentryType(newCommentryType);
      setMasterData((preData) => ({
        ...preData,
        "inningsId": Array(newCommentryType.totalInnings).fill(null).map((v, i)=>({
          label: `Inning ${i+1}`,
          value: i+1,
        })),
        "teamId":newCommentryType.teams.map((option, i)=>({
          label: option.teamName,
          value: option.teamId,
        })),
      }));
      if (newCommentryType?.matchTypeId) {
        axiosInstance
          .post("/admin/marketTemplate/getByMatchTypeId", {
            matchTypeId: newCommentryType?.matchTypeId,
          })
          .then((response) => {
            setMarketTemplateList(response.result);
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
    if (
      newFormData?.marketTemplateId &&
      newFormData?.marketTemplateId !== "0" &&
      newFormData?.marketTemplateId !== marketTemplate?.marketTemplateId
    ) {
      const selectedMarketList = marketTemplateList.find(
        (item) => item?.marketTemplateId === newFormData?.marketTemplateId
      );
      setMarketTemplate(selectedMarketList);
      finalizeRef.current.updateFormFromParent({
        ...selectedMarketList,
      });
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
