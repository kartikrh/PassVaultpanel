import React, { useState, useEffect } from 'react';
import {
    Grid,
    Paper,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    Switch,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Box,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { isEmpty } from 'lodash';
import SpinnerModel from "../../components/Model/SpinnerModel/index.js";
import { Container, Row, Col, Card, CardBody, Button } from 'reactstrap';
import Breadcrumbs from "../../components/Common/Breadcrumb.js";
import axiosInstance from "../../Features/axios.js";
import { updateToastData } from "../../Features/toasterSlice.js";
import { ERROR, SUCCESS } from "../../components/Common/Const.js";
import { useDispatch } from "react-redux";
import { useNavigate } from 'react-router-dom';

// Styled Components
const StyledTableCell = styled(TableCell)(({ theme }) => ({
    '&.back': {
        backgroundColor: 'rgba(144, 202, 249, 0.2)',
    },
    '&.lay': {
        backgroundColor: 'rgba(255, 205, 210, 0.2)',
    }
}));

const RateBox = styled(Box)(({ theme, type }) => ({
    padding: theme.spacing(1),
    textAlign: 'center',
    backgroundColor: type === 'back' ? 'rgba(144, 202, 249, 0.2)' : 'rgba(255, 205, 210, 0.2)',
    borderRadius: theme.shape.borderRadius,
}));

const KeyBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    width: '60px',
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
        textAlign: 'center',
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
        tpMarkets: []
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
        maxStack: 10,
        rateRange: '',
        ballStartAfter: 1,
        showRate: 1,
        rateDifferent: 0.01,
        bRateDifferent: 0.01,
        lRateDifferent: 0.01,
        volumeType: 'auto',
        volumeLength: 3,
        bRateVolume: 300,
        lRateVolume: 200
    });

    const [runners, setRunners] = useState([]);

    // Navigation handler
    const handleDynamicNavigation = (navigateTo) => {
        navigate(navigateTo);
    };

    // Fetch market data
    const fetchMarketData = async () => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.post('/admin/eventMarket/getManualMarket', { commentaryId });
            console.log(response)

            if (response?.result) {
                if (!response.result.market) {
                    handleDynamicNavigation("/manualOddsMarket");
                    return;
                }
                console.log(response.result)
                setEventData({
                    comDetails: response.result.comDetails || null,
                    teams: response.result.teams || [],
                    market: response.result.market || [],
                });

                // Initialize runners if market data exists
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

    // Initialize runners with default values
    const initializeRunners = (runnersData) => {
        const formattedRunners = runnersData.map(runner => ({
            ...runner,
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

    // Handle status changes
    const handleStatusChange = (type, value) => {
        if (type === 'radio') {
            const newStatus = Object.fromEntries(
                Object.keys(status).map(key => [key, key === value])
            );
            setStatus(newStatus);
        } else {
            setStatus(prev => ({ ...prev, [type]: value }));
        }
    };

    // Handle settings changes
    const handleSettingChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    // Handle runner updates
    const handleRunnerUpdate = (runnerId, field, value) => {
        setRunners(prev =>
            prev.map(runner =>
                runner.runnerId === runnerId
                    ? { ...runner, [field]: value }
                    : runner
            )
        );
    };

    // Prepare data for saving
    const prepareMarketData = () => {
        return {
            commentaryId,
            status: status,
            settings: settings,
            runners: runners.map(runner => ({
                runnerId: runner.runnerId,
                autoVolume: runner.autoVolume,
                backPrice: runner.back.price,
                layPrice: runner.lay.price,
                backSize: runner.back.volume,
                laySize: runner.lay.volume
            }))
        };
    };

    // Handle save
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
                await fetchMarketData(); // Refresh data
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

    // Handle back button
    const handleBackClick = () => {
        handleDynamicNavigation("/commentary");
    };

    // Shortcut keys configuration
    const shortcutKeys = [
        { key: 'Q', value: '0.03' },
        { key: 'W', value: '0.05' },
        { key: 'E', value: '0.07' },
        { key: 'R', value: '0.08' },
        { key: 'T', value: '0.10' },
        { key: 'Y', value: '0.15' },
        { key: 'U', value: '0.20' },
        { key: 'I', value: '0.30' },
        { key: 'O', value: '' },
        { key: 'P', value: '' }
    ];

    // Handle shortcut keys
    const handleKeyPress = (event) => {
        const shortcuts = {
            'q': 0.03,
            'w': 0.05,
            'e': 0.07,
            'r': 0.08,
            't': 0.10,
            'y': 0.15,
            'u': 0.20,
            'i': 0.30
        };

        const key = event.key.toLowerCase();
        if (shortcuts[key]) {
            handleSettingChange('rateDifferent', shortcuts[key]);
        }
    };

    // Setup keyboard listeners
    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.addEventListener('keydown', handleKeyPress);
        };
    }, []);

    // Initial data fetch
    useEffect(() => {
        fetchMarketData();
    }, []);

    return (
        <React.Fragment>
            <Box className="page-content">
                <Container maxWidth={false}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Paper elevation={1} sx={{ p: 3 }}>
                                {/* Header Section */}
                                <Grid container alignItems="center" spacing={2} sx={{ mb: 3 }}>
                                    <Grid item xs={8}>
                                        <Breadcrumbs
                                            title="ScoreCard"
                                            breadcrumbItem="Update Manual Odds Market"
                                            page="updatecp"
                                        />
                                    </Grid>
                                    <Grid item xs={4} sx={{ textAlign: 'right' }}>
                                        <Col xs={4} className="text-end">
                                            <Button color="primary" className="me-2" onClick={handleSave}>Save</Button>
                                            <Button color="danger" onClick={handleBackClick}>Exit</Button>
                                        </Col>
                                    </Grid>
                                </Grid>

                                {isLoading && <SpinnerModel />}

                                <Row>
                                    {!isEmpty(eventData?.comDetails) && (
                                        <Col className="mb-3">
                                            <div className="match-details-breadcrumbs">
                                                {eventData.comDetails.eventName}
                                            </div>
                                            <div>
                                                {`Ref: ${eventData.comDetails.eventRefId} [ ${new Date(eventData.comDetails.eventDate).toLocaleString()} ]`}
                                            </div>
                                        </Col>
                                    )}
                                </Row>

                                {/* Status Controls */}
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2,
                                        mb: 3,
                                        bgcolor: 'grey.50',
                                        borderRadius: 1
                                    }}
                                >
                                    <FormControl component="fieldset">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                            <RadioGroup
                                                row
                                                value={Object.keys(status).find(key => status[key]) || ''}
                                                onChange={(e) => handleStatusChange('radio', e.target.value)}
                                            >
                                                <FormControlLabel
                                                    value="suspended"
                                                    control={<Radio />}
                                                    label="Suspended"
                                                />
                                                <FormControlLabel
                                                    value="inactive"
                                                    control={<Radio />}
                                                    label="Inactive"
                                                />
                                                <FormControlLabel
                                                    value="close"
                                                    control={<Radio />}
                                                    label="Close"
                                                />
                                            </RadioGroup>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={status.betAllow}
                                                        onChange={(e) => handleStatusChange('betAllow', e.target.checked)}
                                                    />
                                                }
                                                label="Bet Allow"
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={status.active}
                                                        onChange={(e) => handleStatusChange('active', e.target.checked)}
                                                    />
                                                }
                                                label="Active"
                                            />
                                        </Box>
                                    </FormControl>
                                </Paper>

                                {/* Settings Section */}
                                <Grid container spacing={3} sx={{ mb: 3 }}>
                                    <Grid item xs={3}>
                                        <TextField
                                            label="Max Stack per Rate"
                                            type="number"
                                            size="small"
                                            fullWidth
                                            value={settings.maxStack}
                                            onChange={(e) => handleSettingChange('maxStack', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={3}>
                                        <TextField
                                            label="Rate Range"
                                            size="small"
                                            fullWidth
                                            value={settings.rateRange}
                                            onChange={(e) => handleSettingChange('rateRange', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={3}>
                                        <TextField
                                            label="Ball Start After"
                                            type="number"
                                            size="small"
                                            fullWidth
                                            value={settings.ballStartAfter}
                                            onChange={(e) => handleSettingChange('ballStartAfter', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={3}>
                                        <TextField
                                            label="Show Rate"
                                            type="number"
                                            size="small"
                                            fullWidth
                                            value={settings.showRate}
                                            onChange={(e) => handleSettingChange('showRate', e.target.value)}
                                        />
                                    </Grid>
                                </Grid>

                                {/* Rate Settings */}
                                <Grid container spacing={3} sx={{ mb: 3 }}>
                                    <Grid item xs={4}>
                                        <TextField
                                            label="Rate Different"
                                            type="number"
                                            size="small"
                                            fullWidth
                                            value={settings.rateDifferent}
                                            inputProps={{ step: "0.01" }}
                                            onChange={(e) => handleSettingChange('rateDifferent', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={4}>
                                        <TextField
                                            label="B.Rate Different"
                                            type="number"
                                            size="small"
                                            fullWidth
                                            value={settings.bRateDifferent}
                                            inputProps={{ step: "0.01" }}
                                            onChange={(e) => handleSettingChange('bRateDifferent', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={4}>
                                        <TextField
                                            label="L.Rate Different"
                                            type="number"
                                            size="small"
                                            fullWidth
                                            value={settings.lRateDifferent}
                                            inputProps={{ step: "0.01" }}
                                            onChange={(e) => handleSettingChange('lRateDifferent', e.target.value)}
                                        />
                                    </Grid>
                                </Grid>

                                {/* Volume Controls */}
                                <Grid container spacing={3} sx={{ mb: 3 }}>
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

                                {/* Shortcut Keys */}
                                <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                                    {shortcutKeys.map((key) => (
                                        <KeyBox key={key.key}>
                                            <Box className="key">{key.key}</Box>
                                            <Box className="value">{key.value}</Box>
                                        </KeyBox>
                                    ))}
                                </Box>

                                {/* Runners Table */}
                                <TableContainer component={Paper} elevation={1}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Selections</TableCell>
                                                <TableCell></TableCell>
                                                <TableCell></TableCell>
                                                <StyledTableCell className="back" align="center">Back</StyledTableCell>
                                                <StyledTableCell className="lay" align="center">Lay</StyledTableCell>
                                                <TableCell align="center">Place Bet</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {runners.map((runner) => (
                                                <TableRow key={runner.runnerId}>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Switch
                                                                size="small"
                                                                checked={runner.autoVolume}
                                                                onChange={(e) => handleRunnerUpdate(
                                                                    runner.runnerId,
                                                                    'autoVolume',
                                                                    e.target.checked
                                                                )}
                                                            />
                                                            <Typography>{runner.runner}</Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell></TableCell>
                                                    <TableCell></TableCell>
                                                    <TableCell align="center">
                                                        <RateBox type="back">
                                                            {runner.back.price}
                                                        </RateBox>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <RateBox type="lay">
                                                            {runner.lay.price}
                                                        </RateBox>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Button
                                                            variant="contained"
                                                            color="warning"
                                                            size="small"
                                                        >
                                                            Place Bet
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </React.Fragment>
    );
};