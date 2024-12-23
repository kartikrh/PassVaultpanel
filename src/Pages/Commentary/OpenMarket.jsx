import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ERROR, OPEN_MARKET_CONNECT, OPEN_MARKET_DATA, SUCCESS, WARNING } from "../../components/Common/Const";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { Button, Card, CardBody, Col, Container, Input, Row, } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { updateToastData } from "../../Features/toasterSlice";
import axiosInstance from "../../Features/axios";
import { ACTIVE, ALLOW, DEACTIVE, INACTIVE, INACTIVE_VALUE, NOT_ALLOW, OPEN_MARKET_STATUS, SEND_ALL, SUSPEND, SUSPEND_VALUE, OPEN_VALUE } from "./CommentartConst";
import "./CommentaryCss.css"
import _, { isEmpty } from "lodash";
import { generateOverUnderLineType } from "./functions";
import createSocket from "../../Features/socket";
import CustomInput from "../../components/Common/Reusables/CustomInput";
import Select from "react-select";
import OpenMarketCategories from "./OpenMarketCategoryRendering";

export const OpenMarket = () => {
    const [data, setData] = useState([]);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [teams, setTeams] = useState({});
    const [categories, setCategories] = useState([]);
    const [fullCategories, setFullCategories] = useState([]);
    const [categorisedData, setCategorisedData] = useState([]);
    const [lineRatio, setLineRatio] = useState(0);
    const [commentaryInfo, setCommentaryInfo] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isAutoUpdate, setIsAutoUpdate] = useState(false);
    const [autoInterval, setAutoInterval] = useState(500)
    const [isSocketConnected, setIsSocketConnected] = useState(false)
    const [openAccordions, setOpenAccordions] = useState(["Session"]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [debouncedLineRatio, setDebouncedLineRatio] = useState(lineRatio);
    const [isLineRatioInitialized, setIsLineRatioInitialized] = useState(0);
    const [originalMarketData, setOriginalMarketData] = useState({});
    const [isDataFromApiOrSocket, setIsDataFromApiOrSocket] = useState(false);

    const selectedCategoriesData = selectedCategories.map(category => { })
    const commentaryId = +localStorage.getItem('openMarketCommentaryId') || "0";
    const intervalIdRef = useRef(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const marketTypeObj = useSelector((state) => state.marketType?.marketTypeList);
    const socket = createSocket();
    const statusListToInclude = [1, 2, 3]
    const lineRatioForMarketCategoryId = 23


    useEffect(() => {
        if (!isEmpty(commentaryInfo))
            document.title = `OM ${commentaryInfo.eid} ${commentaryInfo.en}`;
    }, [commentaryInfo])

    const filterDataBySelectedCategories = (dataToFilter) => {
        if (selectedCategories.length === 0) return [];
        return dataToFilter.filter(item =>
            selectedCategories.some(category => category.value === item.marketTypeCategoryId)
        );
    };

    useEffect(() => {
        if (!isEmpty(data) && isDataFromApiOrSocket) {
            // Store original data for reference
            const newOriginalData = {};
            data.forEach(market => {
                if (market.runner && market.runner.length === 1) {
                    newOriginalData[market.marketId] = {
                        line: market.runner[0].line,
                        predefinedValue: market.predefinedValue,
                        playerScore: market.playerScore
                    };
                }
            });
            setOriginalMarketData(newOriginalData);
            setIsDataFromApiOrSocket(false); // Reset flag after updating
        }
    }, [data, isDataFromApiOrSocket]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedLineRatio(lineRatio);
        }, 1000);

        return () => {
            clearTimeout(handler);
        };
    }, [lineRatio]);

    const saveLineRatio = async (payload) => {
        try {
            await axiosInstance.post("/admin/commentary/updatLineRatio", payload);
        } catch (error) {
            dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
        }
    };

    useEffect(() => {
        if (debouncedLineRatio && isLineRatioInitialized !== debouncedLineRatio) {
            const payload = {
                commentaryId,
                lineRatio: +debouncedLineRatio,
            };
            saveLineRatio(payload)
        }
    }, [debouncedLineRatio]);

    const fetchConfigAll = async () => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.post("/admin/config/all", { isActive: true });

            const isMarketRepetitionCall = response.result.find(config => config.key === 'ISMARKETREPETITIONCALL')?.value;
            const repetitionCallInterval = response.result.find(config => config.key === 'REPETITIONCALLINTERVAL')?.value;

            if (isMarketRepetitionCall === 'true' && repetitionCallInterval) {
                const interval = parseInt(repetitionCallInterval);
                setAutoInterval(interval || 1000)

            }
        } catch (error) {
            dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
        } finally {
            setIsLoading(false);
        }
    };

    // const debouncedSave = useCallback(
    //     debounce((dataToSave) => {
    //         saveData({ dataToSave });
    //     }, 500),
    //     []
    // );

    const formatDataBeforeSend = (dataToChange = []) => {
        return dataToChange.map(record => {
            let workingRecord = _.clone(record);
            // Check if runner exists and is an array
            if (Array.isArray(workingRecord.runner)) {
                workingRecord.runner = workingRecord.runner.map(runner => ({
                    ...runner,
                    line: +(runner.line || 0),
                    overRate: +(runner.overRate || 0),
                    underRate: +(runner.underRate || 0),
                    backPrice: +(runner.backPrice || 0),
                    backSize: +(runner.backSize || 100),
                    layPrice: +(runner.layPrice || 0),
                    laySize: +(runner.laySize || 100),
                    status: +(runner.status || 0),
                    runnerId: +(runner.runnerId || 0),
                }));
            } else if (workingRecord.runner) {
                // If runner exists but is not an array, convert it to an array
                workingRecord.runner = [{
                    ...workingRecord.runner,
                    line: +(workingRecord.runner.line || 0),
                    overRate: +(workingRecord.runner.overRate || 0),
                    underRate: +(workingRecord.runner.underRate || 0),
                    backPrice: +(workingRecord.runner.backPrice || 0),
                    backSize: +(workingRecord.runner.backSize || 100),
                    layPrice: +(workingRecord.runner.layPrice || 0),
                    laySize: +(workingRecord.runner.laySize || 100),
                    status: +(workingRecord.runner.status || 0),
                    runnerId: +(workingRecord.runner.runnerId || 0),
                }];
            } else {
                workingRecord.runner = [];
            }

            return {
                ...workingRecord,
                status: +(workingRecord.status || 0),
                lineRatio: +(workingRecord.lineRatio || 0),
                margin: +(workingRecord.margin || 0),
            };
        });
    };

    useEffect(() => {
        const storedCategories = localStorage.getItem("selectedCategories");
        if (storedCategories) {
            const parsedCategories = JSON.parse(storedCategories);
            setSelectedCategories(parsedCategories);
        }
    }, []);

    const handleCategoryChange = (selectedOptions) => {
        setSelectedCategories(selectedOptions);
        localStorage.setItem("selectedCategories", JSON.stringify(selectedOptions));
    };

    const handleValueChange = (record, key, value) => {
        setHasUnsavedChanges(true);
        setData(prevData => {
            let updatedData = [...prevData];
            const marketIndex = updatedData.findIndex(m => m.marketId === record.marketId);

            if (marketIndex === -1) return prevData;

            let updatedMarket = { ...record };

            // Special handling for category 31
            if (record.marketTypeCategoryId === 31) {
                if (key === 'predefinedValue') {
                    const teamMarkets = updatedData.filter(
                        m => m.marketTypeCategoryId === 31 &&
                            m.teamId === record.teamId
                    ).sort((a, b) => a.marketId - b.marketId);

                    const currentMarketPosition = teamMarkets.findIndex(
                        m => m.marketId === record.marketId
                    );

                    let previousLine = 0;
                    if (currentMarketPosition > 0) {
                        previousLine = teamMarkets[currentMarketPosition - 1].line || 0;
                    }

                    const newValue = parseFloat(value) || 0;
                    const newLine = previousLine + newValue;

                    updatedMarket = {
                        ...updatedMarket,
                        predefinedValue: newValue,
                        line: newLine
                    };

                    if (updatedMarket.runner && updatedMarket.runner.length > 0) {
                        updatedMarket.runner = updatedMarket.runner.map(runner => ({
                            ...runner,
                            line: newLine,
                            layPrice: Math.round(newLine),
                            backPrice: (record?.marketTypeId == marketTypeObj?.Fancy ||
                                record?.marketTypeId == marketTypeObj?.LineMarket)
                                ? Math.round(newLine) + parseFloat(record?.rateDiff || 0)
                                : Math.round(newLine) + 1
                        }));
                    }

                    updatedMarket = generateOverUnderLineType({
                        ...updatedMarket,
                        margin: updatedMarket.margin,
                        lineType: updatedMarket.lineType,
                        marketTypeId: updatedMarket.marketTypeId,
                        rateDiff: updatedMarket?.rateDiff
                    }, marketTypeObj);

                    const updatedMarkets = updateSubsequentLines(teamMarkets, currentMarketPosition, newLine);
                    updatedData = updatedData.map(market => {
                        const updatedMarket = updatedMarkets.find(m => m.marketId === market.marketId);
                        return updatedMarket || market;
                    });
                } else if (key === 'line') {
                    const newLine = Number(value);
                    const teamMarkets = updatedData.filter(
                        m => m.marketTypeCategoryId === 31 &&
                            m.teamId === record.teamId
                    );
                    const currentIndex = teamMarkets.findIndex(m => m.marketId === record.marketId);

                    if (currentIndex > 0) {
                        const previousMarket = teamMarkets[currentIndex - 1];
                        const previousLine = previousMarket.line || 0;
                        updatedMarket.predefinedValue = newLine - previousLine;
                    } else {
                        updatedMarket.predefinedValue = newLine;
                    }

                    updatedMarket.line = newLine;
                    if (updatedMarket.runner && updatedMarket.runner.length > 0) {
                        updatedMarket.runner = updatedMarket.runner.map(runner => ({
                            ...runner,
                            line: newLine,
                            layPrice: Math.round(newLine),
                            backPrice: (record?.marketTypeId == marketTypeObj?.Fancy ||
                                record?.marketTypeId == marketTypeObj?.LineMarket)
                                ? Math.round(newLine) + parseFloat(record?.rateDiff || 0)
                                : Math.round(newLine) + 1
                        }));
                    }

                    updatedMarket = generateOverUnderLineType({
                        ...updatedMarket,
                        margin: updatedMarket.margin,
                        lineType: updatedMarket.lineType,
                        marketTypeId: updatedMarket.marketTypeId,
                        rateDiff: updatedMarket?.rateDiff
                    }, marketTypeObj);

                    const updatedMarkets = updateSubsequentLines(teamMarkets, currentIndex, newLine);
                    updatedData = updatedData.map(market => {
                        const updatedMarket = updatedMarkets.find(m => m.marketId === market.marketId);
                        return updatedMarket || market;
                    });
                } else {
                    if (key === 'status') {
                        updatedMarket.status = +value;
                        if (Array.isArray(updatedMarket.runner)) {
                            updatedMarket.runner = updatedMarket.runner.map(runner => ({
                                ...runner,
                                status: +value
                            }));
                        }
                    } else {
                        const runnerProperties = ['overRate', 'underRate', 'backPrice', 'layPrice', 'backSize', 'laySize'];
                        if (runnerProperties.includes(key) && Array.isArray(updatedMarket.runner)) {
                            updatedMarket.runner = updatedMarket.runner.map(runner => ({
                                ...runner,
                                [key]: value
                            }));
                        } else {
                            updatedMarket[key] = value;
                        }
                    }
                }
            } else {
                // Handling for non-category 31 markets
                if (key === 'predefinedValue') {
                    const originalData = originalMarketData[record.marketId];
                    const newValue = parseFloat(value) || 0;

                    if (record.runner && record.runner.length === 1) {
                        if ([12, 29, 30].includes(record.marketTypeCategoryId)) {
                            // For special market categories, predefinedValue is based on playerScore
                            const newLine = newValue + (originalData?.playerScore || 0);
                            updatedMarket.predefinedValue = newValue;
                            updatedMarket.line = newLine;
                            updatedMarket.lineDifference = newValue - (originalData?.predefinedValue || 0);

                            updatedMarket.runner[0] = {
                                ...updatedMarket.runner[0],
                                line: newLine,
                                layPrice: Math.round(newLine),
                                backPrice: (record?.marketTypeId == marketTypeObj?.Fancy ||
                                    record?.marketTypeId == marketTypeObj?.LineMarket)
                                    ? Math.round(newLine) + parseFloat(record?.rateDiff || 0)
                                    : Math.round(newLine) + 1
                            };
                        } else {
                            // For other single runner markets
                            const newLine = newValue;
                            updatedMarket.predefinedValue = newValue;
                            updatedMarket.line = newLine;
                            updatedMarket.lineDifference = newValue - (originalData?.predefinedValue || 0);

                            updatedMarket.runner[0] = {
                                ...updatedMarket.runner[0],
                                line: newLine,
                                layPrice: Math.round(newLine),
                                backPrice: (record?.marketTypeId == marketTypeObj?.Fancy ||
                                    record?.marketTypeId == marketTypeObj?.LineMarket)
                                    ? Math.round(newLine) + parseFloat(record?.rateDiff || 0)
                                    : Math.round(newLine) + 1
                            };
                        }

                        // Update dependent values
                        updatedMarket = generateOverUnderLineType({
                            ...updatedMarket,
                            margin: updatedMarket.margin,
                            lineType: updatedMarket.lineType,
                            marketTypeId: updatedMarket.marketTypeId,
                            rateDiff: updatedMarket?.rateDiff
                        }, marketTypeObj);
                    }
                } else if (key === 'status') {
                    updatedMarket.status = +value;
                    if (Array.isArray(updatedMarket.runner)) {
                        updatedMarket.runner = updatedMarket.runner.map(runner => ({
                            ...runner,
                            status: +value
                        }));
                    }
                } else {
                    const runnerProperties = ['line', 'overRate', 'underRate', 'backPrice', 'layPrice', 'backSize', 'laySize'];
                    if (runnerProperties.includes(key) && Array.isArray(updatedMarket.runner)) {
                        updatedMarket.runner = updatedMarket.runner.map(runner => ({
                            ...runner,
                            [key]: value
                        }));
                    } else {
                        updatedMarket[key] = value;
                    }

                    if ((updatedMarket?.marketTypeId == marketTypeObj?.Fancy ||
                        updatedMarket?.marketTypeId == marketTypeObj?.LineMarket) &&
                        Array.isArray(updatedMarket?.runner)) {
                        const marketStatus = updatedMarket?.status;
                        updatedMarket.runner = updatedMarket?.runner?.length > 0 &&
                            updatedMarket.runner.map(runner => ({
                                ...runner,
                                status: marketStatus
                            }));
                    }

                    if (key === 'line' || key === 'margin' || key === "rateDiff") {
                        updatedMarket = generateOverUnderLineType({
                            ...updatedMarket,
                            line: updatedMarket.runner[0]?.line,
                            backSize: updatedMarket.runner[0]?.backSize,
                            laySize: updatedMarket.runner[0]?.laySize
                        }, marketTypeObj);

                        if (updatedMarket.runner && updatedMarket.runner.length > 0) {
                            updatedMarket.runner[0] = {
                                ...updatedMarket.runner[0],
                                backPrice: updatedMarket.backPrice,
                                layPrice: updatedMarket.layPrice,
                                backSize: updatedMarket.backSize,
                                laySize: updatedMarket.laySize,
                                overRate: updatedMarket.overRate,
                                underRate: updatedMarket.underRate,
                            };
                        }
                    }
                }
            }

            updatedData[marketIndex] = updatedMarket;
            return updatedData;
        });
    };

    const handleMultiRunnerUpdate = (updatedMarket) => {
        const indexOfData = data.findIndex(i => i.marketId === updatedMarket.marketId);
        if (indexOfData !== -1) {
            setData(prev => [
                ...prev.slice(0, indexOfData),
                {
                    ...updatedMarket,
                    // Ensure runner remains an array
                    runner: Array.isArray(updatedMarket.runner) ? updatedMarket.runner : [updatedMarket.runner]
                },
                ...prev.slice(indexOfData + 1),
            ]);
            setHasUnsavedChanges(true);
        }
    };

    const updateSubsequentLines = (markets, startIndex, previousLine) => {
        return markets.map((market, index) => {
            if (index > startIndex) {
                const predefinedValue = market.predefinedValue || 0;
                const newLine = previousLine + predefinedValue;

                const updatedMarket = {
                    ...market,
                    line: newLine,
                    predefinedValue
                };

                if (updatedMarket.runner && updatedMarket.runner.length > 0) {
                    updatedMarket.runner = updatedMarket.runner.map(runner => ({
                        ...runner,
                        line: newLine,
                        layPrice: Math.round(newLine),
                        backPrice: (market?.marketTypeId == marketTypeObj?.Fancy ||
                            market?.marketTypeId == marketTypeObj?.LineMarket)
                            ? Math.round(newLine) + parseFloat(market?.rateDiff || 0)
                            : Math.round(newLine) + 1
                    }));
                }

                const result = generateOverUnderLineType({
                    ...updatedMarket,
                    margin: updatedMarket.margin,
                    lineType: updatedMarket.lineType,
                    marketTypeId: updatedMarket.marketTypeId,
                    rateDiff: updatedMarket?.rateDiff
                }, marketTypeObj);

                previousLine = newLine;
                return result;
            }
            return market;
        });
    };

    const handleAction = async ({ changeIn, key, value, action }) => {
        let dataToUpdate = filterDataBySelectedCategories(changeIn).filter(record => {
            if (key === "status" && value === INACTIVE_VALUE) {
                return record.status !== INACTIVE_VALUE;
            }
            return !_.isEqual(+record[key], +value);
        }).map(record => {
            // Create updated record with new status
            const updatedRecord = { ...record, [key]: value };

            // If this is a status change, update runner status too
            if (key === "status" && Array.isArray(updatedRecord.runner)) {
                updatedRecord.runner = updatedRecord.runner.map(runner => ({
                    ...runner,
                    status: +value
                }));
            }

            return updatedRecord;
        });

        dataToUpdate = formatDataBeforeSend(dataToUpdate);
        if (!isEmpty(dataToUpdate)) {
            await saveData({ dataToSave: dataToUpdate, action });

            // Update local state after successful API call
            setData(prevData =>
                prevData.map(market => {
                    const updatedMarket = dataToUpdate.find(u => u.marketId === market.marketId);
                    if (updatedMarket) {
                        return {
                            ...market,
                            [key]: value,
                            // Also update runner status in local state
                            runner: key === "status" ? market.runner.map(runner => ({
                                ...runner,
                                status: +value
                            })) : market.runner
                        };
                    }
                    return market;
                })
            );
        } else {
            dispatch(updateToastData({ data: "No data to update based on current filter", title: "Update Skipped", type: WARNING }));
        }
    };

    const updateRecords = (record) => {
        let dataToSend = [];
        let isSaveAll = false;
        if (record) {
            dataToSend = [record];
        } else {
            dataToSend = filterDataBySelectedCategories(data).map(market => ({
                ...market,
                isSendData: true
            }));
            isSaveAll = true;
        }
        dataToSend = formatDataBeforeSend(dataToSend);
        if (!isEmpty(dataToSend)) {
            saveData({ dataToSave: dataToSend, action: isSaveAll ? "SAVE_ALL" : false });
        } else {
            dispatch(updateToastData({ data: "No data to save based on current filter", title: "Save Skipped", type: WARNING }));
        }
    };

    const handleSingleAction = (record, key, value) => {
        const updatedRecord = { ...record, [key]: value }
        const dataToSend = formatDataBeforeSend([updatedRecord])
        saveData({ dataToSave: dataToSend })
    }

    const saveData = async ({ dataToSave, action }) => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.post(`/admin/eventMarket/updateMarketRateV1`, {
                eventMarket: dataToSave,
                action
            });

            if (response?.result) {
                const updatedData = response.result.marketList || [];
                setData(prevData =>
                    prevData.map(market => {
                        const updatedMarket = updatedData.find(u => u.marketId === market.marketId);
                        if (updatedMarket) {
                            return {
                                ...market,
                                ...updatedMarket,
                                runner: updatedMarket.runner || market.runner
                            };
                        }
                        return market;
                    })
                );
                setHasUnsavedChanges(false);
            }

            setIsLoading(false);
            // Handle success message and other logic...
        } catch (error) {
            setIsLoading(false);
            dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
        }
    };

    const handleLineRatio = (value) => {
        setLineRatio(value)
        const lineRatioToSend = (value || 5) / 5
        const updatedData = data?.map(market => {
            market["lineRatio"] = +lineRatioToSend.toFixed(2)
            return market
        })
        setData(updatedData)
    }

    const formatAPIDataForState = ({ responseData, teamData }) => {
        let highestLineRatio = 1
        let updatedDatalist = responseData.map(eventMarket => {
            if ((eventMarket.marketTypeCategoryId === lineRatioForMarketCategoryId)
                && (highestLineRatio < (+eventMarket.lineRatio || 0)))
                highestLineRatio = +eventMarket.lineRatio
            // Don't spread runner properties at market level
            if (eventMarket.runner) {
                return {
                    ...eventMarket,
                    predefinedValue: eventMarket.predefinedValue, // Explicitly preserve predefinedValue
                    teamName: teamData[eventMarket.teamId],
                    // Keep the original market status
                    status: eventMarket.status,
                    // Keep runners as an array
                    runner: Array.isArray(eventMarket.runner) ? eventMarket.runner : [eventMarket.runner]
                }
            }
            return null
        }).filter(x => x)

        updatedDatalist = _.orderBy(updatedDatalist, ['marketId'], ['asc']);
        return { data: updatedDatalist, lineRatio: highestLineRatio * 5 }
    }

    const formatSocketDataForState = (responseData) => {
        if (!isEmpty(responseData)) {
            const newMarketData = {};

            responseData.forEach(eventMarketString => {
                if (typeof eventMarketString === "string") {
                    const eventMarket = JSON.parse(eventMarketString);
                    // Ensure the runner is always treated as an array
                    let runners = Array.isArray(eventMarket.runner) ? eventMarket.runner.map(runner => ({
                        runnerId: runner.runnerId,
                        runnerName: runner.runner,
                        line: runner.line,
                        overRate: runner.overRate,
                        underRate: runner.underRate,
                        status: +runner.status, // Ensure status is a number
                        backPrice: runner.backPrice,
                        layPrice: runner.layPrice,
                        backSize: runner.backSize,
                        laySize: runner.laySize
                    })) : [{
                        runnerId: eventMarket.runnerId,
                        runnerName: eventMarket.runner,
                        line: eventMarket.line,
                        overRate: eventMarket.overRate,
                        underRate: eventMarket.underRate,
                        status: +eventMarket.status, // Ensure status is a number
                        backPrice: eventMarket.backPrice,
                        layPrice: eventMarket.layPrice,
                        backSize: eventMarket.backSize,
                        laySize: eventMarket.laySize
                    }];

                    let updatedMarketData = {
                        ...eventMarket,
                        teamName: teams[eventMarket.teamId],
                        predefinedValue: eventMarket.predefinedValue,
                        isNewSocketData: true,
                        margin: parseFloat(eventMarket.margin).toFixed(2), // Preserve margin formatting
                        runner: runners // Ensure runner is always an array
                    };

                    // Remove redundant fields from the top level after mapping runner
                    const redundantFields = ['runnerId', 'line', 'overRate', 'underRate', 'backPrice', 'layPrice', 'backSize', 'laySize'];
                    redundantFields.forEach(field => delete updatedMarketData[field]);

                    // Ensure that the new data replaces old data in the market
                    newMarketData[eventMarket.marketId] = updatedMarketData;
                }
            });

            setData(prevData => {
                // Replace the existing market data with the new market data from the socket
                const updatedData = prevData.map(market => {
                    const newMarket = newMarketData[market.marketId];
                    if (newMarket) {
                        return {
                            ...market,
                            ...newMarket,
                            // Ensure runner remains an array
                            runner: Array.isArray(newMarket.runner) ? newMarket.runner : [newMarket.runner]
                        };
                    }
                    return market;
                });
                // Add new markets that are in newMarketData but not in prevData
                const newMarkets = Object.keys(newMarketData)
                    .filter(marketId => {
                        // Check if marketId is already in prevData or updatedData
                        const existsInPrevData = updatedData.some(market => parseInt(market.marketId) === parseInt(marketId));
                        return !existsInPrevData; // Only include new markets
                    })
                    .map(marketId => ({
                        marketId: parseInt(marketId),
                        ...newMarketData[marketId],
                        runner: Array.isArray(newMarketData[marketId].runner) ? newMarketData[marketId].runner : [newMarketData[marketId].runner]
                    }));

                // Combine updatedData with newMarkets
                const combinedData = [...updatedData, ...newMarkets];

                // Filter based on statusListToInclude
                const finalDataToSet = combinedData.filter(e => statusListToInclude.includes(e.status));

                setTimeout(() => {
                    setData((storedData) =>
                        storedData.map(element => ({ ...element, isNewSocketData: false }))
                    );
                    setHasUnsavedChanges(false);
                }, 3000);

                const sortedData = _.orderBy(finalDataToSet, ['marketId'], ['asc']);
                return sortedData;
            });
            setIsDataFromApiOrSocket(true);
        }
    };

    const fetchTableData = async (commentaryId) => {
        await axiosInstance
            .post("/admin/eventMarket/marketListByCIdV1", { commentaryId })
            .then((response) => {
                if (response?.result) {
                    const teamsObj = {}
                    const newCategoryObj = {}
                    response?.result?.teams?.forEach(team => { teamsObj[team.teamId] = team.teamName })
                    response?.result?.categories?.forEach(category => { newCategoryObj[category.marketTypeCategoryId] = category.categoryName })
                    const formattedData = formatAPIDataForState({ responseData: response?.result?.marketList || [], teamData: teamsObj })
                    setTeams(teamsObj)
                    setData(formattedData.data);
                    setIsDataFromApiOrSocket(true);
                    setCategories(newCategoryObj)
                    // setLineRatio(formattedData.lineRatio)
                }
            })
            .catch((error) => {
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                // setIsLading(false);
            });
    };

    const fetchCommentaryInfo = async () => {
        setIsLoading(true);
        await axiosInstance
            .post("/admin/commentary/getEventDetailsByCId", { commentaryId })
            .then((response) => {
                if (response?.result?.es) {
                    setCommentaryInfo(response.result.es);
                    setLineRatio(+response.result.es?.lr);
                    setIsLineRatioInitialized(+response.result.es?.lr);
                }
                setIsLoading(false);
            })
            .catch((error) => {
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                setIsLoading(false);
            });
    }

    const handleBackClick = () => {
        navigate("/commentary");
    };

    const updateLineAndDependency = (record, newValue) => {
        if (record.marketTypeCategoryId === 31) {
            const roundedLine = Math.round(parseFloat(newValue));
            let updatedRecord = { ...record };

            setData(prevData => {
                const teamMarkets = prevData.filter(
                    m => m.marketTypeCategoryId === 31 &&
                        m.teamId === record.teamId
                );
                const currentIndex = teamMarkets.findIndex(m => m.marketId === record.marketId);

                if (currentIndex > 0) {
                    const previousMarket = teamMarkets[currentIndex - 1];
                    const previousLine = previousMarket.line || 0;
                    updatedRecord.predefinedValue = roundedLine - previousLine;
                } else {
                    updatedRecord.predefinedValue = roundedLine;
                }

                updatedRecord.line = roundedLine;
                if (updatedRecord.runner && updatedRecord.runner.length > 0) {
                    updatedRecord.runner = updatedRecord.runner.map(runner => ({
                        ...runner,
                        line: roundedLine,
                        layPrice: roundedLine,
                        backPrice: (record?.marketTypeId == marketTypeObj?.Fancy ||
                            record?.marketTypeId == marketTypeObj?.LineMarket)
                            ? roundedLine + parseFloat(record?.rateDiff || 0)
                            : roundedLine + 1
                    }));
                }

                updatedRecord = generateOverUnderLineType({
                    ...updatedRecord,
                    margin: updatedRecord.margin,
                    lineType: updatedRecord.lineType,
                    marketTypeId: updatedRecord.marketTypeId,
                    rateDiff: updatedRecord?.rateDiff
                }, marketTypeObj);

                const updatedMarkets = updateSubsequentLines(teamMarkets, currentIndex, roundedLine);

                return prevData.map(market => {
                    if (market.marketId === record.marketId) return updatedRecord;
                    const updatedMarket = updatedMarkets.find(m => m.marketId === market.marketId);
                    return updatedMarket || market;
                });
            });

            setHasUnsavedChanges(true);
        } else {
            let updatedRecord = { ...record };
            const originalData = originalMarketData[record.marketId];

            if (record.runner && record.runner.length === 1) {
                const roundedLine = Math.round(parseFloat(newValue));

                if ([12, 29, 30].includes(record.marketTypeCategoryId)) {
                    updatedRecord.predefinedValue = newValue - (originalData?.playerScore || 0);
                    updatedRecord.lineDifference = updatedRecord.predefinedValue - (originalData?.predefinedValue || 0);
                } else {
                    const lineDifference = newValue - (originalData?.line || 0);
                    updatedRecord.lineDifference = lineDifference;
                    updatedRecord.predefinedValue = (originalData?.predefinedValue || 0) + lineDifference;
                }

                updatedRecord.runner = [{
                    ...record.runner[0],
                    line: newValue,
                    layPrice: roundedLine,
                    backPrice: (record?.marketTypeId == marketTypeObj?.Fancy ||
                        record?.marketTypeId == marketTypeObj?.LineMarket)
                        ? roundedLine + parseFloat(record?.rateDiff || 0)
                        : roundedLine + 1
                }];

                updatedRecord.runner[0] = generateOverUnderLineType({
                    ...updatedRecord.runner[0],
                    margin: updatedRecord.margin,
                    lineType: updatedRecord.lineType,
                    marketTypeId: updatedRecord.marketTypeId,
                    rateDiff: updatedRecord?.rateDiff
                }, marketTypeObj);
            } else {
                const roundedLine = Math.round(parseFloat(newValue));
                updatedRecord.line = newValue;
                updatedRecord.layPrice = roundedLine;
                updatedRecord.backPrice = (record?.marketTypeId == marketTypeObj?.Fancy ||
                    record?.marketTypeId == marketTypeObj?.LineMarket)
                    ? roundedLine + parseFloat(record?.rateDiff || 0)
                    : roundedLine + 1;
                updatedRecord = generateOverUnderLineType(updatedRecord, marketTypeObj);
            }

            const indexOfData = data.findIndex(i => i.marketId === record.marketId);
            if (indexOfData !== -1) {
                setData(prev => [
                    ...prev.slice(0, indexOfData),
                    updatedRecord,
                    ...prev.slice(indexOfData + 1),
                ]);
                setHasUnsavedChanges(true);
            }
        }
    };

    const handleDS = (id) => {
        localStorage.setItem('EventMarketDataLogId', "" + id);
        const url = new URL(window.location.origin + "/marketDataLogs");
        url.searchParams.append("eventMarketId", id);
        window.open(url.href, '_blank');
    };

    const columns = [
        {
            title: "Team",
            dataIndex: "teamName",
            render: (text, record) => (
                <>
                    <div>{text}</div>
                    <div>{`Innings ${record?.inningsId}`}</div>
                </>
            ),
            key: "teamName",
            className: "p-0",
            columnClassName: "p-1"
        },
        {
            title: "Market",
            dataIndex: "marketId",
            render: (text, record) => (
                <span
                    style={{ cursor: "pointer" }}
                    onClick={() => { handleDS(text) }}>
                    <div>{`${text}[${record.runnerId}]`}</div>
                    <div className={record.isNewSocketData ? "bg-yellow" : ""}>{record?.marketName}</div>
                </span>
            ),
            key: "marketId",
            className: "p-0",
            columnClassName: "p-1"
        },
        {
            title: "Status",
            dataIndex: "status",
            render: (text, record) => (
                <select
                    className="form-control small-text-fields"
                    value={text}
                    onChange={(e) => {
                        handleValueChange(record, "status", +e.target.value);
                    }}
                >
                    {Object.entries(OPEN_MARKET_STATUS).map(([key, value]) =>
                        <option key={key} value={key}>{value}</option>
                    )}
                </select>
            ),
            key: "status",
            className: "p-0",
            columnClassName: "p-1"
        },
        {
            title: "Line",
            dataIndex: "line",
            render: (text, record) => (
                <CustomInput
                    className="form-control small-text-fields input-line-field"
                    value={text === null ? "" : text}
                    onChange={(newValue) => updateLineAndDependency(record, newValue)}
                />
            ),
            key: "line",
            className: "p-0 input-line-field",
            columnClassName: "p-1"
        },
        {
            title: "",
            dataIndex: "lineVal",
            render: (text, record) => (
                <div className="d-flex align-items-center gap-1">
                    <Button
                        className="form-control line-text-fields"
                        onClick={() => updateLineAndDependency(record, record?.line - 2)}
                    >
                        {Math.round(record?.line) - 2}
                    </Button>
                    <Button
                        className="form-control line-text-fields"
                        onClick={() => updateLineAndDependency(record, record?.line - 1)}
                    >
                        {Math.round(record?.line) - 1}
                    </Button>
                    <Button
                        className="form-control line-center-text-fields"
                        onClick={() => updateLineAndDependency(record, record?.line)}
                    >
                        {Math.round(record?.line)}
                    </Button>
                    <Button
                        className="form-control line-text-fields"
                        onClick={() => updateLineAndDependency(record, record?.line + 1)}
                    >
                        {Math.round(record?.line) + 1}
                    </Button>
                    <Button
                        className="form-control line-text-fields"
                        onClick={() => updateLineAndDependency(record, record?.line + 2)}
                    >
                        {Math.round(record?.line) + 2}
                    </Button>
                </div>
            ),
            key: "lineVal",
            className: "p-0",
            columnClassName: "p-1"
        },
        {
            title: "R-Rate",
            render: (text, record) => (<span>{`${(+record.line / +record.over)?.toFixed(2)}`}</span>),
            key: "inningsId",
            className: "p-0",
            columnClassName: "p-1"
        },
        {
            title: "R-No",
            dataIndex: "layPrice",
            render: (text, record) => (
                <CustomInput
                    className="form-control small-text-fields input-no-field"
                    value={text === null ? "" : text}
                    onChange={(newValue) => handleValueChange(record, "layPrice", newValue)}
                />
            ),
            key: "layPrice",
            className: "p-0 input-no-field",
            columnClassName: "p-1"

        },
        {
            title: "R-Yes",
            dataIndex: "backPrice",
            render: (text, record) => (
                <CustomInput
                    className="form-control small-text-fields input-yes-field"
                    value={text === null ? "" : text}
                    onChange={(newValue) => handleValueChange(record, "backPrice", newValue)}
                />
            ),
            key: "backPrice",
            className: "p-0 input-yes-field",
            columnClassName: "p-1"

        },
        {
            title: "Active",
            dataIndex: "isActive",
            render: (text, record) => (
                <Button
                    color={`${record.isActive ? "primary" : "danger"}`}
                    size="sm"
                    className="btn"
                    onClick={() => {
                        handleSingleAction(record, "isActive", !record.isActive);
                    }}
                >
                    <i className={`bx ${record.isActive ? "bx-check" : "bx-block"}`}></i>
                </Button>
            ),
            key: "isActive",
            className: "p-0",
            columnClassName: "p-1",
            style: { width: "2%", textAlign: "center" },
        },
        {
            title: "Allow",
            dataIndex: "isAllow",
            render: (text, record) => (
                <Button
                    color={`${record.isAllow ? "primary" : "danger"}`}
                    size="sm"
                    className="btn"
                    onClick={() => {
                        handleSingleAction(record, "isAllow", !record.isAllow);
                    }}
                >
                    <i className={`bx ${record.isAllow ? "bx-check" : "bx-block"}`}></i>
                </Button>
            ),
            key: "isAllow",
            className: "p-0",
            columnClassName: "p-1",
            style: { width: "2%", textAlign: "center" },
        },
        {
            title: "Send",
            dataIndex: "isSendData",
            render: (text, record) => (
                <Button
                    color={`${record.isSendData ? "primary" : "danger"}`}
                    size="sm"
                    className="btn"
                    onClick={() => {
                        handleSingleAction(record, "isSendData", !record.isSendData);
                    }}
                >
                    <i className={`bx ${record.isSendData ? "bx-check" : "bx-block"}`}></i>
                </Button>
            ),
            style: { width: "2%", textAlign: "center" },
            className: "p-0",
            columnClassName: "p-1",
        },
        {
            title: "L-Ratio",
            dataIndex: "lineRatio",
            render: (text, record) => (
                <Input
                    className="form-control small-text-fields"
                    type="number"
                    step={0.1}
                    min={0}
                    value={text === null ? "" : text}
                    onChange={(e) => handleValueChange(record, "lineRatio", e.target.value)}
                />
            ),
            key: "underRate",
            className: "p-0",
            columnClassName: "p-1"
        },
        {
            title: "Save",
            render: (text, record) => (
                <Button color="primary" className="small-button" onClick={() => updateRecords(record)}>Save</Button>
            ),
            key: "isSendData",
            className: "p-0",
            columnClassName: "p-1"
        },
        {
            title: "Margin",
            dataIndex: "margin",
            render: (text, record) => (
                <CustomInput
                    className="form-control small-text-fields"
                    value={text === null ? "" : text}
                    onChange={(newValue) => handleValueChange(record, "margin", newValue)}
                />
            ),
            key: "margin",
            className: "p-0",
            columnClassName: "p-1"
        },
        {
            title: "Under",
            dataIndex: "underRate",
            render: (text, record) => (
                <CustomInput
                    className="form-control small-text-fields input-under-field"
                    value={text === null ? "" : text}
                    onChange={(newValue) => handleValueChange(record, "underRate", newValue)}
                />
            ),
            key: "underRate",
            className: "p-0 input-under-field",
            columnClassName: "p-1"

        },
        {
            title: "Over",
            dataIndex: "overRate",
            render: (text, record) => (
                <CustomInput
                    className="form-control small-text-fields input-over-field"
                    value={text === null ? "" : text}
                    onChange={(newValue) => handleValueChange(record, "overRate", newValue)}
                />
            ),
            key: "overRate",
            className: "p-0 input-over-field",
            columnClassName: "p-1"

        },
        {
            title: "P-No",
            dataIndex: "laySize",
            render: (text, record) => (
                <CustomInput
                    className="form-control small-text-fields input-no-field"
                    value={text === null ? "" : text}
                    onChange={(newValue) => handleValueChange(record, "laySize", newValue)}
                />
            ),
            key: "laySize",
            className: "p-0 input-no-field",
            columnClassName: "p-1"

        },
        {
            title: "P-Yes",
            dataIndex: "backSize",
            render: (text, record) => (
                <CustomInput
                    className="form-control small-text-fields input-yes-field"
                    value={text === null ? "" : text}
                    onChange={(newValue) => handleValueChange(record, "backSize", newValue)}
                />
            ),
            key: "backSize",
            className: "p-0 input-yes-field",
            columnClassName: "p-1"

        },
        {
            title: "Rate Diff",
            dataIndex: "rateDiff",
            render: (text, record) => (
                <CustomInput
                    className="form-control small-text-fields"
                    value={text === null ? "" : text}
                    onChange={(newValue) => handleValueChange(record, "rateDiff", newValue)}
                />
            ),
            key: "rateDiff",
            className: "p-0",
            columnClassName: "p-1"
        },
        {
            title: "Pre",
            dataIndex: "predefinedValue",
            render: (text, record) => {
                // Only show for single runner markets
                if (record.runner && record.runner.length === 1) {
                    return (
                        <CustomInput
                            className="form-control small-text-fields"
                            value={text === null ? "" : text}
                            onChange={(newValue) => handleValueChange(record, "predefinedValue", newValue)}
                        />
                    );
                }
                return null;
            },
            key: "predefinedValue",
            className: "p-0",
            columnClassName: "p-1",
            hidden: true
        },
    ];

    const lineRatioField = <>
        <Col className="mt-2" xs={3} md={2} lg={2}>
            <div><b>Line Ratio:</b></div>
        </Col>
        <Col className="mt-2" xs={3} md={2} lg={2}>
            <Input
                className="form-control small-text-fields"
                type="number"
                step={0.05}
                min={0}
                max={10}
                value={Number(lineRatio).toFixed(2)}
                onChange={(e) => {
                    handleLineRatio(e.target.value)
                }}
            />
        </Col>
    </>
    const handleKeyPress = (event) => {
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT') {
            return; // Don't trigger shortcuts if focus is on input or select elements
        }
        const key = event.key.toLowerCase();
        switch (key) {
            case 'a':
                updateRecords();
                break;
            case 's':
                handleAction({ changeIn: data, key: "isSendData", value: true, action: "SEND_ALL" });
                break;
            case 'd':
                handleAction({ changeIn: data, key: "status", value: OPEN_VALUE, action: "PUBLISH" });
                break;
            case 'z':
                handleAction({ changeIn: data, key: "status", value: SUSPEND_VALUE, action: "SUSPEND" });
                break;
            default:
                break;
        }
    }

    const toggleAccordion = (id) => {
        setOpenAccordions((prevOpenAccordions) => {
            if (prevOpenAccordions.includes(id)) {
                return prevOpenAccordions.filter((accordionId) => accordionId !== id);
            } else {
                return [...prevOpenAccordions, id];
            }
        });
    };


    useEffect(() => {
        if (commentaryId !== "0") {
            fetchTableData(commentaryId);
            fetchCommentaryInfo(commentaryId)
        }
    }, []);

    useEffect(() => {
        if (!isEmpty(teams)) {
            if (socket) {
                socket.emit(OPEN_MARKET_CONNECT, { commentaryId });
                setIsSocketConnected(true)
                socket.on(OPEN_MARKET_DATA, (socketData) => {
                    formatSocketDataForState(socketData || [])
                });
            } else {
                setIsSocketConnected(false)
                fetchConfigAll();
            }
        }
        return () => {
            socket.off(OPEN_MARKET_DATA);
        };
    }, [teams])

    useEffect(() => {
        if (isAutoUpdate && !isSocketConnected) {
            intervalIdRef.current = setInterval(() => {
                if (commentaryId !== "0") {
                    fetchTableData(commentaryId);
                }
            }, autoInterval);
        } else {
            clearInterval(intervalIdRef.current);
        }
        return () => {
            clearInterval(intervalIdRef.current);
        };
    }, [isAutoUpdate, isSocketConnected])

    useEffect(() => {
        const tempCategorisedData = {}
        if (!isEmpty(data)) {
            window.addEventListener('keydown', handleKeyPress);
            data.forEach(market => {

                tempCategorisedData[categories[market.marketTypeCategoryId]] =
                    [].concat(
                        tempCategorisedData[categories[market.marketTypeCategoryId]] || [], [market]
                    )
            })
            setCategorisedData(tempCategorisedData)
        } else {
            window.removeEventListener('keydown', handleKeyPress);
        }
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [data])

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [data, selectedCategories]);

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid={true}>
                    <Row>
                        <Card>
                            <CardBody>
                                {isLoading && <SpinnerModel />}
                                <Row>
                                    <Col >
                                        <Breadcrumbs title="ScoreCard" breadcrumbItem="Open Market" page="updatecp" />
                                    </Col>
                                    <Col className="p-0" xs={2} md={2} lg={1}>
                                        <button className="table-header-button btn btn-color-yellow" onClick={() => handleAction({ changeIn: data, key: "status", value: INACTIVE_VALUE })}>{INACTIVE}</button>
                                        <button className="table-header-button btn btn-color-orange" onClick={() => handleAction({ changeIn: data, key: "status", value: SUSPEND_VALUE, action: "SUSPEND" })}>{SUSPEND}</button>
                                    </Col>
                                    <Col className="p-0" xs={2} md={2} lg={1}>
                                        <Button color="primary" className="table-header-button" onClick={() => handleAction({ changeIn: data, key: "isAllow", value: true })}>{ALLOW}</Button>
                                        <Button color="danger" className="table-header-button" onClick={() => handleAction({ changeIn: data, key: "isAllow", value: false })}>{NOT_ALLOW}</Button>
                                    </Col>
                                    <Col className="p-0" xs={2} md={2} lg={1}>
                                        <Button color="primary" className="table-header-button" onClick={() => handleAction({ changeIn: data, key: "isActive", value: true })}>{ACTIVE}</Button>
                                        <Button color="danger" className="table-header-button" onClick={() => handleAction({ changeIn: data, key: "isActive", value: false })}>{DEACTIVE}</Button>
                                    </Col>
                                    <Col className="p-0" xs={2} md={2} lg={1}>
                                        {isSocketConnected ?
                                            <span className="mx-3 live-css" /> :
                                            <Button color={isAutoUpdate ? "danger" : "primary"} className="table-header-button" onClick={() => setIsAutoUpdate(!isAutoUpdate)}>{isAutoUpdate ? "AE" : "AS"}</Button>
                                        }
                                        <Button color="primary" className="table-header-button" onClick={() => fetchTableData(commentaryId)}>
                                            <i className='bx bx-refresh'></i></Button>
                                    </Col>
                                    <Col className="p-0" xs={2} md={1} lg={1}>
                                        <button className="btn btn-danger p-1" onClick={handleBackClick}>Back</button>
                                    </Col>
                                </Row>
                                <Row>
                                    {!isEmpty(commentaryInfo) && <Col className="mb-1">
                                        <div className='match-details-breadcrumbs'>{`${commentaryInfo.ety}/ ${commentaryInfo.com}/ ${commentaryInfo.en}/ Ref: ${commentaryInfo.eid} [ ${commentaryInfo.ed + " " + commentaryInfo.et} ]`}</div>
                                    </Col>
                                    }
                                </Row>
                                {data.length > 0 &&
                                    <Row>
                                        <Col className="mt-2" xs={12} md={12} lg={12}>
                                            <div><b>Filter Categories:</b></div>
                                            <Select
                                                isMulti
                                                name="categories"
                                                options={Object.entries(categories).map(([id, name]) => ({ value: +id, label: name }))}
                                                className="basic-multi-select"
                                                classNamePrefix="select"
                                                value={selectedCategories}
                                                onChange={handleCategoryChange}
                                            />
                                        </Col>
                                        {lineRatioField}
                                        <Col className="p-0 d-flex" xs={12} md={6} lg={6}>
                                            <Button
                                                color="primary"
                                                // style={{ opacity: hasUnsavedChanges && selectedCategories.length > 0 ? 1 : 0.65 }}
                                                className="table-header-button"
                                                onClick={() => handleAction({ changeIn: data, key: "isSendData", value: true, action: "SEND_ALL" })}
                                                disabled={selectedCategories.length === 0}
                                            > {`${SEND_ALL} (S)`}</Button>
                                            <Button
                                                color="primary"
                                                className="table-header-button"
                                                onClick={() => handleAction({ changeIn: data, key: "status", value: OPEN_VALUE, action: "PUBLISH" })}
                                                disabled={selectedCategories.length === 0}
                                            >{`Publish (D)`}</Button>
                                            <Button
                                                color="primary"
                                                className="table-header-button"
                                                style={{ opacity: hasUnsavedChanges && selectedCategories.length > 0 ? 1 : 0.65 }}
                                                onClick={() => updateRecords()}
                                                disabled={selectedCategories.length === 0}
                                            >{`Save All (A)`}</Button>
                                        </Col>
                                    </Row>}
                                {Object.keys(categorisedData).length > 0 && (
                                    <OpenMarketCategories
                                        categorisedData={categorisedData}
                                        columns={columns}
                                        teams={teams}
                                        handleMultiRunnerUpdate={handleMultiRunnerUpdate}
                                        setIsLoading={setIsLoading}
                                        openAccordions={openAccordions}
                                        toggleAccordion={toggleAccordion}
                                    />
                                )}
                            </CardBody>
                        </Card>
                    </Row>
                </Container>
            </div>
        </React.Fragment >

    )
}
