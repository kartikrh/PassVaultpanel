import React, { useState, useEffect } from 'react';
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

export const UpdateManualOdds = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const commentaryId = localStorage.getItem("updateManualOddsCommentaryId");
    const [isSocketConnected, setIsSocketConnected] = useState(false);
    const [rateSourceRefID, setRateSourceRefID] = useState([]);
    const socket = createSocket();
    // Main states
    const [isLoading, setIsLoading] = useState(false);
    const [eventData, setEventData] = useState({
        comDetails: null,
        teams: [],
        market: [],
    });

    // Betting interface states
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

    const [runners, setRunners] = useState([]);
    const [selectedRunner, setSelectedRunner] = useState(null);
    const [selectedRunnerDetails, setSelectedRunnerDetails] = useState({
        runnerId: null,
        main: '',
        point: ''
    });
    const initializeRunners = (runnersData) => {
        const formattedRunners = runnersData.map(runner => ({
            ...runner,
            selectionId: runner.selectionId, // Make sure this is included
            isSelected: false,
            autoVolume: true,
            back: {
                price: runner.backPrice || 0,
                volume: runner.backSize || 0
            },
            lay: {
                price: runner.layPrice || 0,
                volume: runner.laySize || 0
            }
        }));
        setRunners(formattedRunners);
    };

    // Handle runner selection
    const handleRunnerSelection = (runnerId) => {
        setRunners(prev => prev.map(runner => ({
            ...runner,
            isSelected: runner.runnerId === runnerId ? true : false
        })));
        setSelectedRunner(runnerId);
        setSelectedRunnerDetails({
            runnerId,
            main: '',
            point: ''
        });
    };

    // Handle settings changes
    const handleSettingChange = (key, value, isShortcut = false) => {
        if (isShortcut) {
            setSettings(prev => ({
                ...prev,
                shortcutValues: {
                    ...prev.shortcutValues,
                    [key]: value
                }
            }));
        } else {
            setSettings(prev => ({ ...prev, [key]: value }));
        }
    };

    // Handle shortcut keys
    const handleKeyPress = (event) => {
        const key = event.key.toUpperCase();
        if (settings.shortcutValues[key]) {
            handleSettingChange('rateDifferent', settings.shortcutValues[key]);
        }
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
            laySize: runner.lay.volume
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

    // Effects
    useEffect(() => {
        fetchMarketData();
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    useEffect(() => {
        if (rateSourceRefID.length > 0 && socket) {
            socket.emit(MARKET_RUNNER_CONNECT, rateSourceRefID);
            setIsSocketConnected(true);

            socket.on(MARKET_RUNNER_DATA, (socketData) => {

                if (socketData && socketData[0] && socketData[0]?.runner?.length > 0) {
                    const marketData = socketData[0]; // Get the first market

                    if (marketData?.runner) {
                        setRunners(prevRunners => {
                            return prevRunners.map(prevRunner => {
                                // Find matching runner using selectionId
                                const socketRunner = marketData.runner.find(
                                    r => r.selectionId === prevRunner.selectionId
                                );
                                if (socketRunner) {
                                    return {
                                        ...prevRunner,
                                        back: {
                                            price: socketRunner.backPrice,
                                            volume: socketRunner.backSize
                                        },
                                        lay: {
                                            price: socketRunner.layPrice,
                                            volume: socketRunner.laySize
                                        }
                                    };
                                }
                                return prevRunner;
                            });
                        });
                    }
                }
            });
        }

        return () => {
            if (socket) {
                socket.off(MARKET_RUNNER_DATA);
            }
        };
    }, [rateSourceRefID]);

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
                                        onChange={(e) => handleSettingChange('showRate', e.target.value)}
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
                            {/* Shortcut Keys */}
                            <Box display="flex" flexWrap="wrap" gap={1} sx={{ mb: 3 }}>
                                {Object.entries(settings.shortcutValues).map(([key, value]) => (
                                    <Box width="9%" key={key}>
                                        <KeyBox>
                                            <Box className="key">{key}</Box>
                                            <TextField
                                                className="value"
                                                size="small"
                                                value={value}
                                                onChange={(e) => handleSettingChange(key, e.target.value, true)}
                                            />
                                        </KeyBox>
                                    </Box>
                                ))}
                            </Box>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Selections</TableCell>
                                            <TableCell align="center">Back</TableCell>
                                            <TableCell align="center">Lay</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {runners.map((runner) => (
                                            <TableRow key={runner.runnerId}>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Switch
                                                            size="small"
                                                            checked={runner.isSelected}
                                                            onChange={() => handleRunnerSelection(runner.runnerId)}
                                                        />
                                                        <Typography>{runner.runner}</Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                        <RateBox type="back" className="large">
                                                            {runner.back.price || 0}
                                                        </RateBox>
                                                        <RateBox type="back" className="small">
                                                            {runner.back.volume || 0}
                                                        </RateBox>
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                        <RateBox type="lay" className="large">
                                                            {runner.lay.price || 0}
                                                        </RateBox>
                                                        <RateBox type="lay" className="small">
                                                            {runner.lay.volume || 0}
                                                        </RateBox>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {/* Selected Runner Details Section */}
                            {selectedRunner && (
                                <Paper elevation={1} sx={{ mt: 3, p: 2 }}>
                                    <Typography variant="h6" sx={{ mb: 2 }}>Selected Runner Details</Typography>
                                    <Box display="flex" gap={2}>
                                        <Box width="33.33%">
                                            <FormControl fullWidth size="small">
                                                <Select
                                                    value={selectedRunnerDetails.runnerId || ''}
                                                    onChange={(e) => setSelectedRunnerDetails(prev => ({
                                                        ...prev,
                                                        runnerId: e.target.value
                                                    }))}
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