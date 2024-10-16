import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ERROR, OPEN_MARKET_CONNECT, OPEN_MARKET_DATA, SUCCESS, WARNING } from "../../components/Common/Const";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { Button, Card, CardBody, Col, Container, Input, Row, } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { updateToastData } from "../../Features/toasterSlice";
import axiosInstance from "../../Features/axios";
import { ACTIVE, ALLOW, DEACTIVE, INACTIVE, INACTIVE_VALUE, NOT_ALLOW, MARKET_STATUS, SEND_ALL, SUSPEND, SUSPEND_VALUE, OPEN_VALUE } from "./CommentartConst";
import { ListingElement } from "../../components/Common/Reusables/ListingComponent";
import "./CommentaryCss.css"
import _, { isEmpty } from "lodash";
import { generateOverUnder } from "./functions";
import createSocket from "../../Features/socket";
import CustomInput from "../../components/Common/Reusables/CustomInput";
import Select from "react-select";
import MultiRunnerMarket from "./MultiRunnerMarket";
import OpenMarketCategories from "./OpenMarketCategoryRendering";

const tableElement = {
    title: "Open Market",
    displayTitle: true
};
export const OpenMarket = () => {
    const [data, setData] = useState([]);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [teams, setTeams] = useState({});
    const [categories, setCategories] = useState([]);
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
    const commentaryId = +localStorage.getItem('openMarketCommentaryId') || "0";
    const intervalIdRef = useRef(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const socket = createSocket();
    const statusListToInclude = [1, 2, 3]
    const lineRatioForMarketCategoryId = 23

    const filterDataBySelectedCategories = (dataToFilter) => {
        if (selectedCategories.length === 0) return [];
        return dataToFilter.filter(item =>
            selectedCategories.some(category => category.value === item.marketTypeCategoryId)
        );
    };
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
        if (debouncedLineRatio) {
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
            workingRecord.runner = workingRecord.runner.map(runner => ({
                ...runner,
                line: +runner.line,
                overRate: +runner.overRate,
                underRate: +runner.underRate,
                backPrice: +runner.backPrice,
                backSize: +(runner.backSize || 100),
                layPrice: +runner.layPrice,
                laySize: +(runner.laySize || 100),
                status: +runner.status,
                runnerId: +runner.runnerId,
            }));
            return {
                ...workingRecord,
                status: +workingRecord.status,
                lineRatio: +workingRecord.lineRatio,
                margin: +workingRecord.margin,
            };
        });
    };

    useEffect(() => {
        const storedCategories = localStorage.getItem(`selectedCategories_${commentaryId}`);
        if (storedCategories) {
            const parsedCategories = JSON.parse(storedCategories);
            setSelectedCategories(parsedCategories);
        }
    }, []);

    const handleCategoryChange = (selectedOptions) => {
        setSelectedCategories(selectedOptions);
        localStorage.setItem(`selectedCategories_${commentaryId}`, JSON.stringify(selectedOptions));
    };

    const handleValueChange = (record, key, value) => {
        setHasUnsavedChanges(true);
        const indexOfData = data.findIndex(i => i.marketId === record.marketId);
        if (indexOfData !== -1) {
            let updatedRecord = { ...record };

            if (record.runner && record.runner.length === 1) {
                // Single runner market
                updatedRecord.runner = [{
                    ...record.runner[0],
                    [key]: value
                }];
                if (key === 'line' || key === 'margin') {
                    updatedRecord.runner[0] = generateOverUnder(updatedRecord.runner[0]);
                }
            } else {
                // Multi-runner market or market-level change
                updatedRecord[key] = value;
                if (key === 'line' || key === 'margin') {
                    updatedRecord = generateOverUnder(updatedRecord);
                }
            }

            setData(prev => [
                ...prev.slice(0, indexOfData),
                updatedRecord,
                ...prev.slice(indexOfData + 1),
            ]);

            // Remove the debouncedSave call from here
        }
    };

    const handleMultiRunnerUpdate = (updatedMarket) => {
        const indexOfData = data.findIndex(i => i.marketId === updatedMarket.marketId);
        if (indexOfData !== -1) {
            setData(prev => [
                ...prev.slice(0, indexOfData),
                updatedMarket,
                ...prev.slice(indexOfData + 1),
            ]);
            setHasUnsavedChanges(true);
        }
    };

    const handleAction = ({ changeIn, key, value, action }) => {
        let dataToUpdate = filterDataBySelectedCategories(changeIn).filter(record => {
            if (key === "status" && value === OPEN_VALUE) {
                return record.status === SUSPEND_VALUE;
            }
            return !_.isEqual(+record[key], +value);
        }).map(record => ({ ...record, [key]: value }));

        dataToUpdate = formatDataBeforeSend(dataToUpdate);
        if (!isEmpty(dataToUpdate)) {
            saveData({ dataToSave: dataToUpdate, action });
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
            dataToSend = filterDataBySelectedCategories(data);
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
        await axiosInstance
            .post(`/admin/eventMarket/updateMarketRate`, {
                eventMarket: dataToSave,
                action
            })
            .then((response) => {
                if (response?.result) {
                    const teamsObj = {}
                    response?.result?.teams?.forEach(team => { teamsObj[team?.teamId] = team?.teamName })
                    const formattedData = formatAPIDataForState({ responseData: response?.result?.marketList || [], teamData: teamsObj })
                    setTeams(teamsObj)
                    setData(formattedData.data);
                    setHasUnsavedChanges(false);
                }
                setIsLoading(false);
                if (response?.result?.callPrediction?.predictioncallSuccess === false) {
                    const predictionMessage = response?.result?.callPrediction?.predictionMessage;
                    const endPoint = response?.result?.callPrediction?.endPoint;
                    dispatch(
                        updateToastData({
                            data: `${endPoint}\n${predictionMessage}`,
                            title: "Call Prediction",
                            type: WARNING,
                        })
                    );
                } else {
                    dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
                }
            })
            .catch((error) => {
                setIsLoading(false);
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
            });
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
            if (eventMarket.runner)
                return {
                    ...eventMarket,
                    teamName: teamData[eventMarket.teamId],
                    ...eventMarket.runner[0]
                }
            else return null
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
                    let updatedMarketData = {
                        ...eventMarket,
                        teamName: teams[eventMarket.teamId],
                        isNewSocketData: true
                    };

                    if (Array.isArray(eventMarket.runner)) {
                        if (eventMarket.runner.length === 1) {
                            // Single runner market
                            updatedMarketData = {
                                ...updatedMarketData,
                                ...eventMarket.runner[0],
                                runner: eventMarket.runner // Keep the original runner array
                            };
                        } else if (eventMarket.runner.length > 1) {
                            // Multi-runner market
                            updatedMarketData.runner = eventMarket.runner.map(runner =>
                                Array.isArray(runner) ? runner[0] : runner
                            );
                        }
                    }

                    newMarketData[eventMarket.marketId] = updatedMarketData;
                }
            });

            setData((prevData) => {
                const prevMarketData = {};
                prevData.forEach(market => { prevMarketData[market.marketId] = market });

                const updatedMarketData = {
                    ...prevMarketData,
                    ...newMarketData
                };

                const finalDataToSet = Object.values(updatedMarketData)
                    .filter(e => statusListToInclude.includes(e.status));

                setTimeout(() => {
                    setData((storedData) =>
                        storedData.map(element => ({ ...element, isNewSocketData: false }))
                    );
                    setHasUnsavedChanges(false);
                }, 3000);

                return _.orderBy(finalDataToSet, ['marketId'], ['asc']);
            });
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
                    setCommentaryInfo(response.result.es)
                    setLineRatio(response.result.es?.lr)
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
        const updatedRecord = { ...record };
        if (record.runner && record.runner.length === 1) {
            // Single runner market
            updatedRecord.runner = [{
                ...record.runner[0],
                line: newValue,
                layPrice: Math.round(+newValue),
                backPrice: Math.round(+newValue) + 1
            }];
            updatedRecord.runner[0] = generateOverUnder(updatedRecord.runner[0]);
        } else {
            // Multi-runner market or market-level change
            updatedRecord.line = newValue;
            updatedRecord.layPrice = Math.round(+newValue);
            updatedRecord.backPrice = Math.round(+newValue) + 1;
            updatedRecord = generateOverUnder(updatedRecord);
        }

        const indexOfData = data.findIndex(i => i.marketId === record.marketId);
        if (indexOfData !== -1) {
            setData(prev => [
                ...prev.slice(0, indexOfData),
                updatedRecord,
                ...prev.slice(indexOfData + 1),
            ]);
            setHasUnsavedChanges(true);
            // debouncedSave([updatedRecord]);
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
                    {Object.entries(MARKET_STATUS).map(([key, value]) =>
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
                    value={text || ""}
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
            render: (text, record) => (<span>{`${(+record.line / +record.over)?.toFixed(2) || 0}`}</span>),
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
                    value={text || ""}
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
                    value={text || ""}
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
            title: "Is Send",
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
                    value={text || 0}
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
                    value={text || ""}
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
                    value={text || ""}
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
                    value={text || ""}
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
                    value={text || ""}
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
                    value={text || ""}
                    onChange={(newValue) => handleValueChange(record, "backSize", newValue)}
                />
            ),
            key: "backSize",
            className: "p-0 input-yes-field",
            columnClassName: "p-1"

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
                value={Number(lineRatio).toFixed(2) || 0}
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
    const renderMarket = (market) => {
        if (market.runner && market.runner.length > 1) {
            return (
                <MultiRunnerMarket
                    key={market.marketId}
                    market={market}
                    onUpdate={handleMultiRunnerUpdate}
                    teams={teams}
                    loadingTrue={() => setIsLoading(true)}
                    loadingFalse={() => setIsLoading(false)}
                />
            );
        } else {
            // Render single-runner market
            const singleRunnerMarket = market.runner && market.runner.length === 1
                ? { ...market, ...market.runner[0] }
                : market;
            return (
                <ListingElement
                    key={market.marketId}
                    columns={columns}
                    dataSource={[singleRunnerMarket]}
                    tableElement={tableElement}
                    tableClassName="open-market-table-class"
                    hideHeader={true}
                />
            );
        }
    };

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
