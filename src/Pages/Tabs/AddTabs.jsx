import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import FormBuilder from '../../components/Common/Reusables/FormBuilder';
import { TabFields } from '../../constants/FieldConst/TabConst';
import { Button, ButtonDropdown, Card, CardBody, Col, Container, DropdownItem, DropdownMenu, DropdownToggle, Row } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { ERROR, PERMISSION_ADD, PERMISSION_EDIT, PERMISSION_VIEW, SAVE, SAVE_AND_CLOSE, SAVE_AND_NEW, TAB_TABS, SWITCH, SELECT } from '../../components/Common/Const';
import { addTabToDb, updateSavedState } from '../../Features/Tabs/tabsSlice';
import axiosInstance from '../../Features/axios';
import SpinnerModel from "../../components/Model/SpinnerModel";
import { updateToastData } from '../../Features/toasterSlice';
import { checkPermission } from '../../components/Common/Reusables/reusableMethods';
import { isEqual } from 'lodash';
const navigateTo = "/tabs"

function AddTabs() {
    const pageName = TAB_TABS
    const finalizeRef = useRef(null);
    const [drp_up, setDrp_up] = useState(false);
    const [initialEditData, setInitialEditData] = useState(undefined);
    const [currentSaveAction, setCurrentSaveAction] = useState(undefined);
    const [masterData, setMasterData] = useState({});
    const [savedFormState, setSavedFormState] = useState({});
    const [disabledFields, setDisabledFields] = useState({});
    const { isSaved, isLoading, selectedTab } = useSelector(state => state.tabsData.tab);
    const permissionObj = useSelector(state => state.auth?.tabPermissionList);
    const dispatch = useDispatch();
    let navigate = useNavigate();
    const location = useLocation();
    const [id, setId] = useState(location.state?.userId || "0");

    useEffect(() => {
        if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
            navigate("/dashboard")
        }
        fetchMasterData()
    }, []);
    useEffect(() => {
        if (id !== "0") {
            fetchData(id);
            setDisabledFields({
                "parentId": true,
                "displayType": true
            })
        }
        else if (selectedTab.id !== "0" && !isEqual(selectedTab.id, savedFormState.parentId)) {
            const dataToUpdate = {
                parentId: selectedTab.id,
                displayType: selectedTab.displayType
            }
            setSavedFormState(dataToUpdate)
            finalizeRef.current.updateFormFromParent({
                ...savedFormState,
                ...dataToUpdate
            })
            setDisabledFields({
                "displayType": true
            })
        }
    }, [id, selectedTab]);

    useEffect(() => {
        if (isSaved) {
            dispatch(updateSavedState(undefined))
            if (currentSaveAction === SAVE_AND_CLOSE) navigate(navigateTo)
            else if (currentSaveAction === SAVE_AND_NEW) {
                setDisabledFields({})
                setInitialEditData({})
                setId("0")
                finalizeRef.current.resetForm()
            }
            setCurrentSaveAction(undefined)
        }
    }, [isSaved]);

    const fetchData = async (id) => {
        await axiosInstance.post('/admin/tabs/byId', { id })
            .then((response) => {
                finalizeRef.current.updateFormFromParent(response?.result)
            }).catch((error) => {
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
            });
    };

    const fetchMasterData = async () => {
        await axiosInstance.post('/admin/tabs/all')
            .then((response) => {
                setMasterData({
                    "parentId":
                        response?.result?.map(item => {
                            return {
                                label: item.tabName, value: item.encryptedTabId,
                                displayType: item.displayType
                            }
                        })
                });
            }).catch((error) => {
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
            });
    };

    const handleFormDataChange = async (newFormData) => {
        setSavedFormState(newFormData);
        if (newFormData["parentId"] !== savedFormState["parentId"]) {
            let dataToUpdate = {}
            if (newFormData["parentId"] !== "0") {
                let displayType
                masterData["parentId"]?.forEach(element => {
                    if (element.value === newFormData["parentId"]) {
                        displayType = element.displayType
                    }
                });
                dataToUpdate["displayType"] = displayType
                setDisabledFields({ displayType: true })
            } else {
                dataToUpdate["displayType"] = undefined
                setDisabledFields({})
            }
            finalizeRef.current.updateFormFromParent(dataToUpdate)
        }
    }
    const handleSaveClick = async (saveAction) => {
        const dataToSave = finalizeRef.current.finalizeData()
        if (dataToSave) {
            console.log("type", dataToSave.displayType);
            const extraData = {
              id: id,
              iconName: dataToSave?.iconName && `mdi mdi-${dataToSave.iconName}`,
              displayType: dataToSave?.displayType ?? 1,
            };
            const completeData = {};
            TabFields.forEach((field) => {
              const { name, type } = field;
              if (!name) return; 
              const value = dataToSave[name];

              if (type === SELECT) {
                completeData[name] = value ?? (name === 'displayType' ? 1 : 0);
              } else if (type === SWITCH) {
                completeData[name] = value ?? false;
              } else {
                completeData[name] = value ?? null;
              }
            });
            setCurrentSaveAction(saveAction);
            dispatch(addTabToDb({ ...completeData, ...extraData }))
        }
    };
    const handleBackClick = () => {
        navigate(navigateTo)
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid={true}>
                    <Row>
                        <Col xs={12} md={8} lg={9}>
                            <h3 className="modal-header-title">Tabs </h3>
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
                                            <Button disabled={
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
                                    fields={TabFields}
                                    editFormData={initialEditData}
                                    masterData={masterData}
                                    disabledFields={disabledFields}
                                    onFormDataChange={handleFormDataChange}
                                />
                            </CardBody>
                        </Card>
                    </Row>
                </Container>
            </div>
        </React.Fragment >
    );
}

export default AddTabs;
