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
import axiosInstance from "../../Features/axios";
import { updateToastData } from "../../Features/toasterSlice";
import { ERROR, MARKET_RUNNER_CONNECT, MARKET_RUNNER_DATA, SUCCESS, UPDATE_BALL_STATUS } from "../../components/Common/Const";
import { useDispatch } from "react-redux";
import { useNavigate } from 'react-router-dom';
import createSocket from '../../Features/socket.js';
import { RiRefreshLine } from 'react-icons/ri';
import { AUTO_STATUS, CLOSE_VALUE, CUSTOM_STATUS, INACTIVE_VALUE, OPEN_VALUE, SUSPEND_VALUE } from './CommentartConst.js';

// Styled Components
const RateBox = styled(Box)(({ theme, type }) => ({
    backgroundColor: type === 'back' ? 'rgba(144, 202, 249, 0.2)' :
        type === 'lay' ? 'rgba(255, 182, 193, 0.2)' :
            'inherit',
    width: '100%',
    '& .MuiInputBase-root': {
        backgroundColor: 'transparent'
    },
    '& .MuiInputBase-input': {
        padding: '4px',
        textAlign: 'center',
        fontSize: '1.1rem'
    },
    '& .price-field': {
        height: '40px'
    },
    '& .volume-field': {
        height: '24px'
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

const StyledTableCell = styled(TableCell)(({ theme, type }) => ({
    backgroundColor: type === 'back' ? 'rgba(144, 202, 249, 0.1)' :
        type === 'lay' ? 'rgba(255, 182, 193, 0.1)' :
            'inherit',
    padding: '8px 4px' // Reduce padding
}));

export const UpdateManualOdds = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const socket = createSocket();
    const commentaryId = localStorage.getItem("updateManualOddsCommentaryId");
    const [isSocketConnected, setIsSocketConnected] = useState(false);
    const [isLive, setIsLive] = useState(true);
    const [rateSourceRefID, setRateSourceRefID] = useState([]);
    const [marketStatus, setMarketStatus] = useState("2"); // Default to inactive
    const [isLoading, setIsLoading] = useState(false);
    const [originalShortcutValues, setOriginalShortcutValues] = useState({});
    const [hasShortcutChanges, setHasShortcutChanges] = useState(false);
    const [runners, setRunners] = useState([]);
    const [selectedRunner, setSelectedRunner] = useState(null);
    const [ballStatus, setBallStatus] = useState(null);
    const [eventData, setEventData] = useState({
        comDetails: null,
        teams: [],
        market: {},
    });
    const [settings, setSettings] = useState({
        rateRange: 10,
        ballStartAfter: 1,
        showRate: 1,
        bRateDifferent: 0.01,
        lRateDifferent: 0.01,
        volumeLength: 3,
        volumeType: CUSTOM_STATUS,
        betAllow: false,
        active: false,
        rateDifferent: 5,
        bRateVolume: 300,
        lRateVolume: 300,
        margin: 10,
        delay: 10,
        lineRatio: 10,
        shortcutValues: {
            Q: '0.03', W: '0.05', E: '0.07', R: '0.08',
            T: '0.10', Y: '0.15', U: '0.20', I: '0.30',
            O: '', P: ''
        }
    });
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

        // Find runner with minimum lay price
        const minLayRunner = getRunnerWithMinimumLay(formattedRunners);

        // Set the runners with the minimum lay price runner selected
        setRunners(formattedRunners.map(runner => ({
            ...runner,
            isSelected: runner.runnerId === minLayRunner?.runnerId
        })));

        // Set the selected runner
        if (minLayRunner) {
            setSelectedRunner(minLayRunner.runnerId);
            setSelectedRunnerDetails(prev => ({
                ...prev,
                runnerId: minLayRunner.runnerId
            }));
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

    const handleStatusChange = (newStatus) => {
        setMarketStatus(newStatus);
    };

    const handleSettingChange = (key, value, isShortcut = false) => {
        if (isShortcut) {
            const newValue = settings.shortcutValues[value];
            if (newValue) {
                handleSettingChange('rateDifferent', newValue);
            }
        } else {
            // Ensure value is numeric for rate-related settings
            const numericValue = value === '' ? '0' : value;
            setSettings(prev => ({ ...prev, [key]: numericValue }));

            // Trigger recalculation when rate differences or volumes change
            if (['rateDifferent', 'bRateDifferent', 'lRateDifferent'].includes(key)) {
                setRunners(prev => prev.map(runner => {
                    const newSettings = { ...settings, [key]: numericValue };
                    const newRates = calculateRunnerRates(runner, newSettings);
                    let objToSend = {
                        ...runner,
                        b2: newRates.b2,
                        b1: newRates.b1,
                        back: { ...runner.back, price: newRates.back },
                        lay: { ...runner.lay, price: newRates.lay },
                        l1: newRates.l1,
                        l2: newRates.l2,
                    }
                    return objToSend
                }));
            }
            if (settings.volumeType === CUSTOM_STATUS) {
                if (key === 'bRateVolume') {
                    setRunners(prev => prev.map(runner => ({
                        ...runner,
                        b2Volume: numericValue,
                        b1Volume: numericValue,
                        back: { ...runner.back, volume: numericValue }
                    })));
                } else if (key === 'lRateVolume') {
                    setRunners(prev => prev.map(runner => ({
                        ...runner,
                        lay: { ...runner.lay, volume: numericValue },
                        l1Volume: numericValue,
                        l2Volume: numericValue
                    })));
                }
            }
        }
    };

    const handleKeyPress = useCallback((event) => {
        const key = event.key.toUpperCase();
        const value = settings.shortcutValues[key];
        if (value) {
            handleSettingChange('rateDifferent', value);
        }
        switch (key) {
            case 'S':
                handleStatusChange(SUSPEND_VALUE.toString)
                break;
            case 'D':
                handleStatusChange(INACTIVE_VALUE.toString)
                break;
            case 'F':
                handleStatusChange(CLOSE_VALUE.toString)
                break;
            case 'G':
                handleStatusChange(OPEN_VALUE.toString)
                break;
            default:
                break;
        }
    }, [settings.shortcutValues]);

    const handleSync = () => {
        setOriginalShortcutValues(settings.shortcutValues);
        setHasShortcutChanges(false);
    };
    const calculateRunnerRates = (runner, settings) => {
        // Ensure we have numeric values, default to 0 if undefined/null/NaN
        const back = parseFloat(runner?.back?.price) || 0;
        const bRateDiff = parseFloat(settings?.bRateDifferent) || 0;
        const lRateDiff = parseFloat(settings?.lRateDifferent) || 0;
        const rateDiff = parseFloat(settings?.rateDifferent) || 0;

        // Calculate and ensure all values are numbers
        const b2 = Number((back - (2 * bRateDiff)).toFixed(2));
        const b1 = Number((back - bRateDiff).toFixed(2));
        const lay = Number((back + rateDiff).toFixed(2));
        const l1 = Number((back + rateDiff + lRateDiff).toFixed(2));
        const l2 = Number((back + rateDiff + (2 * lRateDiff)).toFixed(2));

        return {
            b2,
            b1,
            back,
            lay,
            l1,
            l2
        };
    };

    // Function to find runner with minimum lay price
    const getRunnerWithMinimumLay = (runnersData) => {
        if (!runnersData?.length) return null;
        return runnersData.reduce((minRunner, currentRunner) => {
            return (currentRunner.lay?.price || Infinity) < (minRunner.lay?.price || Infinity)
                ? currentRunner
                : minRunner;
        }, runnersData[0]);
    };


    // Prepare data for saving
    const prepareMarketData = () => {
        const marketData = {
            eventMarket: [{
                eventMarketId: eventData.market.eventMarketId,
                marketName: eventData.market.marketName,
                margin: eventData.market.margin,
                status: parseInt(marketStatus),
                isActive: settings.active,
                isAllow: settings.betAllow,
                isSendData: true,
                lineRatio: eventData.market.lineRatio,
                rateDiff: settings.rateDifferent,
                predefinedValue: eventData.market.predefinedValue,
                runner: runners.map(runner => ({
                    runnerId: runner.runnerId,
                    line: runner.line,
                    overRate: runner.overRate,
                    underRate: runner.underRate,
                    backPrice: runner.back.price,
                    layPrice: runner.lay.price,
                    backSize: runner.back.volume,
                    laySize: runner.lay.volume
                }))
            }]
        };
        return marketData;
    };

    // Save handler
    const handleSave = async () => {
        setIsLoading(true);
        try {
            const marketData = prepareMarketData();
            const response = await axiosInstance.post('/admin/eventMarket/upManualMarket', marketData);

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
                    // Add this block for custom volume handling
                    if (settings.volumeType === CUSTOM_STATUS && field === 'back') {
                        const newVolumes = parsedValue;
                        return {
                            ...newRunner,
                            b2Volume: newVolumes.b2Volume,
                            b1Volume: newVolumes.b1Volume,
                            back: { ...runner.back, volume: newVolumes.backVolume },
                            lay: { ...runner.lay, volume: newVolumes.layVolume },
                            l1Volume: newVolumes.l1Volume,
                            l2Volume: newVolumes.l2Volume
                        };
                    }
                    if (settings.volumeType === CUSTOM_STATUS && valueType === 'volume') {
                        if (field === 'lay') {
                            const newVolumes = {
                                l1Volume: parsedValue + parseFloat(settings.lRateVolume),
                                l2Volume: parsedValue + (2 * parseFloat(settings.lRateVolume))
                            };
                            return {
                                ...newRunner,
                                lay: { ...runner.lay, volume: parsedValue },
                                ...newVolumes
                            };
                        }
                    }
                    // Your existing volume change logic
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
        const isBackType = ['b2', 'b1', 'back'].includes(field);
        const isLayType = ['lay', 'l1', 'l2'].includes(field);
        const type = isBackType ? 'back' : isLayType ? 'lay' : '';

        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <RateBox type={type}>
                    <TextField
                        type="number"
                        fullWidth
                        size="small"
                        value={isActive ? (price !== null ? Number(price).toFixed(2).replace(/\.?0+$/, '') : '0') : '-'}
                        onChange={(e) => handleCellEdit(runner.runnerId, field, 'price', e.target.value)}
                        disabled={!isActive}
                        sx={{
                            '& .MuiInputBase-root': { height: '40px' }
                        }}
                        inputProps={{ step: "0.1" }}
                    />
                </RateBox>
                <RateBox type={type}>
                    <TextField
                        type="number"
                        fullWidth
                        size="small"
                        value={isActive ? (volume || '') : '-'}
                        onChange={(e) => handleCellEdit(runner.runnerId, field, 'volume', e.target.value)}
                        disabled={!isActive}
                        className="volume-field"
                        sx={{
                            '& .MuiInputBase-root': { height: '24px' }
                        }}
                        inputProps={{ step: "1" }}
                    />
                </RateBox>
            </Box>
        );
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

    const generateRandomVolume = (length) => {
        const min = Math.pow(10, length - 1);
        const max = Math.pow(10, length) - 1;
        return Math.floor(Math.random() * (max - min + 1) + min);
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
                    market: response.result.market?.[0] || {},
                });
                const marketData = response.result.market?.[0]
                const settingDataToUpdate = {
                    ...settings,
                    betAllow: marketData?.isAllow || settings.betAllow,
                    active: marketData?.isActive || settings.active,
                    rateDifferent: marketData?.rateDiff || settings.rateDifferent,
                    bRateVolume: marketData?.defaultBackSize || settings.bRateVolume,
                    lRateVolume: marketData?.defaultLaySize || settings.lRateVolume,
                    margin: marketData?.margin || settings.margin,
                    delay: marketData?.delay || settings.delay,
                    lineRatio: marketData?.lineRatio || settings.lineRatiow
                }
                setSettings(settingDataToUpdate)
                if (marketData?.rateSourceRefID) {
                    setRateSourceRefID([response.result.market[0].rateSourceRefID]);
                }

                // Initialize runners
                if (marketData?.runners) {
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
        let intervalId;
        if (settings.volumeType === AUTO_STATUS) {
            intervalId = setInterval(() => {
                setRunners(prev => prev.map(runner => {
                    const activeColumns = getActiveColumns(settings.showRate);
                    const newVolumes = {};

                    activeColumns.forEach(field => {
                        if (field === 'back' || field === 'lay') {
                            const volume = generateRandomVolume(settings.volumeLength);
                            if (field === 'back') {
                                newVolumes.back = { ...runner.back, volume };
                            } else {
                                newVolumes.lay = { ...runner.lay, volume };
                            }
                        } else {
                            newVolumes[`${field}Volume`] = generateRandomVolume(settings.volumeLength);
                        }
                    });

                    return {
                        ...runner,
                        ...newVolumes
                    };
                }));
            }, 1000);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [settings.volumeType, settings.volumeLength]);

    useEffect(() => {
        const handleKeyDown = async (e) => {
            if (e.key === 'Enter') {
                if (selectedRunnerDetails.main || selectedRunnerDetails.point) {
                    // Calculate and update prices for selected runner
                    const main = parseFloat(selectedRunnerDetails.main) || 0;
                    const point = parseFloat(selectedRunnerDetails.point) || 0;
                    const calculatedPrice = main + (point / 100);

                    handleCellEdit(selectedRunnerDetails.runnerId, 'back', 'price', calculatedPrice);
                }

                // Handle status toggle and save
                const newStatus = marketStatus === "1" ? "3" : "1";
                await new Promise(resolve => {
                    setMarketStatus(newStatus);
                    resolve();
                });

                // Prepare market data with the new status
                const marketData = {
                    eventMarket: [{
                        ...prepareMarketData().eventMarket[0],
                        status: parseInt(newStatus),
                        isActive: newStatus === "1"
                    }]
                };

                // Save with the updated status
                setIsLoading(true);
                try {
                    const response = await axiosInstance.post('/admin/eventMarket/upManualMarket', marketData);
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
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedRunnerDetails, marketStatus]);

    useEffect(() => {
        fetchMarketData();
        // Store original shortcut values
        setOriginalShortcutValues(settings.shortcutValues);
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);


    useEffect(() => {
        console.log("Socket Effect triggered with:", {
            hasRateSourceRefID: rateSourceRefID.length > 0,
            hasSocket: !!socket,
            isLive
        });

        if (rateSourceRefID.length > 0 && socket) {
            console.log("Emitting MARKET_RUNNER_CONNECT with:", rateSourceRefID);
            socket.emit(MARKET_RUNNER_CONNECT, rateSourceRefID);
            setIsSocketConnected(true);
            const handleBallStatus = (data) => {
                if (data) {
                    setBallStatus(data?.ballStatus);
                }
            }
            // Handler for market runner messages
            const handleMarketRunnerData = (message) => {
                if (!isLive || !message?.[0]?.runners) return;

                const socketRunners = message[0].runners;

                setRunners(prevRunners => {
                    return prevRunners.map(prevRunner => {
                        const socketRunner = socketRunners.find(
                            r => r.selectionId === prevRunner.selectionId
                        );

                        if (socketRunner) {
                            // Calculate all rates based on new socket data
                            const newRates = calculateRunnerRates({
                                back: { price: socketRunner.backPrice }
                            }, settings);
                            console.log({ prevRunner })
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
                                // Update all calculated rates
                                b2: newRates.b2,
                                b1: newRates.b1,
                                l1: newRates.l1,
                                l2: newRates.l2,
                                b1Volume: socketRunner.backSize,
                                b2Volume: socketRunner.backSize,
                                l1Volume: socketRunner.laySize,
                                l2Volume: socketRunner.laySize,
                            };
                        }
                        return prevRunner;
                    });
                });
            }

            // Set up socket event listeners
            socket.on(MARKET_RUNNER_DATA, handleMarketRunnerData);
            socket.on(UPDATE_BALL_STATUS, handleBallStatus);

            // Cleanup function
            return () => {
                console.log("Cleaning up socket listener");
                socket.off(MARKET_RUNNER_DATA, handleMarketRunnerData);
                socket.off(UPDATE_BALL_STATUS, handleBallStatus);
            };
        }
    }, [rateSourceRefID, socket, isLive, settings]);

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
                                    {!isEmpty(eventData?.comDetails) && (
                                        <Box sx={{ mb: 3 }}>
                                            <Typography variant="h6">{`${eventData.comDetails.eventName}/${eventData.market?.marketName} [${eventData.market?.rateSourceRefID}]`}</Typography>
                                            <Typography variant="body2">
                                                {`Ref: ${eventData.comDetails.eventRefId} [ ${new Date(eventData.comDetails.eventDate).toLocaleString()} ]`}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                                <Box width="33.33%" sx={{ textAlign: 'right' }}>
                                    <Button color="primary" className="me-2" onClick={handleSave}>Save</Button>
                                    <Button color="danger" onClick={() => navigate("/commentary")}>Exit</Button>
                                </Box>
                            </Box>

                            {isLoading && <SpinnerModel />}
                            {/* Status Controls */}
                            <Box display="flex" gap={2} sx={{ mb: 3 }}>
                                <Box width="66.67%">
                                    <FormControl component="fieldset">
                                        <RadioGroup
                                            row
                                            value={marketStatus}
                                            onChange={(e) => handleStatusChange(e.target.value)}
                                        >
                                            <FormControlLabel value={INACTIVE_VALUE.toString()} control={<Radio />} label="Inactive" />
                                            <FormControlLabel value={CLOSE_VALUE.toString()} control={<Radio />} label="Close" />
                                        </RadioGroup>
                                    </FormControl>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={settings.betAllow}
                                                onChange={(e) => setSettings(prev => ({ ...prev, betAllow: e.target.checked }))}
                                            />
                                        }
                                        label="Bet Allowed"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={settings.active}
                                                onChange={(e) => setSettings(prev => ({ ...prev, active: e.target.checked }))}
                                            />
                                        }
                                        label="Active"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={isLive}
                                                onChange={(e) => setIsLive(e.target.checked)}
                                            />
                                        }
                                        label="Live"
                                    />
                                </Box>
                                <Box width="15%">
                                    <TextField
                                        label="Rate Range"
                                        size="small"
                                        fullWidth
                                        value={settings.rateRange}
                                        onChange={(e) => handleSettingChange('rateRange', e.target.value)}
                                    />
                                </Box>
                                <Box width="15%">
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
                                        inputProps={{ step: "0.01" }}
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
                                        inputProps={{ step: "0.01" }}
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
                                        inputProps={{ step: "0.01" }}
                                        onChange={(e) => handleSettingChange('lRateDifferent', e.target.value)}
                                    />
                                </Box>
                                <Box width="20%">
                                    <TextField
                                        label="Margin"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={settings.margin}
                                        inputProps={{ step: "0.01" }}
                                        onChange={(e) => handleSettingChange('margin', e.target.value)}
                                    />
                                </Box>
                                <Box width="20%">
                                    <TextField
                                        label="Delay"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={settings.delay}
                                        inputProps={{ step: "0.01" }}
                                        onChange={(e) => handleSettingChange('delay', e.target.value)}
                                    />
                                </Box>
                                <Box width="20%">
                                    <TextField
                                        label="Line Ratio"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={settings.lineRatio}
                                        inputProps={{ step: "0.01" }}
                                        onChange={(e) => handleSettingChange('lineRatio', e.target.value)}
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
                                                value={AUTO_STATUS}
                                                control={<Radio />}
                                                label="Auto Volume"
                                            />
                                            <FormControlLabel
                                                value={CUSTOM_STATUS}
                                                control={<Radio />}
                                                label="Cust.Volume"
                                            />
                                        </RadioGroup>
                                    </FormControl>
                                </Box>
                                <Box width="16.67%">
                                    <TextField
                                        label="B.Rate Volume"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={settings.bRateVolume}
                                        onChange={(e) => handleSettingChange('bRateVolume', e.target.value)}
                                        disabled={settings.volumeType === AUTO_STATUS}
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
                                        disabled={settings.volumeType === AUTO_STATUS}
                                    />
                                </Box>
                                <Box width="16.67%">
                                    <TextField
                                        label="Volume Length"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={settings.volumeLength}
                                        onChange={(e) => handleSettingChange('volumeLength', e.target.value)}
                                        disabled={settings.volumeType === CUSTOM_STATUS}
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
                                                    <StyledTableCell align="center" type="back">
                                                        <RateCell
                                                            runner={runner}
                                                            field="back"
                                                            price={runner.back.price}
                                                            volume={runner.back.volume}
                                                            isActive={activeColumns.includes('back')}
                                                        />
                                                    </StyledTableCell>
                                                    <StyledTableCell align="center" type="lay">
                                                        <RateCell
                                                            runner={runner}
                                                            field="lay"
                                                            price={runner.lay.price}
                                                            volume={runner.lay.volume}
                                                            isActive={activeColumns.includes('lay')}
                                                        />
                                                    </StyledTableCell>
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
                                // Updated Selected Runner Details section
                                <Paper elevation={1} sx={{ mt: 3, p: 0 }}>  {/* Removed padding */}
                                    <Box display="flex" gap={2} sx={{ p: 2 }}>
                                        <Box width="25%">
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
                                        <Box width="25%">
                                            <TextField
                                                fullWidth
                                                size="small"
                                                type="number"
                                                label="Main"
                                                value={selectedRunnerDetails.main}
                                                onChange={(e) => setSelectedRunnerDetails(prev => ({
                                                    ...prev,
                                                    main: Math.max(0, parseInt(e.target.value) || 0)
                                                }))}
                                                disabled={isLive}
                                                inputProps={{
                                                    min: 0,
                                                    step: 1
                                                }}
                                            />
                                        </Box>
                                        <Box width="25%">
                                            <TextField
                                                fullWidth
                                                size="small"
                                                type="number"
                                                label="Point"
                                                value={selectedRunnerDetails.point}
                                                onChange={(e) => setSelectedRunnerDetails(prev => ({
                                                    ...prev,
                                                    point: e.target.value
                                                }))}
                                                disabled={isLive}
                                                inputProps={{ step: 1 }}
                                            />
                                        </Box>
                                        <Box width="25%">
                                            <FormControl component="fieldset">
                                                <RadioGroup
                                                    row
                                                    value={marketStatus}
                                                >
                                                    <FormControlLabel value={OPEN_VALUE} control={<Radio />} label="Open" />
                                                    <FormControlLabel value={SUSPEND_VALUE} control={<Radio />} label="Suspend" />
                                                </RadioGroup>
                                            </FormControl>
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