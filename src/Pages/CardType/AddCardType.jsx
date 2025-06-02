import React, { useRef, useState, useEffect } from 'react'
import { useLocation, useNavigate } from "react-router-dom";
import FormBuilder from "../../components/Common/Reusables/FormBuilder";
import { BlockFields } from "../../constants/FieldConst/BlockConst";
import { useDispatch, useSelector } from "react-redux";
import { ERROR, PERMISSION_ADD, PERMISSION_EDIT, PERMISSION_VIEW, SAVE, SAVE_AND_CLOSE, SAVE_AND_NEW, TAB_BLOCKS, TEXT_EDITOR } from '../../components/Common/Const';
// import { addCardTypeToDB, updateSavedState } from "../../Features/Tabs/BlockSlice";
import axiosInstance from "../../Features/axios";
import { checkPermission } from '../../components/Common/Reusables/reusableMethods';
import { updateToastData } from "../../Features/toasterSlice";
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
import { CardTypeFields } from '../../constants/FieldConst/CardTypeConst';
import { addCardTypeToDB, updateSavedState } from '../../Features/Tabs/CardTypeSlice';
import { convertObjtoFormData } from '../../components/Common/utilities';

const AddCardType = () => {
  const finalizeRef = useRef(null);
  let navigate = useNavigate();
  const handleBackClick = () => {
    navigate("/cardType");
  };

  const pageName = TAB_BLOCKS
  const [drp_up, setDrp_up] = useState(false);
  const [initialEditData, setInitialEditData] = useState(undefined);
  const [disabledFields, setDisabledFields] = useState({});
  const [currentSaveAction, setCurrentSaveAction] = useState(undefined);
  const { isSaved, isLoading } = useSelector(state => state.tabsData.cardType);
  const permissionObj = useSelector(state => state.auth?.tabPermissionList);
  const dispatch = useDispatch();
  const location = useLocation();
  const [id, setId] = useState(location.state?.cardTypeId || "0");

  useEffect(() => {
    if (id !== "0") {
      fetchData(id);
    }
  }, [id]);

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard")
    }
  }, []);

  useEffect(() => {
    if (isSaved) {
      dispatch(updateSavedState(undefined))
      if (currentSaveAction === SAVE_AND_CLOSE) {
        navigate("/cardType")
      }
      else if (currentSaveAction === SAVE_AND_NEW) {
        setInitialEditData({})
        setId("0")
        finalizeRef.current.resetForm()
      }
      setCurrentSaveAction(undefined)
    }
  }, [isSaved]);

  const fetchData = async (id) => {
    await axiosInstance.post('/admin/cardType/byId', { id })
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
        id: id,
        isActive: dataToSave?.isActive || false,
      }
      dispatch(addCardTypeToDB(convertObjtoFormData({ ...dataToSave, ...extraData })))
      setCurrentSaveAction(saveAction);
    }
  };
useEffect(() => {
    if (id !== "0") {
      fetchData(id);
      setDisabledFields({
        isActive: true,
      });
    }
  }, [id]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Row>
            <Col xs={12} md={8} lg={9}>
              <h3 className="modal-header-title">Card Type </h3>
            </Col>
            {/* {isLoading && <SpinnerModel />} */}
            <Card>
              <CardBody>
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
                  fields={CardTypeFields}
                  editFormData={initialEditData}
                  disabledFields={disabledFields}
                />
              </CardBody>
            </Card>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  )
}

export default AddCardType
