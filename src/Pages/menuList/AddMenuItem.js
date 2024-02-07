import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import FormBuilder from "../../components/Common/Reusables/FormBuilder";
import { menuItemFields, menuItemPageDetials } from "../../constants/FieldConst/MenuItemConst";
import { Button, ButtonDropdown, Card, CardBody, Col, Container, DropdownItem, DropdownMenu, DropdownToggle, Row } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { ERROR, PERMISSION_ADD, PERMISSION_EDIT, PERMISSION_VIEW, SAVE, SAVE_AND_CLOSE, SAVE_AND_NEW, Tab_Menu_List } from '../../components/Common/Const';
import { addMenuTypeToDb, updateSavedState } from '../../Features/Tabs/menuTypeSlice';
import axiosInstance from "../../Features/axios";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { convertObjtoFormData } from "../../components/Common/utilities";
import { convertDateLocalToUTC } from '../../components/Common/Reusables/reusableMethods';
import { checkPermission } from '../../components/Common/Reusables/reusableMethods';
import { updateToastData } from "../../Features/toasterSlice";

const AddMenuType = () => {
  const pageName = Tab_Menu_List
  const finalizeRef1 = useRef(null);
  const finalizeRef2 = useRef(null);
  const [drp_up, setDrp_up] = useState(false);
  const [initialEditData, setInitialEditData] = useState(undefined);
  const [currentSaveAction, setCurrentSaveAction] = useState(undefined);
  const { isSaved, isLoading } = useSelector(state => state.tabsData.menuType);
  const permissionObj = useSelector(state => state.auth?.tabPermissionList);
  const dispatch = useDispatch();
  let navigate = useNavigate();
  const location = useLocation();
  const [menuTypeId, setMenuTypeId] = useState(location.state?.menuTypeId || "0");
  const [masterData, setMasterData] = useState({});

  useEffect(() => {
    if (menuTypeId !== "0") {
      fetchData(menuTypeId);
    }
  }, [menuTypeId]);

  useEffect(()=>{
    console.log("changed",initialEditData)
  },[initialEditData, menuItemFields])
  
  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard")
    }
    fetchMasterData()
  }, []);

  useEffect(() => {
    if (isSaved) {
      dispatch(updateSavedState(undefined))
      if (currentSaveAction === SAVE_AND_CLOSE) {
        navigate("/menuList")
      }
      else if (currentSaveAction === SAVE_AND_NEW) {
        setInitialEditData({})
        setMenuTypeId("0")
        finalizeRef1.current.resetForm()
        finalizeRef2.current.resetForm()
      }
      setCurrentSaveAction(undefined)
    }
  }, [isSaved]);

  const fetchData = async (menuTypeId) => {
    await axiosInstance.post('/admin/menuTypes/byId', { menuTypeId })
      .then((response) => {
        setInitialEditData(response?.result);
      }).catch((error) => {
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
      });
  };

  const fetchMasterData = async () => {
    // axiosInstance.post('/admin/menuItem/menuTypeList', {})
    //   .then((response) => {
    //     setMasterData((prevData) => ({
    //       ...prevData, 
    //       "menuTypeId": response?.result?.map(item => {
    //           return { label: item.menuTypeName, value: item.menuTypeId }
    //         })
    //     }));
    //   }).catch((error) => {
    //     dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
    //   });
    //   axiosInstance.post('/admin/menuItem/getMenuItemByMenuType', {})
    //   .then((response) => {
    //     setMasterData((prevData) => ({
    //       ...prevData, 
    //       "menuItemId": response?.result?.map(item => {
    //           return { label: item.menuItem, value: item.menuItemId }
    //         })
    //     }));
    //   }).catch((error) => {
    //     dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
    //   });
  };
  const handleFormBDataChange = (newFormData) => {
    axiosInstance.post('/admin/menuItem/menuTypeList', {})
      .then((response) => {
        setMasterData((prevData) => ({
          ...prevData, 
          "menuTypeId": response?.result?.map(item => {
              return { label: item.menuTypeName, value: item.menuTypeId }
            })
        }));
      }).catch((error) => {
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
      });
    console.log({newFormData})
}
const handleSaveClick = async (saveAction) => {
  const dataToSave1 = finalizeRef1.current.finalizeData()
  const dataToSave2 = finalizeRef2.current.finalizeData()
  if (dataToSave1 && dataToSave2) {
      const dataToSave = {
          ...dataToSave1,
          "team1Id": dataToSave2.team1Id,
          "team2Id": dataToSave2.team2Id,
          "team1Captain": dataToSave2.team1Captain,
          "team2Captain": dataToSave2.team2Captain,
          "team1Kipper": dataToSave2.team1Kipper,
          "team2Kipper": dataToSave2.team2Kipper,
          "team1Players": dataToSave2.team1Players,
          "team2Players": dataToSave2.team2Players,
          "addSystemPlayer" : dataToSave2.addSystemPlayer
      }
      setCurrentSaveAction(saveAction);
      dispatch(addMenuTypeToDb({ ...dataToSave }))
  }
};

  const handleBackClick = () => {
    navigate("/menuList");
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
                  <Col className='mb-3' xs={12} md={{ span: 4, offset: 8 }} lg={{ span: 3, offset: 9 }}>
                    <button className="btn btn-danger mx-1" onClick={handleBackClick}>Back</button>
                    <ButtonDropdown
                      direction="down"
                      isOpen={drp_up}
                      toggle={() => setDrp_up(!drp_up)}
                    >
                      <Button
                        disabled={
                          !(checkPermission(permissionObj, pageName, PERMISSION_ADD) ||
                            checkPermission(permissionObj, pageName, PERMISSION_EDIT))}
                        id="caret" color="primary" onClick={() => { handleSaveClick(SAVE_AND_CLOSE) }}>
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
                  ref={finalizeRef2}
                  fields={menuItemFields}
                  editFormData={initialEditData}
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
}

export default AddMenuType;
