import React, { useState, useEffect } from 'react';
import {
    Grid, Paper, Radio, RadioGroup, FormControlLabel, FormControl,
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
import { ERROR, SUCCESS } from "../../components/Common/Const";
import { useDispatch } from "react-redux";
import { useNavigate } from 'react-router-dom';

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
        bRateVolume: 300,
        lRateVolume: 200,
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
        field1: '',
        field2: ''
    });

    // Initialize runners with default values
    const initializeRunners = (runnersData) => {
        const formattedRunners = runnersData.map(runner => ({
            ...runner,
            isSelected: false,
            autoVolume: true,
            back: {
                price: runner.backPrice || 0,
                volume: settings.bRateVolume
            },
            lay: {
                price: runner.layPrice || 0,
                volume: settings.lRateVolume
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
            field1: '',
            field2: ''
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

    // Fetch market data
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

    return (
        <Box className="page-content">
            <Container fluid>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Paper elevation={1} sx={{ p: 3 }}>
                            {/* Header */}
                            <Grid container alignItems="center" spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={8}>
                                    <Breadcrumbs
                                        title="ScoreCard"
                                        breadcrumbItem="Update Manual Odds Market"
                                    />
                                </Grid>
                                <Grid item xs={4} sx={{ textAlign: 'right' }}>
                                    <Button color="primary" className="me-2" onClick={handleSave}>Save</Button>
                                    <Button color="danger" onClick={() => navigate("/commentary")}>Exit</Button>
                                </Grid>
                            </Grid>

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
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={8}>
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
                                </Grid>
                                <Grid item xs={4}>
                                    <TextField
                                        label="Rate Range"
                                        size="small"
                                        fullWidth
                                        value={settings.rateRange}
                                        onChange={(e) => handleSettingChange('rateRange', e.target.value)}
                                    />
                                </Grid>
                            </Grid>

                            {/* Settings Row */}
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={2.4}>
                                    <TextField
                                        label="Show Rate"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={settings.showRate}
                                        onChange={(e) => handleSettingChange('showRate', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={2.4}>
                                    <TextField
                                        label="Rate Different"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={settings.rateDifferent}
                                        onChange={(e) => handleSettingChange('rateDifferent', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={2.4}>
                                    <TextField
                                        label="B.Rate Different"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={settings.bRateDifferent}
                                        onChange={(e) => handleSettingChange('bRateDifferent', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={2.4}>
                                    <TextField
                                        label="L.Rate Different"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={settings.lRateDifferent}
                                        onChange={(e) => handleSettingChange('lRateDifferent', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={2.4}>
                                    <TextField
                                        label="Ball Start After"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={settings.ballStartAfter}
                                        onChange={(e) => handleSettingChange('ballStartAfter', e.target.value)}
                                    />
                                </Grid>
                            </Grid>

                            {/* Shortcut Keys */}
                            <Grid container spacing={1} sx={{ mb: 3 }}>
                                {Object.entries(settings.shortcutValues).map(([key, value]) => (
                                    <Grid item xs={1.2} key={key}>
                                        <KeyBox>
                                            <Box className="key">{key}</Box>
                                            <TextField
                                                className="value"
                                                size="small"
                                                value={value}
                                                onChange={(e) => handleSettingChange(key, e.target.value, true)}
                                            />
                                        </KeyBox>
                                    </Grid>
                                ))}
                            </Grid>
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
                                                            {runner.back.price}
                                                        </RateBox>
                                                        <RateBox type="back" className="small">
                                                            {runner.back.volume}
                                                        </RateBox>
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                        <RateBox type="lay" className="large">
                                                            {runner.lay.price}
                                                        </RateBox>
                                                        <RateBox type="lay" className="small">
                                                            {runner.lay.volume}
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
                                    <Grid container spacing={2}>
                                        <Grid item xs={4}>
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
                                        </Grid>
                                        <Grid item xs={4}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                label="Field 1"
                                                value={selectedRunnerDetails.field1}
                                                onChange={(e) => setSelectedRunnerDetails(prev => ({
                                                    ...prev,
                                                    field1: e.target.value
                                                }))}
                                            />
                                        </Grid>
                                        <Grid item xs={4}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                label="Field 2"
                                                value={selectedRunnerDetails.field2}
                                                onChange={(e) => setSelectedRunnerDetails(prev => ({
                                                    ...prev,
                                                    field2: e.target.value
                                                }))}
                                            />
                                        </Grid>
                                    </Grid>
                                </Paper>
                            )}

                            {/* Volume Controls */}
                            <Grid container spacing={2} sx={{ mt: 3 }}>
                                <Grid item xs={6}>
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
                                </Grid>
                                <Grid item xs={2}>
                                    <TextField
                                        label="Volume Length"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={settings.volumeLength}
                                        onChange={(e) => handleSettingChange('volumeLength', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={2}>
                                    <TextField
                                        label="B.Rate Volume"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={settings.bRateVolume}
                                        onChange={(e) => handleSettingChange('bRateVolume', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={2}>
                                    <TextField
                                        label="L.Rate Volume"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={settings.lRateVolume}
                                        onChange={(e) => handleSettingChange('lRateVolume', e.target.value)}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};