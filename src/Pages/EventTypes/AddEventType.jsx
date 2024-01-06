import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import FormBuilder from '../../components/Common/Reusables/FormBuilder';
import { EventTypeFields } from '../../constants/FieldConst/EventTypeConst';
import { Button, ButtonDropdown, Card, CardBody, Col, Container, DropdownItem, DropdownMenu, DropdownToggle, Row } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { ERROR, PERMISSION_ADD, PERMISSION_EDIT, PERMISSION_VIEW, SAVE, SAVE_AND_CLOSE, SAVE_AND_NEW, TAB_EVENT_TYPES } from '../../components/Common/Const';
import { addEventTypeToDb } from '../../Features/Tabs/eventTypesSlice';
import axiosInstance from '../../Features/axios';
import SpinnerModel from "../../components/Model/SpinnerModel";
import { convertObjtoFormData } from '../../components/Common/utilities';
import { checkPermission } from '../../components/Common/Reusables/reusableMethods';
import { updateToastData } from '../../Features/toasterSlice';

function AddEventType() {
    const pageName = TAB_EVENT_TYPES
    const finalizeRef = useRef(null);
    const [drp_up, setDrp_up] = useState(false);
    const [initialEditData, setInitialEditData] = useState(undefined);
    const [currentSaveAction, setCurrentSaveAction] = useState(undefined);
    const { isSaved, isLoading } = useSelector(state => state.tabsData.eventType);
    const permissionObj = useSelector(state => state.auth?.tabPermissionList);
    const dispatch = useDispatch();
    let navigate = useNavigate();
    const location = useLocation();
    const eventTypeId = location.state?.eventTypeId || "0";


    useEffect(() => {
        if (eventTypeId !== "0") {
            fetchData(eventTypeId);
        }
    }, [eventTypeId]);

    useEffect(() => {
        if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
            navigate("/dashboard")
        }
    }, []);

    useEffect(() => {
        if (isSaved) {
            if (currentSaveAction === SAVE_AND_CLOSE)
                navigate("/eventType")
            else if (currentSaveAction === SAVE_AND_NEW) {
                setInitialEditData({})
                finalizeRef.current.resetForm()
            }
            setCurrentSaveAction(undefined)
        }
    });

    const fetchData = async (eventTypeId) => {
        await axiosInstance.post('/admin/eventType/byId', { eventTypeId })
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
                eventTypeId: eventTypeId
            }
            dispatch(addEventTypeToDb(convertObjtoFormData({ ...dataToSave, ...extraData })))
            setCurrentSaveAction(saveAction);
        }
    };

    const handleBackClick = () => {
        navigate("/eventType");
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid={true}>
                    <Row>
                        <Col xs={12} md={8} lg={9}>
                            <h3>Event Types</h3>
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
                                                {(checkPermission(permissionObj, pageName, PERMISSION_ADD) ||
                                                    checkPermission(permissionObj, pageName, PERMISSION_EDIT))
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
                                    fields={EventTypeFields}
                                    editFormData={initialEditData}
                                />
                            </CardBody>
                        </Card>
                    </Row>
                </Container>
            </div>
        </React.Fragment >
    );
}

export default AddEventType;
