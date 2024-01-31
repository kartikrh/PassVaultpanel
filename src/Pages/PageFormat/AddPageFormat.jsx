import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import FormBuilder from "../../components/Common/Reusables/FormBuilder";
import { PageFormatFields } from "../../constants/FieldConst/PageFormatConst";
import { Button, ButtonDropdown, Card, CardBody, Col, Container, DropdownItem, DropdownMenu, DropdownToggle, Row } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { ERROR, PERMISSION_ADD, PERMISSION_EDIT, PERMISSION_VIEW, SAVE, SAVE_AND_CLOSE, SAVE_AND_NEW, TAB_PAGE_FORMAT } from '../../components/Common/Const';
import { addPageFormatToDB, updateSavedState } from '../../Features/Tabs/pageFormatSlice';
import axiosInstance from "../../Features/axios";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { convertObjtoFormData } from "../../components/Common/utilities";
import { checkPermission } from '../../components/Common/Reusables/reusableMethods';
import { updateToastData } from "../../Features/toasterSlice";

const AddPageFormat = () => {
  const pageName = TAB_PAGE_FORMAT
  const finalizeRef = useRef(null);
  const [drp_up, setDrp_up] = useState(false);
  const [initialEditData, setInitialEditData] = useState(undefined);
  const [currentSaveAction, setCurrentSaveAction] = useState(undefined);
  const { isSaved, isLoading } = useSelector(state => state.tabsData.pageFormat);
  const permissionObj = useSelector(state => state.auth?.tabPermissionList);
  const dispatch = useDispatch();
  let navigate = useNavigate();
  const location = useLocation();
  const [pageFormatId, setPageFormatId] = useState(location.state?.pageFormatId || "0");

  useEffect(() => {
    if (pageFormatId !== "0") {
      fetchData(pageFormatId);
    }
  }, [pageFormatId]);

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard")
    }
  }, []);

  useEffect(() => {
    if (isSaved) {
      dispatch(updateSavedState(undefined))
      if (currentSaveAction === SAVE_AND_CLOSE){
        navigate("/PageFormat")
      }
      else if (currentSaveAction === SAVE_AND_NEW) {
        setInitialEditData({})
        setPageFormatId("0")
        finalizeRef.current.resetForm()
      }
      setCurrentSaveAction(undefined)
    }
  }, [isSaved]);

  const fetchData = async (pageFormatId) => {
    await axiosInstance.post('/admin/pageFormate/byId', { pageFormatId })
      .then((response) => {
        setInitialEditData(response?.result);
      }).catch((error) => {
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
      });
  };

  const handleSaveClick = async (saveAction) => {
    const dataToSave = finalizeRef.current.finalizeData()
    if (dataToSave) {
      const extraData = {
        pageFormatId: pageFormatId
      }
      dispatch(addPageFormatToDB(convertObjtoFormData({ ...dataToSave, ...extraData })))
      setCurrentSaveAction(saveAction);
    }
  };

  const handleBackClick = () => {
    navigate("/PageFormat");
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Row>
            <Col xs={12} md={8} lg={9}>
              <h3>Page Format</h3>
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
                  ref={finalizeRef}
                  fields={PageFormatFields}
                  editFormData={initialEditData}
                />
              </CardBody>
            </Card>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
}

export default AddPageFormat;
