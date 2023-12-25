import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import FormBuilder from '../../components/Common/Reusables/FormBuilder';
import { EventTypeFields } from '../../constants/FieldConst/EventTypeConst';
import { Button, ButtonDropdown, Card, CardBody, Col, Container, DropdownItem, DropdownMenu, DropdownToggle, Row } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { SAVE, SAVE_AND_CLOSE, SAVE_AND_NEW } from '../../components/Common/Const';
import { addEventTypeToDb } from '../../Features/Tabs/eventTypesSlice';
import axiosInstance from '../../Features/axios';

const convertObjtoFormData = (obj) => {
    const formData = new FormData();
    for (const key in obj) {
        if (key === "image") {
            typeof obj[key] !== "string" && formData.append(key, obj[key]);
            continue;
        }
        formData.append(key, obj[key]);
    }
    return formData
}


function AddEventType() {
    const finalizeRef = useRef(null);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [drp_up, setDrp_up] = useState(false);
    const [initialEditData, setInitialEditData] = useState(undefined);
    const [currentSaveAction, setCurrentSaveAction] = useState(undefined);
    const { isSaved, isLoading, error } = useSelector(state => state.tabsData.eventType);
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
        if (isSaved) {
            if (currentSaveAction === SAVE)
                setSnackbarMessage("Data saved successfully!");
            else if (currentSaveAction === SAVE_AND_CLOSE)
                navigate("/eventType")
            else if (currentSaveAction === SAVE_AND_NEW)
                finalizeRef.current.resetForm()
        }
    });

    const fetchData = async (eventTypeId) => {
        await axiosInstance.post('/admin/eventType/byId', { eventTypeId })
            .then((response) => {
                setInitialEditData(response?.result);
            }).catch((error) => {
                // setIsLoading(false)
            });
    };


    const handleSaveClick = async (saveAction) => {
        setCurrentSaveAction(saveAction);
        dispatch(addEventTypeToDb(convertObjtoFormData({ ...finalizeRef.current.finalizeData(), eventTypeId })))
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
                            <h3>Tabs </h3>
                        </Col>

                        <Card>
                            <CardBody>
                                <Row>
                                    <Col className='mb-3' xs={12} md={{ span: 4, offset: 8 }} lg={{ span: 3, offset: 9 }}>
                                        <button className="btn btn-danger mx-1" onClick={handleBackClick}>Back</button>
                                        <ButtonDropdown
                                            direction="down"
                                            isOpen={drp_up}
                                            toggle={() => setDrp_up(!drp_up)}
                                        >
                                            <Button id="caret" color="primary" onClick={() => { handleSaveClick(SAVE_AND_CLOSE) }}>
                                                Save & Close
                                            </Button>
                                            <DropdownToggle caret color="primary">
                                                <i className="mdi mdi-chevron-down" />
                                            </DropdownToggle>
                                            <DropdownMenu>
                                                <DropdownItem onClick={() => { handleSaveClick(SAVE) }}>Save</DropdownItem>
                                                <DropdownItem onClick={() => { handleSaveClick(SAVE_AND_NEW) }}>Save & New</DropdownItem>
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
        //         {
        //     snackbarMessage && (
        //         <div className="alert alert-success" role="alert" style={{ position: 'fixed', bottom: '20px', right: '20px' }} onClick={handleCloseSnackbar}>
        //             {snackbarMessage}
        //         </div>
        //     )
        // }
        // </div >
    );
}

export default AddEventType;
