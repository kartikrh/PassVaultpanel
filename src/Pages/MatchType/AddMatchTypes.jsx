import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import FormBuilder from '../../components/Common/Reusables/FormBuilder';
import { MatchTypeFields } from '../../constants/FieldConst/MatchTypeConst';
import { Button, ButtonDropdown, Card, CardBody, Col, Container, DropdownItem, DropdownMenu, DropdownToggle, Row } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { SAVE, SAVE_AND_CLOSE, SAVE_AND_NEW } from '../../components/Common/Const';
import { addMatchTypeToDb } from '../../Features/Tabs/matchTypeSlice';
import axiosInstance from '../../Features/axios';

function AddTabs() {
    const finalizeRef = useRef(null);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [drp_up, setDrp_up] = useState(false);
    const [initialEditData, setInitialEditData] = useState(undefined);
    const [currentSaveAction, setCurrentSaveAction] = useState(undefined);
    const [masterData, setMasterData] = useState({});
    const { isSaved, isLoading, error } = useSelector(state => state.tabsData.matchType);
    const dispatch = useDispatch();
    let navigate = useNavigate();
    const location = useLocation();
    const id = location.state?.userId || "0";

    useEffect(() => {
        if (id !== "0") {
            fetchData(id);
        }
    }, [id]);

    useEffect(() => {
        if (isSaved) {
            if (currentSaveAction === SAVE)
                setSnackbarMessage("Data saved successfully!");
            else if (currentSaveAction === SAVE_AND_CLOSE)
                navigate("/matchType")
            else if (currentSaveAction === SAVE_AND_NEW)
                finalizeRef.current.resetForm()
        }
    });

    const fetchData = async (id) => {
        await axiosInstance.post('/admin/matchType/byId', { matchTypeId: id })
            .then((response) => {
                setInitialEditData(response?.result);
            }).catch((error) => {
                // setIsLoading(false)
            });
    };


    const handleSaveClick = async (saveAction) => {
        const dataToSave = finalizeRef.current.finalizeData()
        if (dataToSave) {
            let totalOvers;
            if (dataToSave["isLimitedOvers"])
                totalOvers = dataToSave["oversPerInings"] * (dataToSave["noOfIningsPerSide"] * 2)
            else
                totalOvers = -1
            const extraData = {
                matchTypeId: id,
                totalOversInMatch: totalOvers
            }
            setCurrentSaveAction(saveAction);
            dispatch(addMatchTypeToDb({ ...dataToSave, ...extraData }))
        }
    };

    const handleBackClick = () => {
        navigate("/matchType");
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid={true}>
                    <Row>
                        <Col xs={12} md={8} lg={9}>
                            <h3>Match Type </h3>
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
                                    fields={MatchTypeFields}
                                    editFormData={initialEditData}
                                    masterData={masterData}
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

export default AddTabs;
