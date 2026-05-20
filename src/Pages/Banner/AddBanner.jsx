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
} from "../../components/Common/Const";
import { addBannerToDb, updateSavedState } from "../../Features/Tabs/bannerSlice";
import axiosInstance from "../../Features/axios";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { convertObjtoFormData } from "../../components/Common/utilities";
import { checkPermission, convertDateLocalToUTC } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import { bannerFields } from "../../constants/FieldConst/BannerConst";
import { isEmpty } from "lodash";

const AddBanner = () => {
  const pageName = TAB_BANNER;
  const finalizeRef = useRef(null);
  const [drp_up, setDrp_up] = useState(false);
  const [initialEditData, setInitialEditData] = useState(undefined);
  const [currentSaveAction, setCurrentSaveAction] = useState(undefined);
  const { isSaved, isLoading } = useSelector((state) => state.tabsData.banner);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  const dispatch = useDispatch();
  let navigate = useNavigate();
  const location = useLocation();
  const [bannerId, setBannerId] = useState(location.state?.bannerId || "0");
  const [fields, setFields] = useState(bannerFields || [])
  const [masterData, setMasterData] = useState({});
  useEffect(() => {
    if (bannerId !== "0") {
      fetchData(bannerId);
    }
  }, [bannerId]);

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
        navigate("/banner");
      } else if (currentSaveAction === SAVE_AND_NEW) {
        setInitialEditData({});
        setBannerId("0");
        finalizeRef.current.resetForm();
      }
      setCurrentSaveAction(undefined);
    }
  }, [isSaved]);

  const fetchData = async (bannerId) => {
    await axiosInstance
      .post("/admin/banner/byId", { bannerId })
      .then((response) => {
        // setInitialEditData(response?.result);
        const data = response?.result;

        setInitialEditData({
          ...data,
          startDate: data?.startDate ? convertDateLocalToUTC(data.startDate) : null,
          endDate: data?.endDate ? convertDateLocalToUTC(data.endDate) : null,
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
    await axiosInstance
      .post("/admin/whitelabel/all", {isActive: true})
      .then((response) => {
        setMasterData((preData) => ({
          ...preData,
          whitelabelId: response.result?.map((item) => {
            return { label: item.domain, value: item.id };
          }),
        }));
      })
      .catch((error) => {
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
      });
  };
  
  const handleFormBDataChange = (val) => {
    if(val?.isPermanent){
      const filteredFields = bannerFields.filter(obj => obj.name !== "startDate" && obj.name !== "endDate")
      setFields(filteredFields)
    }else if (!val?.isPermanent){
      setFields(bannerFields)
    }
  };

  const handleSaveClick = async (saveAction) => {
    const dataToSave = finalizeRef.current.finalizeData();
    if (dataToSave) {
      const extraData = {
        bannerId: bannerId,
        startDate: !dataToSave.isPermanent ? convertDateLocalToUTC(dataToSave?.startDate) : null,
        endDate: !dataToSave.isPermanent ? convertDateLocalToUTC(dataToSave?.endDate) : null,
      };
      dispatch(
        addBannerToDb(convertObjtoFormData({ ...dataToSave, ...extraData }))
      );
      setCurrentSaveAction(saveAction);
    }
  };
  const handleBackClick = () => {
    navigate("/banner");
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Row>
            <Col xs={12} md={8} lg={9}>
              <h3 className="modal-header-title">Banner</h3>
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
                  editFormData={{
                    deviceTypeId: initialEditData?.deviceTypeId ?? 1,
                    ...(initialEditData || {}),
                  }}
                  // editFormData={initialEditData}
                  masterData={masterData}
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

export default AddBanner;
