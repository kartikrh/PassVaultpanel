import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FormBuilder from "../../components/Common/Reusables/FormBuilder";
import {
  menuItemFields,
  PageFields,
  existingPage,
} from "../../constants/FieldConst/MenuItemConst";
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
  Tab_Menu_List,
} from "../../components/Common/Const";
import {
  addMenuTypeToDb,
  addMenuItemToDb,
  updateSavedState,
  setSelectedMenuType,
  setSelectedMenuTypeHistory,
} from "../../Features/Tabs/menuTypeSlice";
import axiosInstance from "../../Features/axios";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { convertObjtoFormData } from "../../components/Common/utilities";
import { convertDateLocalToUTC } from "../../components/Common/Reusables/reusableMethods";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";

const AddMenuType = () => {
  const pageName = Tab_Menu_List;
  const finalizeRef1 = useRef(null);
  const finalizeRef2 = useRef(null);
  const [drp_up, setDrp_up] = useState(false);
  const [initialEditData, setInitialEditData] = useState(undefined);
  const [currentSaveAction, setCurrentSaveAction] = useState(undefined);
  const { isSaved, isLoading, selectedMenuType, selectedMenuTypeHistory } = useSelector(
    (state) => state.tabsData.menuType
  );
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  const dispatch = useDispatch();
  let navigate = useNavigate();
  const location = useLocation();
  const [menuItemId, setMenuTypeId] = useState(
    location.state?.menuItemId || "0"
  );
  const [masterData, setMasterData] = useState({});
  const [pageNewOld, setPageNewOld] = useState(null);
  useEffect(() => {
    if (menuItemId !== "0") {
      setPageNewOld(0)
      fetchData(menuItemId);
    }
  }, [menuItemId]);


  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard");
    }
  }, []);

  useEffect(() => {
    if (isSaved) {
      dispatch(updateSavedState(undefined));
      if (currentSaveAction === SAVE_AND_CLOSE) {
        navigate("/menuList");
      } else if (currentSaveAction === SAVE_AND_NEW) {
        setInitialEditData({});
        setMenuTypeId("0");
        finalizeRef1.current.resetForm();
        finalizeRef2.current.resetForm();
      }
      setCurrentSaveAction(undefined);
    }
  }, [isSaved]);

  const fetchData = async (menuItemId) => {
    await axiosInstance
      .post("/admin/menuItem/byId", { menuItemId })
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

  const handleFormBDataChange = (newFormData) => {
    axiosInstance
      .post("/admin/menuItem/menuTypeList", {})
      .then((response) => {
        setMasterData((prevData) => ({
          ...prevData,
          menuTypeId: response?.result?.map((item) => {
            return { label: item.menuTypeName, value: item.menuTypeId };
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
    if (newFormData?.menuTypeId !== undefined) {
      axiosInstance
        .post("/admin/menuItem/getMenuItemByMenuType", {
          isActive: true,
          menuTypeId: newFormData?.menuTypeId,
        })
        .then((response) => {
          setMasterData((prevData) => ({
            ...prevData,
            parentId: response?.result?.map((item) => {
              return { label: item.menuItem, value: item.menuItemId };
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
    if (newFormData?.newOldPage == 1) {
      axiosInstance
        .post("/admin/menuItem/pageList", {})
        .then((response) => {
          setMasterData((prevData) => ({
            ...prevData,
            pageId: response?.result?.map((item) => {
              return { label: item.pageName, value: item.pageId };
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
        setPageNewOld(newFormData?.newOldPage);
    }else if(newFormData?.newOldPage == 0){
      setPageNewOld(newFormData?.newOldPage);
    }
  };

  const handleSaveClick = async (saveAction) => {
    const dataToSave1 = finalizeRef1?.current?.finalizeData();
    const dataToSave2 = finalizeRef2?.current?.finalizeData();
    const {alias, createPage,newOldPage, ...rest} = dataToSave1
    if (pageNewOld == 1) {
      const dataToSave = {
        ...rest,
        parentId: rest?.parentId ? rest?.parentId : "0",
        menuItemId: rest?.menuItemId ? rest?.menuItemId : "0",
        pageDetails: {
          alias: dataToSave1.alias
        }
      };
      setCurrentSaveAction(saveAction);
      dispatch(addMenuItemToDb({ ...dataToSave,}));
    } else if (pageNewOld == 0){
      const dataToSave = {
        ...rest,
        menuItemId: rest?.menuItemId ? rest?.menuItemId : "0",
        parentId: rest?.parentId ? rest?.parentId : "0",
        pageId: rest?.pageId ? rest?.pageId : "0",
        pageDetails: {
          ...dataToSave2
        }
      };
      setCurrentSaveAction(saveAction);
      dispatch(addMenuItemToDb({ ...dataToSave,}));
    }
  };

  function generateAlias() {
    if(selectedMenuType?.level === 0){
    const finalizeData = finalizeRef1.current.finalizeData();
    const { menuItem } = finalizeData;
    const autoGeneratedAlias = "/" + menuItem.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-');
    finalizeRef1.current.updateFormFromParent({ "alias": autoGeneratedAlias })
    }else{
    const finalizeData = finalizeRef1.current.finalizeData();
    const { menuItem } = finalizeData;
    const autoGeneratedAlias = "/" + menuItem.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-');
    finalizeRef2.current.updateFormFromParent({ "alias": autoGeneratedAlias })
    }
  }
  
  const handleBackClick = () => {
    navigate("/menuList");
    dispatch(selectedMenuType[selectedMenuTypeHistory.length-1].value)
    console.log(
      {selectedMenuType}
    )
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Row>
            <Col xs={12} md={8} lg={9}>
              <h3>Menu Item</h3>
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
                  ref={finalizeRef1}
                  fields={
                    pageNewOld == null
                      ? menuItemFields :   pageNewOld == 0? menuItemFields
                      : pageNewOld == 1
                      ? [...menuItemFields, ...existingPage]
                      : null
                  }
                  editFormData={initialEditData}
                  masterData={masterData}
                  onFormDataChange={handleFormBDataChange}
                  generateAlias = {generateAlias}
                />
              </CardBody>
            </Card>
          </Row>
          {pageNewOld == 0 && (
            <Row>
              <Col xs={12} md={8} lg={9}>
                <h3>Page Details</h3>
              </Col>
              <Card>
                <CardBody>
                  <FormBuilder
                    ref={finalizeRef2}
                    fields={PageFields}
                    editFormData={initialEditData?.pageDetails}
                    onFormDataChange={handleFormBDataChange}
                    generateAlias = {generateAlias}
                  />
                </CardBody>
              </Card>
            </Row>
          )}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default AddMenuType;
