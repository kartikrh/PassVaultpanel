import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { ERROR, MARKET_RUNNER_CONNECT, MARKET_RUNNER_DATA, COMMENTARY_STATUS_CONNECT, SUCCESS, UPDATE_BALL_STATUS, INNINGS_CONNECT, INNINGS_RUN_DATA } from "../../components/Common/Const";
import { useDispatch } from "react-redux";
import { useNavigate } from 'react-router-dom';
import createSocket from '../../Features/socket.js';
import { RiRefreshLine } from 'react-icons/ri';
import { AUTO_STATUS, BALL_START_STATUS, CLOSE_VALUE, CUSTOM_STATUS, INACTIVE_VALUE, OPEN_VALUE, SCORING_STATUS, SUSPEND_VALUE } from './CommentartConst.js';
import { calculateLayFromBack, decimalOddsTwoOutcomes, predictWinProbability } from '../../components/Helper/UpdateManualOddHelper.js';

// Styled Components
const RateBox = styled(Box)(({ theme, type }) => ({
    backgroundColor: type === 'back' ? 'rgba(144, 202, 249, 0.2)' :
        type === 'lay' ? 'rgba(255, 182, 193, 0.2)' :
            'inherit',
    width: '100%',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
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
        height: '24px',
        '& .MuiInputBase-input': {
            fontSize: '0.85rem',
            color: 'rgba(0, 0, 0, 0.6)'
        }
    },
    '& .live-label-calculated': {
        padding: '2px 4px',
        fontSize: '0.75rem',
        backgroundColor: theme.palette.grey[100],
        borderBottom: `1px solid ${theme.palette.divider}`,
        textAlign: 'center',
        color: theme.palette.text.primary, // Making it bold color
        fontWeight: 'bold'
    },
    '& .live-label-original': {
        padding: '2px 4px',
        fontSize: '0.75rem',
        backgroundColor: theme.palette.grey[100],
        borderBottom: `1px solid ${theme.palette.divider}`,
        textAlign: 'center',
        color: theme.palette.text.disabled // Making it light color
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

const StyledTextField = styled(TextField)(({ theme }) => ({
    // Light Mode Styles (Default)
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            borderColor: '#E0E3E7',
            borderWidth: 1,
        },
        '&.Mui-error fieldset': {
            borderColor: 'red',
            borderWidth: 1,
        },
        '&.Mui-focused fieldset': {
            borderLeftWidth: 4,
            padding: '4px !important',
        },
        '& input': {
            color: '#333',
        },
        '&.Mui-disabled': {
            '& fieldset': {
                borderColor: '#E0E3E7',
            },
            '& input': {
                color: 'rgba(0, 0, 0, 0.38)',
            },
        },
    },
    '& .MuiInputLabel-root': {
        color: '#555',
        '&.Mui-disabled': {
            color: 'rgba(0, 0, 0, 0.38)',
        },
    },

    // Dark Mode Styles
    [theme.breakpoints.up(0)]: {
        'body[data-theme="dark"] &': {
            '& .MuiOutlinedInput-root': {
                '& fieldset': {
                    borderColor: '#fff',
                },
                '&.Mui-error fieldset': {
                    borderColor: '#ff6b6b',
                },
                '&.Mui-focused fieldset': {
                    borderColor: '#fff',
                    borderLeftWidth: 4,
                },
                '& input': {
                    color: '#fff',
                },
                // Dark Mode Disabled Styles
                '&.Mui-disabled': {
                    '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)', // Dimmed border
                    },
                    '& input': {
                        color: 'rgba(255, 255, 255, 0.38)', // Dimmed text
                        '-webkit-text-fill-color': 'rgba(255, 255, 255, 0.38)', // For Safari
                        cursor: 'not-allowed',
                    },
                },
            },
            '& .MuiInputLabel-root': {
                color: '#fff',
                // Dark Mode Disabled Label
                '&.Mui-disabled': {
                    color: 'rgba(255, 255, 255, 0.38)', // Dimmed label
                },
            },
        },
    },
}));

const StyledSelect = styled(Select)(({ theme }) => ({
    // Light Mode Styles (Default)
    '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#E0E3E7',
        borderWidth: 1,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: '#1976d2',
        borderLeftWidth: 4,
        padding: '4px !important',
    },
    '&.Mui-error .MuiOutlinedInput-notchedOutline': {
        borderColor: 'red',
    },
    '& .MuiSelect-select': {
        color: '#333',
    },
    '& .MuiSvgIcon-root': { // Dropdown icon
        color: '#555',
    },
    '&.Mui-disabled': {
        '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#E0E3E7',
        },
        '& .MuiSelect-select': {
            color: 'rgba(0, 0, 0, 0.38)',
        },
        '& .MuiSvgIcon-root': {
            color: 'rgba(0, 0, 0, 0.38)',
        },
    },

    // Dark Mode Styles
    [theme.breakpoints.up(0)]: {
        'body[data-theme="dark"] &': {
            '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#fff',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#fff',
                borderLeftWidth: 4,
            },
            '&.Mui-error .MuiOutlinedInput-notchedOutline': {
                borderColor: '#ff6b6b',
            },
            '& .MuiSelect-select': {
                color: '#fff',
            },
            '& .MuiSvgIcon-root': {
                color: '#fff',
            },
            // Dark Mode Disabled Styles
            '&.Mui-disabled': {
                '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '& .MuiSelect-select': {
                    color: 'rgba(255, 255, 255, 0.38)',
                    '-webkit-text-fill-color': 'rgba(255, 255, 255, 0.38)',
                    cursor: 'not-allowed',
                },
                '& .MuiSvgIcon-root': {
                    color: 'rgba(255, 255, 255, 0.38)',
                },
            },
        },
    },

    // Menu Paper Props (Dropdown List Styles)
    '& .MuiPaper-root': {
        'body[data-theme="dark"] &': {
            backgroundColor: '#333',
            '& .MuiMenuItem-root': {
                color: '#fff',
                '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                },
                '&.Mui-selected': {
                    backgroundColor: 'rgba(255, 255, 255, 0.16)',
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.24)',
                    },
                },
            },
        },
    },
}));

const StyledFormControlLabel = styled(FormControlLabel)(({ theme }) => ({
    // Light Mode Styles (Default)
    '& .MuiFormControlLabel-label': {
        color: '#333',
        fontSize: '14px',
    },
    '&.Mui-disabled': {
        '& .MuiFormControlLabel-label': {
            color: 'rgba(0, 0, 0, 0.38)',
        },
    },
    // For Checkbox
    '& .MuiCheckbox-root': {
        color: '#555',
        '&.Mui-checked': {
            color: '#1976d2',
        },
        '&.Mui-disabled': {
            color: 'rgba(0, 0, 0, 0.38)',
        },
    },
    // For Radio
    '& .MuiRadio-root': {
        color: '#555',
        '&.Mui-checked': {
            color: '#1976d2',
        },
        '&.Mui-disabled': {
            color: 'rgba(0, 0, 0, 0.38)',
        },
    },

    // Dark Mode Styles
    [theme.breakpoints.up(0)]: {
        'body[data-theme="dark"] &': {
            '& .MuiFormControlLabel-label': {
                color: '#fff',
            },
            '&.Mui-disabled': {
                '& .MuiFormControlLabel-label': {
                    color: 'rgba(255, 255, 255, 0.38)',
                    '-webkit-text-fill-color': 'rgba(255, 255, 255, 0.38)',
                },
            },
            // Dark Mode Checkbox
            '& .MuiCheckbox-root': {
                color: '#fff',
                '&.Mui-checked': {
                    color: '#90caf9', // Lighter blue for dark mode
                },
                '&.Mui-disabled': {
                    color: 'rgba(255, 255, 255, 0.3)',
                },
            },
            // Dark Mode Radio
            '& .MuiRadio-root': {
                color: '#fff',
                '&.Mui-checked': {
                    color: '#90caf9', // Lighter blue for dark mode
                },
                '&.Mui-disabled': {
                    color: 'rgba(255, 255, 255, 0.3)',
                },
            },
        },
    },
}));

const StyledRadio = styled(Radio)(({ theme }) => ({
    // Light Mode Styles (Default)
    color: '#555',
    '&.Mui-checked': {
        color: '#1976d2',
    },
    '&:hover': {
        backgroundColor: 'rgba(25, 118, 210, 0.04)',
    },
    '&.Mui-disabled': {
        color: 'rgba(0, 0, 0, 0.38)',
        '&.Mui-checked': {
            color: 'rgba(0, 0, 0, 0.38)',
        },
        '&:hover': {
            backgroundColor: 'transparent',
        },
    },

    // Dark Mode Styles
    [theme.breakpoints.up(0)]: {
        'body[data-theme="dark"] &': {
            color: '#fff',
            '&.Mui-checked': {
                color: '#90caf9', // Lighter blue for dark mode
            },
            '&:hover': {
                backgroundColor: 'rgba(144, 202, 249, 0.08)', // Subtle hover effect
            },
            // Dark Mode Disabled State
            '&.Mui-disabled': {
                color: 'rgba(255, 255, 255, 0.3)',
                '&.Mui-checked': {
                    color: 'rgba(255, 255, 255, 0.3)',
                },
                '&:hover': {
                    backgroundColor: 'transparent',
                },
            },
            // Dark Mode Ripple Effect
            '& .MuiTouchRipple-root': {
                color: '#90caf9',
            },
        },
    },
}));

