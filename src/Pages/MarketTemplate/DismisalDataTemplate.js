import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    Button,
    Card,
    CardBody,
    Col,
    Container,
    Row,
    Table,
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import {
    ERROR,
    PERMISSION_ADD,
    PERMISSION_EDIT,
    PERMISSION_VIEW,
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
import { getDynamicStep } from "../Commentary/functions";

function DismissalDataComponent() {
    const pageName = TAB_MARKET_TEMPLATE;
    const [isLoading, setIsLoading] = useState(false);
    const [expandedSections, setExpandedSections] = useState({});
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [focusedCell, setFocusedCell] = useState(null);
    const [originalData, setOriginalData] = useState({});

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

    // Check if data has changed
    const hasDataChanged = () => {
        try {
            return JSON.stringify(dismissalData) !== JSON.stringify(originalData);
        } catch (error) {
            return false;
        }
    };

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
            console.error("Error updating input value", error);
        }
    };

    const handleCellFocus = (overType, bowlingStyle, runnerKey) => {
        setFocusedCell({ overType, bowlingStyle, runnerKey });
    };

    const handleCellBlur = () => {
        setFocusedCell(null);
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
                // Store original data for comparison
                setOriginalData(JSON.parse(JSON.stringify(transformedData)));

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
    const getMinMaxNonZero = (value) => {
        const MAX_VALUE = 999;

        // Convert to number and handle invalid inputs
        const numValue = parseFloat(value);

        // If not a valid number, return empty string (or 0)
        if (isNaN(numValue)) return '';

        if (numValue < 0) return 0;
        else if (numValue > MAX_VALUE) return MAX_VALUE;
        else {
            // Round to 2 decimal places
            return Math.round(numValue * 100) / 100;
        }
    };

    const handleSaveClick = async () => {
        if (!marketTemplateId || marketTemplateId === "0") {
            dispatch(
                updateToastData({
                    data: "Invalid market template ID for saving",
                    title: "Error",
                    type: ERROR,
                })
            );
            return;
        }

        // Check if data has changed
        if (!hasDataChanged()) {
            dispatch(
                updateToastData({
                    data: "No changes detected. Please modify some values before saving.",
                    title: "Warning",
                    type: WARNING,
                })
            );
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

            setIsLoading(true);

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

                // Update original data after successful save
                setOriginalData(JSON.parse(JSON.stringify(dismissalData)));

                // Always redirect to market template page after save
                navigate("/marketTemplate");
            } else {
                dispatch(
                    updateToastData({
                        data: "Failed to save dismissal data. Please try again.",
                        title: "Error",
                        type: ERROR,
                    })
                );
            }
        } catch (error) {
            dispatch(
                updateToastData({
                    data: error?.response?.data?.message || "Error saving dismissal data. Please try again.",
                    title: "Save Error",
                    type: ERROR,
                })
            );
        } finally {
            setIsLoading(false);
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

            // Helper function to check if current cell is focused
            const isCellFocused = (bowlingStyleId, runnerRunnerId) => {
                return focusedCell &&
                    focusedCell.overType.toString() === overTypeId.toString() &&
                    focusedCell.bowlingStyle.toString() === bowlingStyleId.toString() &&
                    focusedCell.runnerKey.toString() === runnerRunnerId.toString();
            };

            // Helper function to check if column is highlighted
            const isColumnHighlighted = (bowlingStyleId) => {
                return focusedCell &&
                    focusedCell.overType.toString() === overTypeId.toString() &&
                    focusedCell.bowlingStyle.toString() === bowlingStyleId.toString();
            };

            // Helper function to check if row is highlighted
            const isRowHighlighted = (runnerRunnerId) => {
                return focusedCell &&
                    focusedCell.overType.toString() === overTypeId.toString() &&
                    focusedCell.runnerKey.toString() === runnerRunnerId.toString();
            };

            return (
                <Table bordered responsive>
                    <thead>
                        <tr>
                            <th style={{
                                minWidth: '120px',
                                fontWeight: focusedCell && focusedCell.overType.toString() === overTypeId.toString() ? '700' : 'bold',
                                fontSize: focusedCell && focusedCell.overType.toString() === overTypeId.toString() ? '16px' : '14px'
                            }}>
                                Runner Type
                            </th>
                            {bowlingStyles.map(bowlingStyle => (
                                <th
                                    key={bowlingStyle.bowlingTypeId}
                                    className="text-center"
                                    style={{
                                        minWidth: '250px',
                                        fontWeight: isColumnHighlighted(bowlingStyle.bowlingTypeId) ? '700' : 'bold',
                                        fontSize: isColumnHighlighted(bowlingStyle.bowlingTypeId) ? '16px' : '14px',
                                        borderBottom: isColumnHighlighted(bowlingStyle.bowlingTypeId) ? '4px solid #28a745' : '1px solid #dee2e6',
                                        backgroundColor: isColumnHighlighted(bowlingStyle.bowlingTypeId) ? '#f8f9fa' : 'transparent'
                                    }}
                                >
                                    {bowlingStyle.bowlingType}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {runners.sort((a,b) => a.marketTemplateRunnerId - b.marketTemplateRunnerId).map(runner => (
                            <tr key={runner.marketTemplateRunnerId}>
                                <td style={{
                                    fontWeight: isRowHighlighted(runner.marketTemplateRunnerId) ? '700' : 'bold',
                                    fontSize: isRowHighlighted(runner.marketTemplateRunnerId) ? '16px' : '14px',
                                    borderBottom: isRowHighlighted(runner.marketTemplateRunnerId) ? '4px solid #ffc107' : '1px solid #dee2e6',
                                    backgroundColor: isRowHighlighted(runner.marketTemplateRunnerId) ? '#f8f9fa' : 'transparent'
                                }}>
                                    <strong>{runner.runner}</strong>
                                </td>
                                {/* {console.log("runner", runner.marketTemplateRunnerId, runner.runner)} */}
                                {bowlingStyles.map(bowlingStyle => (
                                    <td
                                        key={bowlingStyle.bowlingTypeId}
                                        className="p-2"
                                        style={{
                                            backgroundColor: isCellFocused(bowlingStyle.bowlingTypeId, runner.marketTemplateRunnerId)
                                                ? '#e9ecef' : 'transparent'
                                        }}
                                    >
                                        <div className="d-flex gap-2" style={{ minWidth: '220px' }}>
                                            <div style={{ flex: '0 0 70%' }}>
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
                                                        getMinMaxNonZero(e.target.value)
                                                    )}
                                                    onFocus={() => handleCellFocus(overTypeId, bowlingStyle.bowlingTypeId, runner.marketTemplateRunnerId)}
                                                    onBlur={handleCellBlur}
                                                    onKeyPress={(e) => {
                                                        const allowedKeys = /[0-9.]/;
                                                        if (!allowedKeys.test(e.key)) {
                                                            e.preventDefault();
                                                        }
                                                        // Prevent multiple decimal points
                                                        if (e.key === '.' && e.target.value.includes('.')) {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                    steps={getDynamicStep(dismissalData[overTypeId]?.[bowlingStyle.bowlingTypeId]?.[runner.marketTemplateRunnerId]?.predefinedValue)}
                                                    sx={{
                                                        '& .MuiInputLabel-root': {
                                                            fontSize: '12px'
                                                        },
                                                        '& .MuiOutlinedInput-input': {
                                                            fontSize: '12px'
                                                        },
                                                        '& .MuiOutlinedInput-root': {
                                                            backgroundColor: isCellFocused(bowlingStyle.bowlingTypeId, runner.marketTemplateRunnerId)
                                                                ? '#f8f9fa' : 'white',
                                                            '&:hover': {
                                                                backgroundColor: '#f8f9fa'
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <div style={{ flex: '0 0 30%' }}>
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
                                                        getMinMaxNonZero(e.target.value)
                                                    )}
                                                    onFocus={() => handleCellFocus(overTypeId, bowlingStyle.bowlingTypeId, runner.marketTemplateRunnerId)}
                                                    onBlur={handleCellBlur}
                                                    onKeyPress={(e) => {
                                                        const allowedKeys = /[0-9.]/;
                                                        if (!allowedKeys.test(e.key)) {
                                                            e.preventDefault();
                                                        }
                                                        // Prevent multiple decimal points
                                                        if (e.key === '.' && e.target.value.includes('.')) {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                    steps={getDynamicStep(dismissalData[overTypeId]?.[bowlingStyle.bowlingTypeId]?.[runner.marketTemplateRunnerId]?.impactProb)}
                                                    sx={{
                                                        '& .MuiInputLabel-root': {
                                                            fontSize: '12px'
                                                        },
                                                        '& .MuiOutlinedInput-input': {
                                                            fontSize: '12px'
                                                        },
                                                        '& .MuiOutlinedInput-root': {
                                                            backgroundColor: isCellFocused(bowlingStyle.bowlingTypeId, runner.marketTemplateRunnerId)
                                                                ? '#f8f9fa' : 'white',
                                                            '&:hover': {
                                                                backgroundColor: '#f8f9fa'
                                                            }
                                                        }
                                                    }}
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
            console.error("Error rendering table:", error);
            return (
                <div className="text-center p-3 text-danger">
                    <p>Error rendering table. Please try refreshing the page.</p>
                </div>
            );
        }
    };

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
                                    <Col className="mb-3 text-end">
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