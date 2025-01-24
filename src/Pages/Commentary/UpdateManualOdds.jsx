import React, { useState, useEffect, useCallback } from 'react';
import {
    Paper, Radio, RadioGroup, FormControlLabel, FormControl,
    Switch, TextField, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Typography, Box, Select, MenuItem
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { isEmpty } from 'lodash';
import SpinnerModel from "../../components/Model/SpinnerModel";
import { Container, Button } from 'reactstrap';
import Breadcrumbs from "../../components/Common/Breadcrumb";
import axiosInstance from "../../Features/axios";
import { updateToastData } from "../../Features/toasterSlice";
import { ERROR, MARKET_RUNNER_CONNECT, MARKET_RUNNER_DATA, SUCCESS } from "../../components/Common/Const";
import { useDispatch } from "react-redux";
import { useNavigate } from 'react-router-dom';
import createSocket from '../../Features/socket.js';
import { RiRefreshLine } from 'react-icons/ri';

// Styled Components
const RateBox = styled(Box)(({ theme, type }) => ({
    padding: theme.spacing(1),
    textAlign: 'center',
    backgroundColor: type === 'back' ? 'rgba(144, 202, 249, 0.2)' : 'rgba(255, 205, 210, 0.2)',
    borderRadius: theme.shape.borderRadius,
    '&.large': {
        fontSize: '1.2rem',
        padding: theme.spacing(1.5)
    },
    '&.small': {
        fontSize: '0.9rem',
        padding: theme.spacing(0.5)
    }
}));

const KeyBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    width: '100px',
    '& .key': {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.common.white,
        padding: theme.spacing(1),
        borderTopLeftRadius: theme.shape.borderRadius,
        borderTopRightRadius: theme.shape.borderRadius,
        textAlign: 'center',
    },
    '& .value': {
        backgroundColor: theme.palette.grey[100],
        padding: theme.spacing(0.5),
        borderBottomLeftRadius: theme.shape.borderRadius,
        borderBottomRightRadius: theme.shape.borderRadius,
    }
}));

