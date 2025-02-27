import React, { useState, useEffect } from 'react';
import axiosInstance from "../../Features/axios";
import { Button, Card, CardBody, Table, Input, Container, Row, Col, Accordion, AccordionItem, AccordionHeader, AccordionBody } from 'reactstrap';
import SpinnerModel from "../../components/Model/SpinnerModel";
import Breadcrumbs from '../../components/Common/Breadcrumb';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updateToastData } from '../../Features/toasterSlice';
import { ERROR, SUCCESS } from '../../components/Common/Const';
import { isEmpty } from 'lodash';
import "../../components/Common/Reusables/CustomCss.css";
import { convertDateUTCToLocal } from '../../components/Common/Reusables/reusableMethods';
import EventMarketModal from './CommentaryModels/CustomEventModal';
import { FaArrowUp } from "react-icons/fa"
import CustomInput from '../../components/Common/Reusables/CustomInput';

const MARKET_STATUS = {
    0: "NotOpen",
    1: "Open",
    2: "Inactive",
    3: "Suspend",
};

const getOrdinalSuffix = (n) => {
    const suffixes = ["st", "nd", "rd"];
    const remainder = n % 10;
    if (remainder >= 4 || (n >= 11 && n <= 13)) {
        return `${n}th`;
    }
    return `${n}${suffixes[remainder - 1] || "th"}`;
};

