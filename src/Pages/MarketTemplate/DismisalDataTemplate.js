import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
    Table,
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import {
    ERROR,
    PERMISSION_ADD,
    PERMISSION_EDIT,
    PERMISSION_VIEW,
    SAVE,
    SAVE_AND_CLOSE,
    SAVE_AND_NEW,
    SUCCESS,
    TAB_MARKET_TEMPLATE,
    WARNING,
} from "../../components/Common/Const";
import axiosInstance from "../../Features/axios";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import { isEmpty } from "lodash";
import { TextField } from "@mui/material";

function DismissalDataComponent() {
    const pageName = TAB_MARKET_TEMPLATE;
    const [drp_up, setDrp_up] = useState(false);
    const [currentSaveAction, setCurrentSaveAction] = useState(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [expandedSections, setExpandedSections] = useState({});
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Master data structure with default empty arrays
    const [masterData, setMasterData] = useState({
        overType: [],
        bowlingStyle: [],
        runners: []
    });

    // Dismissal data structure - stores values for each combination
    const [dismissalData, setDismissalData] = useState({});

    // Stores existing dismissal data from API
    const [existingDismissalData, setExistingDismissalData] = useState([]);

    const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
    const dispatch = useDispatch();
    let navigate = useNavigate();
    const location = useLocation();
    const [marketTemplateId, setMarketTemplateId] = useState(
        location.state?.marketTemplateId || "0"
    );

    useEffect(() => {
        try {
            if (!isEmpty(permissionObj) && !checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
                navigate("/dashboard");
                return;
            }
            fetchMasterData();
        } catch (error) {
            handleError("Error in component initialization", error);
        }
    }, [permissionObj]);

    useEffect(() => {
        try {
            if (marketTemplateId !== "0") {
                fetchDismissalData(marketTemplateId);
            }
        } catch (error) {
            handleError("Error loading data for market template", error);
        }
    }, [marketTemplateId]);

    const handleError = (message, error = null) => {
        console.error(message, error);
        setHasError(true);
        setErrorMessage(message);
        dispatch(
            updateToastData({
                data: error?.message || message,
                title: "Error",
                type: ERROR,
            })
        );
    };

    const fetchMasterData = async () => {
        try {
            // Master data will be fetched with dismissal data
        } catch (error) {
            handleError("Error fetching master data", error);
        }
    };

    const fetchDismissalData = async (id) => {
        if (!id || id === "0") {
            setErrorMessage("Invalid market template ID");
            return;
        }

        setIsLoading(true);
        setHasError(false);

        try {
            const response = await axiosInstance.post("/admin/marketTemplate/dismissalData", {
                marketTemplateId: parseInt(id)
            });

            if (response?.success && response?.result) {
                const result = response.result;

                // Set master data from response with safety checks
                setMasterData({
                    overType: Array.isArray(result.overType) ? result.overType : [],
                    bowlingStyle: Array.isArray(result.bowlingStyle) ? result.bowlingStyle : [],
                    runners: Array.isArray(result.runners) ? result.runners : []
                });

                // Set existing dismissal data
                const dismissalDataFromAPI = Array.isArray(result.dismissalData) ? result.dismissalData : [];
                setExistingDismissalData(dismissalDataFromAPI);

                // Transform existing dismissal data into our dismissalData structure for form inputs
                const transformedData = {};

                if (dismissalDataFromAPI.length > 0) {
                    dismissalDataFromAPI.forEach(item => {
                        try {
                            if (!transformedData[item.overType]) {
                                transformedData[item.overType] = {};
                            }
                            if (!transformedData[item.overType][item.bowlingStyle]) {
                                transformedData[item.overType][item.bowlingStyle] = {};
                            }

                            // Find the runner info to get the runner name
                            const runnerInfo = result.runners?.find(r => r.marketTemplateRunnerId === item.marketTemplateRunnerId);
                            const runnerKey = runnerInfo ? runnerInfo.marketTemplateRunnerId : item.marketTemplateRunnerId;

                            transformedData[item.overType][item.bowlingStyle][runnerKey] = {
                                id: item.id || 0,
                                marketTemplateRunnerId: item.marketTemplateRunnerId || 0,
                                runnerName: item.runnerName || (runnerInfo ? runnerInfo.runner : ''),
                                predefinedValue: item.predefinedValue || '',
                                impactProb: item.impactProb || ''
                            };
                        } catch (itemError) {
                            console.error("Error processing dismissal data item:", itemError, item);
                        }
                    });
                }

                setDismissalData(transformedData);

                // Expand first section by default
                if (result.overType && result.overType.length > 0) {
                    setExpandedSections({ [result.overType[0].id]: true });
                }

            } else {
                handleError("Invalid response from server");
            }
        } catch (error) {
            handleError("Failed to fetch dismissal data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (overType, bowlingStyle, runnerKey, field, value) => {
        try {
            setDismissalData(prev => ({
                ...prev,
                [overType]: {
                    ...prev[overType],
                    [bowlingStyle]: {
                        ...prev[overType]?.[bowlingStyle],
                        [runnerKey]: {
                            ...prev[overType]?.[bowlingStyle]?.[runnerKey],
                            [field]: value
                        }
                    }
                }
            }));
        } catch (error) {
            handleError("Error updating input value", error);
        }
    };

    const toggleSection = (overTypeId) => {
        try {
            setExpandedSections(prev => ({
                ...prev,
                [overTypeId]: !prev[overTypeId]
            }));
        } catch (error) {
            handleError("Error toggling section", error);
        }
    };

    const handleSaveClick = async (saveAction) => {
        if (!marketTemplateId || marketTemplateId === "0") {
            handleError("Invalid market template ID for saving");
            return;
        }

        try {
            const dismissalDataArray = [];

            // Transform dismissalData back to API format
            Object.keys(dismissalData).forEach(overType => {
                Object.keys(dismissalData[overType] || {}).forEach(bowlingStyle => {
                    Object.keys(dismissalData[overType][bowlingStyle] || {}).forEach(runnerKey => {
                        const item = dismissalData[overType][bowlingStyle][runnerKey];
                        if (item && (item.predefinedValue || item.impactProb)) {
                            // Find the runner info to get the runner name
                            const runnerInfo = masterData.runners?.find(r => r.marketTemplateRunnerId === parseInt(runnerKey));

                            dismissalDataArray.push({
                                id: item.id || 0,
                                marketTemplateId: parseInt(marketTemplateId),
                                marketTemplateRunnerId: parseInt(runnerKey),
                                runnerName: runnerInfo ? runnerInfo.runner : (item.runnerName || ''),
                                overType: parseInt(overType),
                                bowlingStyle: parseInt(bowlingStyle),
                                predefinedValue: parseFloat(item.predefinedValue) || 0,
                                impactProb: parseFloat(item.impactProb) || 0
                            });
                        }
                    });
                });
            });

            if (dismissalDataArray.length === 0) {
                dispatch(
                    updateToastData({
                        data: "No data to save. Please enter some values.",
                        title: "Warning",
                        type: WARNING,
                    })
                );
                return;
            }

            setIsLoading(true);
            setCurrentSaveAction(saveAction);

            const response = await axiosInstance.post("/admin/marketTemplate/saveDismissal", {
                dismissalData: dismissalDataArray
            });

            if (response?.success) {
                dispatch(
                    updateToastData({
                        data: "Dismissal data saved successfully",
                        title: "Success",
                        type: SUCCESS,
                    })
                );

                if (saveAction === SAVE_AND_CLOSE) {
                    navigate("/marketTemplate");
                } else if (saveAction === SAVE_AND_NEW) {
                    setDismissalData({});
                    setMarketTemplateId("0");
                }
            } else {
                handleError("Failed to save dismissal data");
            }
        } catch (error) {
            handleError("Error saving dismissal data", error);
        } finally {
            setIsLoading(false);
            setCurrentSaveAction(undefined);
        }
    };

    const handleBackClick = () => {
        try {
            navigate("/marketTemplate");
        } catch (error) {
            handleError("Error navigating back", error);
        }
    };

    const renderTable = (overTypeId) => {
        try {
            const bowlingStyles = masterData.bowlingStyle || [];
            const runners = masterData.runners || [];

            if (bowlingStyles.length === 0 || runners.length === 0) {
                return (
                    <div className="text-center p-3">
                        <p>No data available to display</p>
                    </div>
                );
            }

            return (
                <Table bordered responsive>
                    <thead>
                        <tr>
                            <th style={{ minWidth: '120px' }}>Runner Type</th>
                            {bowlingStyles.map(bowlingStyle => (
                                <th key={bowlingStyle.bowlingTypeId} className="text-center" style={{ minWidth: '250px' }}>
                                    {bowlingStyle.bowlingType}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {runners.map(runner => (
                            <tr key={runner.marketTemplateRunnerId}>
                                <td><strong>{runner.runner}</strong></td>
                                {bowlingStyles.map(bowlingStyle => (
                                    <td key={bowlingStyle.bowlingTypeId} className="p-2">
                                        <div className="d-flex gap-2" style={{ minWidth: '220px' }}>
                                            <div style={{ flex: 1 }}>
                                                <TextField
                                                    label="Predefined Value"
                                                    variant="outlined"
                                                    size="small"
                                                    type="number"
                                                    fullWidth
                                                    value={dismissalData[overTypeId]?.[bowlingStyle.bowlingTypeId]?.[runner.marketTemplateRunnerId]?.predefinedValue || ''}
                                                    onChange={(e) => handleInputChange(
                                                        overTypeId,
                                                        bowlingStyle.bowlingTypeId,
                                                        runner.marketTemplateRunnerId,
                                                        'predefinedValue',
                                                        e.target.value
                                                    )}
                                                    inputProps={{ step: "0.1", min: "0" }}
                                                />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <TextField
                                                    label="Impact Prob"
                                                    variant="outlined"
                                                    size="small"
                                                    type="number"
                                                    fullWidth
                                                    value={dismissalData[overTypeId]?.[bowlingStyle.bowlingTypeId]?.[runner.marketTemplateRunnerId]?.impactProb || ''}
                                                    onChange={(e) => handleInputChange(
                                                        overTypeId,
                                                        bowlingStyle.bowlingTypeId,
                                                        runner.marketTemplateRunnerId,
                                                        'impactProb',
                                                        e.target.value
                                                    )}
                                                    inputProps={{ step: "0.1", min: "0" }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </Table>
            );
        } catch (error) {
            handleError("Error rendering table", error);
            return (
                <div className="text-center p-3 text-danger">
                    <p>Error rendering table. Please try refreshing the page.</p>
                </div>
            );
        }
    };

    if (hasError) {
        return (
            <React.Fragment>
                <div className="page-content overflow-scroll">
                    <Container fluid={true}>
                        <Card>
                            <CardBody>
                                <div className="text-center p-4">
                                    <div className="text-danger mb-3">
                                        <i className="mdi mdi-alert-circle" style={{ fontSize: '48px' }}></i>
                                    </div>
                                    <h4 className="text-danger">Something went wrong</h4>
                                    <p className="text-muted">{errorMessage}</p>
                                    <Button color="primary" onClick={() => window.location.reload()}>
                                        Reload Page
                                    </Button>
                                    <Button color="secondary" className="ms-2" onClick={handleBackClick}>
                                        Go Back
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    </Container>
                </div>
            </React.Fragment>
        );
    }

    return (
        <React.Fragment>
            <div className="page-content overflow-scroll">
                <Container fluid={true}>
                    <Row>
                        <Col xs={12} md={8} lg={9}>
                            <h3 className="modal-header-title">Market Template Dismissal Data</h3>
                        </Col>
                        <Card>
                            <CardBody>
                                {isLoading && <SpinnerModel />}
                                <Row>
                                    <Col
                                        className="mb-3 text-end "
                                    >
                                        <button
                                            className="btn btn-danger mx-1"
                                            onClick={handleBackClick}
                                            disabled={isLoading}
                                        >
                                            Back
                                        </button>
                                        <Button
                                            disabled={
                                                isLoading || !(
                                                    checkPermission(
                                                        permissionObj,
                                                        pageName,
                                                        PERMISSION_ADD
                                                    ) ||
                                                    checkPermission(
                                                        permissionObj,
                                                        pageName,
                                                        PERMISSION_EDIT
                                                    )
                                                )
                                            }
                                            color="primary"
                                            onClick={handleSaveClick}
                                        >
                                            Save
                                        </Button>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col xs={12}>
                                        {masterData.overType?.length > 0 ? (
                                            <div>
                                                {masterData.overType.map((overType) => (
                                                    <Card key={overType.id} className="mb-3">
                                                        <CardBody
                                                            className="cursor-pointer p-3"
                                                            onClick={() => toggleSection(overType.id)}
                                                            style={{
                                                                cursor: 'pointer',
                                                                backgroundColor: expandedSections[overType.id] ? '#f8f9fa' : '#ffffff',
                                                                borderBottom: expandedSections[overType.id] ? '1px solid #dee2e6' : 'none'
                                                            }}
                                                        >
                                                            <div className="d-flex justify-content-between align-items-center">
                                                                <h5 className="mb-0">{overType.overType}</h5>
                                                                <i className={`mdi ${expandedSections[overType.id] ? 'mdi-chevron-up' : 'mdi-chevron-down'}`}></i>
                                                            </div>
                                                        </CardBody>
                                                        {expandedSections[overType.id] && (
                                                            <CardBody className="pt-0">
                                                                {renderTable(overType.id)}
                                                            </CardBody>
                                                        )}
                                                    </Card>
                                                ))}
                                            </div>
                                        ) : (
                                            <Card>
                                                <CardBody>
                                                    <div className="text-center p-4">
                                                        <p className="text-muted">
                                                            {isLoading ? "Loading data..." : "No over types available"}
                                                        </p>
                                                    </div>
                                                </CardBody>
                                            </Card>
                                        )}
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
}

export default DismissalDataComponent;