const StyledTableRow = styled(TableRow)(({ theme, selected }) => ({
    backgroundColor: selected ? 'rgba(0, 0, 0, 0.04)' : 'inherit',
    '&:hover': {
        backgroundColor: selected ? 'rgba(0, 0, 0, 0.08)' : 'rgba(0, 0, 0, 0.04)',
    }
}));
export const UpdateManualOdds = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const commentaryId = localStorage.getItem("updateManualOddsCommentaryId");
    const [isSocketConnected, setIsSocketConnected] = useState(false);
    const [isLive, setIsLive] = useState(true);

    const [rateSourceRefID, setRateSourceRefID] = useState([]);
    const socket = createSocket();
    // Main states
    const [isLoading, setIsLoading] = useState(false);
    const [eventData, setEventData] = useState({
        comDetails: null,
        teams: [],
        market: [],
    });
    const [status, setStatus] = useState({
        suspended: false,
        inactive: true,
        close: false,
        betAllow: true,
        active: true
    });
    const [settings, setSettings] = useState({
        rateRange: '',
        ballStartAfter: 1,
        showRate: 1,
        rateDifferent: 0.01,
        bRateDifferent: 0.01,
        lRateDifferent: 0.01,
        volumeType: 'auto',
        volumeLength: 3,
        bRateVolume: 0,
        lRateVolume: 0,
        shortcutValues: {
            Q: '0.03', W: '0.05', E: '0.07', R: '0.08',
            T: '0.10', Y: '0.15', U: '0.20', I: '0.30',
            O: '', P: ''
        }
    });
    const [originalShortcutValues, setOriginalShortcutValues] = useState({});
    const [hasShortcutChanges, setHasShortcutChanges] = useState(false);
    const [runners, setRunners] = useState([]);
    const [selectedRunner, setSelectedRunner] = useState(null);
    const [selectedRunnerDetails, setSelectedRunnerDetails] = useState({
        runnerId: null,
        main: '',
        point: ''
    });
    const initializeRunners = (runnersData) => {
        const formattedRunners = runnersData.map(runner => {
            const rates = calculateRunnerRates({
                back: { price: runner.backPrice || 0 }
            }, settings);

            return {
                ...runner,
                selectionId: runner.selectionId,
                isSelected: false,
                autoVolume: true,
                back: {
                    price: runner.backPrice || 0,
                    volume: runner.backSize || 0
                },
                lay: {
                    price: runner.layPrice || 0,
                    volume: runner.laySize || 0
                },
                b2: rates.b2,
                b1: rates.b1,
                l1: rates.l1,
                l2: rates.l2
            };
        });
        setRunners(formattedRunners);
        // Auto-select first runner on initialization
        if (formattedRunners.length > 0) {
            handleRunnerSelection(formattedRunners[0].runnerId);
        }
    };

    // Handle runner selection
    const handleRunnerSelection = (runnerId) => {
        setRunners(prev => prev.map(runner => ({
            ...runner,
            isSelected: runner.runnerId === runnerId
        })));
        setSelectedRunner(runnerId);
        setSelectedRunnerDetails(prev => ({
            ...prev,
            runnerId
        }));
    };

    const handleSettingChange = (key, value, isShortcut = false) => {
        if (isShortcut) {
            // Existing shortcut handling code
        } else {
            setSettings(prev => ({ ...prev, [key]: value }));

            // Trigger recalculation when rate differences change
            if (['rateDifferent', 'bRateDifferent', 'lRateDifferent'].includes(key)) {
                setRunners(prev => prev.map(runner => {
                    const newRates = calculateRunnerRates({
                        ...runner,
                        back: { price: runner.back.price }
                    }, { ...settings, [key]: value });

                    return {
                        ...runner,
                        b2: newRates.b2,
                        b1: newRates.b1,
                        lay: { price: newRates.lay, volume: runner.lay.volume },
                        l1: newRates.l1,
                        l2: newRates.l2
                    };
                }));
            }
        }
    };

    const handleKeyPress = useCallback((event) => {
        const key = event.key.toUpperCase();
        // Use callback to ensure we get latest settings
        setSettings(currentSettings => {
            const value = currentSettings.shortcutValues[key];
            if (value) {
                return {
                    ...currentSettings,
                    rateDifferent: value
                };
            }
            return currentSettings;
        });
    }, []); //
    const handleSync = () => {
        setOriginalShortcutValues(settings.shortcutValues);
        setHasShortcutChanges(false);
    };
    const calculateRunnerRates = (runner, settings) => {
        const back = parseFloat(runner.back.price) || 0;
        const bRateDiff = parseFloat(settings.bRateDifferent) || 0;
        const lRateDiff = parseFloat(settings.lRateDifferent) || 0;
        const rateDiff = parseFloat(settings.rateDifferent) || 0;

        return {
            b2: back - (2 * bRateDiff),
            b1: back - bRateDiff,
            back: back,
            lay: back + rateDiff,
            l1: back + rateDiff + lRateDiff,
            l2: back + rateDiff + (2 * lRateDiff)
        };
    };

    // Prepare data for saving
    const prepareMarketData = () => ({
        commentaryId,
        status,
        settings: {
            ...settings,
            shortcutValues: settings.shortcutValues
        },
        runners: runners.map(runner => ({
            runnerId: runner.runnerId,
            isSelected: runner.isSelected,
            autoVolume: runner.autoVolume,
            backPrice: runner.back.price,
            layPrice: runner.lay.price,
            backSize: runner.back.volume,
            laySize: runner.lay.volume,
            b2: runner.b2,
            b1: runner.b1,
            l1: runner.l1,
            l2: runner.l2
        })),
        selectedRunnerDetails
    });

    // Save handler
    const handleSave = async () => {
        setIsLoading(true);
        try {
            const marketData = prepareMarketData();
            const response = await axiosInstance.post('/admin/eventMarket/updateManualMarket', marketData);

            if (response?.success) {
                dispatch(updateToastData({
                    data: "Market updated successfully",
                    title: "Success",
                    type: SUCCESS
                }));
                await fetchMarketData();
            }
        } catch (error) {
            dispatch(updateToastData({
                data: error?.message,
                title: error?.title,
                type: ERROR
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const handleCellEdit = (runnerId, field, valueType, value) => {
        // Validate numeric input
        if (value !== '' && !/^\d*\.?\d*$/.test(value)) {
            return;
        }

        setRunners(prev => prev.map(runner => {
            if (runner.runnerId === runnerId) {
                const newRunner = { ...runner };
                const parsedValue = parseFloat(value) || 0;

                // Handle price changes
                if (valueType === 'price') {
                    switch (field) {
                        case 'b2':
                            // When B2 changes, adjust B1 and Back
                            const b1Value = parsedValue + parseFloat(settings.bRateDifferent);
                            const backValue = b1Value + parseFloat(settings.bRateDifferent);
                            const newRatesFromB2 = calculateRunnerRates({
                                ...runner,
                                back: { price: backValue }
                            }, settings);

                            return {
                                ...newRunner,
                                b2: parsedValue,
                                b1: newRatesFromB2.b1,
                                back: { ...runner.back, price: newRatesFromB2.back },
                                lay: { ...runner.lay, price: newRatesFromB2.lay },
                                l1: newRatesFromB2.l1,
                                l2: newRatesFromB2.l2
                            };

                        case 'b1':
                            // When B1 changes, adjust Back
                            const newBackValue = parsedValue + parseFloat(settings.bRateDifferent);
                            const newRatesFromB1 = calculateRunnerRates({
                                ...runner,
                                back: { price: newBackValue }
                            }, settings);

                            return {
                                ...newRunner,
                                b2: newRatesFromB1.b2,
                                b1: parsedValue,
                                back: { ...runner.back, price: newRatesFromB1.back },
                                lay: { ...runner.lay, price: newRatesFromB1.lay },
                                l1: newRatesFromB1.l1,
                                l2: newRatesFromB1.l2
                            };

                        case 'back':
                            // When Back changes, recalculate all
                            const newRatesFromBack = calculateRunnerRates({
                                ...runner,
                                back: { price: parsedValue }
                            }, settings);

                            return {
                                ...newRunner,
                                b2: newRatesFromBack.b2,
                                b1: newRatesFromBack.b1,
                                back: { ...runner.back, price: parsedValue },
                                lay: { ...runner.lay, price: newRatesFromBack.lay },
                                l1: newRatesFromBack.l1,
                                l2: newRatesFromBack.l2
                            };

                        case 'lay':
                            // When Lay changes, adjust L1 and L2
                            const newRatesFromLay = calculateRunnerRates({
                                ...runner,
                                back: { price: parsedValue - parseFloat(settings.rateDifferent) }
                            }, settings);

                            return {
                                ...newRunner,
                                b2: newRatesFromLay.b2,
                                b1: newRatesFromLay.b1,
                                back: { ...runner.back, price: newRatesFromLay.back },
                                lay: { ...runner.lay, price: parsedValue },
                                l1: newRatesFromLay.l1,
                                l2: newRatesFromLay.l2
                            };

                        case 'l1':
                            // When L1 changes, adjust L2 and back-calculate
                            const layValue = parsedValue - parseFloat(settings.lRateDifferent);
                            const backFromL1 = layValue - parseFloat(settings.rateDifferent);
                            const newRatesFromL1 = calculateRunnerRates({
                                ...runner,
                                back: { price: backFromL1 }
                            }, settings);

                            return {
                                ...newRunner,
                                b2: newRatesFromL1.b2,
                                b1: newRatesFromL1.b1,
                                back: { ...runner.back, price: newRatesFromL1.back },
                                lay: { ...runner.lay, price: newRatesFromL1.lay },
                                l1: parsedValue,
                                l2: newRatesFromL1.l2
                            };

                        case 'l2':
                            // When L2 changes, back-calculate all values
                            const l1FromL2 = parsedValue - parseFloat(settings.lRateDifferent);
                            const layFromL2 = l1FromL2 - parseFloat(settings.lRateDifferent);
                            const backFromL2 = layFromL2 - parseFloat(settings.rateDifferent);
                            const newRatesFromL2 = calculateRunnerRates({
                                ...runner,
                                back: { price: backFromL2 }
                            }, settings);

                            return {
                                ...newRunner,
                                b2: newRatesFromL2.b2,
                                b1: newRatesFromL2.b1,
                                back: { ...runner.back, price: newRatesFromL2.back },
                                lay: { ...runner.lay, price: newRatesFromL2.lay },
                                l1: newRatesFromL2.l1,
                                l2: parsedValue
                            };

                        default:
                            return newRunner;
                    }
                }
                // Handle volume changes
                else if (valueType === 'volume') {
                    const fieldParts = field.split('.');
                    if (fieldParts[0] === 'back') {
                        return {
                            ...newRunner,
                            back: { ...runner.back, volume: value }
                        };
                    } else if (fieldParts[0] === 'lay') {
                        return {
                            ...newRunner,
                            lay: { ...runner.lay, volume: value }
                        };
                    } else {
                        return {
                            ...newRunner,
                            [`${field}Volume`]: value
                        };
                    }
                }

                return newRunner;
            }
            return runner;
        }));
    };

    const handleShowRateChange = (value) => {
        // Only allow 1, 2, or 3
        if (/^[1-3]$/.test(value) || value === '') {
            handleSettingChange('showRate', value);
        }
    };

    const handleSelectedRunnerChange = (newRunnerId) => {
        setSelectedRunnerDetails(prev => ({
            ...prev,
            runnerId: newRunnerId
        }));
        handleRunnerSelection(newRunnerId); // This will select the runner in the table
    };

    const RateCell = ({ runner, field, price, volume, isActive }) => {
        if (!isActive) return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <RateBox type={field.startsWith('b') ? 'back' : 'lay'} className="large">-</RateBox>
                <RateBox type={field.startsWith('b') ? 'back' : 'lay'} className="small">-</RateBox>
            </Box>
        );

        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <TextField
                    size="small"
                    value={price || ''}
                    onChange={(e) => handleCellEdit(runner.runnerId, field, 'price', e.target.value)}
                    className="large"
                    fullWidth
                />
                <TextField
                    size="small"
                    value={volume || ''}
                    onChange={(e) => handleCellEdit(runner.runnerId, field, 'volume', e.target.value)}
                    className="small"
                    fullWidth
                />
            </Box>
        );
    };
    const handleLiveToggle = (isLive) => {
        setIsLive(isLive);
        if (isLive) {
            // Reconnect socket
            if (socket && rateSourceRefID.length > 0) {
                socket.emit(MARKET_RUNNER_CONNECT, rateSourceRefID);
                setIsSocketConnected(true);
            }
        } else {
            // Disconnect socket
            if (socket) {
                socket.disconnect();
                setIsSocketConnected(false);
            }
        }
    };

    const getActiveColumns = (showRate) => {
        switch (parseInt(showRate)) {
            case 1:
                return ['back', 'lay'];
            case 2:
                return ['b1', 'back', 'lay', 'l1'];
            case 3:
                return ['b2', 'b1', 'back', 'lay', 'l1', 'l2'];
            default:
                return ['back', 'lay'];
        }
    };

    const fetchMarketData = async () => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.post('/admin/eventMarket/getManualMarket', { commentaryId });
            if (response?.result) {
                if (!response.result.market) {
                    navigate("/manualOddsMarket");
                    return;
                }
                setEventData({
                    comDetails: response.result.comDetails || null,
                    teams: response.result.teams || [],
                    market: response.result.market || [],
                });

                // Set rateSourceRefID for socket
                if (response.result.market?.[0]?.rateSourceRefID) {
                    setRateSourceRefID([response.result.market[0].rateSourceRefID]);
                }

                // Initialize runners
                if (response.result.market?.[0]?.runners) {
                    initializeRunners(response.result.market[0].runners);
                }
            }
        } catch (error) {
            dispatch(updateToastData({
                data: error?.message,
                title: error?.title,
                type: ERROR
            }));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMarketData();
        // Store original shortcut values
        setOriginalShortcutValues(settings.shortcutValues);
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    useEffect(() => {
        if (rateSourceRefID.length > 0 && socket && isLive) {
            socket.emit(MARKET_RUNNER_CONNECT, rateSourceRefID);
            setIsSocketConnected(true);

            socket.on(MARKET_RUNNER_DATA, (socketData) => {
                if (socketData && socketData[0] && socketData[0]?.runner?.length > 0) {
                    const marketData = socketData[0];

                    if (marketData?.runner) {
                        setRunners(prevRunners => {
                            return prevRunners.map(prevRunner => {
                                const socketRunner = marketData.runner.find(
                                    r => r.selectionId === prevRunner.selectionId
                                );
                                if (socketRunner) {
                                    const newRates = calculateRunnerRates({
                                        ...prevRunner,
                                        back: { price: socketRunner.backPrice }
                                    }, settings);

                                    return {
                                        ...prevRunner,
                                        back: {
                                            price: socketRunner.backPrice,
                                            volume: socketRunner.backSize
                                        },
                                        lay: {
                                            price: socketRunner.layPrice,
                                            volume: socketRunner.laySize
                                        },
                                        b2: newRates.b2,
                                        b1: newRates.b1,
                                        l1: newRates.l1,
                                        l2: newRates.l2
                                    };
                                }
                                return prevRunner;
                            });
                        });
                    }
                }
            });

            return () => {
                socket.off(MARKET_RUNNER_DATA);
            };
        }
    }, [rateSourceRefID, isLive]);

    useEffect(() => {
        if (runners.length > 0 && !selectedRunner) {
            handleRunnerSelection(runners[0].runnerId);
        }
    }, [runners]);

    return (
        <Box className="page-content">
            <Container fluid>
                <Box display="flex" flexWrap="wrap" gap={2}>
                    <Box width="100%">
                        <Paper elevation={1} sx={{ p: 3 }}>
                            {/* Header */}
                            <Box display="flex" alignItems="center" gap={2} sx={{ mb: 3 }}>
                                <Box width="66.67%">
                                    <Breadcrumbs
                                        title="ScoreCard"
                                        breadcrumbItem="Update Manual Odds Market"
                                    />
                                </Box>
                                <Box width="33.33%" sx={{ textAlign: 'right' }}>
                                    <Button color="primary" className="me-2" onClick={handleSave}>Save</Button>
                                    <Button color="danger" onClick={() => navigate("/commentary")}>Exit</Button>
                                </Box>
                            </Box>

                            {isLoading && <SpinnerModel />}

                            {/* Event Details */}
                            {!isEmpty(eventData?.comDetails) && (
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="h6">{eventData.comDetails.eventName}</Typography>
                                    <Typography variant="body2">
                                        {`Ref: ${eventData.comDetails.eventRefId} [ ${new Date(eventData.comDetails.eventDate).toLocaleString()} ]`}
                                    </Typography>
                                </Box>
                            )}

                            {/* Status Controls */}
                            <Box display="flex" gap={2} sx={{ mb: 3 }}>
                                <Box width="66.67%">
                                    <FormControl component="fieldset">
                                        <RadioGroup
                                            row
                                            value={Object.keys(status).find(key => status[key]) || ''}
                                            onChange={(e) => setStatus(prev =>
                                                Object.fromEntries(Object.keys(prev).map(key =>
                                                    [key, key === e.target.value]
                                                ))
                                            )}
                                        >
                                            <FormControlLabel value="suspended" control={<Radio />} label="Suspended" />
                                            <FormControlLabel value="inactive" control={<Radio />} label="Inactive" />
                                            <FormControlLabel value="close" control={<Radio />} label="Close" />
                                        </RadioGroup>
                                    </FormControl>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={status.betAllow}
                                                onChange={(e) => setStatus(prev => ({ ...prev, betAllow: e.target.checked }))}
                                            />
                                        }
                                        label="Bet Allowed"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={status.active}
                                                onChange={(e) => setStatus(prev => ({ ...prev, active: e.target.checked }))}
                                            />
                                        }
                                        label="Active"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={isLive}
                                                onChange={(e) => handleLiveToggle(e.target.checked)}
                                            />
                                        }
                                        label="Live"
                                    />
                                </Box>
                                <Box width="33.33%">
                                    <TextField
                                        label="Rate Range"
                                        size="small"
                                        fullWidth
                                        value={settings.rateRange}
                                        onChange={(e) => handleSettingChange('rateRange', e.target.value)}
                                    />
                                </Box>
                            </Box>

                            {/* Settings Row */}
                            <Box display="flex" gap={2} sx={{ mb: 3 }}>
                                <Box width="20%">
                                    <TextField
                                        label="Show Rate"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={settings.showRate}
                                        onChange={(e) => handleShowRateChange(e.target.value)}  // Changed this line
                                        inputProps={{
                                            min: 1,
                                            max: 3
                                        }}
                                    />
                                </Box>
                                <Box width="20%">
                                    <TextField
                                        label="Rate Different"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={settings.rateDifferent}
                                        onChange={(e) => handleSettingChange('rateDifferent', e.target.value)}
                                    />
                                </Box>
                                <Box width="20%">
                                    <TextField
                                        label="B.Rate Different"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={settings.bRateDifferent}
                                        onChange={(e) => handleSettingChange('bRateDifferent', e.target.value)}
                                    />
                                </Box>
                                <Box width="20%">
                                    <TextField
                                        label="L.Rate Different"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={settings.lRateDifferent}
                                        onChange={(e) => handleSettingChange('lRateDifferent', e.target.value)}
                                    />
                                </Box>
                                <Box width="20%">
                                    <TextField
                                        label="Ball Start After"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={settings.ballStartAfter}
                                        onChange={(e) => handleSettingChange('ballStartAfter', e.target.value)}
                                    />
                                </Box>
                            </Box>
                            {/* Volume Controls */}
                            <Box display="flex" gap={2} sx={{ mt: 3 }}>
                                <Box width="50%">
                                    <FormControl component="fieldset">
                                        <RadioGroup
                                            row
                                            value={settings.volumeType}
                                            onChange={(e) => handleSettingChange('volumeType', e.target.value)}
                                        >
                                            <FormControlLabel
                                                value="auto"
                                                control={<Radio />}
                                                label="Auto Volume"
                                            />
                                            <FormControlLabel
                                                value="custom"
                                                control={<Radio />}
                                                label="Cust.Volume"
                                            />
                                        </RadioGroup>
                                    </FormControl>
                                </Box>
                                <Box width="16.67%">
                                    <TextField
                                        label="Volume Length"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={settings.volumeLength}
                                        onChange={(e) => handleSettingChange('volumeLength', e.target.value)}
                                    />
                                </Box>
                                <Box width="16.67%">
                                    <TextField
                                        label="B.Rate Volume"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={settings.bRateVolume}
                                        onChange={(e) => handleSettingChange('bRateVolume', e.target.value)}
                                    />
                                </Box>
                                <Box width="16.67%">
                                    <TextField
                                        label="L.Rate Volume"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={settings.lRateVolume}
                                        onChange={(e) => handleSettingChange('lRateVolume', e.target.value)}
                                    />
                                </Box>
                            </Box>
                            <Box display="flex" alignItems="center" flexWrap="wrap" gap={1} sx={{ mb: 3 }}>
                                <Box display="flex" flexWrap="wrap" gap={1} sx={{ flex: 1 }}>
                                    {Object.entries(settings.shortcutValues).map(([key, value]) => (
                                        <Box width="8%" key={key}>
                                            <KeyBox>
                                                <Box className="key" sx={{ py: 0.5 }}>{key}</Box>
                                                <TextField
                                                    className="value"
                                                    size="small"
                                                    value={value}
                                                    onChange={(e) => handleSettingChange(key, e.target.value, true)}
                                                    sx={{ '& .MuiInputBase-input': { py: 0.5 } }}
                                                />
                                            </KeyBox>
                                        </Box>
                                    ))}
                                </Box>
                                <Box width="8%">  {/* Same width as shortcut cards */}
                                    <Button
                                        color="primary"
                                        disabled={!hasShortcutChanges}
                                        onClick={handleSync}
                                        sx={{
                                            height: '100%',  // Match height of KeyBox
                                            width: '100%',   // Take full width of container
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: theme => theme.spacing(1),  // Match KeyBox padding
                                        }}
                                    >
                                        <RiRefreshLine className="me-1" size={16} />
                                        Sync
                                    </Button>
                                </Box>
                            </Box>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Selections</TableCell>
                                            <TableCell align="center">B2</TableCell>
                                            <TableCell align="center">B1</TableCell>
                                            <TableCell align="center">Back</TableCell>
                                            <TableCell align="center">Lay</TableCell>
                                            <TableCell align="center">L1</TableCell>
                                            <TableCell align="center">L2</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {runners.map((runner) => {
                                            const activeColumns = getActiveColumns(settings.showRate);
                                            return (
                                                <StyledTableRow key={runner.runnerId} selected={runner.isSelected}>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Radio
                                                                size="small"
                                                                checked={runner.isSelected}
                                                                onChange={() => handleRunnerSelection(runner.runnerId)}
                                                            />
                                                            <Typography>{runner.runner}</Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <RateCell
                                                            runner={runner}
                                                            field="b2"
                                                            price={runner.b2}
                                                            volume={runner.b2Volume}
                                                            isActive={activeColumns.includes('b2')}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <RateCell
                                                            runner={runner}
                                                            field="b1"
                                                            price={runner.b1}
                                                            volume={runner.b1Volume}
                                                            isActive={activeColumns.includes('b1')}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <RateCell
                                                            runner={runner}
                                                            field="back"
                                                            price={runner.back.price}
                                                            volume={runner.back.volume}
                                                            isActive={activeColumns.includes('back')}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <RateCell
                                                            runner={runner}
                                                            field="lay"
                                                            price={runner.lay.price}
                                                            volume={runner.lay.volume}
                                                            isActive={activeColumns.includes('lay')}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <RateCell
                                                            runner={runner}
                                                            field="l1"
                                                            price={runner.l1}
                                                            volume={runner.l1Volume}
                                                            isActive={activeColumns.includes('l1')}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <RateCell
                                                            runner={runner}
                                                            field="l2"
                                                            price={runner.l2}
                                                            volume={runner.l2Volume}
                                                            isActive={activeColumns.includes('l2')}
                                                        />
                                                    </TableCell>
                                                </StyledTableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            {selectedRunner && (
                                <Paper elevation={1} sx={{ mt: 3, p: 2 }}>
                                    <Typography variant="h6" sx={{ mb: 2 }}>Selected Runner Details</Typography>
                                    <Box display="flex" gap={2}>
                                        <Box width="33.33%">
                                            <FormControl fullWidth size="small">
                                                <Select
                                                    value={selectedRunnerDetails.runnerId || ''}
                                                    onChange={(e) => handleSelectedRunnerChange(e.target.value)}
                                                >
                                                    {runners.map(runner => (
                                                        <MenuItem key={runner.runnerId} value={runner.runnerId}>
                                                            {runner.runner}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Box>
                                        <Box width="33.33%">
                                            <TextField
                                                fullWidth
                                                size="small"
                                                label="Main"
                                                value={selectedRunnerDetails.main}
                                                onChange={(e) => setSelectedRunnerDetails(prev => ({
                                                    ...prev,
                                                    main: e.target.value
                                                }))}
                                            />
                                        </Box>
                                        <Box width="33.33%">
                                            <TextField
                                                fullWidth
                                                size="small"
                                                label="Point"
                                                value={selectedRunnerDetails.point}
                                                onChange={(e) => setSelectedRunnerDetails(prev => ({
                                                    ...prev,
                                                    point: e.target.value
                                                }))}
                                            />
                                        </Box>
                                    </Box>
                                </Paper>
                            )}
                        </Paper>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};