export const CreateEventMarket = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    // document.title = "Create Market";
    const [marketData, setMarketData] = useState({
        teamAndPlayers: [],
        marketTemplate: [],
        commentary: {},
        eventMarket: [],
        categories: [],
        marketTypes: []
    });

    let navigate = useNavigate();
    const dispatch = useDispatch();
    const marketTypeObj = useSelector((state) => state.marketType?.marketTypeList);
    const commentaryId = +sessionStorage.getItem('marketTemplateCommentaryId') || "0";
    const commentaryDetails = JSON.parse(sessionStorage.getItem('marketTemplateCommentaryDetails') || "{}");
    const [processedMarkets, setProcessedMarkets] = useState({});
    const [selectedMarkets, setSelectedMarkets] = useState({});
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [openMarket, setOpenMarket] = useState('');
    const [openCategory, setOpenCategory] = useState('');

    useEffect(() => {
        if (!isEmpty(commentaryDetails))
            document.title = `Create Market - ${commentaryDetails?.eventName} [${commentaryDetails?.eventRefId}]`;
    }, [commentaryDetails])

    useEffect(() => {
        fetchData(commentaryId);
    }, []);

    const fetchData = async (commentaryId) => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.post("/admin/eventMarket/getDetailsByCIdV1", { commentaryId });
            if (response?.result) {
                const { teamAndPlayers, marketTemplate, commentary, eventMarket, categories, marketTypes, matchType } = response.result;
                setMarketData({ teamAndPlayers, marketTemplate, commentary, eventMarket, categories, marketTypes });
                const processedMarkets = processMarketData(marketTemplate, eventMarket, teamAndPlayers, commentary, matchType);
                setProcessedMarkets(processedMarkets);
                initializeSelectedMarkets(processedMarkets);
            }
        } catch (error) {
            console.error("Error fetching market data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleScroll = (e) => {
        const scrollTop = e?.target?.scrollTop;
        setShowBackToTop(scrollTop > 500); // Show button after scrolling 500px
    };

    const scrollToTop = () => {
        const contentSection = document.querySelector('.content-section');
        if (contentSection) {
          contentSection.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        }
    };

    const sortbasedOnthePlayerTypeAndPlayerName = (team) => {
        const typeOrder = ["BatsMan", "Wicketkeeper", "AllRounder", "Bowler"];
        team.sort((a, b) => {
            // Compare playerType based on typeOrder
            const typeComparison = typeOrder.indexOf(a.playerType) - typeOrder.indexOf(b.playerType);
            if (typeComparison !== 0) return typeComparison;

            // If playerType is the same, compare playerName alphabetically
            return a.playerName.localeCompare(b.playerName);
        });
    }

    // const handleSelectAllInSection = (sectionKey) => {
    //     setSelectedMarkets(prev => {
    //         const sectionSelections = prev[sectionKey] || [];
    //         const allSelected = sectionSelections.length > 0 && sectionSelections.every(Boolean);
    //         const newSelections = processedMarkets[sectionKey]?.map(() => !allSelected) || [];
    //         return {
    //             ...prev,
    //             [sectionKey]: newSelections
    //         };
    //     });
    // };

    const handleSelectAllInSection = (sectionKey) => {
        const markets = processedMarkets[sectionKey] || [];
        const errors = markets.map(validateMarketRow).flat().filter(Boolean);
        if (errors.length > 0) {
            dispatch(updateToastData({
                data: `Please fill in all required fields`,
                title: "Market Error",
                type: ERROR
            }));
            return;
        }

        setSelectedMarkets(prev => {
            const sectionSelections = prev[sectionKey] || [];
            const allSelected = sectionSelections.length > 0 && sectionSelections.every(Boolean);
            const newSelections = markets?.map(() => !allSelected);
            return {
                ...prev,
                [sectionKey]: newSelections
            };
        });
    };

    // const handleSelectMarket = (record) => {
    //     const newCheckedList = checkedList.includes(record.eventMarketId)
    //         ? checkedList.filter(id => id !== record.eventMarketId)
    //         : [...checkedList, record.eventMarketId];

    //     setCheckedList(newCheckedList);
    //     handleValueChange(record, "isCreate", !checkedList.includes(record.eventMarketId));
    // };
    const generateOverUnderLineMarketFancy = (dataObj) => {
        let dataToSend = {
            ...dataObj,
            backPrice: null,
            layPrice: null,
            // backSize: 100,
            // laySize: 100,
            overRate: null,
            underRate: null,
        }
        if (!isEmpty(dataObj)) {
            const roundedLine = Math.round(parseFloat(dataObj?.line));
            const thresholdValue = Math.floor(parseFloat(dataObj?.line)) + 0.5;
            const marginAdjustment = dataObj?.margin ? ((dataObj.margin / 100) + 1) : 1;
            dataToSend = {
                ...dataToSend,
                backPrice: parseFloat((roundedLine + parseFloat(dataObj?.rateDiff || 0)).toFixed(2)),
                layPrice: parseFloat(roundedLine.toFixed(2)),
                // backSize: parseFloat(dataObj?.backSize) || 100,
                // laySize: parseFloat(dataObj?.laySize) || 100,
                overRate: dataObj?.margin ? parseFloat(((1 / (marginAdjustment / (1 + Math.exp(-(dataObj?.line - thresholdValue))))).toFixed(2))) : null,
                underRate: dataObj?.margin ? parseFloat(((1 / (marginAdjustment / (1 + Math.exp(+(dataObj?.line - thresholdValue))))).toFixed(2))) : null,
            }
        }
        return dataToSend;
    };

    const generateOverUnder = (dataObj) => {
        let dataToSend = {
            ...dataObj,
            backPrice: null,
            layPrice: null,
            // backSize: 100,
            // laySize: 100,
            overRate: null,
            underRate: null,
        }
        if (!isEmpty(dataObj)) {
            const roundedLine = Math.round(parseFloat(dataObj?.line));
            const thresholdValue = Math.floor(parseFloat(dataObj?.line)) + 0.5;
            const marginAdjustment = dataObj?.margin ? ((dataObj.margin / 100) + 1) : 1;
            dataToSend = {
                ...dataToSend,
                backPrice: parseFloat((roundedLine + 1).toFixed(2)),
                layPrice: parseFloat(roundedLine.toFixed(2)),
                // backSize: parseFloat(dataObj?.backSize) || 100,
                // laySize: parseFloat(dataObj?.laySize) || 100,
                overRate: dataObj?.margin ? parseFloat(((1 / (marginAdjustment / (1 + Math.exp(-(dataObj?.line - thresholdValue))))).toFixed(2))) : null,
                underRate: dataObj?.margin ? parseFloat(((1 / (marginAdjustment / (1 + Math.exp(+(dataObj?.line - thresholdValue))))).toFixed(2))) : null,
            }
        }
        return dataToSend;
    };

    const generateSameLayBack = (dataObj) => {
        let dataToSend = {
            ...dataObj,
            backPrice: null,
            layPrice: null,
            // backSize: 100,
            // laySize: 100,
            overRate: null,
            underRate: null,
        }
        if (!isEmpty(dataObj) && dataObj.line && dataObj.margin) {
            const roundedLine = Math.round(parseFloat(dataObj?.line));
            const thresholdValue = Math.floor(parseFloat(dataObj?.line)) + 0.5;
            const marginAdjustment = dataObj?.margin ? ((dataObj.margin / 100) + 1) : 1;
            dataToSend = {
                ...dataToSend,
                backPrice: parseFloat(roundedLine.toFixed(2)) || 0,
                layPrice: parseFloat(roundedLine.toFixed(2)) || 0,
                // backSize: parseFloat(dataObj?.backSize) || 100,
                // laySize: parseFloat(dataObj?.laySize) || 100,
                overRate: dataObj?.margin ? parseFloat(((1 / (marginAdjustment / (1 + Math.exp(-(dataObj?.line - thresholdValue))))).toFixed(2))) || 0 : 0,
                underRate: dataObj?.margin ? parseFloat(((1 / (marginAdjustment / (1 + Math.exp(+(dataObj?.line - thresholdValue))))).toFixed(2))) || 0 : 0,
            }
        }
        return dataToSend;
    };

    const processMarketData = (templates, existingMarkets, teams, commentary, matchType) => {
        const processedMarketsObj = {};

        // Helper function to get the key for a market
        const getMarketKey = (market) => {
            const prefix = market.teamId || 'oneTimeMarket';
            return `${prefix}_##_${market.marketTypeId}_##_${market.marketTypeCategoryId}`;
        };

        // Helper function to merge runners
        const mergeRunners = (templateRunners, apiRunners, marketName, marketPredefinedValue) => {
            if (apiRunners.length > 0) {
                return apiRunners.map(apiRunner => ({
                    ...apiRunner,
                    runner: apiRunner.runner || marketName,
                    runnerId: apiRunner.runnerId || apiRunner.selectionId || apiRunner.runner || marketName,
                    predefinedValue: marketPredefinedValue, // Copy market level predefinedValue to runner
                    line: apiRunner.line,
                    overRate: apiRunner.overRate,
                    underRate: apiRunner.underRate,
                    backPrice: apiRunner.backPrice,
                    layPrice: apiRunner.layPrice,
                    backSize: apiRunner.backSize,
                    laySize: apiRunner.laySize,
                    order: apiRunner.order,
                    selectionId: apiRunner.selectionId
                }));
            }
            return templateRunners;
        };

        // Process templates first to ensure all markets are generated
        templates.forEach(template => {
            if (template.isPerEvent) {
                processMarketAndRunners(generateMarketFromTemplate(template, teams, commentary), null, 'oneTimeMarket', processedMarketsObj);
            } else if (template.marketTypeCategoryId === 11 && template.isOver) {
                processOnlyOverMarkets(generateMarketFromTemplate(template, teams, commentary), teams, matchType.maxOversInFirstInings, processedMarketsObj);
            } else if (template.marketTypeCategoryId === 13) {
                processWicketMarkets(generateMarketFromTemplate(template, teams, commentary), teams, matchType.noOfPlayer, processedMarketsObj);
            } else if (template.marketTypeCategoryId === 12) {
                processPlayerRunsMarkets(generateMarketFromTemplate(template, teams, commentary), teams, processedMarketsObj);
            } else if (template.marketTypeCategoryId === 29) {
                processPlayerBoundaryMarkets(generateMarketFromTemplate(template, teams, commentary), teams, processedMarketsObj);
            } else if (template.marketTypeCategoryId === 26) {
                processFancyLDOMarkets(generateMarketFromTemplate(template, teams, commentary), teams, matchType.maxOversInFirstInings, processedMarketsObj);
            } else if (template.marketTypeCategoryId === 30) {
                processPlayerBallMarkets(generateMarketFromTemplate(template, teams, commentary), teams, processedMarketsObj);
            } else if (template.marketTypeCategoryId === 23 || template.marketTypeCategoryId === 26 || template.marketTypeCategoryId === 27) {
                processMarkets(generateMarketFromTemplate(template, teams, commentary), teams, processedMarketsObj);
            } else if (template.marketTypeCategoryId === 28 || template.marketTypeCategoryId === 35) {
                processLotteryMarkets(generateMarketFromTemplate(template, teams, commentary), teams, processedMarketsObj, matchType);
            } else if (template.marketTypeCategoryId === 31) {
                processFallOfWicketMarkets(generateMarketFromTemplate(template, teams, commentary), teams, processedMarketsObj);
            } else if (template.marketTypeCategoryId === 32) {
                processPartnershipBoundariesMarkets(generateMarketFromTemplate(template, teams, commentary), teams, processedMarketsObj);
            } else if (template.marketTypeCategoryId === 33) {
                processWicketLostBallsMarkets(generateMarketFromTemplate(template, teams, commentary), teams, processedMarketsObj);
            } else {
                teams.forEach(team => {
                    processMarketAndRunners(generateExtraMarketFromTemplate(template, team, commentary), team.teamId, team.teamId.toString(), processedMarketsObj);
                });
            }
        });

        // Now update with existing markets from API
        existingMarkets.forEach(apiMarket => {
            const key = getMarketKey(apiMarket);
            if (!processedMarketsObj[key]) {
                processedMarketsObj[key] = [];
            }

            const existingMarketIndex = processedMarketsObj[key].findIndex(m =>
                m.teamId === apiMarket.teamId &&
                m.marketTypeId === apiMarket.marketTypeId &&
                m.marketTypeCategoryId === apiMarket.marketTypeCategoryId &&
                m.marketName === apiMarket.marketName
            );

            if (existingMarketIndex !== -1) {
                // Update the existing market with API data
                const templateMarket = processedMarketsObj[key][existingMarketIndex];
                const updatedMarket = {
                    ...templateMarket,
                    ...apiMarket,
                    isCreate: false,
                    runners: mergeRunners(
                        templateMarket.runners,
                        apiMarket.runners,
                        apiMarket.marketName,
                        apiMarket.predefinedValue // Pass market level predefinedValue
                    )
                };
                processedMarketsObj[key][existingMarketIndex] = updatedMarket;
            } else {
                // If the API market doesn't exist in our generated markets, add it
                processedMarketsObj[key].push({
                    ...apiMarket,
                    isCreate: false,
                    runners: mergeRunners(
                        [],
                        apiMarket.runners,
                        apiMarket.marketName,
                        apiMarket.predefinedValue // Pass market level predefinedValue
                    )
                });
            }
        });

        // Sort the markets within each key to maintain order
        Object.keys(processedMarketsObj).forEach(key => {
            processedMarketsObj[key].sort((a, b) => {
                // First, sort by over if it exists
                if (a.over && b.over) {
                    return a.over - b.over;
                }
                // If over doesn't exist, maintain the original order
                return 0;
            });
        });

        return processedMarketsObj;
    };

    const updateSubsequentWicketLines = (markets, startIndex, previousWicketLine) => {
        return markets.map((market, index) => {
            if (index > startIndex) {
                // Get the predefined value for current wicket
                const currentPredefinedValue = market?.runners[0]?.predefinedValue || null;
                // New line is previous wicket's line plus current wicket's predefined value
                const newLine = previousWicketLine ? (+previousWicketLine + currentPredefinedValue) : null;

                const updatedMarket = {
                    ...market,
                    runners: market?.runners?.map(runner => {
                        if (runner?.line || runner?.predefinedValue) {
                            return {
                                ...runner,
                                line: newLine,
                                ...generateRunnerValues(
                                    market,
                                    { ...runner, line: newLine },
                                    market.margin,
                                    market.rateDiff
                                )
                            };
                        }
                        return runner;
                    })
                };
                previousWicketLine = newLine; // Update for next iteration
                return updatedMarket;
            }
            return market;
        });
    };

    const initializeSelectedMarkets = (markets) => {
        const initialSelection = {};
        Object.keys(markets).forEach(key => {
            initialSelection[key] = Array(markets[key].length).fill(false);
        });
        setSelectedMarkets(initialSelection);
    };

    // Modified validateMarketRow function to include predefinedValue
    const validateMarketRow = (market) => {
        const requiredFields = ['marketName', 'margin', 'status'];
        const requiredRunnerFields = ['runner', 'predefinedValue', 'line', 'underRate', 'overRate', 'layPrice', 'backPrice', 'laySize', 'backSize'];

        const errors = [];

        requiredFields.forEach(field => {
            if (!market[field]) {
                errors.push(`${field}`);
            }
        });

        if (market.runners && market.runners.length > 0) {
            market.runners.forEach((runner, index) => {
                requiredRunnerFields.forEach(field => {
                    if (runner[field] === undefined || runner[field] === null || runner[field] === '') {
                        errors.push(`${index + 1} ${field}`);
                    }
                });
            });
        } else {
            errors.push('Runner');
        }

        return errors;
    };

    // Modified handleSelectMarket function to handle category 31 markets
    const handleSelectMarket = (sectionKey, index) => {
        const markets = processedMarkets[sectionKey];
        const market = markets[index];
        const errors = validateMarketRow(market);
        // Special handling for Fall of Wicket markets (category 31)
        if (market.marketTypeCategoryId === 31) {
            // If trying to unselect a market, prevent it
            // if (selectedMarkets[sectionKey]?.[index]) {
            //     return; // Prevent unselection by returning early
            // }

            // Check if all previous markets are filled and selected
            for (let i = 0; i < index; i++) {
                const prevMarket = markets[i];
                const prevErrors = validateMarketRow(prevMarket);
                if (prevErrors.length > 0 || !selectedMarkets[sectionKey]?.[i]) {
                    dispatch(updateToastData({
                        data: `Please fill in all fields and select Fall of ${i + 1} Wicket first`,
                        title: "Market Error",
                        type: ERROR
                    }));
                    return;
                }
            }

            // Check if current market has any errors
            if (errors.length > 0) {
                dispatch(updateToastData({
                    data: `Please fill in all required fields: ${errors.join(', ')}`,
                    title: "Market Error",
                    type: ERROR
                }));
                return;
            }

            // If all validations pass, select the current market
            setSelectedMarkets(prev => {
                const updatedSelections = { ...prev };

                const sectionSelections = [...(updatedSelections[sectionKey] || Array(markets.length).fill(false))];

                // If deselecting the current index, deselect all subsequent indexes
                if (sectionSelections[index]) {
                    sectionSelections[index] = false; // Deselect the clicked index
                    // Deselect all subsequent indexes
                    for (let i = index + 1; i < sectionSelections.length; i++) {
                        sectionSelections[i] = false;
                    }
                } else {
                    sectionSelections[index] = true; // Select the clicked index
                }

                updatedSelections[sectionKey] = sectionSelections;
                return updatedSelections;
            });
        } else {
            // Regular handling for non-category-31 markets
            if (errors.length > 0) {
                dispatch(updateToastData({
                    data: `Please fill in all required fields: ${errors.join(', ')}`,
                    title: "Market Error",
                    type: ERROR
                }));
                return;
            }

            setSelectedMarkets(prev => {
                const sectionSelections = prev[sectionKey] || [];
                const updatedSelections = [...sectionSelections];

                // If deselecting the current index, deselect all subsequent indexes
                if (updatedSelections[index]) {
                    for (let i = index; i < updatedSelections.length; i++) {
                        updatedSelections[i] = false;
                    }
                } else {
                    updatedSelections[index] = true; // Select the clicked index
                }

                return {
                    ...prev,
                    [sectionKey]: updatedSelections
                };
            });
        }
    };

    // Add this new function to handle auto-unselection of subsequent markets
    const handleAutoUnselectSubsequentMarkets = (sectionKey, startIndex) => {
        setSelectedMarkets(prev => {
            const updatedSelections = { ...prev };
            const sectionSelections = [...(updatedSelections[sectionKey] || [])];

            // Unselect all markets after the given index
            for (let i = startIndex; i < sectionSelections.length; i++) {
                sectionSelections[i] = false;
            }

            updatedSelections[sectionKey] = sectionSelections;
            return updatedSelections;
        });
    };

    const processMarketAndRunners = (market, teamId, keyPrefix, processedMarketsObj) => {
        const baseKey = `${keyPrefix}_##_${market.marketTypeId}_##_${market.marketTypeCategoryId}`;

        if (!processedMarketsObj[baseKey]) {
            processedMarketsObj[baseKey] = [];
        }

        // Special handling for marketTypeId=5 and marketTypeCategoryId=6
        let marketRunners = [];
        if (market.marketTypeId === 5 && market.marketTypeCategoryId === 6) {
            // Get team names from commentary object instead of marketData
            const team1Name = commentaryDetails?.team1Name || 'Team1';
            const team2Name = commentaryDetails?.team2Name || 'Team2';

            // For each template runner, create two runners (one for each team)
            if (market.runners && market.runners.length > 0) {
                market.runners.forEach(templateRunner => {
                    // Create runner for team 1
                    const team1Runner = {
                        ...templateRunner,
                        marketTemplateRunnerId: templateRunner.marketTemplateRunnerId,
                        runnerId: templateRunner.runnerId || "0",
                        marketTemplateId: market.marketTemplateId,
                        runner: templateRunner.runner.replace("{team}", team1Name),
                        line: templateRunner.line,
                        overRate: templateRunner.overRate,
                        underRate: templateRunner.underRate,
                        lastUpdate: new Date().toISOString(),
                        selectionId: `${templateRunner.selectionId}_1`,
                        order: templateRunner.order * 2 - 1,
                        backPrice: templateRunner.backPrice,
                        layPrice: templateRunner.layPrice,
                        backSize: templateRunner.backSize || market.defaultBackSize,
                        laySize: templateRunner.laySize || market.defaultLaySize,
                    };

                    // Create runner for team 2
                    const team2Runner = {
                        ...templateRunner,
                        marketTemplateRunnerId: templateRunner.marketTemplateRunnerId,
                        runnerId: templateRunner.runnerId || "0",
                        marketTemplateId: market.marketTemplateId,
                        runner: templateRunner.runner.replace("{team}", team2Name),
                        line: templateRunner.line,
                        overRate: templateRunner.overRate,
                        underRate: templateRunner.underRate,
                        lastUpdate: new Date().toISOString(),
                        selectionId: `${templateRunner.selectionId}_2`,
                        order: templateRunner.order * 2,
                        backPrice: templateRunner.backPrice,
                        layPrice: templateRunner.layPrice,
                        backSize: templateRunner.backSize || market.defaultBackSize,
                        laySize: templateRunner.laySize || market.defaultLaySize,
                    };

                    marketRunners.push(team1Runner, team2Runner);
                });
            }
        }
        else if (market.marketTypeCategoryId === 28) {
            marketRunners = market.runners?.map(runner => ({
                marketTemplateRunnerId: runner.marketTemplateRunnerId,
                marketTemplateId: runner.marketTemplateId,
                runner: runner.runner,
                line: runner.line,
                overRate: runner.overRate,
                underRate: runner.underRate,
                lastUpdate: new Date().toISOString(),
                selectionId: runner.selectionId,
                order: runner.order,
                backPrice: runner.backPrice,
                layPrice: runner.layPrice,
                backSize: runner.backSize,
                laySize: runner.laySize,
                predefinedValue: runner.predefinedValue,
                runnerId: runner.runnerId || "0"
            })) || [];
        }
        else if (market.marketTypeCategoryId === 26) {
            // Handle LDO and Lottery markets
            marketRunners = market.runners?.map(runner => ({
                ...runner,  // Spread the original runner properties
                runnerId: runner.runnerId || "0",
                // Make sure each property is explicitly copied
                marketTemplateRunnerId: runner.marketTemplateRunnerId,
                marketTemplateId: market.marketTemplateId,
                runner: runner.runner,
                line: runner.line,
                overRate: runner.overRate,
                underRate: runner.underRate,
                lastUpdate: new Date().toISOString(),
                selectionId: runner.selectionId,
                order: runner.order,
                backPrice: runner.backPrice,
                layPrice: runner.layPrice,
                backSize: market?.isPredefineRunnerValue ? runner?.backSize : market?.defaultBackSize,
                laySize: market?.isPredefineRunnerValue ? runner?.laySize : market?.defaultLaySize,
                predefinedValue: runner.predefinedValue
            })) || [];
        } else {
            // Default runner handling for other market types
            if (!market.runners || market.runners.length === 0) {
                marketRunners = [{
                    marketTemplateRunnerId: 0,
                    runnerId: "0",
                    marketTemplateId: market.marketTemplateId,
                    runner: market?.marketName,
                    line: market.defaultLine || null,
                    overRate: null,
                    underRate: null,
                    lastUpdate: new Date().toISOString(),
                    selectionId: `${market.marketTemplateId}01`,
                    order: 1,
                    backPrice: null,
                    layPrice: null,
                    backSize: market?.defaultBackSize,
                    laySize: market?.defaultLaySize,
                }];
            } else {
                marketRunners = market.runners;
            }
        }

        processedMarketsObj[baseKey].push({
            ...market,
            teamId,
            eventMarketId: market.eventMarketId || 0,
            isCreate: market.isCreate !== undefined ? market.isCreate : true,
            status: market.status || "1",
            margin: parseFloat(market.margin) || 3,
            data: market.data || "",
            playerId: market.playerId || null,
            isActive: market.isActive !== undefined ? market.isActive : true,
            isAllow: market.isAllow !== undefined ? market.isAllow : false,
            inningsId: market.inningsId || 1,
            index: market.index || 0,
            commentaryId: market.commentaryId,
            eventRefId: market.eventRefId,
            isPredefineRunnerValue: market.isPredefineRunnerValue !== undefined ? market.isPredefineRunnerValue : true,
            runners: marketRunners
        });
    };

    const processOnlyOverMarkets = (market, teams, maxOvers, processedMarketsObj) => {
        // const startOver = parseInt(market.over);
        const startOver = 2;
        teams.forEach(team => {
            for (let currentOver = startOver; currentOver <= maxOvers; currentOver++) {
                const specialMarketName = `ONLY ${currentOver} OVER - ${team.shortName}`;
                const specialMarket = {
                    ...market,
                    over: currentOver.toString(),
                    marketName: specialMarketName,
                    teamId: team.teamId
                };
                processMarketAndRunners(specialMarket, team.teamId, team.teamId.toString(), processedMarketsObj);
            }
        });
    };
    const processWicketMarkets = (market, teams, noOfPlayers, processedMarketsObj) => {
        teams.forEach(team => {
            for (let wicket = 1; wicket < noOfPlayers; wicket++) {
                // const specialMarketName = `${wicket} Wicket - ${team.shortName}`;
                const specialMarketName = `${market?.marketName.replace("{fow}", wicket)} - ${team.shortName}`;
                const specialMarket = {
                    ...market,
                    marketName: specialMarketName,
                    teamId: team.teamId
                };
                processMarketAndRunners(specialMarket, team.teamId, team.teamId.toString(), processedMarketsObj);
            }
        });
    };

    const processPlayerRunsMarkets = (market, teams, processedMarketsObj) => {
        teams.forEach(team => {
            sortbasedOnthePlayerTypeAndPlayerName(team.players);
            // team.players.sort((a, b) => a?.playerName.localeCompare(b?.playerName));
            team.players.forEach(player => {
                const specialMarketName = `${player.playerName} Runs`;
                const specialMarket = {
                    ...market,
                    playerId: player.commentaryPlayerId,
                    marketName: specialMarketName,
                    teamId: team.teamId,
                    over: 0,
                    defaultLine: parseFloat(player.batsmanAverage)
                }
                processMarketAndRunners(specialMarket, team.teamId, team.teamId.toString(), processedMarketsObj);
            });
        });
    };

    const processPlayerBoundaryMarkets = (market, teams, processedMarketsObj) => {
        teams.forEach(team => {
            // team.players.sort((a, b) => a?.playerName.localeCompare(b?.playerName));
            sortbasedOnthePlayerTypeAndPlayerName(team.players);
            team.players.forEach(player => {
                const specialMarketName = `${player.playerName} Boundaries`;
                const specialMarket = {
                    ...market,
                    playerId: player.commentaryPlayerId,
                    marketName: specialMarketName,
                    teamId: team.teamId,
                    over: 0,
                    defaultLine: parseFloat(player.boundary) || 0
                };
                processMarketAndRunners(specialMarket, team.teamId, team.teamId.toString(), processedMarketsObj);
            });
        });
    };

    const processPartnershipBoundariesMarkets = (market, teams, processedMarketsObj) => {
        const maxWickets = market?.afterWicketAutoSuspend - 2;  // Subtract 2 to not include the suspend wicket

        teams.forEach(team => {
            for (let wicket = 1; wicket <= maxWickets; wicket++) {
                const wicketOrdinal = getOrdinalSuffix(wicket);
                const marketName = market.templateName.replace("{wicket}", wicketOrdinal);
                const specialMarket = {
                    ...market,
                    marketName: `${marketName} - ${team.shortName}`,
                    wicketNo: wicket,
                    teamId: team.teamId
                };
                processMarketAndRunners(specialMarket, team.teamId, team.teamId.toString(), processedMarketsObj);
            }
        });
    };

    const processWicketLostBallsMarkets = (market, teams, processedMarketsObj) => {
        const maxWickets = market?.afterWicketAutoSuspend - 2;  // Subtract 2 to not include the suspend wicket

        teams.forEach(team => {
            for (let wicket = 1; wicket <= maxWickets; wicket++) {
                const wicketOrdinal = getOrdinalSuffix(wicket);
                const marketName = market.templateName.replace("{wicket}", wicketOrdinal);
                const specialMarket = {
                    ...market,
                    marketName: `${marketName} - ${team.shortName}`,
                    wicketNo: wicket,
                    teamId: team.teamId
                };
                processMarketAndRunners(specialMarket, team.teamId, team.teamId.toString(), processedMarketsObj);
            }
        });
    };

    const processPlayerBallMarkets = (market, teams, processedMarketsObj) => {
        teams.forEach(team => {
            // team.players.sort((a, b) => a?.playerName.localeCompare(b?.playerName));
            sortbasedOnthePlayerTypeAndPlayerName(team.players);
            team.players.forEach(player => {
                const specialMarketName = market.marketName.replace("{player}", player.playerName);
                const specialMarket = {
                    ...market,
                    playerId: player.commentaryPlayerId,
                    marketName: specialMarketName,
                    teamId: team.teamId,
                    over: 0,
                    defaultLine: parseFloat(player.playerBallFaced)
                };
                processMarketAndRunners(specialMarket, team.teamId, team.teamId.toString(), processedMarketsObj);
            });
        });
    };

    const processFallOfWicketMarkets = (market, teams, processedMarketsObj) => {
        const maxWickets = market.afterWicketAutoSuspend - 1;  // Subtract 1 to not include the suspend wicket

        teams.forEach(team => {
            for (let wicket = 1; wicket <= maxWickets; wicket++) {
                const wicketOrdinal = getOrdinalSuffix(wicket);
                const marketName = market.templateName.replace("{wicket}", wicketOrdinal);
                const specialMarket = {
                    ...market,
                    marketName: `${marketName} - ${team.shortName}`,
                    wicketNo: wicket,
                    teamId: team.teamId
                };
                processMarketAndRunners(specialMarket, team.teamId, team.teamId.toString(), processedMarketsObj);
            }
        });
    };

    const processMarkets = (market, teams, processedMarketsObj) => {
        teams.forEach(team => {
            const specialMarketName = `${market.marketName} - ${team.shortName}`;
            const specialMarket = {
                ...market,
                marketName: specialMarketName,
                teamId: team.teamId
            };
            processMarketAndRunners(specialMarket, team.teamId, team.teamId.toString(), processedMarketsObj);
        });
    };

    const ballsToOvers = (value, matchTypeId) => {
        const LD_OVER_BALLS = {
            "2": 6 // For 20 Over Event. Add more match types as needed
        };
        const ballsPerOver = LD_OVER_BALLS[`${matchTypeId}`];

        if (parseInt(value) === 0) {
            return 0.0;
        } else {
            const over = ((value - ballsPerOver) / ballsPerOver) + ballsPerOver / 10;
            return parseFloat(over.toFixed(2));
        }
    };

    const processFancyLDOMarkets = (market, teams, maxOvers, processedMarketsObj) => {
        const startOver = parseInt(market.over) || 2;
        const diff = startOver;
        const autoclose = parseFloat(market.beforeAutoClose) || 6;
        const autosuspend = parseFloat(market.beforeAutoSuspend) || 6;
        const autocreate = parseFloat(market.create) || 6;
        const autoopen = parseFloat(market.autoOpen) || 6;
        const howManyOpenMarkets = parseInt(market.howManyOpenMarkets) || 1;
        const notincludedover = market.notIncludedOver ?
            market.notIncludedOver.split(',').map(x => parseInt(x)) : [];
        const matchTypeId = market.matchTypeID || 2;

        teams.forEach(team => {
            const templateName = market.templateName + " - " + team.shortName;
            let nextopen = 0.0;
            let nextcreate = 0.0;
            let noOfMarketsCreated = 0;
            let nextaddmarket = 0;

            for (let currentOver = startOver; currentOver <= maxOvers; currentOver++) {
                if (!notincludedover.includes(currentOver)) {
                    const updatedBeforeAutoClose = ballsToOvers((currentOver * 6 - autoclose), matchTypeId);
                    const updatedBeforeAutoSuspend = ballsToOvers((currentOver * 6 - autosuspend), matchTypeId);

                    let updatedCreate, updatedAutoOpen;

                    if (howManyOpenMarkets === 1) {
                        updatedCreate = ballsToOvers(((currentOver - diff) * 6 + autocreate - 6), matchTypeId);
                        updatedAutoOpen = ballsToOvers(((currentOver - diff) * 6 + autoopen - 6), matchTypeId);
                    } else {
                        updatedCreate = nextcreate;
                        updatedAutoOpen = nextopen;
                        noOfMarketsCreated++;

                        if (noOfMarketsCreated === howManyOpenMarkets) {
                            noOfMarketsCreated--;
                            nextcreate = Math.floor(nextaddmarket) + (autocreate / 10);
                            nextopen = Math.floor(nextaddmarket) + (autoopen / 10);
                            nextaddmarket++;
                        }
                    }

                    const marketName = templateName.replace("{x}", currentOver);
                    const specialMarket = {
                        ...market,
                        over: currentOver.toString(),
                        marketName: marketName,
                        teamId: team.teamId,
                        beforeAutoClose: updatedBeforeAutoClose.toString(),
                        beforeAutoSuspend: updatedBeforeAutoSuspend.toString(),
                        create: updatedCreate.toString(),
                        autoOpen: updatedAutoOpen.toString()
                    };

                    processMarketAndRunners(specialMarket, team.teamId, team.teamId.toString(), processedMarketsObj);
                }
            }
        });
    };

    const processLotteryMarkets = (market, teams, processedMarketsObj, matchType) => {
        const ballsToOvers = (value, matchTypeId) => {
            const LD_OVER_BALLS = { "2": 6 };
            const ballsPerOver = LD_OVER_BALLS[`${matchTypeId}`];
            if (parseInt(value) === 0) return 0.0;
            const over = ((value - ballsPerOver) / ballsPerOver) + ballsPerOver / 10;
            return parseFloat(over.toFixed(2));
        };

        const maxOvers = market.maxOvers || matchType?.maxOversInFirstInings || 5;
        const startOver = parseInt(market.over) || 2;
        const diff = startOver;
        const autoclose = parseFloat(market.beforeAutoClose) || 6;
        const autosuspend = parseFloat(market.beforeAutoSuspend) || 6;
        const autocreate = parseFloat(market.create) || 6;
        const autoopen = parseFloat(market.autoOpen) || 6;
        const howManyOpenMarkets = parseInt(market.howManyOpenMarkets) || 1;
        const notincludedover = market.notIncludedOver ?
            market.notIncludedOver.split(',').map(x => parseInt(x)) : [];
        const matchTypeId = market.matchTypeID || 2;

        teams.forEach(team => {
            let nextopen = 0.0;
            let nextcreate = 0.0;
            let noOfMarketsCreated = 0;
            let nextaddmarket = 0;

            for (let currentOver = startOver; currentOver <= maxOvers; currentOver++) {
                if (notincludedover.includes(currentOver)) continue;

                // Calculate updated values based on current over
                const updatedValues = {
                    beforeAutoClose: ballsToOvers((currentOver * 6 - autoclose), matchTypeId),
                    beforeAutoSuspend: ballsToOvers((currentOver * 6 - autosuspend), matchTypeId)
                };

                // Determine create and autoOpen values based on howManyOpenMarkets
                if (howManyOpenMarkets === 1) {
                    updatedValues.create = ballsToOvers(((currentOver - diff) * 6 + autocreate - 6), matchTypeId);
                    updatedValues.autoOpen = ballsToOvers(((currentOver - diff) * 6 + autoopen - 6), matchTypeId);
                } else {
                    updatedValues.create = nextcreate;
                    updatedValues.autoOpen = nextopen;
                    noOfMarketsCreated++;

                    if (noOfMarketsCreated === howManyOpenMarkets) {
                        noOfMarketsCreated--;
                        nextcreate = Math.floor(nextaddmarket) + (autocreate / 10);
                        nextopen = Math.floor(nextaddmarket) + (autoopen / 10);
                        nextaddmarket++;
                    }
                }

                // Create market for current over
                const marketName = market.templateName.replace("{x}", currentOver) + " - " + team.shortName;
                const specialMarket = {
                    ...market,
                    over: currentOver.toString(),
                    marketName,
                    teamId: team.teamId,
                    beforeAutoClose: updatedValues.beforeAutoClose.toString(),
                    beforeAutoSuspend: updatedValues.beforeAutoSuspend.toString(),
                    create: updatedValues.create.toString(),
                    autoOpen: updatedValues.autoOpen.toString(),
                    runners: market.runners?.map(runner => ({
                        marketTemplateRunnerId: runner.marketTemplateRunnerId,
                        marketTemplateId: market.marketTemplateId,
                        runner: runner.runner,
                        line: runner.line,
                        overRate: runner.overRate,
                        underRate: runner.underRate,
                        lastUpdate: new Date().toISOString(),
                        selectionId: runner.selectionId,
                        order: runner.order,
                        backPrice: runner.backPrice,
                        layPrice: runner.layPrice,
                        backSize: market.isPredefineRunnerValue ? runner.backSize : market.defaultBackSize,
                        laySize: market.isPredefineRunnerValue ? runner.laySize : market.defaultLaySize,
                        predefinedValue: runner.predefinedValue,
                        runnerId: runner.runnerId || "0"
                    })) || []
                };

                processMarketAndRunners(specialMarket, team.teamId, team.teamId.toString(), processedMarketsObj);
            }
        });
    };
    const generateMarketFromTemplate = (template, teams, commentary) => {
        // Default market name without any changes
        let marketName = template.templateName;

        // Apply specific logic only when isPerEvent is true
        if (template.isPerEvent && teams.length >= 2) {
            const team1Name = teams[0]?.shortName || 'Team1';
            const team2Name = teams[1]?.shortName || 'Team2';
            marketName = `${template.templateName} (${team1Name} vs ${team2Name}) ADV`;
        }

        return {
            eventMarketId: 0, // Default to 0 for new markets
            isCreate: true,  // Default to true for new markets
            status: "1",
            margin: template.margin,
            data: "",
            playerId: null,
            ...template,
            commentaryId: commentary.commentaryId,
            eventRefId: commentary.eventRefId,
            marketName, // Use the newly formatted market name only when isPerEvent is true
            defaultBackSize: template?.defaultBackSize,
            defaultLaySize: template?.defaultLaySize,
            lineType: template?.lineType,
            teamId: null,
            inningsId: 1,
            isActive: template?.isDefaultMarketActive || false,
            isAllow: template.isDefaultBetAllowed || false,
            index: 0,
            beforeSuspendMin: template.beforeSuspendMin,
            beforeCloseMin: template.beforeCloseMin,
            rateDiff: template?.rateDiff,
            runners: template.runners?.map(runner => ({
                ...runner,
                runnerId: runner.runnerId || "0",
                backSize: template?.isPredefineRunnerValue ? runner?.backSize : template?.defaultBackSize,
                laySize: template?.isPredefineRunnerValue ? runner?.laySize : template?.defaultLaySize,
            })) || []
        };
    };
    const generateExtraMarketFromTemplate = (template, team, commentary) => {
        return {
            eventMarketId: 0,
            isCreate: true,
            status: "1",
            margin: template.margin,
            data: "",
            playerId: null,
            ...template,
            commentaryId: commentary.commentaryId,
            eventRefId: commentary.eventRefId,
            marketName: `${template.templateName} - ${team.shortName}`,
            defaultBackSize: template?.defaultBackSize,
            defaultLaySize: template?.defaultLaySize,
            lineType: template?.lineType,
            teamId: null,
            inningsId: 1,
            isActive: template?.isDefaultMarketActive || false,
            isAllow: template.isDefaultBetAllowed || false,
            index: 0,
            rateDiff: template?.rateDiff,
            runners: template.runners?.map(runner => ({
                ...runner,
                runnerId: runner.runnerId || "0",
                backSize: template?.isPredefineRunnerValue ? runner?.backSize : template?.defaultBackSize,
                laySize: template?.isPredefineRunnerValue ? runner?.laySize : template?.defaultLaySize,
            })) || []
        };
    };
    const handleRunnerValueChange = (market, runnerIndex, key, value) => {
        setProcessedMarkets((prevMarkets) => {
            const updatedMarkets = { ...prevMarkets };
            const marketKey = Object.keys(updatedMarkets).find((k) => updatedMarkets[k].includes(market));
            const marketIndex = updatedMarkets[marketKey].findIndex((m) => m === market);
            const updatedMarket = { ...updatedMarkets[marketKey][marketIndex] };

            if (!updatedMarket.runners) {
                updatedMarket.runners = [];
            }

            // Handle value change
            if (key === 'line' || key === 'predefinedValue') {
                const newValue = value === null || value === "" ? "" : Number(value);

                // Update the specific field first
                updatedMarket.runners[runnerIndex] = {
                    ...updatedMarket.runners[runnerIndex],
                    [key]: newValue
                };

                if (updatedMarket.marketTypeCategoryId === 31) {
                    // For Fall of Wicket markets
                    if (key === 'line') {
                        // Update current market's values
                        updatedMarket.runners[runnerIndex] = {
                            ...updatedMarket.runners[runnerIndex],
                            ...generateRunnerValues(
                                updatedMarket,
                                { ...updatedMarket.runners[runnerIndex], line: newValue },
                                updatedMarket.margin,
                                updatedMarket.rateDiff
                            )
                        };

                        // Update subsequent markets only when line changes
                        updatedMarkets[marketKey] = updateSubsequentWicketLines(
                            updatedMarkets[marketKey],
                            marketIndex,
                            newValue
                        );
                    } else if (key === 'predefinedValue') {

                        let prevMarket = { ...updatedMarkets[marketKey][marketIndex - 1] };
                        let prevMarketIndex = marketIndex - 1;
                        // Iterate backwards through previous markets until we find a valid line value
                        while (((prevMarket?.runners?.[runnerIndex]?.line === null || prevMarket?.runners?.[runnerIndex]?.line === "" || prevMarket?.runners?.[runnerIndex]?.line === undefined) && (prevMarket?.runners?.[runnerIndex]?.predefinedValue === null || prevMarket?.runners?.[runnerIndex]?.predefinedValue === "" || prevMarket?.runners?.[runnerIndex]?.predefinedValue === undefined)) && prevMarketIndex > 0) {
                            prevMarket = { ...updatedMarkets[marketKey][prevMarketIndex - 1] };  // Get the previous market
                            prevMarketIndex--;
                        }

                        const prevLineValue = prevMarket?.runners?.[runnerIndex]?.line;
                        const newLineValue = newValue ? (prevLineValue + newValue) : null;

                        updatedMarket.runners[runnerIndex] = {
                            ...updatedMarket.runners[runnerIndex],
                            predefinedValue: newValue,
                            line: newLineValue,
                            ...generateRunnerValues(
                                updatedMarket,
                                { ...updatedMarket.runners[runnerIndex], line: newLineValue },
                                updatedMarket.margin,
                                updatedMarket.rateDiff
                            )
                        };

                        //Update subsequent markets only when line changes
                        updatedMarkets[marketKey] = updateSubsequentWicketLines(
                            updatedMarkets[marketKey],
                            marketIndex,
                            newLineValue
                        );
                    }
                    // If it's predefinedValue change, do nothing more for category 31

                    // Check if the current market becomes invalid
                    const errors = validateMarketRow(updatedMarket);
                    if (errors.length > 0 && selectedMarkets[marketKey]?.[marketIndex]) {
                        // If current market becomes invalid, unselect it and all subsequent markets
                        handleAutoUnselectSubsequentMarkets(marketKey, marketIndex);
                    }
                } else {
                    // For all other market categories
                    if (key === 'predefinedValue' && newValue !== "") {
                        updatedMarket.runners[runnerIndex] = {
                            ...updatedMarket.runners[runnerIndex],
                            line: newValue,
                            ...generateRunnerValues(
                                updatedMarket,
                                { ...updatedMarket.runners[runnerIndex], line: newValue },
                                updatedMarket.margin,
                                updatedMarket.rateDiff
                            )
                        };
                    } else if (key === 'line' && newValue !== "") {
                        updatedMarket.runners[runnerIndex] = {
                            ...updatedMarket.runners[runnerIndex],
                            ...generateRunnerValues(
                                updatedMarket,
                                { ...updatedMarket.runners[runnerIndex], line: newValue },
                                updatedMarket.margin,
                                updatedMarket.rateDiff
                            )
                        };
                    }

                    // Check if the current market becomes invalid (for non-category-31)
                    const errors = validateMarketRow(updatedMarket);
                    if (errors.length > 0 && selectedMarkets[marketKey]?.[marketIndex]) {
                        // If current market becomes invalid, just unselect it
                        setSelectedMarkets(prev => {
                            const updated = { ...prev };
                            updated[marketKey][marketIndex] = false;
                            return updated;
                        });
                    }
                }
            } else {
                // Handle other field changes (overRate, underRate, backPrice, etc.)
                const parsedValue = ["overRate", "underRate", "backPrice", "layPrice", "backSize", "laySize"].includes(key)
                    ? (value === null || value === "" ? "" : Number(value))
                    : value;

                updatedMarket.runners[runnerIndex] = {
                    ...updatedMarket.runners[runnerIndex],
                    [key]: parsedValue
                };

                // Check for validation after other field changes
                const errors = validateMarketRow(updatedMarket);
                if (errors.length > 0 && selectedMarkets[marketKey]?.[marketIndex]) {
                    if (updatedMarket.marketTypeCategoryId === 31) {
                        // For category 31, unselect current and subsequent markets
                        handleAutoUnselectSubsequentMarkets(marketKey, marketIndex);
                    } else {
                        // For other categories, just unselect the current market
                        setSelectedMarkets(prev => {
                            const updated = { ...prev };
                            updated[marketKey][marketIndex] = false;
                            return updated;
                        });
                    }
                }
            }

            updatedMarkets[marketKey][marketIndex] = updatedMarket;
            return updatedMarkets;
        });
    };

    // Helper function to generate runner values based on line
    const generateRunnerValues = (market, runner, margin, rateDiff) => {
        const isFancyOrLineMarket = !market?.isPredefineRunnerValue && (market?.marketTypeId == marketTypeObj?.Fancy || market?.marketTypeId == marketTypeObj?.LineMarket);

        if (isFancyOrLineMarket) {
            return generateOverUnderLineMarketFancy({ ...runner, margin, rateDiff });
        } else {
            return generateOverUnder({ ...runner, margin });
        }
    };

    const renderTable = (markets, sectionKey) => {
        const columns = [
            {
                title: () => (
                    <input
                        type="checkbox"
                        className='mx-2'
                        checked={selectedMarkets[sectionKey]?.every(Boolean)}
                        onChange={() => handleSelectAllInSection(sectionKey)}
                    />
                ),
                style: { width: "5%" },
                render: (_, record, index) => (
                    <input
                        type="checkbox"
                        checked={selectedMarkets[sectionKey]?.[index] || false}
                        onChange={() => handleSelectMarket(sectionKey, index)}
                    />
                ),
            },
            ...columnInitials,
            ...runnerColumns.map(column => ({
                ...column,
                render: (text, record, index) => {
                    const runner = record.runners && record.runners[0];
                    return column.render(
                        runner ? runner[column.key] : null,
                        runner || {},
                        (key, value) => handleRunnerValueChange(record, 0, key, value)
                    );
                }
            }))
        ];

        return (
            <Table responsive>
                <thead>
                    <tr>
                        {columns.map((column, index) => (
                            <th className="p-0" key={index} style={column.style}>
                                {typeof column.title === 'function' ? column.title(sectionKey) : column.title}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {markets.map((market, index) => (
                        <React.Fragment key={index}>
                            <tr>
                                {columns.map((column, colIndex) => (
                                    <td className="p-2" key={colIndex}>
                                        {column.render ?
                                            column.render(
                                                market[column.dataIndex],
                                                market,
                                                index,
                                                (key, value) => handleValueChange(market, key, value)
                                            ) :
                                            market[column.dataIndex]
                                        }
                                    </td>
                                ))}
                            </tr>
                            {market.runners && market.runners.length > 1 &&
                                market.runners.slice(1)?.sort((a, b) => a.order - b.order).map((runner, runnerIndex) => (
                                    <tr key={`additional-runner-${runnerIndex}`}>
                                        <td colSpan={columns.length - runnerColumns.length}></td>
                                        {runnerColumns.map((column, runnerColIndex) => (
                                            <td className="p-2" key={`additional-runner-col-${runnerColIndex}`}>
                                                {column.render(
                                                    runner[column.key],
                                                    runner,
                                                    (key, value) => handleRunnerValueChange(market, runnerIndex + 1, key, value)
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            }
                        </React.Fragment>
                    ))}
                </tbody>
            </Table>
        );
    };

    const toggleMarket = (id) => {
        setOpenMarket(openMarket === id ? '' : id);
    };

    const toggleCategory = (id) => {
        setOpenCategory(openCategory === id ? '' : id);
    };

    const renderMarketCategory = (categoryId, markets, sectionKey) => (
        <Accordion open={openCategory} toggle={toggleCategory} key={sectionKey}>
        <AccordionItem className="rounded-0">
            <AccordionHeader targetId={sectionKey} className="market-category-header">
                {marketData.categories.find(cat => cat.marketTypeCategoryId === parseInt(categoryId))?.categoryName || `Category ${categoryId}`}
            </AccordionHeader>
            <AccordionBody accordionId={sectionKey} className="market-category-body">
               {renderTable(markets, sectionKey)}
            </AccordionBody>
        </AccordionItem>
        </Accordion>
    );
    const renderMarketType = (typeId, categories, teamId) => (
        <>
            {Object.entries(categories).map(([categoryId, markets]) => {
                const sectionKey = `${teamId || 'oneTimeMarket'}_##_${typeId}_##_${categoryId}`;
                return renderMarketCategory(categoryId, markets, sectionKey);
            })}
        </>
    );

    // const typeOrder = ["batsmen", "wicket-keeper", "allrounder", "bowler"];

    // processedMarkets["1_##_2_##_12"]?.sort((a, b) => {
    //     console.log("a", a, b);
    //     // Compare by playerType order
    //     const typeComparison = typeOrder.indexOf(a.playerType) - typeOrder.indexOf(b.playerType);
    //     if (typeComparison !== 0) return typeComparison;

    //     // Compare by playerName alphabetically
    //     return a.playerName?.localeCompare(b.playerName);
    //   });

    // const renderTeamMarkets = (teamId, typeCategories) => (
    //     <Card key={teamId}>
    //         <CardHeader>
    //             {marketData.teamAndPlayers.find(team => team.teamId === parseInt(teamId))?.teamName || `Team ${teamId}`}
    //         </CardHeader>
    //         <CardBody className="p-1">
    //             {Object.entries(typeCategories).map(([typeId, categories]) =>
    //                 renderMarketType(typeId, categories)
    //             )}
    //         </CardBody>
    //     </Card>
    // );

    const renderMainSections = () => {
        const sections = {
            oneTimeMarket: { title: "One Time Markets", data: {} }
        };

        // Create sections for each team dynamically
        const teamPlayers = marketData?.teamAndPlayers?.sort((a,b)=>a?.teamStatus - b?.teamStatus);
        teamPlayers.forEach(team => {
            sections[`team_${team.teamId}`] = {
                title: `${team.teamName} Markets`,
                data: {}
            };
        });

        Object.entries(processedMarkets).forEach(([key, markets]) => {
            const [prefix, typeId, categoryId, name] = key.split('_##_');

            if (prefix === 'oneTimeMarket') {
                if (!sections.oneTimeMarket.data[typeId]) sections.oneTimeMarket.data[typeId] = {};
                if (!sections.oneTimeMarket.data[typeId][categoryId]) sections.oneTimeMarket.data[typeId][categoryId] = [];
                sections.oneTimeMarket.data[typeId][categoryId].push(...markets);
            } else {
                const teamId = prefix;
                const teamSection = sections[`team_${teamId}`];

                if (teamSection) {
                    if (!teamSection.data[typeId]) teamSection.data[typeId] = {};
                    if (!teamSection.data[typeId][categoryId]) teamSection.data[typeId][categoryId] = [];
                    teamSection.data[typeId][categoryId].push(...markets);
                }
            }
        });

        return (
          <>
            {Object.entries(sections).map(([sectionKey, section]) => (
              <Accordion open={openMarket} toggle={toggleMarket} key={sectionKey}>
                <AccordionItem className="rounded-0">
                    <AccordionHeader targetId={sectionKey} className="market-category-header">{section.title}</AccordionHeader>
                    <AccordionBody accordionId={sectionKey} className="market-category-body p-2">
                        {Object.entries(section.data).map(([typeId, categories]) =>
                            renderMarketType(typeId, categories, sectionKey === 'oneTimeMarket' ? null : sectionKey.split('_')[1])
                        )}
                    </AccordionBody>
                </AccordionItem>
              </Accordion>
            ))}
          </>
        );
    };

    const handleSave = async () => {
        const savedData = Object.entries(processedMarkets)
            .flatMap(([key, markets]) =>
                markets.filter((_, index) => selectedMarkets[key]?.[index])
            )
            .map(market => {
                // Get predefinedValue from the first runner
                const predefinedValue = market.runners[0]?.predefinedValue;

                return {
                    ...market,
                    eventMarketId: market.eventMarketId || 0,
                    isCreate: market.isCreate !== undefined ? market.isCreate : true,
                    status: market.status || "1",
                    margin: market.margin,
                    data: market.data || "",
                    playerId: market.playerId || null,
                    marketTypeId: market.marketTypeId,
                    marketTypeCategoryId: market.marketTypeCategoryId,
                    marketTemplateId: market.marketTemplateId,
                    commentaryId: market.commentaryId,
                    eventRefId: market.eventRefId,
                    marketName: market.marketName,
                    teamId: market.teamId,
                    inningsId: market.inningsId || 1,
                    isAllow: market.isAllow !== undefined ? market.isAllow : false,
                    isActive: market.isActive !== undefined ? market.isActive : true,
                    index: market.index || 0,
                    over: market.over || 0,
                    rateDiff: market.rateDiff || 0,
                    beforeSuspendMin: market.beforeSuspendMin,
                    beforeCloseMin: market.beforeCloseMin,
                    isPredefineRunnerValue: market.isPredefineRunnerValue,
                    predefinedValue: predefinedValue, // Add predefinedValue at market level
                    runners: market.runners.map(runner => {
                        // Remove predefinedValue from runner level
                        const { predefinedValue: _, ...runnerWithoutPredefined } = runner;
                        return {
                            ...runnerWithoutPredefined,
                            marketTemplateId: market.marketTemplateId,
                            runnerId: runner.runnerId || "0",
                            runner: runner.runner,
                            line: runner.line,
                            overRate: runner.overRate,
                            underRate: runner.underRate,
                            backPrice: runner.backPrice,
                            layPrice: runner.layPrice,
                            backSize: runner.backSize,
                            laySize: runner.laySize,
                            order: runner.order,
                            selectionId: runner.selectionId
                        };
                    })
                };
            });

        if (savedData.length === 0) {
            dispatch(updateToastData({
                data: "Select at least one row",
                title: "Error",
                type: ERROR
            }));
            return;
        }

        try {
            const response = await axiosInstance.post(`/admin/eventMarket/saveEventMarketV1`, {
                eventMarket: savedData,
            });

            // Show success message
            dispatch(updateToastData({
                data: response?.message,
                title: response?.title,
                type: SUCCESS
            }));

            // Refresh the page after successful save
            window.location.reload();

        } catch (error) {
            setIsLoading(false);

            // Show error message
            dispatch(updateToastData({
                data: error?.message || "An error occurred while saving. Page will refresh.",
                title: error?.title || "Error",
                type: ERROR
            }));

            // Refresh the page after error
            setTimeout(() => {
                window.location.reload();
            }, 2000); // Give user time to see the error message
        }
    };

    const handleBackClick = () => {
        navigate("/commentary");
    };
    const handleValueChange = (market, key, value) => {
        setProcessedMarkets(prevMarkets => {
            const updatedMarkets = { ...prevMarkets };
            const marketKey = Object.keys(updatedMarkets).find(k => updatedMarkets[k].includes(market));
            const marketIndex = updatedMarkets[marketKey].findIndex(m => m === market);
            const updatedMarket = { ...market, [key]: value };

            // If margin changes, update all runners
            if ((key === 'margin' || key === 'rateDiff') && !market?.isPredefineRunnerValue && (market?.marketTypeId == marketTypeObj?.Fancy || market?.marketTypeId == marketTypeObj?.LineMarket)) {
                updatedMarket.runners = updatedMarket.runners.map(runner =>
                    generateOverUnderLineMarketFancy({ ...runner, margin: key === 'margin' ? parseFloat(value) : market?.margin, rateDiff: key === 'rateDiff' ? parseFloat(value || 0) : market?.rateDiff })
                );
            } else if ((key === 'margin') && !market?.isPredefineRunnerValue) {
                updatedMarket.runners = updatedMarket.runners.map(runner =>
                    generateOverUnder({ ...runner, margin: parseFloat(value) })
                );
            } /* else if ((key === 'margin') && !market?.isPredefineRunnerValue && parseInt(market.lineType) === 2) {
                updatedMarket.runners = updatedMarket.runners.map(runner =>
                    generateSameLayBack({ ...runner, margin: parseFloat(value) })
                );
            } */

            updatedMarkets[marketKey][marketIndex] = updatedMarket;
            return updatedMarkets;
        });
    };

    const columnInitials = [
        {
            title: "Market",
            dataIndex: "marketName",
            render: (text, record) => (
                <>
                    <Input
                        className="form-control small-text-fields"
                        type="text"
                        disabled={+record?.eventMarketId}
                        value={text}
                        onChange={(e) => handleValueChange(record, "marketName", e.target.value)}
                    />
                    <span className="text-danger">
                        {record?.error?.marketName}
                    </span>
                </>
            ),
            key: "marketName",
            style: { width: "20%" }, // Reduced width
        },
        {
            title: "Is Active",
            dataIndex: "isActive",
            render: (text, record) => (
                <Button
                    color={`${record.isActive ? "primary" : "danger"}`}
                    size="sm"
                    className="btn"
                    onClick={() => {
                        handleValueChange(record, "isActive", !record.isActive);
                    }}
                >
                    <i className={`bx ${record.isActive ? "bx-check" : "bx-block"}`}></i>
                </Button>
            ),
            key: "isActive",
            style: { width: "2%", textAlign: "center" },
        },
        {
            title: "Market Allow",
            dataIndex: "isAllow",
            render: (text, record) => (
                <Button
                    color={`${record.isAllow ? "primary" : "danger"}`}
                    size="sm"
                    className="btn"
                    onClick={() => {
                        handleValueChange(record, "isAllow", !record.isAllow);
                    }}
                >
                    <i className={`bx ${record.isAllow ? "bx-check" : "bx-block"}`}></i>
                </Button>
            ),
            key: "isAllow",
            style: { width: "2%", textAlign: "center" },
        },
        {
            title: "Status",
            dataIndex: "status",
            render: (text, record) => (
                <select
                    className="small-text-fields"
                    value={text}
                    onChange={(e) => {
                        handleValueChange(record, "status", e.target.value);
                    }}
                    closeMenuOnSelect={true}
                >
                    {
                        Object.entries(MARKET_STATUS).map(([key, value]) =>
                            <option key={key} value={key}>{value}</option>
                        )
                    }
                </select>
            ),
            key: "status",
            style: { width: "5%" },
        },
        {
            title: "Margin",
            dataIndex: "margin",
            render: (text, record) => (
                <>
                    {/* <Input
                        className="form-control small-text-fields no-spinners"
                        type="number"
                        value={(+text || 0).toFixed(2)}
                        onChange={(e) => handleValueChange(record, "margin", e.target.value)}
                    /> */}
                    <CustomInput
                        className="form-control small-text-fields"
                        value={text}
                        onChange={(newValue) => handleValueChange(record, "margin", newValue)}
                    />
                    <span className="text-danger">
                        {record?.error?.margin}
                    </span>
                </>
            ),
            key: "margin",
            style: { width: "5%" },
        },
        {
            title: "Rate Diff",
            dataIndex: "rateDiff",
            render: (text, record) => (
                <>
                    {/* <Input
                        className="form-control small-text-fields no-spinners"
                        type="number"
                        value={(+text || 0).toFixed(2)}
                        onChange={(e) => handleValueChange(record, "rateDiff", e.target.value)}
                    /> */}
                    <CustomInput
                        className="form-control small-text-fields"
                        value={text}
                        onChange={(newValue) => handleValueChange(record, "rateDiff", newValue)}
                    />
                    <span className="text-danger">
                        {record?.error?.rateDiff}
                    </span>
                </>
            ),
            key: "rateDiff",
            style: { width: "5%" },
        },
    ]

    const runnerColumns = [
        {
            title: "Runner",
            key: "runner",
            render: (text, record, onChange) => (
                <Input
                    className="form-control small-text-fields"
                    type="text"
                    disabled={+record?.runnerId}
                    value={record.runner || ""}
                    onChange={(e) => onChange("runner", e.target.value)}
                    placeholder="Runner Name"
                />
            ),
            style: { width: "15%" },
        },
        {
            title: "Pre",
            key: "predefinedValue",
            render: (text, record, onChange) => (
                <CustomInput
                    className="form-control small-text-fields"
                    value={record?.predefinedValue == null ? "" : record?.predefinedValue}
                    onChange={(newValue) => onChange("predefinedValue", newValue)}
                    placeholder="Predefined Value"
                />
            ),
            style: { width: "5%" },
        },

        {
            title: "Line",
            key: "line",
            render: (text, record, onChange) => (
                // <Input
                //     className="form-control small-text-fields no-spinners"
                //     type="number"
                //     value={record.line}
                //     onChange={(e) => onChange("line", +e.target.value || 0)}
                //     placeholder="Line"
                // />
                <CustomInput
                    className="form-control small-text-fields"
                    value={record?.line == null ? "" : record?.line}
                    onChange={(newValue) => onChange("line", newValue)}
                    placeholder="Line"
                />
            ),
            style: { width: "5%" },
        },
        {
            title: "Under",
            key: "under",
            render: (text, record, onChange) => (
                // <Input
                //     className="form-control small-text-fields no-spinners"
                //     type="number"
                //     value={record.underRate}
                //     onChange={(e) => onChange("underRate", +e.target.value || 0)}
                //     placeholder="Under"
                // />
                <CustomInput
                    className="form-control small-text-fields"
                    value={record?.underRate}
                    onChange={(newValue) => onChange("underRate", newValue)}
                    placeholder="Under"
                />
            ),
            style: { width: "5%" },
        },
        {
            title: "Over",
            key: "over",
            render: (text, record, onChange) => (
                // <Input
                //     className="form-control small-text-fields no-spinners"
                //     type="number"
                //     value={record.overRate}
                //     onChange={(e) => onChange("overRate", +e.target.value || 0)}
                //     placeholder="Over"
                // />
                <CustomInput
                    className="form-control small-text-fields"
                    value={record?.overRate}
                    onChange={(newValue) => onChange("overRate", newValue)}
                    placeholder="Over"
                />
            ),
            style: { width: "5%" },
        },
        {
            title: "No Rate",
            key: "noRate",
            render: (text, record, onChange) => (
                // <Input
                //     className="form-control small-text-fields no-spinners"
                //     type="number"
                //     value={record.layPrice}
                //     onChange={(e) => onChange("layPrice", +e.target.value || 0)}
                //     placeholder="No Rate"
                // />
                <CustomInput
                    className="form-control small-text-fields"
                    value={record?.layPrice}
                    onChange={(newValue) => onChange("layPrice", newValue)}
                    placeholder="No Rate"
                />
            ),
            style: { width: "5%" },
        },
        {
            title: "Yes Rate",
            key: "yesRate",
            render: (text, record, onChange) => (
                // <Input
                //     className="form-control small-text-fields no-spinners"
                //     type="number"
                //     value={record.backPrice}
                //     onChange={(e) => onChange("backPrice", +e.target.value || 0)}
                //     placeholder="Yes Rate"
                // />
                <CustomInput
                    className="form-control small-text-fields"
                    value={record?.backPrice}
                    onChange={(newValue) => onChange("backPrice", newValue)}
                    placeholder="Yes Rate"
                />
            ),
            style: { width: "5%" },
        },
        {
            title: "No Point",
            key: "noPoint",
            render: (text, record, onChange) => (
                // <Input
                //     className="form-control small-text-fields no-spinners"
                //     type="number"
                //     value={record.laySize}
                //     onChange={(e) => onChange("laySize", +e.target.value || 0)}
                //     placeholder="No Point"
                // />
                <CustomInput
                    className="form-control small-text-fields"
                    value={record?.laySize}
                    onChange={(newValue) => onChange("laySize", newValue)}
                    placeholder="No Point"
                />
            ),
            style: { width: "5%" },
        },
        {
            title: "Yes Point",
            key: "yesPoint",
            render: (text, record, onChange) => (
                // <Input
                //     className="form-control small-text-fields no-spinners"
                //     type="number"
                //     value={record.backSize}
                //     onChange={(e) => onChange("backSize", +e.target.value || 0)}
                //     placeholder="Yes Point"
                // />
                <CustomInput
                    className="form-control small-text-fields"
                    value={record?.backSize}
                    onChange={(newValue) => onChange("backSize", newValue)}
                    placeholder="Yes Point"
                />
            ),
            style: { width: "5%" },
        }
    ];
    const MarketDetailsDate = commentaryDetails?.eventDate
        ? convertDateUTCToLocal(commentaryDetails.eventDate, "index")
        : "";
    return (
        <React.Fragment>
            <div className="page-content" >
                <Container fluid={true}>
                    <Row>
                        <Card>
                            <CardBody className="p-1 card-container">
                                {isLoading && <SpinnerModel />}
                                <div className="header-sticky">
                                <Row>
                                    <Col className="mt-3 mt-lg-3 mt-md-3" >
                                        <Breadcrumbs title="ScoreCard" breadcrumbItem="Commentary Market Template" page="updatecp" />
                                    </Col>
                                    <Col className="mt-3 mt-lg-3 mt-md-3 float-right" >
                                        <Button className="btn btn-danger text-right" onClick={handleBackClick} > Back </Button>
                                        <Button color="primary mx-2" className="btn text-right" onClick={handleSave} > Save </Button>
                                        {/* <Button color="primary" className="btn text-right" onClick={() => setIsModalOpen(true)} > Add Runner </Button> */}
                                    </Col>
                                </Row>
                                <Row className="g-2 mb-3">
                                    {commentaryDetails && (
                                        <Col className="col-sm-auto">
                                            <EventMarketModal
                                                isOpen={isModalOpen}
                                                onClose={() => setIsModalOpen(false)}
                                                apiResponse={marketData}
                                            />
                                            <div className="match-details-breadcrumbs">{`${commentaryDetails?.competition}/ ${commentaryDetails?.eventName}`}</div>
                                            <div>{`Ref: ${commentaryDetails?.eventRefId} [
                                            ${MarketDetailsDate}
                                        ]`}</div>
                                        </Col>
                                    )}
                                </Row>
                                </div>
                                <div className="content-section" onScroll={handleScroll}>
                                   {renderMainSections()}
                                </div>
                                {showBackToTop && (
                                     <>
                                    <Button className="btn text-right my-2 sticky-btn" onClick={scrollToTop}>
                                        <FaArrowUp />
                                    </Button>
                                    </>
                                )}
                            </CardBody>
                        </Card>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );

};
