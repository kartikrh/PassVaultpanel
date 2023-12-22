import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import FormBuilder from '../../components/Common/Reusables/FormBuilder';
import { PaneltyRunConst } from '../../constants/FieldConst/PaneltyConst';
import { Button, ButtonDropdown, Card, CardBody, Col, Container, DropdownItem, DropdownMenu, DropdownToggle, Row } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { SAVE, SAVE_AND_CLOSE, SAVE_AND_NEW } from '../../components/Common/Const';
import { addPenaltyRunToDb } from '../../Features/PenaltyRuns/penaltyRunsSlice';
import axiosInstance from '../../Features/axios';

function AddPenaltyRuns() {
    const finalizeRef = useRef(null);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [drp_up, setDrp_up] = useState(false);
    const [initialEditData, setInitialEditData] = useState(undefined);
    const [currentSaveAction, setCurrentSaveAction] = useState(undefined);
    const { isSaved, isLoading, error } = useSelector(state => state.penaltyRunsData.penaltyRun);
    const dispatch = useDispatch();
    let navigate = useNavigate();
    const location = useLocation();
    const paneltyId = location.state?.paneltyId || "0";

    useEffect(() => {
        if (paneltyId !== "0") {
            fetchData(paneltyId);
        }
    }, [paneltyId]);

    useEffect(() => {
        if (isSaved) {
            if (currentSaveAction === SAVE)
                setSnackbarMessage("Data saved successfully!");
            else if (currentSaveAction === SAVE_AND_CLOSE)
                navigate("/penalty")
            else if (currentSaveAction === SAVE_AND_NEW)
                finalizeRef.current.resetForm()
        }
    });

    const fetchData = async (paneltyId) => {
        await axiosInstance.post('/admin/paneltyRun/byId', { paneltyId })
            .then((response) => {
                console.log("res", response);
                setInitialEditData(response?.result);
            }).catch((error) => {
                // setIsLoading(false)
            });
    };

    const handleSaveClick = async (saveAction) => {
        setCurrentSaveAction(saveAction);
        dispatch(addPenaltyRunToDb({ ...finalizeRef.current.finalizeData(), paneltyId }))
    };

    const handleBackClick = () => {
        navigate("/penalty");
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid={true}>
                    <Row>
                        <Col xs={12} md={8} lg={9}>
                            <h3>Penalty Runs</h3>
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
                                    fields={PaneltyRunConst}
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

export default AddPenaltyRuns;
