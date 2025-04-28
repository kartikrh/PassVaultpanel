import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { CONNECT_COMMENTARY, ERROR, OPEN_MARKET_CONNECT, OPEN_MARKET_DATA, SUCCESS, UNDO_CALLED, UPDATE_BALL_STATUS, UPDATE_MARKET_DATA, WARNING } from "../../components/Common/Const";
import { Button, Card, CardBody, Col, Container, Input, Row, } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { updateToastData } from "../../Features/toasterSlice";
import axiosInstance from "../../Features/axios";
import { ACTIVE, ALLOW, DEACTIVE, INACTIVE, INACTIVE_VALUE, NOT_ALLOW, OPEN_MARKET_STATUS, SEND_ALL, SUSPEND, SUSPEND_VALUE, OPEN_VALUE, ALL_SUSPEND } from "./CommentartConst";
import "./CommentaryCss.css"
import _, { isEmpty } from "lodash";
import { generateOverUnderLineType } from "./functions";
import createSocket from "../../Features/socket";
import CustomInput from "../../components/Common/Reusables/CustomInput";
import Select from "react-select";
import OpenMarketCategories from "./OpenMarketCategoryRendering";
import Switch from "react-switch";
import { loadInit } from "../../config";

export const OpenMarket = () => {
    const [data, setData] = useState([]);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [teams, setTeams] = useState({});
    const [playersMarketShow, setPlayerMarketShow] = useState(false);
    const [players, setPlayers] = useState({});
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
    const [isScorecardShow, setIsScorecardShow] = useState(false);
    const [isPointsShow, setIsPointsShow] = useState(false);
    const [isKeyPressed, setIsKeyPressed] = useState(false);
    const [input, setInput] = useState("");
    const [ballStatus, setBallStatus] = useState(null);
    const [teamsData, setTeamsData] = useState([]);
    const commentaryId = +localStorage.getItem('openMarketCommentaryId') || "0";
    const intervalIdRef = useRef(null);
    const socketRef = useRef(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const marketTypeObj = useSelector((state) => state.marketType?.marketTypeList);
    const loadInitData = useSelector((state) => state.loadInit.loadInitData);
    // const socket = createSocket();
    const statusListToInclude = [1, 2, 3]
    const lineRatioForMarketCategoryId = 23
    let scorecardFrameUrl = loadInitData.find(item => item.key === loadInit.SCORECARD_FRAME_URL)?.value;
    if (scorecardFrameUrl) {
        scorecardFrameUrl = scorecardFrameUrl.replace("{eventId}", commentaryInfo?.eid);
    }
    const [keys, setKeys] = useState(() => {
        const savedKeys = localStorage.getItem("editableKeys");
        return savedKeys
            ? JSON.parse(savedKeys)
            : [
                { key: "Q", QNo: 180, QYes: 120 },
                { key: "W", WNo: 140, WYes: 100 },
                { key: "E", ENo: 140, EYes: 110 },
                { key: "R", RNo: 150, RYes: 115 },
                { key: "T", TNo: 225, TYes: 125 },
                { key: "Y", YNo: 250, YYes: 150 },
                { key: "U", UNo: 300, UYes: 200 },
                { key: "I", INo: 400, IYes: 300 },
                { key: "O", ONo: 500, OYes: 300 },
                { key: "P", PNo: 120, PYes: 100 },
                { key: "A", ANo: 105, AYes: 95 },
                { key: "S", SNo: 140, SYes: 90 },
                { key: "D", DNo: 250, DYes: 125 },
                { key: "F", FNo: 400, FYes: 250 },
                { key: "G", GNo: 200, GYes: 140 },
                { key: "H", HNo: 2, HYes: null },
                { key: "J", JNo: 3, JYes: null },
                { key: "K", KNo: 55, KYes: 40 },
                { key: "L", LNo: 100, LYes: 80 },
                { key: "Z", ZNo: 100, ZYes: 85 },
                { key: "X", XNo: 150, XYes: 100 },
                { key: "C", CNo: 110, CYes: 90 },
                { key: "V", VNo: 110, VYes: 95 },
                { key: "B", BNo: 115, BYes: 85 },
                { key: "N", NNo: 120, NYes: 80 },
                { key: "M", MNo: 125, MYes: 75 },
            ];
    });
    const [selectedKey, setSelectedKey] = useState("C");

    useEffect(() => {
        socketRef.current = createSocket();

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    useEffect(() => {
        const socket = socketRef.current;

        if (!socket || !commentaryId) return;

        // Connect to sockets only if we have required data
        if (!isEmpty(teams)) {
            // 1. Setup market data connection
            socket.emit(OPEN_MARKET_CONNECT, { commentaryId });

            // 2. Setup commentary connection
            socket.emit(CONNECT_COMMENTARY, { commentaryId });

            // 3. Important: explicitly emit connectEventMarket
            // socket.emit('connectEventMarket', { commentaryId });

            // 4. Set up all event listeners
            socket.on(OPEN_MARKET_DATA, (socketData) => {
                formatSocketDataForState(socketData || []);
            });

            socket.on(UPDATE_MARKET_DATA, (marketData) => {
                if (marketData) {
                    handleMarketUpdate(marketData);
                }
            });

            socket.on(UNDO_CALLED, (data) => {
                if (data) {
                    dispatch(
                        updateToastData({
                            data: `${data?.message}`,
                            title: "Undo Called",
                            type: WARNING,
                        })
                    );
                }
            });

            socket.on(UPDATE_BALL_STATUS, (data) => {
                if (data) {
                    setBallStatus(data?.ballStatus);
                }
            });

            // 5. Handle reconnection case
            socket.on('connect', () => {
                // Re-establish all connections on reconnect
                socket.emit(OPEN_MARKET_CONNECT, { commentaryId });
                socket.emit(CONNECT_COMMENTARY, { commentaryId });
                // socket.emit('connectEventMarket', { commentaryId });
            });

            setIsSocketConnected(true);
        } else {
            setIsSocketConnected(false);
            fetchConfigAll();
        }

        // Clean up function to remove all listeners
        return () => {
            if (socket) {
                socket.off(OPEN_MARKET_DATA);
                socket.off(UPDATE_MARKET_DATA);
                socket.off(UNDO_CALLED);
                socket.off(UPDATE_BALL_STATUS);
                socket.off('connect');
            }
        };
    }, [teams, commentaryId]);

    const handleKeyValueChange = (index, fieldName, newValue) => {
        const updatedKeys = [...keys];
        updatedKeys[index][fieldName] = Number(newValue) || "";
        setKeys(updatedKeys);
        localStorage.setItem("editableKeys", JSON.stringify(updatedKeys));
    };

    const handleSelectedKeyChange = (event) => {
        const newKey = event.target.value.toUpperCase();
        setSelectedKey(newKey);
    };
    // const scoreCardUrl = process.env.REACT_APP_SCORECARD_URL || "https://deployed.live";
    // const scoreboardUrl = `${scoreCardUrl}/scoreboard?id=${commentaryInfo?.eid}&color=000`;
    // console.log({ originalMarketData, categorisedData });
    // console.log({ isKeyPressed })

    // console.log("############################################", { originalMarketData }, "############################################")
    useEffect(() => {
        if (!isEmpty(commentaryInfo))
            document.title = `Open Market - ${commentaryInfo?.en} [${commentaryInfo?.eid}]`;
    }, [commentaryInfo])

    const filterDataBySelectedCategories = (dataToFilter) => {
        if (selectedCategories.length === 0) return [];
        return dataToFilter.filter(item =>
            selectedCategories.some(category => category.value === item.marketTypeCategoryId)
        );
    };

    const handleKeyClick = (key) => {
        setInput((prev) => prev + key);
    };

    useEffect(() => {
        if (!isEmpty(data) && isDataFromApiOrSocket) {
            updateOriginalValues(data)
            setIsDataFromApiOrSocket(false); // Reset flag after updating
        }
    }, [data, isDataFromApiOrSocket]);

    const updateOriginalValues = (dataToWorkWith) => {
        const newOriginalData = {};
        dataToWorkWith.forEach(market => {
            if (market.runner && market.runner.length === 1) {
                newOriginalData[market.marketId] = {
                    line: market.runner[0].line,
                    predefinedValue: market.predefinedValue,
                    playerScore: market.playerScore
                };
            }
        });
        setOriginalMarketData(newOriginalData);
    }
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

    const upSendMarket = async (payload) => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.post("/admin/eventMarket/upSendMarket", payload);
            if (response?.result) {
                setIsKeyPressed(false);
                setIsLoading(false);
                dispatch(updateToastData({ data: response?.result, title: response?.title, type: SUCCESS }));
            }
        } catch (error) {
            setIsKeyPressed(false);
            setIsLoading(false);
            dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
        }
    };

    const loadMarketData = async (commentaryId) => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.post("/admin/eventMarket/loadMarketByCom", { commentaryId });
            if (response?.result) {
                setIsLoading(false);
                dispatch(updateToastData({ data: response?.result, title: response?.title, type: SUCCESS }));
            }
        } catch (error) {
            setIsLoading(false);
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
            const response = await axiosInstance.post("/configs");

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

    const OffsymbolStatus = () => {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                    fontSize: 10,
                    color: "#fff",
                    paddingRight: "10px",
                }}
            >
                {" "}
                ScoreCard
            </div>
        );
    };
    const OnSymbolStatus = () => {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                    fontSize: 10,
                    color: "#fff",
                    paddingLeft: "11px",
                }}
            >
                {" "}
                ScoreCard
            </div>
        );
    };

    const OffsymbolPointStatus = () => {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                    fontSize: 12,
                    color: "#fff",
                    paddingRight: "10px",
                }}
            >
                {" "}
                Points
            </div>
        );
    };
    const OnSymbolPointStatus = () => {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                    fontSize: 12,
                    color: "#fff",
                    paddingLeft: "11px",
                }}
            >
                {" "}
                Points
            </div>
        );
    };
    const OffsymbolPlayerMarketStatus = () => {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                    fontSize: 12,
                    color: "#fff",
                    paddingRight: "10px",
                }}
            >
                {" "}
                Players
            </div>
        );
    };
    const OnSymbolPlayerMarketStatus = () => {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                    fontSize: 12,
                    color: "#fff",
                    paddingLeft: "11px",
                }}
            >
                {" "}
                Players
            </div>
        );
    };

    const categoryOptions = [
        { value: 'ALL', label: 'Select All' },
        ...Object.entries(categories).map(([id, name]) => ({ value: +id, label: name }))
    ];

    const formatDataBeforeSend = (dataToChange = []) => {
        return dataToChange.map(record => {
            let workingRecord = _.clone(record);
            workingRecord.rateDiff = +(workingRecord.rateDiff || 0);
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

            const formattedRecord = {
                ...workingRecord,
                status: +(workingRecord.status || 0),
                lineRatio: +(workingRecord.lineRatio || 0),
                margin: +(workingRecord.margin || 0),
            };

            // Calculate lineDiff for markets not in category 1 or 31
            if (workingRecord.marketTypeCategoryId !== 1 &&
                workingRecord.marketTypeCategoryId !== 31 &&
                workingRecord.runner?.[0]?.line &&
                originalMarketData[workingRecord.marketId]) {

                const currentLine = +(workingRecord.runner[0].line);
                const originalLine = +(originalMarketData[workingRecord.marketId].line || 0);
                const calculatedLineDiff = currentLine - originalLine;

                // Only add lineDiff if there's an actual difference
                if (calculatedLineDiff !== 0) {
                    formattedRecord.lineDiff = +calculatedLineDiff.toFixed(2);
                }
            }

            return formattedRecord;
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
        // setSelectedCategories(selectedOptions);
        // localStorage.setItem("selectedCategories", JSON.stringify(selectedOptions));
        const isSelectAll = selectedOptions.find(option => option.value === 'ALL');
        if (isSelectAll) {
            const allOptions = Object.entries(categories).map(([id, name]) => ({ value: +id, label: name }));
            setSelectedCategories(allOptions);
            localStorage.setItem("selectedCategories", JSON.stringify(allOptions));
        } else {
            setSelectedCategories(selectedOptions);
            localStorage.setItem("selectedCategories", JSON.stringify(selectedOptions));
        }
    };

    const handleValueChange = (record, key, value) => {
        setHasUnsavedChanges(true);
        setData(prevData => {
            let updatedData = [...prevData];
            const marketIndex = prevData.findIndex(market => market.marketId === record.marketId);

            if (marketIndex === -1) return prevData;

            let updatedMarket = { ...prevData[marketIndex] };

            if (key === 'predefinedValue') {
                const originalData = originalMarketData[updatedMarket.marketId];
                if (originalData && updatedMarket.runner?.length === 1) {
                    // Reset all lineDiffs to 0
                    updatedData = updatedData.map(market => ({
                        ...market,
                        lineDiff: 0
                    }));

                    const predefinedDifference = value - (originalData.predefinedValue || 0);

                    if (updatedMarket.marketTypeCategoryId === 31) {
                        updatedMarket.predefinedValue = value;
                        const newLine = (originalData.line || 0) + predefinedDifference;

                        // Calculate lineDiff only for the changed market
                        updatedMarket.lineDiff = newLine - (originalData.line || 0);

                        updatedMarket.runner = [{
                            ...updatedMarket.runner[0],
                            line: parseFloat(newLine).toFixed(2),
                            layPrice: Math.round(newLine),
                            backPrice: (updatedMarket.marketTypeId === marketTypeObj?.Fancy ||
                                updatedMarket.marketTypeId === marketTypeObj?.LineMarket)
                                ? Math.round(newLine) + parseFloat(updatedMarket.rateDiff || 0)
                                : Math.round(newLine) + 1
                        }];

                        updatedData[marketIndex] = generateOverUnderLineType(updatedMarket, marketTypeObj);

                        // Filter category31Markets to only include markets for the same team
                        const category31Markets = updatedData.filter(m => {
                            return m.marketTypeCategoryId === 31 &&
                                ((m.inningsId === updatedMarket.inningsId) && (m.teamId === updatedMarket.teamId))
                        }
                        );
                        const currentIndex = category31Markets.findIndex(m => m.marketId === record.marketId);

                        let previousLine = newLine;
                        for (let i = currentIndex + 1; i < category31Markets.length; i++) {
                            const nextMarket = category31Markets[i];
                            const nextMarketIndex = updatedData.findIndex(m => m.marketId === nextMarket.marketId);

                            if (nextMarketIndex !== -1) {
                                const nextNewLine = previousLine + nextMarket.predefinedValue;
                                updatedData[nextMarketIndex] = {
                                    ...nextMarket,
                                    runner: [{
                                        ...nextMarket.runner[0],
                                        line: parseFloat(nextNewLine).toFixed(2),
                                        layPrice: Math.round(nextNewLine),
                                        backPrice: (nextMarket.marketTypeId === marketTypeObj?.Fancy ||
                                            nextMarket.marketTypeId === marketTypeObj?.LineMarket)
                                            ? Math.round(nextNewLine) + parseFloat(nextMarket.rateDiff || 0)
                                            : Math.round(nextNewLine) + 1
                                    }]
                                };
                                updatedData[nextMarketIndex] = generateOverUnderLineType(updatedData[nextMarketIndex], marketTypeObj);
                                previousLine = nextNewLine;
                            }
                        }
                    } else {
                        const newLine = (originalData.line || 0) + predefinedDifference;
                        updatedMarket.predefinedValue = value;
                        updatedMarket.runner = [{
                            ...updatedMarket.runner[0],
                            line: parseFloat(newLine).toFixed(2),
                            layPrice: Math.round(newLine),
                            backPrice: (updatedMarket.marketTypeId === marketTypeObj?.Fancy ||
                                updatedMarket.marketTypeId === marketTypeObj?.LineMarket)
                                ? Math.round(newLine) + parseFloat(updatedMarket.rateDiff || 0)
                                : Math.round(newLine) + 1
                        }];

                        updatedData[marketIndex] = generateOverUnderLineType(updatedMarket, marketTypeObj);
                    }
                }
            } else if (key === 'status') {
                updatedMarket.status = +value;
                if (Array.isArray(updatedMarket.runner)) {
                    updatedMarket.runner = updatedMarket.runner.map(runner => ({
                        ...runner,
                        status: +value
                    }));
                }
                updatedData[marketIndex] = updatedMarket;
            } else if (key === 'line' || key === 'margin' || key === "rateDiff") {
                if (key === 'line') {
                    // console.log("originalMarketData[updatedMarket.marketId]", originalMarketData[updatedMarket.marketId])
                    const originalData = originalMarketData[updatedMarket.marketId];
                    if (originalData) {
                        // Reset all lineDiffs to 0
                        updatedData = updatedData.map(market => ({
                            ...market,
                            lineDiff: 0
                        }));
                        // console.log("originalData.line", originalData.line)
                        const lineDifference = parseFloat(value) - (originalData.line || 0);
                        updatedMarket.predefinedValue = parseFloat((originalData.predefinedValue || 0) + lineDifference).toFixed(2);

                        if (updatedMarket.marketTypeCategoryId === 31) {
                            // Calculate lineDiff only for the changed market
                            updatedMarket.lineDiff = lineDifference;

                            updatedMarket.runner = [{
                                ...updatedMarket.runner[0],
                                line: parseFloat(value),
                                layPrice: Math.round(value),
                                backPrice: (updatedMarket.marketTypeId === marketTypeObj?.Fancy ||
                                    updatedMarket.marketTypeId === marketTypeObj?.LineMarket)
                                    ? Math.round(value) + parseFloat(updatedMarket.rateDiff || 0)
                                    : Math.round(value) + 1
                            }];

                            updatedData[marketIndex] = generateOverUnderLineType(updatedMarket, marketTypeObj);

                            const category31Markets = updatedData.filter(m => {
                                return m.marketTypeCategoryId === 31 &&
                                    ((m.inningsId === updatedMarket.inningsId) && (m.teamId === updatedMarket.teamId))
                            });
                            const currentIndex = category31Markets.findIndex(m => m.marketId === record.marketId);

                            let previousLine = parseFloat(value);
                            for (let i = currentIndex + 1; i < category31Markets.length; i++) {
                                const nextMarket = category31Markets[i];
                                const nextMarketIndex = updatedData.findIndex(m => m.marketId === nextMarket.marketId);

                                if (nextMarketIndex !== -1) {
                                    const nextNewLine = previousLine + parseFloat(nextMarket.predefinedValue || 0);
                                    updatedData[nextMarketIndex] = {
                                        ...nextMarket,
                                        runner: [{
                                            ...nextMarket.runner[0],
                                            line: nextNewLine,
                                            layPrice: Math.round(nextNewLine),
                                            backPrice: (nextMarket.marketTypeId === marketTypeObj?.Fancy ||
                                                nextMarket.marketTypeId === marketTypeObj?.LineMarket)
                                                ? Math.round(nextNewLine) + parseFloat(nextMarket.rateDiff || 0)
                                                : Math.round(nextNewLine) + 1
                                        }]
                                    };
                                    updatedData[nextMarketIndex] = generateOverUnderLineType(updatedData[nextMarketIndex], marketTypeObj);
                                    previousLine = nextNewLine;
                                }
                            }
                        } else if (updatedMarket.marketTypeCategoryId === 23 && updatedMarket.isInningRun === true) {
                            // Update the current market first
                            updatedMarket.runner = [{
                                ...updatedMarket.runner[0],
                                line: parseFloat(value),
                                layPrice: Math.round(value),
                                backPrice: (updatedMarket.marketTypeId === marketTypeObj?.Fancy ||
                                    updatedMarket.marketTypeId === marketTypeObj?.LineMarket)
                                    ? Math.round(value) + parseFloat(updatedMarket.rateDiff || 0)
                                    : Math.round(value) + 1
                            }];
                            updatedData[marketIndex] = generateOverUnderLineType(updatedMarket, marketTypeObj);

                            // Find all markets with marketTypeCategoryId 23 and isInningRun true
                            const inningRunMarkets = updatedData.filter(market =>
                                market.marketTypeCategoryId === 23 &&
                                market.isInningRun === true
                            );

                            // Find the marketTypeCategoryId 36 market
                            const totalEventRunMarket = updatedData.find(market =>
                                market.marketTypeCategoryId === 36
                            );

                            if (totalEventRunMarket && inningRunMarkets.length <= 2) {
                                // Calculate sum of lines for both innings
                                const totalInningsLine = inningRunMarkets.reduce((sum, market) => {
                                    if (market.marketId === updatedMarket.marketId) {
                                        // Use the new value for the current market
                                        return sum + parseFloat(value);
                                    }
                                    return sum + (market.runner[0]?.line || 0);
                                }, 0);

                                // Add predefinedValue from marketTypeCategoryId 36
                                const newTotalLine = totalInningsLine + (totalEventRunMarket.predefinedValue || 0);

                                // Update the total event run market
                                const totalEventRunIndex = updatedData.findIndex(m => m.marketId === totalEventRunMarket.marketId);
                                if (totalEventRunIndex !== -1) {
                                    updatedData[totalEventRunIndex] = {
                                        ...totalEventRunMarket,
                                        runner: [{
                                            ...totalEventRunMarket.runner[0],
                                            line: newTotalLine,
                                            layPrice: Math.round(newTotalLine),
                                            backPrice: (totalEventRunMarket.marketTypeId === marketTypeObj?.Fancy ||
                                                totalEventRunMarket.marketTypeId === marketTypeObj?.LineMarket)
                                                ? Math.round(newTotalLine) + parseFloat(totalEventRunMarket.rateDiff || 0)
                                                : Math.round(newTotalLine) + 1
                                        }]
                                    };
                                    updatedData[totalEventRunIndex] = generateOverUnderLineType(updatedData[totalEventRunIndex], marketTypeObj);
                                }
                            }
                        } else {
                            updatedMarket.runner = updatedMarket.runner.map(runner => ({
                                ...runner,
                                [key]: value
                            }));

                            if ((updatedMarket?.marketTypeId === marketTypeObj?.Fancy ||
                                updatedMarket?.marketTypeId === marketTypeObj?.LineMarket) &&
                                Array.isArray(updatedMarket?.runner)) {
                                const marketStatus = updatedMarket?.status;
                                updatedMarket.runner = updatedMarket?.runner?.length > 0 &&
                                    updatedMarket.runner.map(runner => ({
                                        ...runner,
                                        status: marketStatus
                                    }));
                            }

                            updatedMarket = generateOverUnderLineType({
                                ...updatedMarket,
                                line: updatedMarket.runner[0]?.line,
                                backSize: updatedMarket.runner[0]?.backSize,
                                laySize: updatedMarket.runner[0]?.laySize
                            }, marketTypeObj);

                            updatedMarket.runner[0] = {
                                ...updatedMarket.runner[0],
                                backPrice: updatedMarket.backPrice,
                                layPrice: updatedMarket.layPrice,
                                backSize: updatedMarket.backSize,
                                laySize: updatedMarket.laySize,
                                overRate: updatedMarket.overRate,
                                underRate: updatedMarket.underRate,
                            };

                            updatedData[marketIndex] = updatedMarket;
                        }
                    }
                }
                else if (key === "rateDiff" && value == 0 && parseInt(updatedMarket?.marketTypeId) === marketTypeObj?.Fancy) {
                    const selectedKeyMapping = keys.find(k => k.key === selectedKey);
                    if (selectedKeyMapping) {
                        const noValue = selectedKeyMapping[`${selectedKey}No`] || 0;
                        const yesValue = selectedKeyMapping[`${selectedKey}Yes`] || 0;

                        const updatedRunner = generateOverUnderLineType({
                            ...updatedMarket,
                            rateDiff: value,
                            line: updatedMarket.runner[0]?.line,
                            backSize: yesValue,
                            laySize: noValue,
                        }, marketTypeObj);
                        updatedMarket.runner = updatedMarket.runner.map(runner => ({
                            ...runner,
                            ...updatedRunner
                        }));
                        updatedMarket.rateDiff = value
                        updatedData[marketIndex] = updatedMarket;
                    }
                }
                else if (key === "rateDiff") {
                    const updatedRunner = generateOverUnderLineType({
                        ...updatedMarket,
                        rateDiff: value,
                        line: updatedMarket.runner[0]?.line,
                        backSize: updatedMarket.runner[0]?.backSize,
                        laySize: updatedMarket.runner[0]?.laySize
                    }, marketTypeObj);
                    updatedMarket.runner = updatedMarket.runner.map(runner => ({
                        ...runner,
                        ...updatedRunner
                    }));
                    updatedMarket.rateDiff = value
                    updatedData[marketIndex] = updatedMarket;
                }
                else {
                    // Handle margin and rateDiff changes
                    const runnerProperties = ['line', 'overRate', 'underRate', 'backPrice', 'layPrice', 'backSize', 'laySize'];
                    if (runnerProperties.includes(key) && Array.isArray(updatedMarket.runner)) {
                        updatedMarket.runner = updatedMarket.runner.map(runner => ({
                            ...runner,
                            [key]: value
                        }));
                    } else {
                        updatedMarket[key] = value;
                    }

                    updatedMarket = generateOverUnderLineType({
                        ...updatedMarket,
                        line: updatedMarket.runner[0]?.line,
                        backSize: updatedMarket.runner[0]?.backSize,
                        laySize: updatedMarket.runner[0]?.laySize
                    }, marketTypeObj);

                    updatedData[marketIndex] = updatedMarket;
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

                if ((updatedMarket?.marketTypeId === marketTypeObj?.Fancy ||
                    updatedMarket?.marketTypeId === marketTypeObj?.LineMarket) &&
                    Array.isArray(updatedMarket?.runner)) {
                    const marketStatus = updatedMarket?.status;
                    updatedMarket.runner = updatedMarket?.runner?.length > 0 &&
                        updatedMarket.runner.map(runner => ({
                            ...runner,
                            status: marketStatus
                        }));
                }

                updatedData[marketIndex] = updatedMarket;
            }

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

    const handleAction = async ({ changeIn, key, value, action }) => {
        let filteredData = filterDataBySelectedCategories(changeIn);

        if (_.isEmpty(filteredData) && action !== 'SUSPEND') {
            dispatch(updateToastData({
                data: "No data to update based on current filter",
                title: "Update Skipped",
                type: WARNING
            }));
            return;
        }

        let dataToUpdate = (action === "SUSPEND" ? changeIn : filterDataBySelectedCategories(changeIn)).filter(record => {
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
            if (action === "SEND_ALL") {
                const eventMarketIds = dataToUpdate.map(record => record.marketId);
                const payload = { eventMarketId: eventMarketIds, isSendData: true }
                await upSendMarket(payload);
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
            }
        } else {
            dispatch(updateToastData({ data: "No records to update", title: "Update Skipped", type: WARNING }));
        }
    };

    const updateRecords = (record, sendSaveAll = false) => {
        let dataToSend = [];
        let isSaveAll = sendSaveAll;
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
        // console.log('Saving data:', { action, marketCount: dataToSave.length });
        setIsLoading(true);
        try {
            const response = await axiosInstance.post(`/admin/eventMarket/updateMarketRateV1`, {
                eventMarket: dataToSave,
                action
            });

            if (response?.result) {
                // console.log('Save successful:', { action, updatedMarkets: response.result.marketList?.length });
                dispatch(updateToastData({ data: "Market Updated Successfully", title: "Updated", type: SUCCESS }));
                const updatedData = response.result.marketList || [];

                updatedData.forEach(market => {
                    if (market.marketTypeCategoryId === 31) {
                        market.lineDiff = 0;
                    }
                });

                const newOriginalData = {};
                updatedData.forEach(market => {
                    if (market.runner && market.runner.length === 1) {
                        newOriginalData[market.marketId] = {
                            line: market.runner[0].line,
                            predefinedValue: market.predefinedValue,
                            playerScore: market.playerScore
                        };
                    }
                });
                setOriginalMarketData(newOriginalData);

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
            setIsKeyPressed(false)
            setIsLoading(false);
        } catch (error) {
            console.error('Save failed:', error);
            setIsLoading(false);
            setIsKeyPressed(false);
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
                    rateDiff: +(eventMarket.rateDiff || 0),  // Add this line
                    runner: Array.isArray(eventMarket.runner) ? eventMarket.runner : [eventMarket.runner]
                }
            }
            return null
        }).filter(x => x)

        // updatedDatalist = _.orderBy(updatedDatalist, ['marketName'], ['asc']);
        updatedDatalist = _.orderBy(updatedDatalist, [
            item => {
                // Check if the marketName contains a numeric value
                const match = item.marketName.match(/(\d+)/);
                return match ? parseInt(match[1], 10) : 0;  // Return 1 if there's a number, 0 if not
            },
            item => item.marketName  // Then sort alphabetically by marketName
        ], ['asc', 'asc']);
        return { data: updatedDatalist, lineRatio: highestLineRatio * 5 }
    }

    const formatSocketDataForState = (responseData) => {
        // console.log('Socket data received:', responseData);
        if (!isEmpty(responseData)) {
            const newMarketData = {};
            const newOriginalData = {}; // New object to store original values only for socket-received markets

            responseData.forEach(eventMarketString => {
                if (typeof eventMarketString === "string") {
                    const eventMarket = JSON.parse(eventMarketString);
                    // console.log('Processing socket market data:', eventMarket.marketId);

                    // Store original values ONLY for socket-received markets
                    if (eventMarket.runner && eventMarket.runner.length === 1) {
                        newOriginalData[eventMarket.marketId] = {
                            line: Array.isArray(eventMarket.runner) ?
                                eventMarket.runner[0].line :
                                eventMarket.runner.line,
                            predefinedValue: eventMarket.predefinedValue,
                            playerScore: eventMarket.playerScore
                        };
                    }

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
                        rateDiff: +(eventMarket.rateDiff || 0),  // Add this line
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
                // console.log('Updating data from socket with new markets');
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

                // Handle isNewSocketData timeout
                finalDataToSet.forEach(market => {
                    if (market.isNewSocketData) {
                        setTimeout(() => {
                            setData(currentData =>
                                currentData.map(item =>
                                    item.marketId === market.marketId
                                        ? { ...item, isNewSocketData: false }
                                        : item
                                )
                            );
                        }, 3000);
                    }
                });

                // Update originalMarketData only for socket-received markets
                setOriginalMarketData(prevOriginalData => ({
                    ...prevOriginalData,
                    ...newOriginalData
                }));

                // Sort the data
                const sortedData = _.orderBy(finalDataToSet, [
                    item => {
                        const match = item.marketName.match(/(\d+)/);
                        return match ? parseInt(match[1], 10) : 0;
                    },
                    item => item.marketName
                ], ['asc', 'asc']);

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
                    const playersObj = {}
                    const newCategoryObj = {}
                    setFullCategories(response?.result?.categories || [])
                    response?.result?.teams?.forEach(team => { teamsObj[team.teamId] = team.shortName })
                    response?.result?.comPlayer?.forEach(player => { playersObj[player.comPlayerId] = player.playerName })
                    response?.result?.categories?.forEach(category => { newCategoryObj[category.marketTypeCategoryId] = category.categoryName })
                    const formattedData = formatAPIDataForState({ responseData: response?.result?.marketList || [], teamData: teamsObj })
                    setPlayers(playersObj)
                    setTeams(teamsObj)
                    setData(formattedData.data);
                    setIsDataFromApiOrSocket(true);
                    setCategories(newCategoryObj);
                    setTeamsData(response?.result?.teams);
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

    const handleDS = (details) => {
        const url = new URL(window.location.origin + "/marketDataLogs");
        sessionStorage.setItem('eventMarketDataLogId', "" + details?.eventMarketId);
        sessionStorage.setItem('eventMarketDataLogDetails', "" + JSON.stringify(details));
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
            className: "py-0",
            columnClassName: "cell-padding"
        },
        {
            title: "Market",
            dataIndex: "marketId",
            render: (text, record) => (
                <span
                    style={{ cursor: "pointer" }}
                    onClick={() => { handleDS({ ...record, eventTypeName: commentaryInfo?.ety, competitionName: commentaryInfo?.com, eventName: commentaryInfo?.en, eventRefId: commentaryInfo?.eid, eventMarketId: record?.marketId, eventDay: commentaryInfo?.ed, eventTime: commentaryInfo?.et }) }}>
                    <div>{`${text}[${record.runnerId}]`}</div>
                    <div className={record.isNewSocketData ? "bg-yellow" : ""}>{record?.marketName}</div>
                </span>
            ),
            key: "marketId",
            className: "py-0",
            columnClassName: "cell-padding"
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
            className: "py-0",
            columnClassName: "cell-padding"
        },
        {
            title: "Line",
            dataIndex: "line",
            render: (text, record) => (
                <CustomInput
                    className="form-control small-text-fields input-line-field text-bold"
                    // value={text === null ? "" : (Number.isInteger(parseFloat(text)) ? parseInt(text) : parseFloat(text).toFixed(1))}
                    value={text}
                    onChange={(newValue) => {
                        handleValueChange(record, "line", parseFloat(newValue))
                    }}
                    onKeyDown={(e) => {
                        if (["e", "E", "+", "-"].includes(e.key)) {
                            e.preventDefault();
                        }
                    }}
                    inputProps={{ step: "0.1" }}
                    data-market-id={record.marketId}
                />
            ),
            key: "line",
            className: "py-0 input-line-field",
            columnClassName: "cell-padding"
        },
        {
            title: "",
            dataIndex: "lineVal",
            render: (text, record) => {

                const currentLine = parseFloat(record.runner[0].line);
                const adjustments = [-2, -1, 0, 1, 2];

                return (
                    <div className="d-flex align-items-center gap-1">
                        {adjustments.map((adjustment) => {
                            const newValue = currentLine + adjustment;
                            return (
                                <Button
                                    key={adjustment}
                                    className={`form-control ${adjustment === 0 ? 'line-center-text-fields' : 'line-text-fields'}`}
                                    onClick={() => {
                                        const updatedRecord = {
                                            ...record,
                                            runner: [{
                                                ...record.runner[0],
                                                line: newValue
                                            }]
                                        };
                                        handleValueChange(updatedRecord, 'line', newValue);
                                    }}
                                >
                                    {Math.round(newValue)}
                                </Button>
                            );
                        })}
                    </div>
                );
            },
            key: "lineVal",
            className: "py-0",
            columnClassName: "cell-padding"
        },
        {
            title: "RR",
            render: (text, record) => (<span>{`${(+record.line / +record.over)?.toFixed(2)}`}</span>),
            key: "inningsId",
            className: "py-0",
            columnClassName: "cell-padding"
        },
        {
            title: "R-No",
            dataIndex: "layPrice",
            render: (text, record) => (
                <>
                    <CustomInput
                        className="form-control price-text-fields input-no-field text-bold"
                        value={text === null ? "" : text}
                        onChange={(newValue) => handleValueChange(record, "layPrice", newValue)}
                        onKeyDown={(e) => {
                            if (["e", "E", "+", "-"].includes(e.key)) {
                                e.preventDefault();
                            }
                        }}
                        data-market-id={record?.marketId}
                    />
                    <CustomInput
                        className="form-control size-text-fields input-no-field mt-1"
                        value={record?.laySize === null ? "" : record?.laySize}
                        onChange={(newValue) => handleValueChange(record, "laySize", newValue)}
                        steps={5}
                        onKeyDown={(e) => {
                            if (["e", "E", "+", "-"].includes(e.key)) {
                                e.preventDefault();
                            }
                        }}
                        data-market-id={record?.marketId}
                    />
                </>
            ),
            key: "layPrice",
            className: "py-0 input-no-field",
            columnClassName: "cell-padding"

        },
        {
            title: "R-Yes",
            dataIndex: "backPrice",
            render: (text, record) => (
                <>
                    <CustomInput
                        className="form-control price-text-fields input-yes-field text-bold"
                        value={text === null ? "" : text}
                        onChange={(newValue) => handleValueChange(record, "backPrice", newValue)}
                        onKeyDown={(e) => {
                            if (["e", "E", "+", "-"].includes(e.key)) {
                                e.preventDefault();
                            }
                        }}
                        data-market-id={record?.marketId}
                    />
                    <CustomInput
                        className="form-control size-text-fields input-yes-field mt-1"
                        value={record?.backSize === null ? "" : record?.backSize}
                        onChange={(newValue) => handleValueChange(record, "backSize", newValue)}
                        steps={5}
                        onKeyDown={(e) => {
                            if (["e", "E", "+", "-"].includes(e.key)) {
                                e.preventDefault();
                            }
                        }}
                        data-market-id={record?.marketId}
                    />
                </>
            ),
            key: "backPrice",
            className: "py-0 input-yes-field",
            columnClassName: "cell-padding"

        },
        {
            title: "A",
            dataIndex: "isActive",
            render: (text, record) => (
                <Button
                    color={`${record.isActive ? "primary" : "danger"}`}
                    size="sm"
                    className="btn"
                    onClick={() => {
                        // handleSingleAction(record, "isActive", !record.isActive);
                        handleValueChange(record, "isActive", !record.isActive);
                    }}
                >
                    <i className={`bx ${record.isActive ? "bx-check" : "bx-block"}`}></i>
                </Button>
            ),
            key: "isActive",
            className: "py-0",
            columnClassName: "cell-padding",
            style: { width: "2%", textAlign: "center" },
        },
        {
            title: "B",
            dataIndex: "isAllow",
            render: (text, record) => (
                <Button
                    color={`${record.isAllow ? "primary" : "danger"}`}
                    size="sm"
                    className="btn"
                    onClick={() => {
                        // handleSingleAction(record, "isAllow", !record.isAllow);
                        handleValueChange(record, "isAllow", !record.isAllow);
                    }}
                >
                    <i className={`bx ${record.isAllow ? "bx-check" : "bx-block"}`}></i>
                </Button>
            ),
            key: "isAllow",
            className: "py-0",
            columnClassName: "cell-padding",
            style: { width: "2%", textAlign: "center" },
        },
        {
            title: "S",
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
            className: "py-0",
            columnClassName: "cell-padding",
        },
        {
            title: "PR",
            dataIndex: "predefinedValue",
            render: (text, record) => {
                // Only show for single runner markets
                if (record.runner && record.runner.length === 1) {
                    return (
                        <CustomInput
                            className="form-control small-text-fields text-bold"
                            // value={text === null ? "" : (Number.isInteger(parseFloat(text)) ? parseInt(text) : parseFloat(text).toFixed(1))}
                            value={text}
                            onChange={(newValue) => handleValueChange(record, "predefinedValue", newValue)}
                            inputProps={{ step: "0.1" }}
                        />
                    );
                }
                return null;
            },
            key: "predefinedValue",
            className: "py-0",
            columnClassName: "cell-padding",
            hidden: true
        },
        {
            title: "Save",
            render: (text, record) => (
                <Button color="primary" className="small-button" onClick={() => updateRecords(record, "SAVE_ALL")}>Save</Button>
            ),
            key: "isSendData",
            className: "py-0",
            columnClassName: "cell-padding"
        },
        {
            title: "R-Diff",
            dataIndex: "rateDiff",
            render: (text, record) => (
                <CustomInput
                    className="form-control smaller-text-fields input-rdiff-field mx-2"
                    value={text === null ? "" : text}
                    onChange={(newValue) => handleValueChange(record, "rateDiff", newValue)}
                />
            ),
            key: "rateDiff",
            className: "py-0",
            columnClassName: "cell-padding"
        },
        {
            title: "L-Ratio",
            dataIndex: "lineRatio",
            render: (text, record) => (
                <Input
                    className="form-control smaller-text-fields mx-2"
                    type="number"
                    step={0.1}
                    min={0}
                    value={text === null ? "" : text}
                    onChange={(e) => handleValueChange(record, "lineRatio", e.target.value)}
                />
            ),
            key: "underRate",
            className: "py-0",
            columnClassName: "cell-padding"
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
            className: "py-0",
            columnClassName: "cell-padding"
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
            className: "py-0 input-under-field",
            columnClassName: "cell-padding"

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
            className: "py-0 input-over-field",
            columnClassName: "cell-padding"
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
        if (event.target.tagName === 'INPUT') {
            const pressedKey = event.key.toUpperCase();
            const keyMapping = keys.find(k => k.key === pressedKey);
            if (keyMapping) {
                const marketId = event?.target?.dataset?.marketId;
                if (marketId && isPointsShow) {
                    setHasUnsavedChanges(true);
                    if (pressedKey === 'H' || pressedKey === 'J') {
                        setData(prevData => {
                            return prevData.map(market => {
                                if (parseInt(market?.marketId) === parseInt(marketId) && parseInt(market?.marketTypeId) === marketTypeObj?.Fancy) {
                                    return {
                                        ...market,
                                        runner: market.runner.map(runner => ({
                                            ...runner,
                                            layPrice: runner?.layPrice,
                                            backPrice: parseInt(runner?.layPrice) + parseInt(keyMapping[`${pressedKey}No`]),
                                        })),
                                        rateDiff: 0
                                    };
                                }
                                return market;
                            });
                        });
                    } else {
                        setData(prevData => {
                            return prevData.map(market => {
                                if (parseInt(market?.marketId) === parseInt(marketId) && parseInt(market?.marketTypeId) === marketTypeObj?.Fancy) {
                                    return {
                                        ...market,
                                        runner: market.runner.map(runner => ({
                                            ...runner,
                                            layPrice: runner?.layPrice,
                                            backPrice: runner?.layPrice,
                                            laySize: keyMapping[`${pressedKey}No`],
                                            backSize: keyMapping[`${pressedKey}Yes`],
                                        })),
                                        rateDiff: 0
                                    };
                                }
                                return market;
                            });
                        });
                    }
                }
            }
        } else if (event.target.tagName === 'SELECT' || isKeyPressed) {
            return; // Don't trigger shortcuts if focus is on input or select elements
        } else {
            const key = event.key.toLowerCase();
            // console.log('Key pressed:', key);
            switch (key) {
                case 'a':
                    // console.log('Save all triggered by key press');
                    if (selectedCategories.length > 0 && hasUnsavedChanges) {
                        setIsKeyPressed(true)
                        updateRecords();
                    }
                    break;
                case 's':
                    // console.log('Send all triggered by key press');
                    if (selectedCategories.length > 0 && !hasUnsavedChanges) {
                        setIsKeyPressed(true)
                        handleAction({ changeIn: data, key: "isSendData", value: true, action: "SEND_ALL" });
                    }
                    break;
                case 'd':
                    if (selectedCategories.length > 0) {
                        setIsKeyPressed(true)
                        handleAction({ changeIn: data, key: "status", value: OPEN_VALUE, action: "PUBLISH" });
                    }
                    break;
                case 'z':
                    setIsKeyPressed(true)
                    handleAction({ changeIn: data, key: "status", value: SUSPEND_VALUE });
                    break;
                case 'q':
                    setIsKeyPressed(true)
                    handleAction({ changeIn: data, key: "status", value: SUSPEND_VALUE, action: "SUSPEND" });
                    break;
                default:
                    break;
            }
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

    // New method for handling market updates
    const handleMarketUpdate = (marketData) => {
        // console.log('Market update received:', marketData);
        if (!marketData) return;

        // Convert market data to array format if it's a single object
        const marketDataArray = Array.isArray(marketData) ? marketData : [marketData];
        // console.log('Processing market updates:', marketDataArray.length);

        // Create new original data only for received markets
        const newOriginalData = {};
        marketDataArray.forEach(market => {
            if (market.runner && market.runner.length === 1) {
                newOriginalData[market.marketId] = {
                    line: Array.isArray(market.runner) ?
                        market.runner[0].line :
                        market.runner.line,
                    predefinedValue: market.predefinedValue,
                    playerScore: market.playerScore
                };
            }
        });

        setData(prevData => {
            // console.log('Updating data with market updates');
            const updatedData = prevData.map(market => {
                const updatedMarket = marketDataArray.find(m => m.marketId === market.marketId);
                if (updatedMarket) {
                    const formattedMarket = {
                        ...market,
                        ...updatedMarket,
                        isNewSocketData: true,
                        runner: Array.isArray(updatedMarket.runner)
                            ? updatedMarket.runner
                            : [updatedMarket.runner]
                    };

                    // Schedule removal of isNewSocketData flag
                    setTimeout(() => {
                        setData(currentData =>
                            currentData.map(item =>
                                item.marketId === market.marketId
                                    ? { ...item, isNewSocketData: false }
                                    : item
                            )
                        );
                    }, 3000);

                    return formattedMarket;
                }
                return market;
            });

            // Add any new markets that don't exist in current data
            const newMarkets = marketDataArray
                .filter(newMarket => !updatedData.some(market => market.marketId === newMarket.marketId))
                .map(newMarket => ({
                    ...newMarket,
                    isNewSocketData: true,
                    runner: Array.isArray(newMarket.runner) ? newMarket.runner : [newMarket.runner]
                }));

            const finalData = [...updatedData, ...newMarkets]
                .filter(e => statusListToInclude.includes(e.status));

            // Update originalMarketData only for received markets
            setOriginalMarketData(prevOriginalData => ({
                ...prevOriginalData,
                ...newOriginalData
            }));

            return _.orderBy(finalData, [
                item => {
                    const match = item.marketName.match(/(\d+)/);
                    return match ? parseInt(match[1], 10) : 0;
                },
                'marketName'
            ], ['asc', 'asc']);
        });
    };

    useEffect(() => {
        if (commentaryId !== "0") {
            fetchTableData(commentaryId);
            fetchCommentaryInfo(commentaryId)
        }
    }, []);

    // useEffect(() => {
    //     if (!isEmpty(teams)) {
    //         if (socket) {
    //             socket.emit(OPEN_MARKET_CONNECT, { commentaryId });
    //             setIsSocketConnected(true)
    //             socket.on(OPEN_MARKET_DATA, (socketData) => {
    //                 formatSocketDataForState(socketData || [])
    //             });
    //         } else {
    //             setIsSocketConnected(false)
    //             fetchConfigAll();
    //         }
    //     }
    //     return () => {
    //         socket.off(OPEN_MARKET_DATA);
    //     };
    // }, [teams])

    // useEffect(() => {
    //     if (!isEmpty(teams)) {
    //         if (socket) {
    //             // console.log('Connecting to socket for market updates');
    //             socket.emit(OPEN_MARKET_CONNECT, { commentaryId });
    //             setIsSocketConnected(true)
    //             socket.on(OPEN_MARKET_DATA, (socketData) => {
    //                 // console.log('Received OPEN_MARKET_DATA event');
    //                 formatSocketDataForState(socketData || [])
    //             });
    //             socket.on(UPDATE_MARKET_DATA, (marketData) => {
    //                 // console.log('Received UPDATE_MARKET_DATA event');
    //                 if (marketData) {
    //                     handleMarketUpdate(marketData);
    //                 }
    //             });
    //         } else {
    //             // console.log('Socket not available, falling back to polling');
    //             setIsSocketConnected(false)
    //             fetchConfigAll();
    //         }
    //     }
    //     return () => {
    //         // console.log('Cleaning up socket listeners');
    //         socket.off(OPEN_MARKET_DATA);
    //         socket.off(UPDATE_MARKET_DATA);
    //     };
    // }, [teams])

    // useEffect(() => {
    //     if (commentaryId) {
    //         if (socket) {
    //             socket.emit(CONNECT_COMMENTARY, { commentaryId });
    //             socket.on(UNDO_CALLED, (data) => {
    //                 if (data) {
    //                     dispatch(
    //                         updateToastData({
    //                             data: `${data?.message}`,
    //                             title: "Undo Called",
    //                             type: WARNING,
    //                         })
    //                     );
    //                 }
    //             });
    //             socket.on(UPDATE_BALL_STATUS, (data) => {
    //                 if (data) {
    //                     setBallStatus(data?.ballStatus);
    //                 }
    //             });
    //         }
    //     }
    //     return () => {
    //         socket.off(CONNECT_COMMENTARY);
    //     };
    // }, [])

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
    }, [isAutoUpdate, isSocketConnected, autoInterval, commentaryId]);

    useEffect(() => {
        if (!isEmpty(data)) {
            window.addEventListener('keydown', handleKeyPress);

            const tempCategorisedData = {};

            // Step 1: Categorize raw data
            data.forEach((market) => {
                const categoryName = categories[market.marketTypeCategoryId];
                tempCategorisedData[categoryName] = [].concat(
                    tempCategorisedData[categoryName] || [],
                    [market]
                );
            });
            const playerCategories = ["Player", "Player Boundaries", "Player Balls Faced"];
            const WicketCategories = ["Fall of Wicket", "Partnership boundaries", "Wicket Lost Balls"];

            // ✅ Step 2: Merge all player-related categories into "Players" if enabled
            if (playersMarketShow) {
                const mergedPlayers = [];
                const mergedWickets = [];
                playerCategories.forEach((cat) => {
                    if (tempCategorisedData[cat]) {
                        mergedPlayers.push(...tempCategorisedData[cat]);
                        delete tempCategorisedData[cat]; // Remove original player-related keys
                    }
                });
                WicketCategories.forEach((cat) => {
                    if (tempCategorisedData[cat]) {
                        mergedWickets.push(...tempCategorisedData[cat]);
                        delete tempCategorisedData[cat]; // Remove original player-related keys
                    }
                });

                if (mergedPlayers.length) {
                    tempCategorisedData["Players"] = mergedPlayers;
                }
                if (mergedWickets.length) {
                    tempCategorisedData["Wickets"] = mergedWickets;
                }
            }

            // Step 3: Get selected category names (as string)
            const selectedCategoryNames = selectedCategories
                .map((selected) =>
                    fullCategories.find((cat) => cat.marketTypeCategoryId === selected.value)?.categoryName
                ).filter(Boolean);

            const selectedData = {};
            const remainingData = {};

            // Step 4: Sort and categorize selected vs remaining
            fullCategories
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .forEach((category) => {
                    let categoryName = category.categoryName;

                    if (playersMarketShow && playerCategories.includes(categoryName)) {
                        categoryName = "Players";
                    }
                    if (playersMarketShow && WicketCategories.includes(categoryName)) {
                        categoryName = "Wickets";
                    }

                    const categoryData = tempCategorisedData[categoryName];
                    if (!categoryData) return;

                    if (selectedCategoryNames.includes(category.categoryName)) {
                        selectedData[categoryName] = categoryData;
                    } else {
                        remainingData[categoryName] = categoryData;
                    }
                });

            // Step 5: Merge and set final data
            const sortedCategorisedData = { ...selectedData, ...remainingData };
            setCategorisedData(sortedCategorisedData);
        } else {
            window.removeEventListener('keydown', handleKeyPress);
        }
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [data, selectedCategories, isKeyPressed, input, isPointsShow, playersMarketShow]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [data, selectedCategories, isKeyPressed, input, isPointsShow]);

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid={true}>
                    <Row>
                        <Card className="px-2">
                            <CardBody className="p-0">
                                {isLoading && <SpinnerModel />}
                                <Row>
                                    {!isEmpty(commentaryInfo) && <Col>
                                        <div className='match-details-breadcrumbs'>{`${commentaryInfo.ety}/ ${commentaryInfo.com}/ `} <strong>{`${commentaryInfo.en}`}</strong>{`/ Ref: `} <strong>{`${commentaryInfo.eid}`}</strong> {`[ ${commentaryInfo.ed + " " + commentaryInfo.et} ]`}</div>
                                    </Col>
                                    }
                                    {ballStatus === "ballstart" && <Col className="p-0 d-flex align-items-center" xs={2} md={1} lg={1}>
                                        <span className="ball-start">
                                            <span className='text-bold mx-2'>Ball Start</span>
                                        </span>
                                    </Col>}
                                    <Col className="p-0 d-flex align-items-center" xs={2} md={1} lg={1}>
                                        <button className="btn btn-warning p-1" onClick={() => loadMarketData(commentaryId)}>Load Market</button>
                                    </Col>
                                    <Col className="p-0 d-flex align-items-center" xs={2} md={1} lg={1}>
                                        <button className="btn btn-danger p-1" onClick={handleBackClick}>Back</button>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col className="p-0 d-flex align-items-center flex-wrap" xs={12} md={6} lg={6}>
                                        <button className="table-header-button-2 table-header-button-3 btn btn-color-purple" style={{ width: "150px" }} onClick={() => handleAction({ changeIn: data, key: "status", value: SUSPEND_VALUE, action: "SUSPEND" })}>{ALL_SUSPEND} (Q)</button>
                                        <button className="table-header-button-2 btn btn-color-yellow" style={{ width: "100px" }} onClick={() => handleAction({ changeIn: data, key: "status", value: INACTIVE_VALUE })}>{INACTIVE}</button>
                                        <button className="table-header-button-2 btn btn-color-orange" style={{ width: "100px" }} onClick={() => handleAction({ changeIn: data, key: "status", value: SUSPEND_VALUE })}>{SUSPEND} (Z)</button>
                                    </Col>
                                    <Col className="p-0 d-flex align-items-center" xs={12} md={6} lg={2}>
                                        <Button color="primary" className="table-header-button" onClick={() => handleAction({ changeIn: data, key: "isAllow", value: true })}>{ALLOW}</Button>
                                        <Button color="danger" className="table-header-button" onClick={() => handleAction({ changeIn: data, key: "isAllow", value: false })}>{NOT_ALLOW}</Button>
                                    </Col>
                                    <Col className="p-0 d-flex align-items-center" xs={12} md={6} lg={2}>
                                        <Button color="primary" className="table-header-button" onClick={() => handleAction({ changeIn: data, key: "isActive", value: true })}>{ACTIVE}</Button>
                                        <Button color="danger" className="table-header-button" onClick={() => handleAction({ changeIn: data, key: "isActive", value: false })}>{DEACTIVE}</Button>
                                    </Col>
                                    <Col className="p-0 d-flex align-items-center" xs={12} md={6} lg={2}>
                                        {isSocketConnected ?
                                            <span className="mx-3 live-css" /> :
                                            <Button color={isAutoUpdate ? "danger" : "primary"} className="table-header-button" onClick={() => setIsAutoUpdate(!isAutoUpdate)}>{isAutoUpdate ? "AE" : "AS"}</Button>
                                        }
                                        <Button color="primary" className="table-header-button" onClick={() => fetchTableData(commentaryId)}>
                                            <i className='bx bx-refresh'></i></Button>
                                    </Col>
                                </Row>
                                {data.length > 0 &&
                                    <Row>
                                        <Col className="mt-2" xs={12} md={12} lg={12}>
                                            <div><b>Filter Categories:</b></div>
                                            <Select
                                                isMulti
                                                name="categories"
                                                // options={Object.entries(categories).map(([id, name]) => ({ value: +id, label: name }))}
                                                options={categoryOptions}
                                                className="filter-categories"
                                                classNamePrefix="filter-dropdown"
                                                value={selectedCategories}
                                                // menuIsOpen={true}
                                                onChange={handleCategoryChange}
                                            />
                                        </Col>
                                        {lineRatioField}
                                        <Col className="p-0 d-flex align-items-center" xs={12} md={6} lg={6}>
                                            <Button
                                                color="primary"
                                                // style={{ opacity: hasUnsavedChanges && selectedCategories.length > 0 ? 1 : 0.65 }}
                                                className="table-header-button"
                                                onClick={() => handleAction({ changeIn: data, key: "isSendData", value: true, action: "SEND_ALL" })}
                                                disabled={selectedCategories.length === 0 || hasUnsavedChanges}
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
                                                disabled={selectedCategories.length === 0 || !hasUnsavedChanges}
                                            >{`Save All (A)`}</Button>
                                            <Switch
                                                width={80}
                                                uncheckedIcon={<OffsymbolStatus />}
                                                checkedIcon={<OnSymbolStatus />}
                                                className="mx-2"
                                                onColor="#02a499"
                                                onChange={() => {
                                                    setIsScorecardShow(!isScorecardShow);
                                                }}
                                                checked={isScorecardShow}
                                            />
                                            <Switch
                                                width={80}
                                                uncheckedIcon={<OffsymbolPointStatus />}
                                                checkedIcon={<OnSymbolPointStatus />}
                                                className="mx-2"
                                                onColor="#02a499"
                                                onChange={() => {
                                                    setIsPointsShow(!isPointsShow);
                                                }}
                                                checked={isPointsShow}
                                            />
                                            <Switch
                                                width={80}
                                                uncheckedIcon={<OffsymbolPlayerMarketStatus />}
                                                checkedIcon={<OnSymbolPlayerMarketStatus />}
                                                className="mx-2"
                                                onColor="#02a499"
                                                onChange={() => {
                                                    setPlayerMarketShow(!playersMarketShow);
                                                }}
                                                checked={playersMarketShow}
                                            />
                                        </Col>
                                    </Row>}
                                {isScorecardShow && (
                                    <Row className='p-0'>
                                        <Col xs={12} className="p-0">
                                            <iframe
                                                title="YouTube video player"
                                                width="100%"
                                                height="auto"
                                                // src={scoreboardUrl}
                                                src={scorecardFrameUrl}
                                                frameborder="0"
                                                className="mb-0 p-0"
                                            >
                                            </iframe>
                                        </Col>
                                    </Row>
                                )}
                                {isPointsShow && <Row>
                                    {keys.map((item, index) => (
                                        <>
                                            <Col key={index} xs="auto" className="d-flex align-items-center mb-2">
                                                <Button
                                                    className="key-fields key-button py-1"
                                                    onClick={() => handleKeyClick(item.key)}
                                                >
                                                    {item.key}{(item.key === "H" || item.key === "J") && "+"}
                                                </Button>
                                                <Input type="number" className="key-fields py-1" value={item[`${item.key}No`] || ""} onChange={(e) => handleKeyValueChange(index, `${item.key}No`, e.target.value)} />
                                                <Input type="number" className="key-fields py-1" value={item[`${item.key}Yes`] || ""} onChange={(e) => handleKeyValueChange(index, `${item.key}Yes`, e.target.value)} />
                                            </Col>
                                        </>
                                    ))}
                                    <Col xs="auto" className="d-flex align-items-center mb-2">
                                        <Button
                                            className="key-button rounded-0 py-1"
                                        >
                                            Default key
                                        </Button>
                                        <Input
                                            type="text"
                                            className="key-fields py-1"
                                            value={selectedKey}
                                            maxLength={1}
                                            onChange={handleSelectedKeyChange}
                                        />
                                    </Col>
                                </Row>}
                                {Object.keys(categorisedData).length > 0 && (
                                    <OpenMarketCategories
                                        categorisedData={categorisedData}
                                        columns={columns}
                                        players={players}
                                        playersMarketShow={playersMarketShow}
                                        teams={teams}
                                        handleMultiRunnerUpdate={handleMultiRunnerUpdate}
                                        setIsLoading={setIsLoading}
                                        openAccordions={openAccordions}
                                        toggleAccordion={toggleAccordion}
                                        commentaryInfo={commentaryInfo}
                                        handleValueChange={handleValueChange}
                                        handleSingleAction={handleSingleAction}
                                        updateRecordsFunc={updateRecords}
                                        teamsData={teamsData}
                                        handleDS={handleDS}
                                    />
                                )}
                            </CardBody>
                        </Card>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    )
}
