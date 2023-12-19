import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import FormBuilder from '../../components/Common/Reusables/FormBuilder';
import { TabFields } from '../../constants/FieldConst/TabConst';
import { Button, ButtonDropdown, Card, CardBody, Col, Container, DropdownItem, DropdownMenu, DropdownToggle, Row } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { decryptData } from '../Utility/encryptionUtils';
import { SAVE, SAVE_AND_CLOSE, SAVE_AND_NEW } from '../../components/Common/Const';
import { addTabToDb } from '../../Features/Tabs/tabsSlice';
import axiosInstance from '../../Features/axios';

function AddTabs() {
    const finalizeRef = useRef(null);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [drp_up11, setDrp_up11] = useState(false);
    const [initialEditData, setInitialEditData] = useState(undefined);
    const [currentSaveAction, setCurrentSaveAction] = useState(undefined);
    const { isSaved, isLoading, error } = useSelector(state => state.tabsData.tab);
    const dispatch = useDispatch();
    let navigate = useNavigate();
    const location = useLocation();
    const id = location.state?.userId;
    console.log(id)

    useEffect(() => {
        if (id) {
            fetchData(id);
        }
    }, [id]);

    useEffect(() => {
        console.log(isSaved, currentSaveAction)
        if (isSaved) {
            if (currentSaveAction === SAVE)
                setSnackbarMessage("Data saved successfully!");
            else if (currentSaveAction === SAVE_AND_CLOSE)
                navigate("/tabs")
            else if (currentSaveAction === SAVE_AND_NEW)
                finalizeRef.current.resetForm()
        }
    });

    const fetchData = async (id) => {
        await axiosInstance.post('/admin/tabs/byId', { id })
            .then((response) => {
                setInitialEditData(response?.data?.result);
                console.log(response?.data.result)
            }).catch((error) => {
                // setIsLoading(false)
            });

        // console.log(id)
        // const authToken = decryptData(localStorage.getItem("authUser"));
        // console.log(authToken)
        // try {
        //     const response = await fetch('https://scorenodeapi.cloudd.live/admin/tabs/byId', {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json',
        //             Authorization: `Bearer ${authToken?.result?.token}`,
        //         },
        //         body: JSON.stringify({ id }),
        //     });
        //     if (!response.status === 200) {
        //         throw new Error('Network response was not ok');
        //     }
        //     setInitialEditData(response?.result);
        // } catch (error) {
        //     console.error('Error fetching data:', error);
        //     setSnackbarMessage('Error fetching data');
        // }
    };

    const handleSaveClick = async (saveAction) => {
        setCurrentSaveAction(saveAction);
        console.log(finalizeRef.current.finalizeData())
        dispatch(addTabToDb(finalizeRef.current.finalizeData()))
    };

    const handleBackClick = () => {
        navigate("/tabs");
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
                                            isOpen={drp_up11}
                                            toggle={() => setDrp_up11(!drp_up11)}
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
                                    fields={TabFields}
                                    propsFormData={initialEditData}
                                />
                                {console.log(initialEditData)}
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
