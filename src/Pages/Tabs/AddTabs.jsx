import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import FormBuilder from '../../components/Common/Reusables/FormBuilder';
import { TabFields } from '../../constants/FieldConst/TabConst';
import { Button, ButtonDropdown, Col, Container, DropdownItem, DropdownMenu, DropdownToggle, Row } from 'reactstrap';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function AddTabs() {
    const finalizeRef = useRef(null);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [drp_up11, setDrp_up11] = useState(false);
    const [initialEditData, setInitialEditData] = useState(undefined);
    let navigate = useNavigate();
    const query = useQuery();
    const id = query.get('id');

    useEffect(() => {
        if (id) {
            fetchData(id);
        }
    }, [id]);

    const fetchData = async (id) => {
        try {
            const response = await fetch(`https://your-api-endpoint.com/data?id=${id}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setInitialEditData(data);
        } catch (error) {
            console.error('Error fetching data:', error);
            setSnackbarMessage('Error fetching data');
        }
    };

    const handleSaveClick = async () => {
        try {
            const postData = {
                // your data here
            };

            // Replace with your API endpoint
            const response = await fetch('https://your-api-endpoint.com/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            // Show snackbar on success
            setSnackbarMessage("Data saved successfully!");
        } catch (error) {
            console.error('Error saving data:', error);
            setSnackbarMessage("");
        }
    };

    const handleBackClick = () => {
        navigate("/tabs");
    };

    const handleCloseSnackbar = () => {
        setSnackbarMessage('');
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid={true}>
                    <Row>
                        <Col xs={12} md={8} lg={9}>
                            <h3>Tabs </h3>
                        </Col>
                        <Col xs={3} md={1} lg={1}>

                            <button className="btn btn-danger" onClick={handleBackClick}>Back</button>
                        </Col>
                        <Col xs={9} md={3} lg={2}>

                            <ButtonDropdown

                                direction="down"
                                isOpen={drp_up11}
                                toggle={() => setDrp_up11(!drp_up11)}
                            >
                                <Button id="caret" color="primary" onClick={handleSaveClick}>
                                    Save & Close
                                </Button>
                                <DropdownToggle caret color="primary">
                                    <i className="mdi mdi-chevron-down" />
                                </DropdownToggle>
                                <DropdownMenu>
                                    <DropdownItem onClick={handleSaveClick}>Save</DropdownItem>
                                    <DropdownItem onClick={handleSaveClick}>Save & New</DropdownItem>
                                </DropdownMenu>
                            </ButtonDropdown>
                        </Col>
                        <FormBuilder
                            ref={finalizeRef}
                            fields={TabFields}
                            propsFormData={initialEditData}
                        />
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