export const UpdateManualOdds = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const socket = createSocket();
    // const commentaryId = localStorage.getItem("updateManualOddsCommentaryId");
    // const commentaryDetails = JSON.parse(localStorage.getItem('updateManualOddsCommentaryDetails') || "{}");

    const commentaryId = sessionStorage.getItem("updateManualOddsCommentaryId");
    const commentaryDetails = JSON.parse(sessionStorage.getItem('updateManualOddsCommentaryDetails') || "{}");

    // const [isSocketConnected, setIsSocketConnected] = useState(false);
    const [isLive, setIsLive] = useState(true);
    const [rateSourceRefID, setRateSourceRefID] = useState([]);
    const [marketStatus, setMarketStatus] = useState("2"); // Default to inactive
    const [isLoading, setIsLoading] = useState(false);
    const [originalShortcutValues, setOriginalShortcutValues] = useState({});
    const [savedPrices, setSavedPrices] = useState({});
    const [hasShortcutChanges, setHasShortcutChanges] = useState(false);
    const [runners, setRunners] = useState([]);
    const [originalRunner, setOriginalRunner] = useState([]);
    const [selectedRunner, setSelectedRunner] = useState(null);
    const [ballStatus, setBallStatus] = useState(null);
    const [abOpen, setAbOpen] = useState(false);
    const [abSuspend, setAbSuspend] = useState(false);
    const [tempRateDiff, setTempRateDiff] = useState(null);
    const [directLineEnabled, setDirectLineEnabled] = useState(false);
    const [socketMarketData, setSocketMarketData] = useState([]);
    const [eventData, setEventData] = useState({
        comDetails: null,
        teams: [],
        market: {},
    });
    const [originalMarketRunnerData, setOriginalMarketRunnerData] = useState([]);
    const [originalInningsData, setOriginalInningsData] = useState([]);
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
        bRateVolume: 10000,
        lRateVolume: 10000,
        margin: 10,
        delay: 10,
        lineRatio: 10,
        bfRateDiff: 0,
        shortcutValues: {
            Q: '0.03', W: '0.05', E: '0.07', R: '0.08',
            T: '0.10', Y: '0.15', U: '0.20', I: '0.30',
            O: '', P: ''
        },
        favRatio: 10,
        tieProbability: 1.90
    });
    const [selectedRunnerDetails, setSelectedRunnerDetails] = useState({
        runnerId: null,
        main: '',
        point: ''
    });
    const settingsRef = useRef(settings);
    const tempRateDiffRef = useRef(null);
    const runnersRef = useRef([]);
    // console.log({ savedPrices })

    const handlePriceCalculations = (backPrice, isSelected) => {
        backPrice = Math.max(0, parseFloat(backPrice || 0));
        let layPrice;

        if (backPrice === 0 || !backPrice) {
            // When back is 0/null, only set lay to 1.01
            layPrice = 1.01;
            // Keep back as 0
            backPrice = 0;
        } else {
            layPrice = parseFloat((backPrice + parseFloat(settings.rateDifferent)).toFixed(2));
        }

        return { backPrice, layPrice };
    };

    const updateSavedPricesWithNewRateDiff = useCallback((rateDiff) => {
        console.log('updateSavedPricesWithNewRateDiff called with rateDiff:', rateDiff);
        rateDiff = parseFloat(rateDiff);
        if (isNaN(rateDiff)) {
            console.log('Invalid rateDiff, returning');
            return;
        }

        setSavedPrices(prevSavedPrices => {
            console.log('Previous saved prices:', prevSavedPrices);
            const updatedPrices = { ...prevSavedPrices };

            // Find selected runner
            const selectedRunner = runners.find(r => r.isSelected);
            if (!selectedRunner) {
                console.log('No selected runner found');
                return prevSavedPrices;
            }
            console.log('Selected runner:', selectedRunner.runnerId);

            // Get non-selected runner
            const nonSelectedRunners = runners.filter(r => !r.isSelected);
            if (!nonSelectedRunners.length) {
                console.log('No non-selected runners found');
                return prevSavedPrices;
            }
            const nonSelectedRunner = nonSelectedRunners[0];
            console.log('Non-selected runner:', nonSelectedRunner.runnerId);

            // Get current selected back price
            const selectedBackPrice = prevSavedPrices[selectedRunner.runnerId]?.back || 0;
            console.log('Selected back price:', selectedBackPrice);

            if (selectedBackPrice <= 0) {
                console.log('Selected back price is 0 or negative, returning');
                return prevSavedPrices;
            }

            // Calculate new lay price with new rate diff
            const selectedLayPrice = Math.max(1.01, parseFloat((selectedBackPrice + rateDiff).toFixed(2)));
            console.log('New selected lay price:', selectedLayPrice);

            // Calculate non-selected prices using two-outcome formula
            const nonSelectedBackPrice = parseFloat((1 / (1 - (1 / selectedLayPrice))).toFixed(2));
            const nonSelectedLayPrice = parseFloat((1 / (1 - (1 / selectedBackPrice))).toFixed(2));

            console.log('Non-selected back price:', nonSelectedBackPrice);
            console.log('Non-selected lay price:', nonSelectedLayPrice);

            // Update prices for both runners
            updatedPrices[selectedRunner.runnerId] = {
                back: selectedBackPrice,
                lay: selectedLayPrice
            };

            updatedPrices[nonSelectedRunner.runnerId] = {
                back: nonSelectedBackPrice,
                lay: nonSelectedLayPrice
            };

            console.log('Updated saved prices:', updatedPrices);
            return updatedPrices;
        });
    }, [runners]);

    const setTempRateDiffWithRef = useCallback((value) => {
        setTempRateDiff(value);
        tempRateDiffRef.current = value;
        console.log('Setting tempRateDiff to:', value);
    }, []);

    const calculateRunnerRates = useCallback((runner, settings, options = {}) => {
        const {
            forceCalculateLay = true,
            isSocketData = false,
            manualEdit = false,
            editedField = null,
            oppositeRunnerBackPrice = null  // NEW: Parameter for opposite runner's back price
        } = options;

        const back = Math.max(0, parseFloat(runner?.back?.price) || 0);
        const existingLay = Math.max(0, parseFloat(runner?.lay?.price) || 0);
        const existingL1 = Math.max(0, parseFloat(runner?.l1) || 0);
        const existingL2 = Math.max(0, parseFloat(runner?.l2) || 0);

        const bRateDiff = Math.max(0, parseFloat(settings?.bRateDifferent) || 0);
        const lRateDiff = Math.max(0, parseFloat(settings?.lRateDifferent) || 0);

        // Use tempRateDiff if it's not null, otherwise use the settings value
        const rateDiff = Math.max(0, tempRateDiff || parseFloat(settings?.rateDifferent) || 0);

        const b2 = Math.max(0, Number((back - (2 * bRateDiff)).toFixed(2)));
        const b1 = Math.max(0, Number((back - bRateDiff).toFixed(2)));

        let lay, l1, l2;

        if (isSocketData || (manualEdit && editedField === 'back')) {
            // Use the CORRECTED lay calculation formula
            const margin = parseFloat(settings?.margin || 0) / 100;

            // NEW: Use opposite runner's back price if provided (for live mode)
            const backPriceForLayCalculation = oppositeRunnerBackPrice !== null ? oppositeRunnerBackPrice : back;

            lay = backPriceForLayCalculation > 1
                ? Math.max(1.01, Number((1 + ((1 - margin) / (backPriceForLayCalculation - 1))).toFixed(2)))
                : 1.01;

            l1 = lay > 0 ? Math.max(0, Number((lay + lRateDiff).toFixed(2))) : 0;
            l2 = l1 > 0 ? Math.max(0, Number((l1 + lRateDiff).toFixed(2))) : 0;
        } else if (manualEdit) {
            switch (editedField) {
                case 'lay':
                    lay = Math.max(1.01, Number(parseFloat(runner.lay.price).toFixed(2)));
                    l1 = lay > 0 ? Math.max(0, Number((lay + lRateDiff).toFixed(2))) : 0;
                    l2 = l1 > 0 ? Math.max(0, Number((l1 + lRateDiff).toFixed(2))) : 0;
                    break;
                case 'l1':
                    lay = Math.max(1.01, existingLay);
                    l1 = Math.max(0, Number(parseFloat(runner.l1).toFixed(2)));
                    l2 = l1 > 0 ? Math.max(0, Number((l1 + lRateDiff).toFixed(2))) : 0;
                    break;
                case 'l2':
                    lay = Math.max(1.01, existingLay);
                    l1 = Math.max(0, existingL1);
                    l2 = Math.max(0, Number(parseFloat(runner.l2).toFixed(2)));
                    break;
                default:
                    if (forceCalculateLay) {
                        // For manual mode, use standard calculation (not opposite runner)
                        const margin = parseFloat(settings?.margin || 0) / 100;
                        lay = back > 1
                            ? Math.max(1.01, Number((1 + ((1 - margin) / (back - 1))).toFixed(2)))
                            : 1.01;

                        l1 = lay > 0 ? Math.max(0, Number((lay + lRateDiff).toFixed(2))) : 0;
                        l2 = l1 > 0 ? Math.max(0, Number((l1 + lRateDiff).toFixed(2))) : 0;
                    } else {
                        lay = Math.max(1.01, existingLay);
                        l1 = Math.max(0, existingL1);
                        l2 = Math.max(0, existingL2);
                    }
            }
        } else {
            if (forceCalculateLay) {
                // For non-live modes, use standard calculation
                const margin = parseFloat(settings?.margin || 0) / 100;
                lay = back > 1
                    ? Math.max(1.01, Number((1 + ((1 - margin) / (back - 1))).toFixed(2)))
                    : 1.01;

                l1 = lay > 0 ? Math.max(0, Number((lay + lRateDiff).toFixed(2))) : 0;
                l2 = l1 > 0 ? Math.max(0, Number((l1 + lRateDiff).toFixed(2))) : 0;
            } else {
                lay = Math.max(1.01, existingLay);
                l1 = Math.max(0, existingL1);
                l2 = Math.max(0, existingL2);
            }
        }

        return {
            b2: Math.max(0, b2),
            b1: Math.max(0, b1),
            back: Math.max(0, back),
            lay: Math.max(1.01, lay),
            l1: Math.max(0, l1),
            l2: Math.max(0, l2)
        };
    }, [tempRateDiff]);

    const initializeRunners = (runnersData) => {
        const formattedRunners = runnersData.map(runner => {
            const { backPrice, layPrice } = handlePriceCalculations(runner.backPrice, true);
            const rates = calculateRunnerRates({
                runner,
                back: { price: backPrice }
            }, settings);

            return {
                ...runner,
                selectionId: runner.selectionId,
                isSelected: false,
                autoVolume: true,
                back: {
                    price: backPrice,
                    volume: runner.backSize || 0
                },
                lay: {
                    price: layPrice,
                    volume: runner.laySize || 0
                },
                b2: rates.b2,
                b1: rates.b1,
                l1: rates.l1,
                l2: rates.l2
            };
        });

        // Find runner with minimum back price (excluding zero)
        const minBackRunner = getRunnerWithMinimumBack(formattedRunners);

        const runnerDataToSave = formattedRunners.map(runner => {
            const isSelected = runner.runnerId === minBackRunner?.runnerId;

            if (isSelected) {
                return {
                    ...runner,
                    isSelected: true
                };
            } else {
                let backPrice, layPrice;

                if (minBackRunner.back.price === 0 || !minBackRunner.back.price) {
                    // If selected runner's back is 0/null
                    layPrice = 1.01;
                    // Calculate back price for non-selected runner based on lay 1.01
                    backPrice = parseFloat((1 / (1 - (1 / layPrice))).toFixed(2));
                } else {
                    // Normal calculation when selected runner has valid back price
                    const selectedBackPrice = minBackRunner.back.price;
                    const selectedLayPrice = minBackRunner.lay.price;
                    backPrice = parseFloat((1 / (1 - (1 / selectedLayPrice))).toFixed(2));
                    layPrice = parseFloat((1 / (1 - (1 / selectedBackPrice))).toFixed(2));
                }

                const newRates = calculateRunnerRates({
                    back: { price: backPrice }
                }, settings, {
                    forceCalculateLay: true
                });

                return {
                    ...runner,
                    isSelected: false,
                    back: {
                        price: backPrice,
                        volume: runner.back.volume
                    },
                    lay: {
                        price: layPrice,
                        volume: runner.lay.volume
                    },
                    b2: newRates.b2,
                    b1: newRates.b1,
                    l1: newRates.l1,
                    l2: newRates.l2
                };
            }
        });

        setRunners(runnerDataToSave);
        setOriginalRunner(runnerDataToSave);

        if (minBackRunner) {
            setSelectedRunner(minBackRunner.runnerId);
            setSelectedRunnerDetails(prev => ({
                ...prev,
                runnerId: minBackRunner.runnerId
            }));
        }
    };
    const handleRunnerSelection = (runnerId) => {
        setRunners(prev => prev.map(runner => ({
            ...runner,
            isSelected: runner.runnerId === runnerId
        })));
        setSelectedRunner(runnerId);

        const savedPrice = savedPrices[runnerId]?.back || 0;
        const mainPart = Math.floor(savedPrice);
        const pointPart = Math.round((savedPrice - mainPart) * 100);

        setSelectedRunnerDetails(prev => ({
            ...prev,
            runnerId,
            main: mainPart.toString(),
            point: pointPart.toString().padStart(2, '0')
        }));
    };

    const handleInningsDataUpdate = useCallback((updatedMarketData) => {
        const sortedMarkets = [...updatedMarketData].sort((a, b) => b.inningsId - a.inningsId);
        const newIdSetting = [...updatedMarketData].sort((a, b) => b.teamId - a.teamId);
        const currentInningsMarket = sortedMarkets[0];

        if (!currentInningsMarket?.runner?.[0]) {
            console.log("No valid market data found");
            return;
        }

        // Calculate probability and odds
        const probability = predictWinProbability(
            newIdSetting[1]?.runner?.[0]?.line,
            newIdSetting[0]?.runner?.[0]?.line,
            settings.favRatio,
            20 // total overs
        );

        // Get back odds for both teams
        let [oddsB, oddsA] = decimalOddsTwoOutcomes(probability, settings.margin / 100);

        // Handle special case for odds < 1.01
        if (oddsB < 1.01) {
            oddsA = 0;
            oddsB = 1.00;
        } else if (oddsA < 1.01) {
            oddsA = 1.00;
            oddsB = 0;
        }

        // Calculate lay odds for both teams using the lay margin formula
        const layMargin = settings.margin / 100;
        const layA = calculateLayFromBack(oddsA, layMargin);
        const layB = calculateLayFromBack(oddsB, layMargin);

        // When processing innings data (isLive is false and directLineEnabled true),
        // if both odds are equal then override both runners:
        if (!isLive && directLineEnabled && Math.abs(oddsA - oddsB) < 0.01) {
            const tieValue = parseFloat(settings.tieProbability);
            console.log("Tie detected. Setting both runner back prices to tieProbability:", tieValue);

            // Update both original and current runner states
            setOriginalRunner(prevRunners =>
                prevRunners.map(runner => ({
                    ...runner,
                    back: { ...runner.back, price: tieValue },
                    lay: { ...runner.lay, price: 0 }
                }))
            );
            setRunners(prevRunners =>
                prevRunners.map(runner => ({
                    ...runner,
                    back: { ...runner.back, price: tieValue },
                    lay: { ...runner.lay, price: 0 }
                }))
            );

            return; // Exit early; tie scenario handled.
        }

        // Create odds mapping object using teamId
        const oddsObj = {
            [newIdSetting[0]?.teamId]: {
                back: oddsB,
                lay: layB
            },
            [newIdSetting[1]?.teamId]: {
                back: oddsA,
                lay: layA
            }
        };

        console.log("Odds by team:", oddsObj);

        // Find the smallest non-zero back price (favorite team)
        const nonZeroOdds = Object.entries(oddsObj)
            .filter(([_, odds]) => odds.back > 0);

        if (!nonZeroOdds.length) {
            console.log("No valid odds found");
            return;
        }

        const [selectedTeamId, selectedOdds] = nonZeroOdds.reduce(
            (min, curr) => curr[1].back < min[1].back ? curr : min,
            nonZeroOdds[0]
        );

        console.log("Selected team and odds:", { selectedTeamId, odds: selectedOdds });

        // Update runners with the calculated odds
        const updateRunners = (prevRunners) => {
            const updatedRunners = prevRunners.map(runner => {
                // Convert teamId to string for comparison
                const teamId = runner.teamId?.toString();
                const odds = oddsObj[teamId];

                if (!odds) {
                    console.log(`No odds found for runner with teamId ${teamId}`);
                    return runner;
                }

                const isSelected = teamId === selectedTeamId.toString();

                console.log(`Processing runner:`, {
                    runnerId: runner.runnerId,
                    teamId,
                    isSelected,
                    odds
                });

                // Calculate ladder prices
                const bRateDiff = parseFloat(settings.bRateDifferent);
                const lRateDiff = parseFloat(settings.lRateDifferent);

                return {
                    ...runner,
                    isSelected,
                    back: {
                        ...runner.back,
                        price: Number(odds.back.toFixed(2))
                    },
                    lay: {
                        ...runner.lay,
                        price: Number(odds.lay.toFixed(2))
                    },
                    b2: Math.max(0, Number((odds.back - (2 * bRateDiff)).toFixed(2))),
                    b1: Math.max(0, Number((odds.back - bRateDiff).toFixed(2))),
                    l1: Math.max(0, Number((odds.lay + lRateDiff).toFixed(2))),
                    l2: Math.max(0, Number((odds.lay + (2 * lRateDiff)).toFixed(2)))
                };
            });
            return updatedRunners;
        };

        // Update both original and current runner states
        setOriginalRunner(prevRunners => updateRunners(prevRunners));
        setRunners(prevRunners => {
            const updatedRunners = updateRunners(prevRunners);

            // Update selected runner details
            const selectedRunner = updatedRunners.find(r => r.teamId?.toString() === selectedTeamId?.toString());
            if (selectedRunner) {
                const backPrice = selectedRunner.back.price;
                setSelectedRunner(selectedRunner.runnerId);
                setSelectedRunnerDetails(prev => ({
                    ...prev,
                    runnerId: selectedRunner.runnerId,
                    main: Math.floor(backPrice).toString(),
                    point: ((backPrice % 1) * 100).toFixed(0).padStart(2, '0')
                }));
            }

            return updatedRunners;
        });
    });

    const processMarketRunnerData = useCallback((incomingData) => {
        // Use incoming data if provided; otherwise, fallback to stored original data.
        const socketData = incomingData || originalMarketRunnerData;
        if (!socketData || !socketData.length) return;
        const currentSettings = settingsRef.current;

        // First, update originalRunner with the raw socket data without any calculations
        setOriginalRunner(prevRunners =>
            prevRunners.map(prevRunner => {
                const socketRunner = socketData.find(r => r.selectionId === prevRunner.selectionId);
                if (!socketRunner) return prevRunner;

                // Store original values without calculations
                return {
                    ...prevRunner,
                    back: { price: socketRunner.backPrice, volume: prevRunner.back.volume },
                    lay: { price: socketRunner.layPrice, volume: prevRunner.lay.volume },
                    b2: socketRunner.backPrice,
                    b1: socketRunner.backPrice,
                    l1: socketRunner.layPrice,
                    l2: socketRunner.layPrice
                };
            })
        );

        // Then prepare adjusted data for the current runners state using CORRECTED FORMULAS
        const adjustedRunners = socketData.map(runner => {
            const originalBackPrice = runner.backPrice;

            // Step 1: Apply bfRateDiff adjustment to backPrice
            let adjustedBackPrice = parseFloat((originalBackPrice + parseFloat(currentSettings.bfRateDiff)).toFixed(2));

            // If backPrice is less than 1.01 but greater than 0, set it to 0
            if (adjustedBackPrice > 0 && adjustedBackPrice < 1.01) {
                adjustedBackPrice = 0;
            }

            // Step 1.1: Calculate Back Price Using Margin Formula
            // Backprice1 = adjustedBackPrice/(1 + Margin)
            const margin = currentSettings.margin / 100;
            const backPrice1 = adjustedBackPrice > 0
                ? parseFloat((adjustedBackPrice / (1 + margin)).toFixed(2))
                : 0;

            return {
                ...runner,
                backPrice: backPrice1,  // Store the calculated backPrice1
                originalBackPrice: adjustedBackPrice  // Store the original for opposite runner calculation
            };
        });

        // NEW: Calculate lay prices using opposite runner's back price
        const adjustedRunnersWithLay = adjustedRunners.map((runner, index) => {
            const margin = currentSettings.margin / 100;

            // Find the opposite runner (assuming 2 runners)
            const oppositeRunnerIndex = index === 0 ? 1 : 0;
            const oppositeRunner = adjustedRunners[oppositeRunnerIndex];

            // Step 2: Calculate Lay Price Using Opposite Runner's Back Price
            // Lay = 1 + ((1 - margin) / (Backprice2 - 1))
            // where Backprice2 is the opposite runner's back price
            const oppositeBackPrice = oppositeRunner ? oppositeRunner.backPrice : runner.backPrice;

            const calculatedLayPrice = oppositeBackPrice > 1
                ? parseFloat((1 + ((1 - margin) / (oppositeBackPrice - 1))).toFixed(2))
                : 1.01;

            // console.log(`Runner ${runner.selectionId}: Using opposite back price ${oppositeBackPrice} to calculate lay price ${calculatedLayPrice}`);

            return {
                ...runner,
                layPrice: calculatedLayPrice
            };
        });

        // Determine the runner with the minimum back price
        const minBackRunner = adjustedRunnersWithLay.reduce(
            (min, curr) => {
                // Only consider runners with a valid back price (greater than 0)
                if (curr.backPrice > 0 && (min.backPrice === undefined || curr.backPrice < min.backPrice)) {
                    return curr;
                }
                return min;
            },
            {}
        );

        // Update only the current runners state with calculated prices
        setRunners(prevRunners => {
            const updatedRunners = prevRunners.map(prevRunner => {
                const adjustedRunner = adjustedRunnersWithLay.find(r => r.selectionId === prevRunner.selectionId);
                if (!adjustedRunner) return prevRunner;

                const isSelected = adjustedRunner.selectionId === minBackRunner.selectionId;

                // Calculate ladder prices based on calculated back and lay prices
                const bRateDiff = parseFloat(currentSettings.bRateDifferent);
                const lRateDiff = parseFloat(currentSettings.lRateDifferent);

                const backPrice = adjustedRunner.backPrice;  // This is backPrice1 from our calculation
                const layPrice = adjustedRunner.layPrice;   // This is calculated using opposite runner's back price

                const b2 = Math.max(0, parseFloat((backPrice - (2 * bRateDiff)).toFixed(2)));
                const b1 = Math.max(0, parseFloat((backPrice - bRateDiff).toFixed(2)));
                const l1 = Math.max(0, parseFloat((layPrice + lRateDiff).toFixed(2)));
                const l2 = Math.max(0, parseFloat((layPrice + (2 * lRateDiff)).toFixed(2)));

                return {
                    ...prevRunner,
                    isSelected,
                    back: {
                        ...prevRunner.back,
                        price: backPrice
                    },
                    lay: {
                        ...prevRunner.lay,
                        price: layPrice
                    },
                    b2,
                    b1,
                    l1,
                    l2
                };
            });

            // Update selected runner if needed, but ONLY use savedPrices values for main/point
            if (minBackRunner && minBackRunner.selectionId) {
                const selectedRunner = updatedRunners.find(r => r.selectionId === minBackRunner.selectionId);
                if (selectedRunner) {
                    setSelectedRunner(selectedRunner.runnerId);

                    // Important: Use savedPrices instead of socket data for main/point values
                    const savedPrice = savedPrices[selectedRunner.runnerId]?.back || 0;

                    // For directLineEnabled and !isLive mode, if price < 1.01, treat as 0
                    const adjustedSavedPrice = !isLive && directLineEnabled && savedPrice < 1.01 ? 0 : savedPrice;

                    const mainPart = Math.floor(adjustedSavedPrice);
                    const pointPart = Math.round((adjustedSavedPrice - mainPart) * 100);

                    setSelectedRunnerDetails(prev => ({
                        ...prev,
                        runnerId: selectedRunner.runnerId,
                        main: mainPart.toString(),
                        point: pointPart.toString().padStart(2, '0')
                    }));
                }
            }

            return updatedRunners;
        });
    }, [originalMarketRunnerData, settings, savedPrices, isLive, directLineEnabled]);

    const processInningsData = useCallback((incomingData) => {
        // Use incoming data if provided; otherwise, fallback to stored original innings data.
        const dataToProcess = incomingData || originalInningsData;
        if (!dataToProcess || !dataToProcess.length) return;
        console.log("Processing Innings Data:", dataToProcess);

        let updatedMarketData = [];
        if (socketMarketData.length > 0) {
            updatedMarketData = socketMarketData.map(existingMarket => {
                const newMarket = dataToProcess.find(m => m?.marketId == existingMarket?.marketId);
                if (newMarket) {
                    return { ...existingMarket, ...newMarket };
                }
                return existingMarket;
            });
            dataToProcess.forEach(newMarket => {
                const marketExists = socketMarketData.some(m => m?.marketId == newMarket?.marketId);
                if (!marketExists) {
                    updatedMarketData.push(newMarket);
                }
            });
        } else {
            updatedMarketData = dataToProcess;
        }
        console.log("Updated Innings Market Data:", updatedMarketData);
        setSocketMarketData(updatedMarketData);
        handleInningsDataUpdate(updatedMarketData);
    }, [handleInningsDataUpdate, originalInningsData, socketMarketData]);

    const saveSettingsToLocalStorage = useCallback((settingsObj) => {
        try {
            localStorage.setItem('manualOddsSettings', JSON.stringify(settingsObj));
            console.log('Settings saved to local storage');
        } catch (error) {
            console.error('Error saving settings to local storage:', error);
        }
    }, []);

    const getRunnerWithMinimumBack = (runnersData) => {
        if (!runnersData?.length) return null;
        return runnersData.reduce((minRunner, currentRunner) => {
            const currentBackPrice = parseFloat(currentRunner.back?.price || currentRunner.backPrice || Infinity);
            const minBackPrice = parseFloat(minRunner.back?.price || minRunner.backPrice || Infinity);
            return currentBackPrice < minBackPrice ? currentRunner : minRunner;
        }, runnersData[0]);
    };
    // For status change and API call
    const handleStatusChange = async (newStatus) => {
        // Add confirmation for market close
        if (newStatus === CLOSE_VALUE.toString()) {
            const confirmed = window.confirm("Are you sure you want to close the market? This action cannot be undone.");
            if (!confirmed) return;
        }

        try {
            setIsLoading(true);
            setMarketStatus(newStatus);

            // Get latest state for market data
            const currentMarketData = {
                eventMarket: [{
                    ...prepareMarketData(newStatus).eventMarket[0],
                    status: parseInt(newStatus)
                }]
            };

            // Set all prices to 0 if market is not open
            if (+(newStatus || 0) !== +OPEN_VALUE) {
                currentMarketData.eventMarket[0].runner = currentMarketData.eventMarket[0].runner.map(runner => ({
                    ...runner,
                    backPrice: 0,
                    layPrice: 0,
                    overRate: 0,
                    underRate: 0
                }));
            }

            const response = await axiosInstance.post('/admin/eventMarket/upManualMarket', currentMarketData);
            if (response?.success) {
                handleSavedRunnerUpdate(currentMarketData)
                dispatch(updateToastData({
                    data: "Market updated successfully",
                    title: "Success",
                    type: SUCCESS
                }));
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

    const handleSettingChange = useCallback((key, value, isShortcut = false) => {
        // Validate minimum values for rate-related settings
        if (['rateDifferent', 'bRateDifferent', 'lRateDifferent'].includes(key)) {
            const numValue = parseFloat(value);
            if (numValue < 0.01) {
                value = '0.01';
            }
        }

        if (isShortcut) {
            // Handle shortcut value changes - only allow in manual mode
            
            // const isManualMode = !isLive && !directLineEnabled;
            // if (!isManualMode) return;
            
            if (isLive) return;

            setSettings(prev => {
                const newSettings = {
                    ...prev,
                    shortcutValues: {
                        ...prev.shortcutValues,
                        [key]: value
                    }
                };

                // Save to local storage immediately
                saveSettingsToLocalStorage(newSettings);
                return newSettings;
            });

            // Mark that shortcut values have changed
            setHasShortcutChanges(true);
        } else {
            // Handle all other setting changes
            const numericValue = value === '' ? '0' : value;

            // Special handling for volume type changes
            if (key === 'volumeType' && value === CUSTOM_STATUS) {
                setRunners(prev => prev.map(runner => ({
                    ...runner,
                    back: { ...runner.back, volume: settings.bRateVolume },
                    lay: { ...runner.lay, volume: settings.lRateVolume },
                    b2Volume: settings.bRateVolume,
                    b1Volume: settings.bRateVolume,
                    l1Volume: settings.lRateVolume,
                    l2Volume: settings.lRateVolume
                })));
            }

            // Update the main settings
            setSettings(prev => {
                const newSettings = { ...prev, [key]: numericValue };
                saveSettingsToLocalStorage(newSettings);
                return newSettings;
            });

            // Handle settings that affect price calculations
            if (['rateDifferent', 'bRateDifferent', 'lRateDifferent'].includes(key)) {
                // Don't auto-recalculate for margin and favRatio here as they have their own useEffect
                if (((originalMarketRunnerData.length > 0 && isLive) ||
                    (originalInningsData.length > 0 && !isLive && directLineEnabled))) {

                    // Re-process the appropriate data source based on current mode
                    if (isLive && originalMarketRunnerData.length > 0) {
                        processMarketRunnerData(originalMarketRunnerData);
                    } else if (!isLive && directLineEnabled && originalInningsData.length > 0) {
                        processInningsData(originalInningsData);
                    }
                } else if (!isLive && !directLineEnabled) {
                    // MANUAL MODE: Update savedPrices to reflect rate difference changes
                    if (key === 'rateDifferent') {
                        const newRateDiff = parseFloat(numericValue);

                        setSavedPrices(prevSavedPrices => {
                            const updatedPrices = { ...prevSavedPrices };
                            const selectedRunnerData = runners.find(r => r.isSelected);
                            if (!selectedRunnerData) return prevSavedPrices;

                            const nonSelectedRunners = runners.filter(r => !r.isSelected);
                            if (nonSelectedRunners.length === 0) return prevSavedPrices;
                            const nonSelectedRunner = nonSelectedRunners[0];

                            const selectedBackPrice = prevSavedPrices[selectedRunnerData.runnerId]?.back || 0;

                            if (selectedBackPrice > 0) {
                                const selectedLayPrice = Math.max(1.01, parseFloat((selectedBackPrice + newRateDiff).toFixed(2)));
                                const nonSelectedBackPrice = parseFloat((1 / (1 - (1 / selectedLayPrice))).toFixed(2));
                                const nonSelectedLayPrice = parseFloat((1 / (1 - (1 / selectedBackPrice))).toFixed(2));

                                updatedPrices[selectedRunnerData.runnerId] = {
                                    back: selectedBackPrice,
                                    lay: selectedLayPrice
                                };

                                updatedPrices[nonSelectedRunner.runnerId] = {
                                    back: nonSelectedBackPrice,
                                    lay: nonSelectedLayPrice
                                };
                            }

                            return updatedPrices;
                        });
                    }
                }

                // Always update the runner calculations regardless of mode
                setRunners(prev => prev.map(runner => {
                    const newSettings = { ...settings, [key]: numericValue };
                    const newRates = calculateRunnerRates(runner, newSettings);
                    return {
                        ...runner,
                        b2: newRates.b2,
                        b1: newRates.b1,
                        back: { ...runner.back, price: newRates.back },
                        lay: { ...runner.lay, price: newRates.lay },
                        l1: newRates.l1,
                        l2: newRates.l2,
                    };
                }));
            }

            // Handle volume-related settings
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
    }, [
        settings,
        runners,
        originalMarketRunnerData,
        originalInningsData,
        isLive,
        directLineEnabled,
        processMarketRunnerData,
        processInningsData,
        calculateRunnerRates,
        setSavedPrices,
        setRunners,
        setSettings,
        setHasShortcutChanges,
        saveSettingsToLocalStorage
    ]);

    const fixedHandleStatusChange = async (newStatus) => {
        // Add confirmation for market close
        if (newStatus === CLOSE_VALUE.toString()) {
            const confirmed = window.confirm("Are you sure you want to close the market? This action cannot be undone.");
            if (!confirmed) return;
        }

        try {
            setIsLoading(true);
            setMarketStatus(newStatus);

            // IMPORTANT: Directly construct the complete market data instead of using prepareMarketData
            const isOpen = +(newStatus || 0) === +OPEN_VALUE;

            // Get runners data from ref if the state is empty
            const currentRunners = runners.length > 0 ? runners : runnersRef.current;

            console.log("Using runners data:", currentRunners);

            // Construct the payload manually with all required fields
            const currentMarketData = {
                eventMarket: [{
                    eventMarketId: eventData.market.eventMarketId,
                    marketName: eventData.market.marketName,
                    margin: settings.margin,
                    status: parseInt(newStatus),
                    isActive: settings.active,
                    isAllow: settings.betAllow,
                    isSendData: true,
                    lineRatio: eventData.market.lineRatio || 0,
                    rateDiff: settings.rateDifferent,
                    predefinedValue: eventData.market.predefinedValue,
                    favRatio: settings.favRatio,
                    runner: currentRunners.map(runner => ({
                        runnerId: runner.runnerId,
                        line: runner.line || 0,
                        overRate: isOpen ? runner.back.price : 0,
                        underRate: isOpen ? runner.lay.price : 0,
                        backPrice: isOpen ? runner.back.price : 0,
                        layPrice: isOpen ? runner.lay.price : 0,
                        backSize: runner.back?.volume || 0,
                        laySize: runner.lay?.volume || 0
                    }))
                }]
            };

            console.log("FIXED PAYLOAD:", JSON.stringify(currentMarketData, null, 2));

            const response = await axiosInstance.post('/admin/eventMarket/upManualMarket', currentMarketData);
            if (response?.success) {
                handleSavedRunnerUpdate(currentMarketData)
                dispatch(updateToastData({
                    data: "Market updated successfully",
                    title: "Success",
                    type: SUCCESS
                }));
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

    const handleKeyPress = useCallback((event) => {
        const key = event.key.toUpperCase();
        console.log(`Key pressed: ${key}`);

        // Check if we're in manual mode
        const isManualMode = !isLive && !directLineEnabled;
        console.log(`Manual mode: ${isManualMode}, isLive: ${isLive}, directLineEnabled: ${directLineEnabled}`);

        // if (key === '+' && isManualMode) {
        //     event.preventDefault();
        //     return;
        // }

        if (key === '+' && !isLive) {
            event.preventDefault();
            return;
        }


        if (!isManualMode) {
            // Only allow status shortcuts (S, D, F, G) in non-manual modes
            switch (key) {
                case 'S':
                    fixedHandleStatusChange(SUSPEND_VALUE.toString());
                    break;
                case 'D':
                    fixedHandleStatusChange(INACTIVE_VALUE.toString());
                    break;
                case 'F':
                    fixedHandleStatusChange(CLOSE_VALUE.toString());
                    break;
                case 'G':
                    fixedHandleStatusChange(OPEN_VALUE.toString());
                    break;
                default:
                    break;
            }
            return;
        }

        // Manual mode & Direct Line: Check for shortcut values
        const value = settings.shortcutValues[key];
        console.log(`Shortcut value for ${key}:`, value);

        // FIRST: Handle shortcut keys (Q, W, E, R, T, Y, U, I, O, P) - ALWAYS prevent default for these
        // const shortcutKeys = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
        // shortcutKeys.includes(key)
        if (key === 'E' || key === 'e') {
        
            // ALWAYS prevent default for shortcut keys to avoid input field issues
            event.preventDefault();

            if (value && value !== '') {
                console.log(`✅ Valid shortcut key: ${key} with value: ${value}`);

                const newRateDiff = parseFloat(value);
                console.log(`Setting temporary rate diff to: ${newRateDiff}`);
                setTempRateDiffWithRef(newRateDiff);

                // Update runners with the temporary rate difference
                setRunners(prevRunners => {
                    console.log('Updating runners with temporary rate diff');
                    return prevRunners.map(runner => {
                        const tempSettings = { ...settings, rateDifferent: newRateDiff };
                        const newRates = calculateRunnerRates(runner, tempSettings, {
                            forceCalculateLay: true
                        });

                        return {
                            ...runner,
                            b2: newRates.b2,
                            b1: newRates.b1,
                            back: { ...runner.back, price: newRates.back },
                            lay: { ...runner.lay, price: newRates.lay },
                            l1: newRates.l1,
                            l2: newRates.l2
                        };
                    });
                });

                // Update saved prices temporarily in manual mode
                console.log('Updating saved prices with new rate diff');
                updateSavedPricesWithNewRateDiff(newRateDiff);
                return;
            }
        }

        // Handle status shortcuts in manual mode too
        switch (key) {
            case 'S':
                fixedHandleStatusChange(SUSPEND_VALUE.toString());
                break;
            case 'D':
                fixedHandleStatusChange(INACTIVE_VALUE.toString());
                break;
            case 'F':
                fixedHandleStatusChange(CLOSE_VALUE.toString());
                break;
            case 'G':
                fixedHandleStatusChange(OPEN_VALUE.toString());
                break;
            default:
                console.log(`No action defined for key: ${key}`);
                break;
        }
    }, [settings, calculateRunnerRates, fixedHandleStatusChange, isLive, directLineEnabled, updateSavedPricesWithNewRateDiff, setTempRateDiffWithRef]);

    const loadSettingsFromLocalStorage = () => {
        try {
            const savedSettings = localStorage.getItem('manualOddsSettings');
            if (savedSettings) {
                return JSON.parse(savedSettings);
            }
        } catch (error) {
            console.error('Error loading settings from local storage:', error);
        }
        return null;
    };

    // const handleSync = () => {
    //     setOriginalShortcutValues(settings.shortcutValues);
    //     setHasShortcutChanges(false);

    //     // Save to local storage
    //     saveSettingsToLocalStorage(settings);
    // };

    // const updateSavedPricesWithOriginalRateDiff = useCallback(() => {
    //     console.log('updateSavedPricesWithOriginalRateDiff called');
    //     setSavedPrices(prevSavedPrices => {
    //         console.log('Previous saved prices for reset:', prevSavedPrices);
    //         const updatedPrices = { ...prevSavedPrices };

    //         // Find selected runner
    //         const selectedRunner = runners.find(r => r.isSelected);
    //         if (!selectedRunner) {
    //             console.log('No selected runner found for reset');
    //             return prevSavedPrices;
    //         }

    //         // Get non-selected runner
    //         const nonSelectedRunners = runners.filter(r => !r.isSelected);
    //         if (!nonSelectedRunners.length) {
    //             console.log('No non-selected runners found for reset');
    //             return prevSavedPrices;
    //         }
    //         const nonSelectedRunner = nonSelectedRunners[0];

    //         // Get current selected back price
    //         const selectedBackPrice = prevSavedPrices[selectedRunner.runnerId]?.back || 0;
    //         if (selectedBackPrice <= 0) {
    //             console.log('Selected back price is 0 or negative for reset');
    //             return prevSavedPrices;
    //         }

    //         // Use original rate difference from settings
    //         const originalRateDiff = parseFloat(settings.rateDifferent);
    //         console.log('Original rate diff for reset:', originalRateDiff);

    //         // Calculate new prices
    //         const selectedLayPrice = Math.max(1.01, parseFloat((selectedBackPrice + originalRateDiff).toFixed(2)));
    //         const nonSelectedBackPrice = parseFloat((1 / (1 - (1 / selectedLayPrice))).toFixed(2));
    //         const nonSelectedLayPrice = parseFloat((1 / (1 - (1 / selectedBackPrice))).toFixed(2));

    //         // Update both runners
    //         updatedPrices[selectedRunner.runnerId] = {
    //             back: selectedBackPrice,
    //             lay: selectedLayPrice
    //         };

    //         updatedPrices[nonSelectedRunner.runnerId] = {
    //             back: nonSelectedBackPrice,
    //             lay: nonSelectedLayPrice
    //         };

    //         console.log('Reset saved prices:', updatedPrices);
    //         return updatedPrices;
    //     });
    // }, [runners, settings.rateDifferent]);

    const prepareMarketData = (options = {}) => {
        const { newStatus = null, doNotChangeStatus = false, useMainPoint = false, useSocketData = false } = options;

        // Determine which status to use
        const statusToUse = doNotChangeStatus ? marketStatus : (newStatus || marketStatus);
        const isOpen = parseInt(statusToUse) === OPEN_VALUE;

        // Build the market data structure
        return {
            eventMarket: [{
                eventMarketId: eventData.market.eventMarketId,
                marketName: eventData.market.marketName,
                margin: settings.margin,
                status: parseInt(statusToUse),
                isActive: settings.active,
                isAllow: settings.betAllow,
                isSendData: true,
                lineRatio: eventData.market.lineRatio || 0,
                rateDiff: settings.rateDifferent,
                predefinedValue: eventData.market.predefinedValue,
                favRatio: settings.favRatio,
                delay: settings.delay,
                runner: prepareRunnerData(runners, { isOpen, useMainPoint, useSocketData })
            }]
        };
    };

    const handleSave = useCallback(async (options = {}) => {
        setIsLoading(true);
        try {
            const marketData = prepareMarketData(options);
            const response = await axiosInstance.post('/admin/eventMarket/upManualMarket', marketData);

            if (response?.success) {
                if (!options.doNotChangeStatus && options.newStatus) {
                    setMarketStatus(options.newStatus);
                }

                handleSavedRunnerUpdate(marketData);
                dispatch(updateToastData({
                    data: "Market updated successfully",
                    title: "Success",
                    type: SUCCESS
                }));
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
    }, [runners, settings, marketStatus, eventData, savedPrices, dispatch]);

    const handleManualSave = useCallback(async (updatedStatus) => {
        setIsLoading(true);
        try {
            const marketData = {
                eventMarket: [{
                    eventMarketId: eventData.market.eventMarketId,
                    marketName: eventData.market.marketName,
                    margin: settings.margin,
                    status: updatedStatus,
                    isActive: settings.active,
                    isAllow: settings.betAllow,
                    isSendData: true,
                    lineRatio: eventData.market.lineRatio || 0,
                    rateDiff: settings.rateDifferent,
                    predefinedValue: eventData.market.predefinedValue,
                    favRatio: settings.favRatio,
                    delay: settings.delay,
                    runner: prepareManualRunnerData()
                }]
            };
            const response = await axiosInstance.post('/admin/eventMarket/upManualMarket', marketData);

            if (response?.success) {
                // If status should be changed, update it
                if (marketStatus !== updatedStatus)
                    setMarketStatus(updatedStatus);
                handleSavedRunnerUpdate(marketData);
                dispatch(updateToastData({
                    data: "Market updated successfully",
                    title: "Success",
                    type: SUCCESS
                }));
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
    });

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

    // Modify the handleSelectedRunnerChange function to maintain focus better
    const handleSelectedRunnerChange = (newRunnerId) => {
        const savedPrice = savedPrices[newRunnerId]?.back || 0;

        // Default to 1.00 if no saved price
        if (savedPrice === 0) {
            setSelectedRunnerDetails(prev => ({
                ...prev,
                runnerId: newRunnerId,
                main: "1",
                point: "00"
            }));
            return;
        }

        // For directLineEnabled and !isLive mode, if price < 1.01, treat as 0
        if (!isLive && directLineEnabled && savedPrice < 1.01) {
            setSelectedRunnerDetails(prev => ({
                ...prev,
                runnerId: newRunnerId,
                main: "0",
                point: "00"
            }));
            return;
        }

        const mainPart = Math.floor(savedPrice);
        const pointPart = Math.round((savedPrice - mainPart) * 100);

        setSelectedRunnerDetails(prev => ({
            ...prev,
            runnerId: newRunnerId,
            main: mainPart.toString(),
            point: pointPart.toString().padStart(2, '0')
        }));
        handleRunnerSelection(newRunnerId);
    };

    const RateCell = ({ runner, field, price, volume, isActive, savedPrice }) => {
        if (!isActive) {
            return (<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <RateBox type={field.startsWith('b') ? 'back' : 'lay'} className="large">-</RateBox>
                <RateBox type={field.startsWith('b') ? 'back' : 'lay'} className="small">-</RateBox>
            </Box>)
        }

        const isBackType = ['b2', 'b1', 'back'].includes(field);
        const isLayType = ['lay', 'l1', 'l2'].includes(field);
        const type = isBackType ? 'back' : isLayType ? 'lay' : '';
        const showSavedAndLive = ['back', 'lay'].includes(field) && savedPrice !== undefined;

        // Format the display of prices, ensuring very low values display as blank
        const formatPriceDisplay = (priceValue) => {
            if (!priceValue || priceValue <= 0) return '';
            // For directLineEnabled and !isLive, values < 1.01 should be blank
            if (!isLive && directLineEnabled && priceValue < 1.01) return '';
            return Number(priceValue).toFixed(2).replace(/\.?0+$/, '');
        };

        // Handle display value for saved price
        const displaySavedPrice = !isLive && directLineEnabled && savedPrice < 1.01 ? '' :
            isActive ? savedPrice : '-';
        const isManualMode = !isLive && !directLineEnabled;
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <RateBox type={type}>
                    {!isManualMode && showSavedAndLive && (
                        <Box sx={{ display: 'flex', width: '100%' }}>
                            <Typography className="live-label-original">
                                {(() => {
                                    const origRunner = originalRunner.find(r => r.runnerId === runner.runnerId);
                                    const origPrice = field === 'back' ? origRunner?.back?.price : origRunner?.lay?.price;
                                    return formatPriceDisplay(origPrice);
                                })()}
                            </Typography>
                            {<Typography className="live-label-calculated">
                                {formatPriceDisplay(price)}
                            </Typography>}
                        </Box>
                    )}
                    <TextField
                        type="number"
                        fullWidth
                        size="small"
                        value={displaySavedPrice}
                        onChange={(e) => handleSavedRunnerChange(runner.runnerId, field, e.target.value)}
                        disabled={!isActive || marketStatus === CLOSE_VALUE.toString()}
                        sx={{
                            '& .MuiInputBase-root': { height: '40px' }
                        }}
                        inputProps={{ step: "0.01", min: "0" }}
                    />
                </RateBox>
                <RateBox type={type}>
                    <TextField
                        type="number"
                        fullWidth
                        size="small"
                        value={isActive ? (volume || '') : '-'}
                        onChange={(e) => handleCellEdit(runner.runnerId, field, 'volume', e.target.value)}
                        disabled={!isActive || marketStatus === CLOSE_VALUE.toString()}
                        className="volume-field"
                        sx={{
                            '& .MuiInputBase-root': { height: '24px' }
                        }}
                        inputProps={{ step: "1", min: "0" }}
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
                if (Number(response?.result?.market?.[0]?.rateSourceRefID) == 0) {
                    setIsLive(false)
                }
                if (!response.result.market) {
                    navigate("/manualOddsMarket");
                    return;
                }
                setEventData({
                    comDetails: response.result.comDetails || null,
                    teams: response.result.teams?.sort((a, b) => a?.teamNo - b?.teamNo) || [],
                    market: response.result.market?.[0] || {},
                });
                const marketData = response.result.market?.[0];
                const currentMarketStatus = marketData?.status?.toString();
                setMarketStatus(currentMarketStatus);
                if (response?.result?.rsMarket) {
                    setSocketMarketData([response.result.rsMarket]);
                }
                // Disable all interactions if market is closed
                if (currentMarketStatus === CLOSE_VALUE.toString()) {
                    setSettings(prev => ({
                        ...prev,
                        betAllow: false,
                        active: false
                    }));
                    setIsLive(false);
                    setAbOpen(false);
                    setAbSuspend(false);
                } else {
                     setSettings(prevSettings => ({
                        ...prevSettings,
                        betAllow: marketData?.isAllow || prevSettings.betAllow,
                        active: marketData?.isActive || prevSettings.active,
                        rateDifferent: marketData?.rateDiff || prevSettings.rateDifferent,
                        bRateVolume: marketData?.defaultBackSize || prevSettings.bRateVolume,
                        lRateVolume: marketData?.defaultLaySize || prevSettings.lRateVolume,
                        margin: marketData?.margin || prevSettings.margin,
                        delay: marketData?.delay || prevSettings.delay,
                        lineRatio: marketData?.lineRatio || prevSettings.lineRatio,
                        favRatio: marketData?.favRatio || prevSettings.favRatio,
                    }));
                    // const settingDataToUpdate = {
                    //     ...settings,
                    //     betAllow: marketData?.isAllow || settings.betAllow,
                    //     active: marketData?.isActive || settings.active,
                    //     rateDifferent: marketData?.rateDiff || settings.rateDifferent,
                    //     bRateVolume: marketData?.defaultBackSize || settings.bRateVolume,
                    //     lRateVolume: marketData?.defaultLaySize || settings.lRateVolume,
                    //     margin: marketData?.margin || settings.margin,
                    //     delay: marketData?.delay || settings.delay,
                    //     lineRatio: marketData?.lineRatio || settings.lineRatio,
                    //     favRatio: marketData?.favRatio || settings.favRatio,
                    // };
                    // setSettings(settingDataToUpdate);
                }

                if (marketData?.rateSourceRefID) {
                    setRateSourceRefID([response.result.market[0].rateSourceRefID]);
                }

                // Initialize runners with proper status handling
                if (marketData?.runners) {
                    initializeRunners(response.result.market[0].runners);
                    // Then set saved prices from the initial data
                    const initialSavedPrices = {};
                    response.result.market[0].runners.forEach(runner => {
                        initialSavedPrices[runner.runnerId] = {
                            back: runner.backPrice,
                            lay: runner.layPrice
                        };
                    });
                    console.log("Hello 1")
                    setSavedPrices(initialSavedPrices);
                    handleSettingChange('volumeType', CUSTOM_STATUS)
                }

                if (socket && commentaryId) {
                    // console.log("Connecting COMMENTARY_STATUS_CONNECT");
                    socket.emit(COMMENTARY_STATUS_CONNECT, { commentaryId: +commentaryId });

                    if (directLineEnabled && !isLive) {
                        // console.log("Connecting to INNINGS_CONNECT");
                        socket.emit(INNINGS_CONNECT, commentaryId);
                    } else {
                        // console.log("Connecting to MARKET_RUNNER_CONNECT");
                        // socket.emit(MARKET_RUNNER_CONNECT, rateSourceRefID);
                    }
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
    const handleMarketClose = () => {
        const confirmed = window.confirm("Are you sure you want to close the market? This action cannot be undone.");
        if (confirmed) {
            handleStatusChange(CLOSE_VALUE.toString());
        }
    };

    const prepareRunnerData = (runners, options = {}) => {
        const { isOpen = true, useMainPoint = false, useSocketData = false } = options;

        return runners.map(runner => {
            // Base runner object with required fields only
            const baseRunner = {
                runnerId: runner.runnerId,
                line: runner.line || 0,
                backSize: runner.back?.volume || 10000,
                laySize: runner.lay?.volume || 10000
            };

            // If market is not open, set all rates to 0
            if (!isOpen) {
                return {
                    ...baseRunner,
                    overRate: 0,
                    underRate: 0,
                    backPrice: 0,
                    layPrice: 0
                };
            }

            // For + key: Use the socket-formatted runner data directly
            if (useSocketData) {
                return {
                    ...baseRunner,
                    overRate: runner.back.price,
                    underRate: runner.lay.price,
                    backPrice: runner.back.price,
                    layPrice: runner.lay.price
                };
            }

            // When using main/point values (for Shift+Enter)
            if (useMainPoint && selectedRunnerDetails.runnerId === runner.runnerId) {
                // Calculate price from main/point fields
                const mainValue = parseFloat(selectedRunnerDetails.main) || 0;
                const pointValue = parseFloat(selectedRunnerDetails.point) || 0;
                const calculatedPrice = mainValue + (pointValue / 100);

                // Calculate lay price based on the settings
                const layPrice = calculatedPrice > 0 ?
                    Math.max(1.01, Number((calculatedPrice + parseFloat(settings.rateDifferent)).toFixed(2))) : 1.01;

                return {
                    ...baseRunner,
                    overRate: calculatedPrice,
                    underRate: layPrice,
                    backPrice: calculatedPrice,
                    layPrice: layPrice
                };
            }

            // When using direct line and not live mode, use saved prices
            if (!isLive && directLineEnabled) {
                let backPrice = savedPrices[runner.runnerId]?.back || 0;
                let layPrice = savedPrices[runner.runnerId]?.lay || 0;

                // Handle very small prices
                backPrice = backPrice < 1.01 ? 0 : backPrice;
                layPrice = layPrice < 1.01 ? 0 : layPrice;

                return {
                    ...baseRunner,
                    overRate: backPrice,
                    underRate: layPrice,
                    backPrice: backPrice,
                    layPrice: layPrice
                };
            }

            // Default case: use the formatted runner data
            return {
                ...baseRunner,
                overRate: runner.back.price,
                underRate: runner.lay.price,
                backPrice: runner.back.price,
                layPrice: runner.lay.price
            };
        });
    };

    const prepareManualRunnerData = () => {

        return runners.map(runner => {
            // Base runner object with required fields only
            const baseRunner = {
                runnerId: runner.runnerId,
                line: runner.line || 0,
                backSize: runner.back?.volume || 10000,
                laySize: runner.lay?.volume || 10000
            };
            let backPrice = savedPrices[runner.runnerId]?.back || 0;
            let layPrice = savedPrices[runner.runnerId]?.lay || 0;

            // Handle very small prices
            backPrice = backPrice < 1.01 ? 0 : backPrice;
            layPrice = layPrice < 1.01 ? 0 : layPrice;

            return {
                ...baseRunner,
                overRate: backPrice,
                underRate: layPrice,
                backPrice: backPrice,
                layPrice: layPrice
            };
        });
    }

    useEffect(() => {
        runnersRef.current = runners;
    }, [runners]);

    useEffect(() => {
        if (!isEmpty(commentaryDetails))
            document.title = `Bookmakers - ${commentaryDetails?.eventName} [${commentaryDetails?.eventRefId}]`;
    }, [commentaryDetails])

    useEffect(() => {
        // Load other data
        // fetchMarketData();

        // Load settings from local storage FIRST
        const savedSettings = loadSettingsFromLocalStorage();
        if (savedSettings) {
            setSettings(prevSettings => ({
                ...prevSettings,
                ...savedSettings
            }));
            console.log('Loaded settings from local storage:', savedSettings);
        }

        // Set up event listener
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    // Separate useEffect for fetching market data after settings are loaded
    useEffect(() => {
        fetchMarketData();
    }, []);

    // useEffect(() => {
    //     // Ensure shortcut values are properly set with defaults if empty
    //     setSettings(prev => {
    //         const defaultShortcuts = {
    //             Q: '0.03', W: '0.05', E: '0.07', R: '0.08',
    //             T: '0.10', Y: '0.15', U: '0.20', I: '0.30',
    //             O: '', P: ''
    //         };

    //         const hasEmptyShortcuts = Object.values(prev.shortcutValues).every(val => !val);

    //         if (hasEmptyShortcuts) {
    //             console.log('Initializing default shortcut values');
    //             return {
    //                 ...prev,
    //                 shortcutValues: defaultShortcuts
    //             };
    //         }

    //         return prev;
    //     });
    // }, []);

    useEffect(() => {
        fetchMarketData();
        // Store original shortcut values
        setOriginalShortcutValues(settings.shortcutValues);
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    useEffect(() => {
        const handleKeyUp = (event) => {
            const key = event.key.toUpperCase();
            const isManualMode = !isLive && !directLineEnabled;

            console.log(`Key released: ${key}, Manual mode: ${isManualMode}`);

            // Only handle keyup in manual mode
            // if (!isManualMode) return;
            if (isLive) return;

            const shortcutValue = settings.shortcutValues[key];

            if (shortcutValue && shortcutValue !== '') {
                console.log(`Key released: ${key}, resetting temporary rate difference`);

                // Add a small delay to ensure the temporary changes are visible
                console.log('Resetting to original rate difference');
                // Reset temporary rate difference

            }
        };

        window.addEventListener('keyup', handleKeyUp);
        return () => window.removeEventListener('keyup', handleKeyUp);
    }, [settings, calculateRunnerRates, isLive, directLineEnabled]);

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
    }, [settings.volumeType, settings.volumeLength, settings.showRate]);

    const handleSavedRunnerUpdate = useCallback((marketData) => {
        const getNonZeroSavedData = (currenetValue, runnerId, key) => {
            if (+currenetValue === 0) {
                return savedPrices?.[runnerId]?.[key] || 0
            } else return currenetValue
        }
        const newSavedPrices = {};
        const currentRunners = marketData.eventMarket[0].runner;

        currentRunners.forEach(runner => {
            newSavedPrices[runner.runnerId] = {
                back: getNonZeroSavedData(runner.backPrice, runner.runnerId, "back"),
                lay: getNonZeroSavedData(runner.layPrice, runner.runnerId, "lay")
            };
        });
        console.log("Hello 2")
        setSavedPrices(newSavedPrices);
        return newSavedPrices;
    }, [savedPrices]);

    const handleSavedRunnerChange = (runnerId, field, value) => {
        // Don't allow manual changes when in temporary state
        if (tempRateDiffRef.current !== null) {
            console.log('Ignoring manual change - in temporary state');
            return;
        }

        const runner = runners.find(r => r.runnerId === runnerId);
        const isSelectedRunner = runner?.isSelected;
        const otherRunner = runners.find(r => r.runnerId !== runnerId);
        const numericValue = Number(parseFloat(value).toFixed(2));

        // For directLineEnabled and !isLive mode, if value < 1.01, set it to 0
        const adjustedValue = !isLive && directLineEnabled && numericValue < 1.01 ? 0 : numericValue;
        console.log("Hello 3")
        setSavedPrices(prevValue => {
            const newSavedPrices = {
                ...prevValue,
                [runnerId]: {
                    ...prevValue[runnerId],
                    [field]: adjustedValue
                }
            };

            if (isSelectedRunner && otherRunner) {
                if (field === 'back') {
                    const newLayPrice = Number((adjustedValue + parseFloat(settings.rateDifferent)).toFixed(2));
                    const newNonSelectedBack = Number((1 / (1 - (1 / newLayPrice))).toFixed(2));
                    const newNonSelectedLay = Number((1 / (1 - (1 / adjustedValue))).toFixed(2));

                    newSavedPrices[runnerId] = {
                        ...newSavedPrices[runnerId],
                        lay: newLayPrice
                    };
                    newSavedPrices[otherRunner.runnerId] = {
                        back: newNonSelectedBack,
                        lay: newNonSelectedLay
                    };
                } else if (field === 'lay') {
                    const newNonSelectedBack = Number((1 / (1 - (1 / adjustedValue))).toFixed(2));
                    const currentSelectedBack = prevValue[runnerId]?.back || 0;
                    const newNonSelectedLay = Number((1 / (1 - (1 / currentSelectedBack))).toFixed(2));

                    newSavedPrices[otherRunner.runnerId] = {
                        back: newNonSelectedBack,
                        lay: newNonSelectedLay
                    };
                }
            } else if (otherRunner) {
                if (field === 'back') {
                    const newNonSelectedLay = Number((1 / (1 - (1 / adjustedValue))).toFixed(2));
                    newSavedPrices[runnerId] = {
                        ...newSavedPrices[runnerId],
                        lay: newNonSelectedLay
                    };
                }
            }

            return newSavedPrices;
        });
    };

    useEffect(() => {
        settingsRef.current = settings;
    }, [settings]);

    useEffect(() => {
        if (!selectedRunner) return;

        // Don't auto-update when in temporary state
        if (tempRateDiffRef.current !== null) {
            console.log('Skipping selectedRunner update - in temporary state');
            return;
        }

        const savedPrice = savedPrices[selectedRunner]?.back || 0;

        if (savedPrice === 0) {
            setSelectedRunnerDetails(prev => ({
                ...prev,
                main: "1",
                point: "00"
            }));

            if (+marketStatus === +OPEN_VALUE) {
                handleSavedRunnerChange(selectedRunner, 'back', "1.00");
            }
        } else {
            const mainPart = Math.floor(savedPrice);
            const pointPart = Math.round((savedPrice - mainPart) * 100);
            setSelectedRunnerDetails(prev => ({
                ...prev,
                main: mainPart.toString(),
                point: pointPart.toString().padStart(2, '0')
            }));
        }
    }, [savedPrices, selectedRunner, isLive, marketStatus]);
    useEffect(() => {
        // Only recalculate in live mode when bfRateDiff changes
        if (isLive && originalMarketRunnerData.length > 0) {
            // console.log('BF Rate changed in live mode, recalculating...');
            processMarketRunnerData(originalMarketRunnerData);
        }
    }, [settings.bfRateDiff, isLive, processMarketRunnerData, originalMarketRunnerData]);

    useEffect(() => {
        // Handle margin changes for different modes
        if (isLive && originalMarketRunnerData.length > 0) {
            // In live mode, recalculate with socket data
            console.log('Margin changed in live mode, recalculating...');
            processMarketRunnerData(originalMarketRunnerData);
        } else if (!isLive && directLineEnabled && originalInningsData.length > 0) {
            // In direct line mode, recalculate with innings data
            console.log('Margin changed in direct line mode, recalculating...');
            processInningsData(originalInningsData);
        } else if (!isLive && !directLineEnabled) {
            // In manual mode, recalculate saved prices based on margin
            console.log('Margin changed in manual mode, recalculating saved prices...');

            // Find selected runner
            const selectedRunnerData = runners.find(r => r.isSelected);
            if (selectedRunnerData) {
                const selectedBackPrice = savedPrices[selectedRunnerData.runnerId]?.back || 0;
                if (selectedBackPrice > 0) {
                    // Recalculate lay price with new margin
                    const newSettings = { ...settings }; // This will have the updated margin
                    const newRates = calculateRunnerRates({
                        back: { price: selectedBackPrice }
                    }, newSettings, { forceCalculateLay: true });

                    // Update saved prices for both runners
                    const nonSelectedRunner = runners.find(r => !r.isSelected);
                    if (nonSelectedRunner) {
                        const selectedLayPrice = newRates.lay;
                        const nonSelectedBackPrice = parseFloat((1 / (1 - (1 / selectedLayPrice))).toFixed(2));
                        const nonSelectedLayPrice = parseFloat((1 / (1 - (1 / selectedBackPrice))).toFixed(2));

                        setSavedPrices(prev => ({
                            ...prev,
                            [selectedRunnerData.runnerId]: {
                                back: selectedBackPrice,
                                lay: selectedLayPrice
                            },
                            [nonSelectedRunner.runnerId]: {
                                back: nonSelectedBackPrice,
                                lay: nonSelectedLayPrice
                            }
                        }));
                    }
                }
            }
        }

        // Always update runner calculations with new margin
        setRunners(prev => prev.map(runner => {
            const newRates = calculateRunnerRates(runner, settings);
            return {
                ...runner,
                b2: newRates.b2,
                b1: newRates.b1,
                back: { ...runner.back, price: newRates.back },
                lay: { ...runner.lay, price: newRates.lay },
                l1: newRates.l1,
                l2: newRates.l2,
            };
        }));
    }, [settings.margin]);

    useEffect(() => {
        const handleKeyDown = async (e) => {
            // Cannot perform operations on closed markets
            if (+marketStatus === +CLOSE_VALUE) return;
            const isManualMode = !isLive && !directLineEnabled;

            if (isManualMode) {
                if ((e.key === 'Enter')) {
                    if (e.key === '+') {
                        e.preventDefault();
                        if (e.shiftKey && +marketStatus !== +OPEN_VALUE) {
                            console.log("Shift + '+' ignored because market is not open");
                            return;
                        }
                        if (+marketStatus === +OPEN_VALUE) {
                            console.log("Shift + '+' ignored because market is not open");
                            return;
                        }
                        return;
                    }
                    let updatedStatus = marketStatus
                    if (e.key === 'Enter') {
                        if (e.shiftKey) { if (+marketStatus !== +OPEN_VALUE) return; }
                        else updatedStatus = +updatedStatus === OPEN_VALUE ? SUSPEND_VALUE : OPEN_VALUE
                    }
                    await handleManualSave(updatedStatus);
                    return;
                }
                return
            }

            // Handle Enter key press for non-manual modes
            if (e.key === 'Enter') {
                e.preventDefault();

                if (e.shiftKey) {
                    if (+marketStatus !== +OPEN_VALUE) return;
                    await handleSave({
                        useMainPoint: true,
                        doNotChangeStatus: true
                    });
                    return;
                }

                let newStatus;
                if (+marketStatus === +OPEN_VALUE) {
                    newStatus = SUSPEND_VALUE;
                    await handleSave({ newStatus });
                }
                else if (+marketStatus === +INACTIVE_VALUE || +marketStatus === +SUSPEND_VALUE) {
                    newStatus = OPEN_VALUE;

                    const marketData = {
                        eventMarket: [{
                            eventMarketId: eventData.market.eventMarketId,
                            marketName: eventData.market.marketName,
                            margin: settings.margin,
                            status: parseInt(newStatus),
                            isActive: settings.active,
                            isAllow: settings.betAllow,
                            isSendData: true,
                            lineRatio: eventData.market.lineRatio || 0,
                            rateDiff: settings.rateDifferent,
                            predefinedValue: eventData.market.predefinedValue,
                            favRatio: settings.favRatio,
                            delay: settings.delay,
                            runner: runners.map(runner => ({
                                runnerId: runner.runnerId,
                                line: runner.line || 0,
                                overRate: runner.back.price,
                                underRate: runner.lay.price,
                                backPrice: runner.back.price,
                                layPrice: runner.lay.price,
                                backSize: runner.back?.volume || 10000,
                                laySize: runner.lay?.volume || 10000
                            }))
                        }]
                    };

                    setIsLoading(true);
                    try {
                        const response = await axiosInstance.post('/admin/eventMarket/upManualMarket', marketData);
                        if (response?.success) {
                            setMarketStatus(newStatus);
                            handleSavedRunnerUpdate(marketData);
                            dispatch(updateToastData({
                                data: "Market updated successfully",
                                title: "Success",
                                type: SUCCESS
                            }));
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
            }

            if (e.key === '+') {
                e.preventDefault();

                if (e.shiftKey && +marketStatus !== +OPEN_VALUE) {
                    console.log("Shift + '+' ignored because market is not open");
                    return;
                }

                if (+marketStatus === +OPEN_VALUE) {
                    console.log("Processing '+' key action");
                    await handleSave({
                        doNotChangeStatus: true,
                        useSocketData: true
                    });
                }
                return;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedRunnerDetails, marketStatus, runners, settings, savedPrices, isLive, directLineEnabled, eventData, handleManualSave, handleSave, handleSavedRunnerUpdate, dispatch]);

    useEffect(() => {
        if (!socket) return;

        const handleBallStatusFromSocket = async (data) => {
            if (data?.ballStatus) {
                setBallStatus(data.ballStatus);

                let shouldAutoSave = false;
                let nextMarketStatus = marketStatus;

                if (data.ballStatus === BALL_START_STATUS && abSuspend) {
                    shouldAutoSave = true;
                    nextMarketStatus = SUSPEND_VALUE;
                } else if (data.ballStatus === SCORING_STATUS && abOpen) {
                    shouldAutoSave = true;
                    nextMarketStatus = OPEN_VALUE;
                }

                if (shouldAutoSave) {
                    const currentRunners = [...runners];
                    const marketData = {
                        eventMarket: [{
                            ...prepareMarketData().eventMarket[0],
                            status: parseInt(nextMarketStatus),
                            runner: currentRunners.map(runner => ({
                                ...runner,
                                backPrice: nextMarketStatus !== OPEN_VALUE ? 0 : runner.back.price,
                                layPrice: nextMarketStatus !== OPEN_VALUE ? 0 : runner.lay.price,
                                overRate: nextMarketStatus !== OPEN_VALUE ? 0 : runner.back.price,
                                underRate: nextMarketStatus !== OPEN_VALUE ? 0 : runner.lay.price
                            }))
                        }]
                    };

                    setIsLoading(true);
                    try {
                        const response = await axiosInstance.post('/admin/eventMarket/upManualMarket', marketData);
                        if (response?.success) {
                            setMarketStatus(nextMarketStatus);
                            handleSavedRunnerUpdate(marketData);

                            dispatch(updateToastData({
                                data: "Market updated successfully",
                                title: "Success",
                                type: SUCCESS
                            }));
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
            }
        };

        // console.log("Setting up ball status handler with current AB states:", { abOpen, abSuspend });
        socket.on(UPDATE_BALL_STATUS, handleBallStatusFromSocket);

        return () => {
            // console.log("Cleaning up ball status handler");
            socket.off(UPDATE_BALL_STATUS, handleBallStatusFromSocket);
        };
    }, [socket, abOpen, abSuspend, runners, marketStatus]);

    useEffect(() => {
        if (!socket || !rateSourceRefID.length) return;

        let marketRunnerListener = null;

        if (isLive) {
            // console.log("Connecting to MARKET_RUNNER_CONNECT");
            socket.emit(MARKET_RUNNER_CONNECT, rateSourceRefID);

            marketRunnerListener = (message) => {
                if (!message?.[0]?.runners || message[0].runners.length !== 2) return;
                const socketRunners = message[0].runners;
                // Save the raw socket data
                setOriginalMarketRunnerData(socketRunners);
                // Process the data via the reusable method
                processMarketRunnerData(socketRunners);
            };

            socket.on(MARKET_RUNNER_DATA, marketRunnerListener);
        } else {
            // console.log("Disconnecting from MARKET_RUNNER_CONNECT");
            socket.emit(MARKET_RUNNER_CONNECT, []); // Disconnect by sending empty array
        }

        return () => {
            if (marketRunnerListener) {
                // console.log("Cleaning up MARKET_RUNNER_DATA listener");
                socket.off(MARKET_RUNNER_DATA, marketRunnerListener);
            }
        };
    }, [isLive, socket, rateSourceRefID]);

    useEffect(() => {
        if (!socket || !commentaryId) return;

        if (directLineEnabled && !isLive) {
            // console.log("Connecting to INNINGS_CONNECT for DirectLine data");
            socket.emit(INNINGS_CONNECT, commentaryId);
        } else if(rateSourceRefID.length){
            // console.log("Connecting to MARKET_RUNNER_CONNECT");
            socket.emit(MARKET_RUNNER_CONNECT, rateSourceRefID);
        }

        return () => {
            if (directLineEnabled && !isLive) {
                socket.off(INNINGS_RUN_DATA);
            } else {
                socket.off(MARKET_RUNNER_DATA);
            }
        };
    }, [socket, commentaryId, directLineEnabled, isLive, rateSourceRefID]);

    useEffect(() => {
        if (!socket) return;

        const handleInningsData = (data) => {
            // Save the raw innings socket data
            setOriginalInningsData(data);
            // Process the data using the reusable method
            processInningsData(data);
        };

        if (directLineEnabled && !isLive) {
            socket.on(INNINGS_RUN_DATA, handleInningsData);
        }

        return () => {
            if (directLineEnabled && !isLive) {
                socket.off(INNINGS_RUN_DATA, handleInningsData);
            }
        };
    }, [socket, directLineEnabled, isLive, socketMarketData]);

    useEffect(() => {
        if (runners.length > 0 && !selectedRunner) {
            handleRunnerSelection(runners[0].runnerId);
        }
    }, [runners]);

    // TODO: test method Remove after development 
    useEffect(() => {
        console.log("Setting up keydown event listener"); // Debug log

        // Add a test function to check if the listener works
        const testKeyPress = (event) => {
            console.log(`TEST: Key pressed: ${event.key.toUpperCase()}`);
        };

        window.addEventListener('keydown', testKeyPress);
        window.addEventListener('keydown', handleKeyPress);

        return () => {
            console.log("Removing keydown event listener"); // Debug log
            window.removeEventListener('keydown', testKeyPress);
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [settings.shortcutValues, isLive]);

    // Added this useEffect for fetching mode values initially from local
    useEffect(() => {
        // Load mode from localStorage on component mount
        const savedMode = loadModeFromLocalStorage();
    
        if (savedMode === "live" && rateSourceRefID.length) {
            setIsLive(true);
            setDirectLineEnabled(false);
        } else if (savedMode === "directLine") {
            setIsLive(false);
            setDirectLineEnabled(true);
        } else { // default to manual
            setIsLive(false);
            setDirectLineEnabled(false);
        }
    }, [rateSourceRefID]);// Depend on rateSourceRefID so it runs when it's populated

    const handleBetAllowToggle = async (newValue) => {
        const marketData = {
            eventMarket: [{
                ...prepareMarketData().eventMarket[0],
                isAllow: newValue
            }]
        };

        setIsLoading(true);
        try {
            const response = await axiosInstance.post('/admin/eventMarket/upManualMarket', marketData);
            if (response?.success) {
                handleSavedRunnerUpdate(marketData)
                setSettings(prev => ({ ...prev, betAllow: newValue }));
                dispatch(updateToastData({
                    data: "Market updated successfully",
                    title: "Success",
                    type: SUCCESS
                }));
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

    const handleActiveToggle = async (newValue) => {
        const marketData = {
            eventMarket: [{
                ...prepareMarketData().eventMarket[0],
                isActive: newValue
            }]
        };

        setIsLoading(true);
        try {
            const response = await axiosInstance.post('/admin/eventMarket/upManualMarket', marketData);
            if (response?.success) {
                handleSavedRunnerUpdate(marketData)
                setSettings(prev => ({ ...prev, active: newValue }));
                dispatch(updateToastData({
                    data: "Market updated successfully",
                    title: "Success",
                    type: SUCCESS
                }));
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

    // Added these helper functions for locally storing mode values 
    const saveModeToLocalStorage = useCallback((mode) => {
        try {
            localStorage.setItem('manualOddsMode', mode);
            console.log('Mode saved to local storage:', mode);
        } catch (error) {
            console.error('Error saving mode to local:', error);
        }
    }, []);

    const loadModeFromLocalStorage = () => {
        try {
            const savedMode = localStorage.getItem('manualOddsMode');
            return savedMode || 'manual'; // default to manual if nothing saved
        } catch (error) {
            console.error('Error loading mode from:', error);
            return 'manual';
        }
    };

    return (
        <Box className="page-content">
            <Container fluid>
                <Box display="flex" flexWrap="wrap" gap={2}>
                    <Box width="100%">
                        <Paper className="manual-card-body" elevation={1} sx={{ p: 3 }}>
                            {/* Header */}
                            <Box display="flex" alignItems="center" justifyContent="space-between" gap={1} sx={{ mb: 0 }}>
                                <Box width="90%">
                                    {!isEmpty(eventData?.comDetails) && (
                                        <Box sx={{ mb: 3 }}>
                                            <Typography variant="h6" className='manual-card-text'>{`${eventData.comDetails.eventName}/${eventData.market?.marketName} [${eventData.market?.eventMarketId}]`}</Typography>
                                            <Typography variant="body2" className='manual-card-text'>
                                                {`Ref: ${eventData.comDetails.eventRefId} [ ${new Date(eventData.comDetails.eventDate).toLocaleString()} ]`}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                                <Box width="15%" sx={{ textAlign: 'right' }}>
                                    <Button color="danger"
                                        className="w-100"
                                        onClick={() => navigate("/commentary")}>Exit</Button>
                                </Box>
                            </Box>

                            {isLoading && <SpinnerModel />}
                            {/* Status Controls */}
                            <Box display="flex" gap={2} sx={{ mb: 3 }}>
                                <Box width="35%">
                                    <FormControl component="fieldset">
                                        <RadioGroup
                                            row
                                            value={isLive ? "live" : directLineEnabled ? "directLine" : "manual"}
                                            onChange={(e) => {
                                                const value = e.target.value;  
                                                
                                                // Save to localStorage
                                                saveModeToLocalStorage(value);

                                                if (value === "live" && rateSourceRefID.length) {
                                                    setIsLive(true);
                                                    setDirectLineEnabled(false);
                                                } else if (value === "directLine") {
                                                    setIsLive(false);
                                                    setDirectLineEnabled(true);
                                                } else { // manual
                                                    setIsLive(false);
                                                    setDirectLineEnabled(false);
                                                }
                                            }}
                                        > {rateSourceRefID.length ?
                                            <FormControlLabel
                                                value="live"
                                                control={<Radio disabled={marketStatus === CLOSE_VALUE.toString()} />}
                                                label="Live"
                                                disabled={marketStatus === CLOSE_VALUE.toString()}
                                            /> : null}
                                            <FormControlLabel
                                                value="directLine"
                                                control={<Radio disabled={marketStatus === CLOSE_VALUE.toString()} />}
                                                label="Direct Line"
                                                disabled={marketStatus === CLOSE_VALUE.toString()}
                                            />
                                            <FormControlLabel
                                                value="manual"
                                                control={<Radio disabled={marketStatus === CLOSE_VALUE.toString()} />}
                                                label="Manual"
                                                disabled={marketStatus === CLOSE_VALUE.toString()}
                                            />
                                        </RadioGroup>
                                    </FormControl>
                                </Box>
                                <Box width="10%">
                                    <StyledTextField
                                        label="Margin"
                                        type="number"
                                        size="small"
                                        color="warning"
                                        focused
                                        fullWidth
                                        value={settings.margin}
                                        inputProps={{ step: "1.00" }}
                                        onChange={(e) => handleSettingChange('margin', e.target.value)}
                                        disabled={marketStatus === CLOSE_VALUE.toString()}
                                    />
                                </Box>
                                <Box width="10%">
                                    <StyledTextField
                                        label="Delay"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        color="warning"
                                        focused
                                        value={settings.delay}
                                        inputProps={{ step: "0.01" }}
                                        onChange={(e) => handleSettingChange('delay', e.target.value)}
                                        disabled={marketStatus === CLOSE_VALUE.toString()}
                                    />
                                </Box>
                                <Box width="10%">
                                    <StyledTextField
                                        label="Line Ratio"
                                        type="number"
                                        size="small"
                                        color="warning"
                                        focused
                                        fullWidth
                                        value={settings.lineRatio}
                                        inputProps={{ step: "0.01" }}
                                        onChange={(e) => handleSettingChange('lineRatio', e.target.value)}
                                        disabled={marketStatus === CLOSE_VALUE.toString()}
                                    />
                                </Box>
                                <Box width="10%">
                                    <StyledTextField
                                        label="Rate Different"
                                        type="number"
                                        size="small"
                                        color="warning"
                                        focused
                                        fullWidth
                                        value={settings.rateDifferent}
                                        inputProps={{ step: "0.01" }}
                                        onChange={(e) => handleSettingChange('rateDifferent', e.target.value)}
                                        disabled={marketStatus === CLOSE_VALUE.toString()}
                                    />
                                </Box>
                                <Box width="10%">
                                    <StyledTextField
                                        label="Fav Ratio"
                                        type="number"
                                        size="small"
                                        color="warning"
                                        focused
                                        fullWidth
                                        value={settings.favRatio}
                                        inputProps={{ step: "1.00" }}
                                        onChange={(e) => handleSettingChange('favRatio', e.target.value)}
                                        disabled={marketStatus === CLOSE_VALUE.toString()}
                                    />
                                </Box>
                                <Box width="15%">
                                    <Button
                                        color="primary"
                                        className="w-100"
                                        onClick={handleSave}
                                        disabled={marketStatus === CLOSE_VALUE.toString()}
                                    >
                                        Save
                                    </Button>
                                </Box>
                            </Box>
                            <Box display="flex" gap={2} sx={{ mb: 3 }}>
                                <Box width="85%">
                                    <FormControl component="fieldset">
                                        <RadioGroup
                                            row
                                            value={marketStatus}
                                            onChange={(e) => {
                                                const newValue = e.target.value;
                                                if (newValue === CLOSE_VALUE.toString()) {
                                                    handleMarketClose();
                                                } else {
                                                    handleStatusChange(newValue);
                                                }
                                            }}
                                            disabled={marketStatus === CLOSE_VALUE.toString()}
                                        >
                                            <StyledFormControlLabel
                                                value={INACTIVE_VALUE.toString()}
                                                control={<StyledRadio disabled={marketStatus === CLOSE_VALUE.toString()} />}
                                                label="Inactive"
                                                className="manual-card-text"
                                            />
                                            <StyledFormControlLabel
                                                className="manual-card-text"
                                                value={CLOSE_VALUE.toString()}
                                                control={<StyledRadio disabled={marketStatus === CLOSE_VALUE.toString()} />}
                                                label="Close"
                                            />
                                        </RadioGroup>
                                    </FormControl>
                                    <StyledFormControlLabel
                                        control={
                                            <Switch
                                                checked={settings.betAllow}
                                                onChange={(e) => handleBetAllowToggle(e.target.checked)}
                                                disabled={marketStatus === CLOSE_VALUE.toString()}
                                            />
                                        }
                                        label="Bet Allowed"
                                    />
                                    <StyledFormControlLabel
                                        control={
                                            <Switch
                                                checked={settings.active}
                                                onChange={(e) => handleActiveToggle(e.target.checked)}
                                                disabled={marketStatus === CLOSE_VALUE.toString()}
                                            />
                                        }
                                        label="Active"
                                    />
                                    <StyledFormControlLabel
                                        control={
                                            <Switch
                                                checked={abOpen}
                                                onChange={(e) => setAbOpen(e.target.checked)}
                                                disabled={marketStatus === CLOSE_VALUE.toString()}
                                            />
                                        }
                                        label="AB Open"
                                    />
                                    <StyledFormControlLabel
                                        control={
                                            <Switch
                                                checked={abSuspend}
                                                onChange={(e) => setAbSuspend(e.target.checked)}
                                                disabled={marketStatus === CLOSE_VALUE.toString()}
                                            />
                                        }
                                        label="AB Suspend"
                                    />
                                    {ballStatus === BALL_START_STATUS &&
                                        <span className="ball-start">
                                            <span className='text-bold mx-2'>Ball Start</span>
                                        </span>
                                    }
                                </Box>
                                <Box width="15%">
                                    <StyledTextField
                                        label="Rate Range"
                                        size="small"
                                        fullWidth
                                        value={settings.rateRange}
                                        onChange={(e) => handleSettingChange('rateRange', e.target.value)}
                                        disabled={marketStatus === CLOSE_VALUE.toString()}
                                    />
                                </Box>
                                {/* <Box width="15%">
                                    <StyledTextField
                                        label="Ball Start After"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={settings.ballStartAfter}
                                        onChange={(e) => handleSettingChange('ballStartAfter', e.target.value)}
                                        disabled={marketStatus === CLOSE_VALUE.toString()}
                                    />
                                </Box> */}
                            </Box>

                            {/* Settings Row */}
                            <Box display="flex" gap={2} sx={{ mb: 3 }}>
                                <Box width="20%">
                                    <StyledTextField
                                        label="Show Rate"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={settings.showRate}
                                        onChange={(e) => handleShowRateChange(e.target.value)}
                                        disabled={marketStatus === CLOSE_VALUE.toString()}
                                        inputProps={{
                                            min: 1,
                                            max: 3
                                        }}
                                    />
                                </Box>
                                <Box width="20%">
                                    <StyledTextField
                                        label="B.Rate Different"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={settings.bRateDifferent}
                                        inputProps={{ step: "0.01" }}
                                        onChange={(e) => handleSettingChange('bRateDifferent', e.target.value)}
                                        disabled={marketStatus === CLOSE_VALUE.toString()}
                                    />
                                </Box>
                                <Box width="20%">
                                    <StyledTextField
                                        label="L.Rate Different"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={settings.lRateDifferent}
                                        inputProps={{ step: "0.01" }}
                                        onChange={(e) => handleSettingChange('lRateDifferent', e.target.value)}
                                        disabled={marketStatus === CLOSE_VALUE.toString()}
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
                                            disabled={marketStatus === CLOSE_VALUE.toString()}
                                        >
                                            <StyledFormControlLabel
                                                value={AUTO_STATUS}
                                                control={<StyledRadio disabled={marketStatus === CLOSE_VALUE.toString()} />}
                                                label="Auto Volume"
                                            />
                                            <StyledFormControlLabel
                                                value={CUSTOM_STATUS}
                                                control={<StyledRadio disabled={marketStatus === CLOSE_VALUE.toString()} />}
                                                label="Cust.Volume"
                                            />
                                        </RadioGroup>
                                    </FormControl>
                                </Box>
                                <Box width="16.67%">
                                    <StyledTextField
                                        label="Tie Probability"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={settings.tieProbability}
                                        inputProps={{ step: "0.1" }}
                                        onChange={(e) => handleSettingChange('tieProbability', e.target.value)}
                                        disabled={marketStatus === CLOSE_VALUE.toString()}
                                    />
                                </Box>
                                <Box width="16.67%">
                                    <StyledTextField
                                        label="BF Rate Diff"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={settings.bfRateDiff}
                                        inputProps={{ step: "0.01" }}
                                        onChange={(e) => handleSettingChange('bfRateDiff', e.target.value)}
                                        disabled={marketStatus === CLOSE_VALUE.toString()}
                                    />
                                </Box>
                                <Box width="16.67%">
                                    <StyledTextField
                                        label="B.Rate Volume"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={settings.bRateVolume}
                                        onChange={(e) => handleSettingChange('bRateVolume', e.target.value)}
                                        disabled={settings.volumeType === AUTO_STATUS || marketStatus === CLOSE_VALUE.toString()}
                                    />
                                </Box>
                                <Box width="16.67%">
                                    <StyledTextField
                                        label="L.Rate Volume"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={settings.lRateVolume}
                                        onChange={(e) => handleSettingChange('lRateVolume', e.target.value)}
                                        disabled={settings.volumeType === AUTO_STATUS || marketStatus === CLOSE_VALUE.toString()}
                                    />
                                </Box>
                                <Box width="16.67%">
                                    <StyledTextField
                                        label="Volume Length"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={settings.volumeLength}
                                        onChange={(e) => handleSettingChange('volumeLength', e.target.value)}
                                        disabled={settings.volumeType === CUSTOM_STATUS || marketStatus === CLOSE_VALUE.toString()}
                                    />
                                </Box>
                            </Box>

                            {/* Shortcuts Section */}
                            {/* (!isLive && !directLineEnabled) */}
                            {(!isLive ) && (
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
                                                        disabled={marketStatus === CLOSE_VALUE.toString()}
                                                        sx={{
                                                            '& .MuiInputBase-input': { py: 0.5 },
                                                            '& .MuiOutlinedInput-notchedOutline': {
                                                                borderColor: hasShortcutChanges ? 'primary.main' : 'inherit',
                                                                borderWidth: hasShortcutChanges ? 2 : 1
                                                            }
                                                        }}
                                                    />
                                                </KeyBox>
                                            </Box>
                                        ))}
                                    </Box>
                                    {/* <Box width="8%">
                                        <Button
                                            color="primary"
                                            disabled={!hasShortcutChanges || marketStatus === CLOSE_VALUE.toString()}
                                            onClick={handleSync}
                                            sx={{
                                                height: '100%',
                                                width: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: theme => theme.spacing(1),
                                            }}
                                        >
                                            <RiRefreshLine className="me-1" size={16} />
                                            Sync
                                        </Button>
                                    </Box> */}
                                </Box>
                            )}
                            {/* Table Section */}
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Selections</TableCell>
                                            <TableCell align="center"></TableCell>
                                            <TableCell align="center"></TableCell>
                                            <TableCell align="center">Back</TableCell>
                                            <TableCell align="center">Lay</TableCell>
                                            <TableCell align="center"></TableCell>
                                            <TableCell align="center"></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {runners.map((runner) => {
                                            const activeColumns = getActiveColumns(settings.showRate);
                                            return (
                                                <StyledTableRow key={runner.runnerId} selected={runner.isSelected}>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <StyledRadio
                                                                size="small"
                                                                checked={runner.isSelected}
                                                                onChange={() => handleRunnerSelection(runner.runnerId)}
                                                                disabled={marketStatus === CLOSE_VALUE.toString()}
                                                            />
                                                            <Typography className='manual-card-text'>{runner.runner}</Typography>
                                                        </Box>
                                                    </TableCell>
                                                    {['b2', 'b1', 'back', 'lay', 'l1', 'l2'].map(field => {
                                                        const isBackType = ['b2', 'b1', 'back'].includes(field);
                                                        const isLayType = ['lay', 'l1', 'l2'].includes(field);
                                                        const type = isBackType ? 'back' : isLayType ? 'lay' : '';

                                                        const price = field === 'back' ? runner.back.price :
                                                            field === 'lay' ? runner.lay.price :
                                                                runner[field];

                                                        const volume = field === 'back' ? runner.back.volume :
                                                            field === 'lay' ? runner.lay.volume :
                                                                runner[`${field}Volume`];

                                                        // Get saved price for back and lay fields
                                                        const savedPrice = field === 'back' ? savedPrices[runner.runnerId]?.back :
                                                            field === 'lay' ? savedPrices[runner.runnerId]?.lay :
                                                                undefined;
                                                        const isActiveColumn = activeColumns.includes(field) && marketStatus !== CLOSE_VALUE.toString()
                                                        return (
                                                            <StyledTableCell key={field} align="center" type={type}>
                                                                <RateCell
                                                                    runner={runner}
                                                                    field={field}
                                                                    price={price}
                                                                    volume={volume}
                                                                    isActive={isActiveColumn}
                                                                    savedPrice={savedPrice}
                                                                />
                                                            </StyledTableCell>
                                                        );
                                                    })}
                                                </StyledTableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {/* Selected Runner Details Section */}
                            {selectedRunner && (
                                <Paper elevation={1} sx={{ mt: 3, p: 0 }}>
                                    <Box display="flex" gap={2} sx={{ p: 2 }} className="manual-card-body">
                                        <Box width="25%">
                                            <FormControl fullWidth size="small">
                                                <StyledSelect
                                                    value={selectedRunnerDetails.runnerId || ''}
                                                    onChange={(e) => handleSelectedRunnerChange(e.target.value)}
                                                    disabled={marketStatus === CLOSE_VALUE.toString()}
                                                >
                                                    {runners.map(runner => (
                                                        <MenuItem key={runner.runnerId} value={runner.runnerId}>
                                                            {runner.runner}
                                                        </MenuItem>
                                                    ))}
                                                </StyledSelect>
                                            </FormControl>
                                        </Box>
                                        <Box width="25%">
                                            <StyledTextField
                                                fullWidth
                                                size="small"
                                                type="number"
                                                label="Main"
                                                value={selectedRunnerDetails.main}
                                                onChange={(e) => {
                                                    const mainValue = Math.max(0, parseInt(e.target.value) || 0);
                                                    const pointValue = parseInt(selectedRunnerDetails.point) || 0;
                                                    const combinedValue = mainValue + (pointValue / 100);

                                                    setSelectedRunnerDetails(prev => ({
                                                        ...prev,
                                                        main: mainValue.toString()
                                                    }));

                                                    // Immediately update saved prices
                                                    handleSavedRunnerChange(selectedRunner, 'back', combinedValue.toFixed(2));
                                                }}
                                                disabled={marketStatus === CLOSE_VALUE.toString()}
                                                inputProps={{
                                                    min: 0,
                                                    step: 1
                                                }}
                                            />
                                        </Box>
                                        <Box width="25%">
                                            <StyledTextField
                                                fullWidth
                                                size="small"
                                                type="number"
                                                label="Point"
                                                value={selectedRunnerDetails.point}
                                                onChange={(e) => {
                                                    const pointValue = Math.max(0, Math.min(99, parseInt(e.target.value) || 0));
                                                    const mainValue = parseInt(selectedRunnerDetails.main) || 0;
                                                    const combinedValue = mainValue + (pointValue / 100);

                                                    setSelectedRunnerDetails(prev => ({
                                                        ...prev,
                                                        point: pointValue.toString().padStart(2, '0')
                                                    }));

                                                    // Immediately update saved prices
                                                    handleSavedRunnerChange(selectedRunner, 'back', combinedValue.toFixed(2));
                                                }}
                                                disabled={marketStatus === CLOSE_VALUE.toString()}
                                                inputProps={{
                                                    step: 1,
                                                    min: 0,
                                                    max: 99
                                                }}
                                            />
                                        </Box>
                                        <Box width="25%">
                                            <FormControl component="fieldset">
                                                <RadioGroup
                                                    row
                                                    value={marketStatus}
                                                    disabled={marketStatus === CLOSE_VALUE.toString()}
                                                >
                                                    <StyledFormControlLabel
                                                        value={OPEN_VALUE}
                                                        control={<StyledRadio disabled={marketStatus === CLOSE_VALUE.toString()} />}
                                                        label="Open"
                                                    />
                                                    <StyledFormControlLabel
                                                        value={SUSPEND_VALUE}
                                                        control={<StyledRadio disabled={marketStatus === CLOSE_VALUE.toString()} />}
                                                        label="Suspend"
                                                    />
                                                </RadioGroup>
                                            </FormControl>
                                        </Box>
                                    </Box>
                                </Paper>
                            )}
                        </Paper>
                    </Box>
                </Box >
            </Container >
        </Box >
    );
};