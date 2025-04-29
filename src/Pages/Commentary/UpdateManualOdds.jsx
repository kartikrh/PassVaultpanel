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
import { calculateExpectedFinalScore, calculateLayFromBack, decimalOddsTwoOutcomes, predictWinProbability } from '../../components/Helper/UpdateManualOddHelper.js';

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

//   // Optional: Create a styled RadioGroup if needed
//   const StyledRadioGroup = styled(RadioGroup)(({ theme }) => ({
//     // Light Mode Styles
//     '& .MuiFormControlLabel-root': {
//       marginBottom: '8px',
//     },

//     // Dark Mode Styles
//     [theme.breakpoints.up(0)]: {
//       'body[data-theme="dark"] &': {
//         '& .MuiFormControlLabel-root': {
//           marginBottom: '8px',
//         },
//       },
//     },
//   }));

export const UpdateManualOdds = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const socket = createSocket();
    const commentaryId = localStorage.getItem("updateManualOddsCommentaryId");
    const commentaryDetails = JSON.parse(localStorage.getItem('updateManualOddsCommentaryDetails') || "{}");
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
        bRateVolume: 300,
        lRateVolume: 300,
        margin: 10,
        delay: 10,
        lineRatio: 10,
        bfRateDiff: -0.01,
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

    useEffect(() => {
        if (!isEmpty(commentaryDetails))
            document.title = `Bookmakers - ${commentaryDetails?.eventName} [${commentaryDetails?.eventRefId}]`;
    }, [commentaryDetails])

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

    const handleSettingChange = (key, value, isShortcut = false) => {
        if (['rateDifferent', 'bRateDifferent', 'lRateDifferent'].includes(key)) {
            const numValue = parseFloat(value);
            if (numValue < 0.01) {
                value = '0.01';
            }
        }
        if (isShortcut) {
            const newValue = settings.shortcutValues[value];
            if (newValue) {
                handleSettingChange('rateDifferent', newValue);
            }
        } else {
            // Ensure value is numeric for rate-related settings
            const numericValue = value === '' ? '0' : value;

            if (key === 'volumeType' && value === CUSTOM_STATUS) {
                // When switching to custom volume, update all runners with the current B/L rate volumes
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

    const calculateRunnerRates = (runner, settings, options = {}) => {
        const {
            forceCalculateLay = true,
            isSocketData = false,
            manualEdit = false,
            editedField = null
        } = options;

        const back = Math.max(0, parseFloat(runner?.back?.price) || 0);
        const existingLay = Math.max(0, parseFloat(runner?.lay?.price) || 0);
        const existingL1 = Math.max(0, parseFloat(runner?.l1) || 0);
        const existingL2 = Math.max(0, parseFloat(runner?.l2) || 0);

        const bRateDiff = Math.max(0, parseFloat(settings?.bRateDifferent) || 0);
        const lRateDiff = Math.max(0, parseFloat(settings?.lRateDifferent) || 0);
        const rateDiff = Math.max(0, tempRateDiff || parseFloat(settings?.rateDifferent) || 0);

        const b2 = Math.max(0, Number((back - (2 * bRateDiff)).toFixed(2)));
        const b1 = Math.max(0, Number((back - bRateDiff).toFixed(2)));

        let lay, l1, l2;

        if (isSocketData || (manualEdit && editedField === 'back')) {
            lay = back > 0 ? Math.max(1.01, Number((back + rateDiff).toFixed(2))) : 1.01;
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
                        lay = back > 0 ? Math.max(1.01, Number((back + rateDiff).toFixed(2))) : 1.01;
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
                lay = back > 0 ? Math.max(1.01, Number((back + rateDiff).toFixed(2))) : 1.01;
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
    };

    const handleKeyPress = useCallback((event) => {
        const key = event.key.toUpperCase();
        const value = settings.shortcutValues[key];
        if (value && !isLive) {
            setTempRateDiff(parseFloat(value));
            // Recalculate prices using tempRateDiff
            setRunners(prev => prev.map(runner => {
                const newRates = calculateRunnerRates(runner, {
                    ...settings,
                    rateDifferent: value
                });
                return {
                    ...runner,
                    ...newRates
                };
            }));
            return;
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
    }, [settings.shortcutValues, isLive, calculateRunnerRates]);

    const handleSync = () => {
        setOriginalShortcutValues(settings.shortcutValues);
        setHasShortcutChanges(false);
    };

    // Prepare data for saving
    const prepareMarketData = (optionalStatus) => {
        const isOpen = +(optionalStatus || marketStatus || 0) === +OPEN_VALUE;
        const marketData = {
            eventMarket: [{
                eventMarketId: eventData.market.eventMarketId,
                marketName: eventData.market.marketName,
                margin: settings.margin,
                status: parseInt(marketStatus),
                isActive: settings.active,
                isAllow: settings.betAllow,
                isSendData: true,
                lineRatio: eventData.market.lineRatio,
                rateDiff: settings.rateDifferent,
                predefinedValue: eventData.market.predefinedValue,
                favRatio: settings?.favRatio,
                runner: runners.map(runner => ({
                    runnerId: runner.runnerId,
                    line: runner.line || 0,
                    overRate: isOpen ? runner.back.price : 0,
                    underRate: isOpen ? runner.lay.price : 0,
                    backPrice: isOpen ? runner.back.price : 0,
                    layPrice: isOpen ? runner.lay.price : 0,
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
                handleSavedRunnerUpdate(marketData)
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

        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <RateBox type={type}>
                    {showSavedAndLive && (
                        <Box sx={{ display: 'flex', width: '100%' }}>
                            <Typography className="live-label-original">
                                {(() => {
                                    const origRunner = originalRunner.find(r => r.runnerId === runner.runnerId);
                                    const origPrice = field === 'back' ? origRunner?.back?.price : origRunner?.lay?.price;
                                    return formatPriceDisplay(origPrice);
                                })()}
                            </Typography>
                            {!directLineEnabled && <Typography className="live-label-calculated">
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
                    teams: response.result.teams?.sort((a,b)=> a?.teamNo - b?.teamNo) || [],
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
                    const settingDataToUpdate = {
                        ...settings,
                        betAllow: marketData?.isAllow || settings.betAllow,
                        active: marketData?.isActive || settings.active,
                        rateDifferent: marketData?.rateDiff || settings.rateDifferent,
                        bRateVolume: marketData?.defaultBackSize || settings.bRateVolume,
                        lRateVolume: marketData?.defaultLaySize || settings.lRateVolume,
                        margin: marketData?.margin || settings.margin,
                        delay: marketData?.delay || settings.delay,
                        lineRatio: marketData?.lineRatio || settings.lineRatio,
                        favRatio: marketData?.favRatio || settings.favRatio,
                    };
                    setSettings(settingDataToUpdate);
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
                    setSavedPrices(initialSavedPrices);
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

    const handleSavedRunnerUpdate = (marketData) => {
        const getNonZeroSavedData = (currenetValue, runnerId, key) => {
            if (+currenetValue === 0) {
                return savedPrices?.[runnerId]?.[key] || 0
            } else return currenetValue
        }
        const newSavedPrices = {};
        // Extract runners from the passed marketData
        const currentRunners = marketData.eventMarket[0].runner;

        currentRunners.forEach(runner => {
            newSavedPrices[runner.runnerId] = {
                back: getNonZeroSavedData(runner.backPrice, runner.runnerId, "back"),
                lay: getNonZeroSavedData(runner.layPrice, runner.runnerId, "lay")
            };
        });
        setSavedPrices(newSavedPrices);
        return newSavedPrices;
    };

    const handleSavedRunnerChange = (runnerId, field, value) => {
        const runner = runners.find(r => r.runnerId === runnerId);
        const isSelectedRunner = runner?.isSelected;
        const otherRunner = runners.find(r => r.runnerId !== runnerId);
        const numericValue = Number(parseFloat(value).toFixed(2));

        // For directLineEnabled and !isLive mode, if value < 1.01, set it to 0
        const adjustedValue = !isLive && directLineEnabled && numericValue < 1.01 ? 0 : numericValue;

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

    // const handleRunnerUpdates = (currentRunners, newOriginalRunners, settings) => {
    //     // First update original runners
    //     setOriginalRunner(newOriginalRunners);

    //     // Find minimum back price runner from original data
    //     const minBackRunner = newOriginalRunners.reduce((min, curr) => {
    //         const currPrice = curr.back?.price || Infinity;
    //         const minPrice = min.back?.price || Infinity;

    //         // Skip zero prices
    //         if (currPrice === 0) return min;
    //         if (minPrice === 0) return curr;

    //         return currPrice < minPrice ? curr : min;
    //     }, newOriginalRunners[0]);

    //     if (!minBackRunner) return currentRunners;

    //     // Update runner prices and selection
    //     const updatedRunners = currentRunners.map(runner => {
    //         const isSelected = runner.runnerId === minBackRunner.runnerId;
    //         let updatedRunner;

    //         if (isSelected) {
    //             // Selected runner calculations
    //             const backPrice = Number(minBackRunner.back.price.toFixed(2));
    //             let layPrice;

    //             if (backPrice === 0) {
    //                 layPrice = 1.01;
    //             } else {
    //                 layPrice = Number((backPrice + parseFloat(settings.rateDifferent)).toFixed(2));
    //             }

    //             const newRates = calculateRunnerRates({
    //                 back: { price: backPrice }
    //             }, settings, {
    //                 forceCalculateLay: true,
    //                 isSocketData: true
    //             });

    //             updatedRunner = {
    //                 ...runner,
    //                 isSelected: true,
    //                 back: {
    //                     price: backPrice,
    //                     volume: runner.back.volume
    //                 },
    //                 lay: {
    //                     price: layPrice,
    //                     volume: runner.lay.volume
    //                 },
    //                 b2: Number(newRates.b2.toFixed(2)),
    //                 b1: Number(newRates.b1.toFixed(2)),
    //                 l1: Number(newRates.l1.toFixed(2)),
    //                 l2: Number(newRates.l2.toFixed(2))
    //             };
    //         } else {
    //             // Non-selected runner calculations
    //             const selectedBackPrice = minBackRunner.back.price;
    //             let backPrice, layPrice;

    //             if (selectedBackPrice === 0) {
    //                 layPrice = 1.01;
    //                 backPrice = Number((1 / (1 - (1 / layPrice))).toFixed(2));
    //             } else {
    //                 const selectedLayPrice = Number((selectedBackPrice + parseFloat(settings.rateDifferent)).toFixed(2));
    //                 backPrice = Number((1 / (1 - (1 / selectedLayPrice))).toFixed(2));
    //                 layPrice = Number((1 / (1 - (1 / selectedBackPrice))).toFixed(2));
    //             }

    //             const newRates = calculateRunnerRates({
    //                 back: { price: backPrice }
    //             }, settings, {
    //                 forceCalculateLay: true,
    //                 isSocketData: true
    //             });

    //             updatedRunner = {
    //                 ...runner,
    //                 isSelected: false,
    //                 back: {
    //                     price: backPrice,
    //                     volume: runner.back.volume
    //                 },
    //                 lay: {
    //                     price: layPrice,
    //                     volume: runner.lay.volume
    //                 },
    //                 b2: Number(newRates.b2.toFixed(2)),
    //                 b1: Number(newRates.b1.toFixed(2)),
    //                 l1: Number(newRates.l1.toFixed(2)),
    //                 l2: Number(newRates.l2.toFixed(2))
    //             };
    //         }

    //         return updatedRunner;
    //     });

    //     // Update selected runner states
    //     setSelectedRunner(minBackRunner.runnerId);

    //     // Update selected runner details
    //     const savedPrice = savedPrices[minBackRunner.runnerId]?.back || 0;
    //     const mainPart = Math.floor(savedPrice);
    //     const pointPart = Math.round((savedPrice - mainPart) * 100);

    //     setSelectedRunnerDetails(prev => ({
    //         ...prev,
    //         runnerId: minBackRunner.runnerId,
    //         main: mainPart.toString(),
    //         point: pointPart.toString().padStart(2, '0')
    //     }));

    //     return updatedRunners;
    // };

    // Reusable method for processing MARKET_RUNNER_DATA

    const processMarketRunnerData = (incomingData) => {
        // Use incoming data if provided; otherwise, fallback to stored original data.
        const socketData = incomingData || originalMarketRunnerData;
        if (!socketData || !socketData.length) return;
        const currentSettings = settingsRef.current;

        // console.log("Processing Market Runner Data with raw socket data:", socketData);

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

        // Then prepare adjusted data for the current runners state
        const adjustedRunners = socketData.map(runner => {
            const originalBackPrice = runner.backPrice;

            // Apply bfRateDiff adjustment to backPrice
            let adjustedBackPrice = parseFloat((originalBackPrice + parseFloat(currentSettings.bfRateDiff)).toFixed(2));

            // If backPrice is less than 1.01 but greater than 0, set it to 0
            if (adjustedBackPrice > 0 && adjustedBackPrice < 1.01) {
                adjustedBackPrice = 0;
            }

            // Calculate lay price from back price using the margin formula: Lay = Back / (1 - margin)
            const layMargin = currentSettings.margin / 100;
            const calculatedLayPrice = adjustedBackPrice > 0
                ? parseFloat((adjustedBackPrice / (1 - layMargin)).toFixed(2))
                : 0;

            // console.log(`Runner ${runner.selectionId} (${runner.runner}) price calculation:`, {
            //     originalBack: originalBackPrice,
            //     adjustedBack: adjustedBackPrice,
            //     layMargin: layMargin,
            //     calculatedLay: calculatedLayPrice
            // });

            return {
                ...runner,
                backPrice: adjustedBackPrice,
                layPrice: calculatedLayPrice
            };
        });

        // Determine the runner with the minimum back price
        const minBackRunner = adjustedRunners.reduce(
            (min, curr) => {
                // Only consider runners with a valid back price (greater than 0)
                if (curr.backPrice > 0 && (min.backPrice === undefined || curr.backPrice < min.backPrice)) {
                    return curr;
                }
                return min;
            },
            {}
        );

        // console.log("Selected minimum back price runner:", minBackRunner);

        // Update only the current runners state with calculated prices
        setRunners(prevRunners => {
            return prevRunners.map(prevRunner => {
                const adjustedRunner = adjustedRunners.find(r => r.selectionId === prevRunner.selectionId);
                if (!adjustedRunner) return prevRunner;

                const isSelected = adjustedRunner.selectionId === minBackRunner.selectionId;

                // Calculate ladder prices based on calculated back and lay prices
                const bRateDiff = parseFloat(currentSettings.bRateDifferent);
                const lRateDiff = parseFloat(currentSettings.lRateDifferent);

                const backPrice = adjustedRunner.backPrice;
                const layPrice = adjustedRunner.layPrice;

                const b2 = Math.max(0, parseFloat((backPrice - (2 * bRateDiff)).toFixed(2)));
                const b1 = Math.max(0, parseFloat((backPrice - bRateDiff).toFixed(2)));
                const l1 = Math.max(0, parseFloat((layPrice + lRateDiff).toFixed(2)));
                const l2 = Math.max(0, parseFloat((layPrice + (2 * lRateDiff)).toFixed(2)));

                // console.log(`Updating current runner ${prevRunner.selectionId} (${prevRunner.runner}) ladder prices:`, {
                //     isSelected,
                //     backPrice,
                //     layPrice,
                //     b2,
                //     b1,
                //     l1,
                //     l2
                // });

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
        });

        // Update selectedRunner based on minimum back price
        if (minBackRunner && minBackRunner.selectionId) {
            const runner = adjustedRunners.find(r => r.selectionId === minBackRunner.selectionId);
            if (runner) {
                setSelectedRunner(runner.runnerId);
                setSelectedRunnerDetails(prev => ({
                    ...prev,
                    runnerId: runner.runnerId,
                    main: Math.floor(runner.backPrice).toString(),
                    point: ((runner.backPrice % 1) * 100).toFixed(0).padStart(2, '0')
                }));
            }
        }
    };

    // Reusable method for processing INNINGS_RUN_DATA
    const processInningsData = (incomingData) => {
        // Use incoming data if provided; otherwise, fallback to stored original innings data.
        const dataToProcess = incomingData || originalInningsData;
        if (!dataToProcess || !dataToProcess.length) return;
        // console.log("Processing Innings Data:", dataToProcess);

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
        // console.log("Updated Innings Market Data:", updatedMarketData);
        setSocketMarketData(updatedMarketData);
        handleInningsDataUpdate(updatedMarketData);
    };


    useEffect(() => {
        settingsRef.current = settings;
    }, [settings]);

    useEffect(() => {
        if (!selectedRunner) return;

        const savedPrice = savedPrices[selectedRunner]?.back || 0;

        // Set default value to 1.00 instead of 1.25
        if (savedPrice === 0) {
            setSelectedRunnerDetails(prev => ({
                ...prev,
                main: "1",
                point: "00"  // Changed from "25" to "00"
            }));
            handleSavedRunnerChange(selectedRunner, 'back', "1.00");
        } else {
            const mainPart = Math.floor(savedPrice);
            const pointPart = Math.round((savedPrice - mainPart) * 100);
            setSelectedRunnerDetails(prev => ({
                ...prev,
                main: mainPart.toString(),
                point: pointPart.toString().padStart(2, '0')
            }));
        }
    }, [savedPrices, selectedRunner, isLive]);

    useEffect(() => {
        const prepareRunnerData = (runner, event, useNewStatus = false, newStatus = marketStatus) => {
            const isOpenStatus = +(useNewStatus ? newStatus : marketStatus) === +OPEN_VALUE;
            if (!isOpenStatus) {
                return {
                    ...runner,
                    backPrice: 0,
                    layPrice: 0,
                    overRate: 0,
                    underRate: 0,
                    backSize: runner.back.volume,
                    laySize: runner.lay.volume,
                    runnerId: runner.runnerId,
                    line: runner.line || 0
                };
            }

            // When directLine is enabled and not live, use savedPrices
            if (!isLive && directLineEnabled) {
                let backPrice = savedPrices[runner.runnerId]?.back || 0;
                let layPrice = savedPrices[runner.runnerId]?.lay || 0;

                // If prices are < 1.01, explicitly set to 0
                backPrice = backPrice < 1.01 ? 0 : backPrice;
                layPrice = layPrice < 1.01 ? 0 : layPrice;

                return {
                    ...runner,
                    backPrice: backPrice,
                    layPrice: layPrice,
                    overRate: backPrice,
                    underRate: layPrice,
                    backSize: runner.back.volume,
                    laySize: runner.lay.volume,
                    runnerId: runner.runnerId,
                    line: runner.line || 0
                };
            }

            const useSavedPrices = (!isLive && !directLineEnabled) || (event && event.shiftKey);
            return {
                ...runner,
                backPrice: useSavedPrices ? (savedPrices[runner.runnerId]?.back || 0) : runner.back.price,
                layPrice: useSavedPrices ? (savedPrices[runner.runnerId]?.lay || 0) : runner.lay.price,
                overRate: useSavedPrices ? (savedPrices[runner.runnerId]?.back || 0) : runner.back.price,
                underRate: useSavedPrices ? (savedPrices[runner.runnerId]?.lay || 0) : runner.lay.price,
                backSize: runner.back.volume,
                laySize: runner.lay.volume,
                runnerId: runner.runnerId,
                line: runner.line || 0
            };
        };

        const updateMarket = async (event, customStatus = null) => {
            const baseMarketData = prepareMarketData(customStatus);
            const currentMarketData = {
                eventMarket: [{
                    ...baseMarketData.eventMarket[0],
                    ...(customStatus && {
                        status: parseInt(customStatus),
                        isActive: settings.active
                    }),
                    runner: runners.map(runner =>
                        prepareRunnerData(runner, event, !!customStatus, customStatus)
                    )
                }]
            };

            setIsLoading(true);
            try {
                const response = await axiosInstance.post('/admin/eventMarket/upManualMarket', currentMarketData);
                if (response?.success) {
                    handleSavedRunnerUpdate(currentMarketData);
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

        const handleKeyDown = async (e) => {
            if (e.key === '+' && (+marketStatus === +OPEN_VALUE)) {
                e.preventDefault();

                // If there's selected runner details, update price from main/point
                if (selectedRunnerDetails.main || selectedRunnerDetails.point) {
                    const calculatedPrice = (parseFloat(selectedRunnerDetails.main) || 0) +
                        ((parseFloat(selectedRunnerDetails.point) || 0) / 100);
                    await new Promise(resolve => {
                        handleCellEdit(selectedRunnerDetails.runnerId, 'back', 'price', calculatedPrice);
                        resolve();
                    });
                }

                // Save without changing status
                await updateMarket(e);
                return;
            }

            if (e.key === 'Enter') {
                e.preventDefault();
                if (e.shiftKey && +marketStatus !== +OPEN_VALUE) return;
                // Handle Shift+Enter case
                if (e.shiftKey) {
                    await updateMarket(e);
                    return;
                }

                // Update price from main/point if exists
                if (selectedRunnerDetails.main || selectedRunnerDetails.point) {
                    const calculatedPrice = (parseFloat(selectedRunnerDetails.main) || 0) +
                        ((parseFloat(selectedRunnerDetails.point) || 0) / 100);
                    await new Promise(resolve => {
                        handleCellEdit(selectedRunnerDetails.runnerId, 'back', 'price', calculatedPrice);
                        resolve();
                    });
                }

                // Handle status toggle
                let newStatus;
                if (+marketStatus === +OPEN_VALUE) {
                    newStatus = SUSPEND_VALUE;
                } else if (+marketStatus === +INACTIVE_VALUE || +marketStatus === +SUSPEND_VALUE) {
                    newStatus = OPEN_VALUE;
                } else {
                    return;
                }

                await new Promise(resolve => {
                    setMarketStatus(newStatus);
                    resolve();
                });
                await updateMarket(e, newStatus);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedRunnerDetails, marketStatus, runners, prepareMarketData, settings, savedPrices, isLive, directLineEnabled, originalRunner]);

    useEffect(() => {
        fetchMarketData();
        // Store original shortcut values
        setOriginalShortcutValues(settings.shortcutValues);
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    // useEffect(() => {
    //     if (socket && commentaryId) {
    //         console.log("Connecting COMMENTARY_STATUS_CONNECT");
    //         socket.emit(COMMENTARY_STATUS_CONNECT, { commentaryId: +commentaryId });
    //     }
    // }, [socket, commentaryId]);

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
        } else {
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
    }, [socket, commentaryId, directLineEnabled, isLive]);

    // const calculatePricesFromSelectedBack = (selectedBackPrice, settings) => {
    //     const defaultLay = 1 + +settings.rateDifferent
    //     selectedBackPrice = Math.max(0, selectedBackPrice);

    //     if (selectedBackPrice === 0) {
    //         return {
    //             selectedBack: 0,
    //             selectedLay: defaultLay,
    //             nonSelectedBack: 0,
    //             nonSelectedLay: 0
    //         };
    //     }

    //     if (selectedBackPrice < 1.01) {
    //         selectedBackPrice = 1.01;
    //     }

    //     // Calculate selected lay price first
    //     const selectedLay = Math.max(defaultLay, Number((selectedBackPrice + parseFloat(settings.rateDifferent)).toFixed(2)));

    //     // Calculate non-selected prices using the formulas
    //     const nonSelectedBack = Math.max(0, Number((1 / (1 - (1 / selectedLay))).toFixed(2)));
    //     const nonSelectedLay = Math.max(0, Number((1 / (1 - (1 / selectedBackPrice))).toFixed(2)));

    //     return {
    //         selectedBack: selectedBackPrice,
    //         selectedLay,
    //         nonSelectedBack,
    //         nonSelectedLay
    //     };
    // };

    // const updateRunnerWithPrices = (runner, isSelected, prices, settings) => {
    //     const defaultLay = 1 + +settings.rateDifferent
    //     const { selectedBack, selectedLay, nonSelectedBack, nonSelectedLay } = prices;
    //     const backPrice = isSelected ? selectedBack : nonSelectedBack;
    //     const layPrice = isSelected ? selectedLay : nonSelectedLay;

    //     // Special case for zero prices
    //     if (backPrice === 0) {
    //         return {
    //             ...runner,
    //             isSelected,
    //             back: { ...runner.back, price: 0 },
    //             lay: { ...runner.lay, price: defaultLay },
    //             b2: 0,
    //             b1: 0,
    //             l1: 0,
    //             l2: 0
    //         };
    //     }

    //     const bRateDiff = parseFloat(settings.bRateDifferent);
    //     const lRateDiff = parseFloat(settings.lRateDifferent);

    //     return {
    //         ...runner,
    //         isSelected,
    //         back: { ...runner.back, price: Number(backPrice.toFixed(2)) },
    //         lay: { ...runner.lay, price: Number(layPrice.toFixed(2)) },
    //         b2: Number((backPrice - (2 * bRateDiff)).toFixed(2)),
    //         b1: Number((backPrice - bRateDiff).toFixed(2)),
    //         l1: Number((layPrice + lRateDiff).toFixed(2)),
    //         l2: Number((layPrice + (2 * lRateDiff)).toFixed(2))
    //     };
    // };

    const handleInningsDataUpdate = (updatedMarketData) => {
        const sortedMarkets = [...updatedMarketData].sort((a, b) => b.inningsId - a.inningsId);
        const newIdSetting = [...updatedMarketData].sort((a, b) => b.teamId - a.teamId);
        const currentInningsMarket = sortedMarkets[0];

        if (!currentInningsMarket?.runner?.[0]) {
            // console.log("No valid market data found");
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
            // console.log("Tie detected. Setting both runner back prices to tieProbability:", tieValue);
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

        // console.log("Odds by team:", oddsObj);

        // Find the smallest non-zero back price (favorite team)
        const nonZeroOdds = Object.entries(oddsObj)
            .filter(([_, odds]) => odds.back > 0);

        if (!nonZeroOdds.length) {
            // console.log("No valid odds found");
            return;
        }

        const [selectedTeamId, selectedOdds] = nonZeroOdds.reduce(
            (min, curr) => curr[1].back < min[1].back ? curr : min,
            nonZeroOdds[0]
        );

        // console.log("Selected team and odds:", { selectedTeamId, odds: selectedOdds });

        // Update runners with the calculated odds
        const updateRunners = (prevRunners) => {
            return prevRunners.map(runner => {
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
    };


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
        if (!directLineEnabled || isLive || !socketMarketData?.length) return;
        // console.log("Recalculating odds due to margin/favRatio change", { margin: settings.margin, favRatio: settings.favRatio });
        handleInningsDataUpdate(socketMarketData);
    }, [settings?.margin, settings?.favRatio]);

    useEffect(() => {
        if (runners.length > 0 && !selectedRunner) {
            handleRunnerSelection(runners[0].runnerId);
        }
    }, [runners]);

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

    return (
        <Box className="page-content">
            <Container fluid>
                <Box display="flex" flexWrap="wrap" gap={2}>
                    <Box width="100%">
                        <Paper className="manual-card-body" elevation={1} sx={{ p: 3 }}>
                            {/* Header */}
                            <Box display="flex" alignItems="center" gap={2} sx={{ mb: 3 }}>
                                <Box width="66.67%">
                                    {!isEmpty(eventData?.comDetails) && (
                                        <Box sx={{ mb: 3 }}>
                                            <Typography variant="h6" className='manual-card-text'>{`${eventData.comDetails.eventName}/${eventData.market?.marketName} [${eventData.market?.eventMarketId}]`}</Typography>
                                            <Typography variant="body2" className='manual-card-text'>
                                                {`Ref: ${eventData.comDetails.eventRefId} [ ${new Date(eventData.comDetails.eventDate).toLocaleString()} ]`}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                                <Box width="33.33%" sx={{ textAlign: 'right' }}>
                                    <Button
                                        color="primary"
                                        className="me-2"
                                        onClick={handleSave}
                                        disabled={marketStatus === CLOSE_VALUE.toString()}
                                    >
                                        Save
                                    </Button>
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
                                                checked={isLive}
                                                onChange={(e) => setIsLive(!isLive)}
                                                disabled={marketStatus === CLOSE_VALUE.toString()}
                                            />
                                        }
                                        label="Live"
                                    />
                                    <StyledFormControlLabel
                                        control={
                                            <Switch
                                                checked={directLineEnabled}
                                                onChange={(e) => setDirectLineEnabled(e.target.checked)}
                                                disabled={isLive || marketStatus === CLOSE_VALUE.toString()}
                                            />
                                        }
                                        label="Direct Line"
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
                                <Box width="15%">
                                    <StyledTextField
                                        label="Ball Start After"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={settings.ballStartAfter}
                                        onChange={(e) => handleSettingChange('ballStartAfter', e.target.value)}
                                        disabled={marketStatus === CLOSE_VALUE.toString()}
                                    />
                                </Box>
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
                                        label="Rate Different"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={settings.rateDifferent}
                                        inputProps={{ step: "0.01" }}
                                        onChange={(e) => handleSettingChange('rateDifferent', e.target.value)}
                                        disabled={marketStatus === CLOSE_VALUE.toString()}
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
                                <Box width="20%">
                                    <StyledTextField
                                        label="Margin"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={settings.margin}
                                        inputProps={{ step: "1.00" }}
                                        onChange={(e) => handleSettingChange('margin', e.target.value)}
                                        disabled={marketStatus === CLOSE_VALUE.toString()}
                                    />
                                </Box>
                                <Box width="20%">
                                    <StyledTextField
                                        label="Delay"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={settings.delay}
                                        inputProps={{ step: "0.01" }}
                                        onChange={(e) => handleSettingChange('delay', e.target.value)}
                                        disabled={marketStatus === CLOSE_VALUE.toString()}
                                    />
                                </Box>
                                <Box width="20%">
                                    <StyledTextField
                                        label="Line Ratio"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={settings.lineRatio}
                                        inputProps={{ step: "0.01" }}
                                        onChange={(e) => handleSettingChange('lineRatio', e.target.value)}
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
                                        label="Fav Ratio"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={settings.favRatio}
                                        inputProps={{ step: "1.00" }}
                                        onChange={(e) => handleSettingChange('favRatio', e.target.value)}
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
                                                    sx={{ '& .MuiInputBase-input': { py: 0.5 } }}
                                                />
                                            </KeyBox>
                                        </Box>
                                    ))}
                                </Box>
                                <Box width="8%">
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
                                </Box>
                            </Box>

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
                </Box>
            </Container>
        </Box>
    );
};