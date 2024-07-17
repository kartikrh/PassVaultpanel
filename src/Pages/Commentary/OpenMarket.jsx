import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ERROR, OPEN_MARKET_CONNECT, OPEN_MARKET_DATA, SUCCESS } from "../../components/Common/Const";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { Accordion, AccordionBody, AccordionHeader, AccordionItem, Button, Card, CardBody, Col, Container, Input, Row, UncontrolledAccordion } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { updateToastData } from "../../Features/toasterSlice";
import axiosInstance from "../../Features/axios";
import { ACTIVE, ALLOW, DEACTIVE, INACTIVE, INACTIVE_VALUE, NOT_ALLOW, MARKET_STATUS, REFRESH, SEND_ALL, SUSPEND, SUSPEND_VALUE, OPEN_VALUE } from "./CommentartConst";
import { ListingElement } from "../../components/Common/Reusables/ListingComponent";
import "./CommentaryCss.css"
import _, { isEmpty } from "lodash";
import { generateOverUnder } from "./functions";
import createSocket from "../../Features/socket";
import CustomInput from "../../components/Common/Reusables/CustomInput";
const tableElement = {
    title: "Open Market",
    displayTitle: true
};
export const OpenMarket = () => {
    const [data, setData] = useState([]);
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
    const commentaryId = +localStorage.getItem('openMarketCommentaryId') || "0";
    const intervalIdRef = useRef(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const socket = createSocket();
    const statusListToInclude = [1, 2, 3]
    const lineRatioForMarketCategoryId = 23

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

    const formatDataBeforeSend = (dataToChange = []) => {
        const dataToSend = []
        dataToChange.forEach(record => {
            let workingRecord = _.clone(record)
            const recordMarketRunner = {
                ...record.runner?.[0],
                "line": +record.line,
                "margin": +record.margin,
                "overRate": +record.overRate,
                "underRate": +record.underRate,
                "backPrice": +record.backPrice,
                "backSize": +(record.backSize || 100),
                "layPrice": +record.layPrice,
                "laySize": +(record.laySize || 100),
                "status": +record.status
            }
            workingRecord = _.omit(workingRecord,
                ["runner", "line", "overRate", "underRate", "backPrice", "backSize", "layPrice", "laySize", "runner", "runnerId", "selectionStatus", "lastUpdate"])
            workingRecord["runner"] = [recordMarketRunner]
            dataToSend.push(workingRecord)
        })
        return dataToSend
    }

    const handleValueChange = (record, key, value) => {
        const indexOfData = data.findIndex(i => i.marketId === record.marketId)
        if (indexOfData !== -1) {
            if (key === 'line' || key === 'margin') {
                const datatoSave = [
                    ...data.slice(0, indexOfData),
                    generateOverUnder({
                        ...data[indexOfData],
                        [key]: value
                    }),
                    ...data.slice(indexOfData + 1),
                ];
                setData(datatoSave);
            } else {
                setData(prev => [
                    ...prev.slice(0, indexOfData),
                    {
                        ...prev[indexOfData],
                        [key]: value
                    },
                    ...prev.slice(indexOfData + 1, prev.length),
                ]);
            }
        }
    }

    const handleAction = (changeIn, key, value) => {
        let dataToUpdate = []
        changeIn.forEach(record => {
            if (key === "status" && value === OPEN_VALUE) {
                if (record.status === SUSPEND_VALUE) {
                    dataToUpdate.push({ ...record, status: OPEN_VALUE })
                }
            }
            else if (!_.isEqual(+record[key], +value))
                dataToUpdate.push({ ...record, [key]: value })
        })
        dataToUpdate = formatDataBeforeSend(dataToUpdate)
        if (!isEmpty(dataToUpdate))
            saveData({ dataToSave: dataToUpdate, isSendAll: key === "isSendData" })
    }

    const updateRecords = (record) => {
        let dataToSend = []
        let isSaveAll = false
        if (record) dataToSend = [record]
        else {
            dataToSend = data
            isSaveAll = true
        }
        dataToSend = formatDataBeforeSend(dataToSend)
        saveData({ dataToSave: dataToSend, isSaveAll })
    }

    const handleSingleAction = (record, key, value) => {
        const updatedRecord = { ...record, [key]: value }
        const dataToSend = formatDataBeforeSend([updatedRecord])
        saveData({ dataToSave: dataToSend })
    }

    const saveData = async ({ dataToSave, isSaveAll = false, isSendAll = false }) => {
        setIsLoading(true);
        await axiosInstance
            .post(`/admin/eventMarket/updateMarketRate`, {
                eventMarket: dataToSave,
                isSave: isSaveAll,
                isSend: isSendAll
            })
            .then((response) => {
                if (response?.result) {
                    const teamsObj = {}
                    response?.result?.teams?.forEach(team => { teamsObj[team?.teamId] = team?.teamName })
                    const formattedData = formatAPIDataForState({ responseData: response?.result?.marketList || [], teamData: teamsObj })
                    setTeams(teamsObj)
                    setData(formattedData.data);
                }
                setIsLoading(false);
                dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
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
            const newMarketData = {}
            responseData.forEach(eventMarket => {
                if (typeof eventMarket === "string") eventMarket = JSON.parse(eventMarket)
                const marketRunner = eventMarket.runner[0]
                if (marketRunner) {
                    const updatedMarketData = {
                        ...eventMarket,
                        teamName: teams[eventMarket.teamId],
                        ...eventMarket.runner[0],
                        isNewSocketData: true
                    }
                    newMarketData[eventMarket.marketId] = updatedMarketData
                }
            })
            setData((prevData) => {
                let prevMarketData = {}
                let finalDataToSet = []
                prevData.forEach(mrket => { prevMarketData[mrket.marketId] = mrket })
                prevMarketData = {
                    ...prevMarketData,
                    ...newMarketData
                }
                setTimeout(() => {
                    setData((storedData) => {
                        return storedData.map(element => ({ ...element, isNewSocketData: false }))
                    });
                }, 3000);
                finalDataToSet = Object.values(prevMarketData).filter(e => statusListToInclude.includes(e.status))
                return _.orderBy(finalDataToSet, ['marketId'], ['asc']);
            })
        }
    }

    const fetchTableData = async (commentaryId) => {
        await axiosInstance
            .post("/admin/eventMarket/marketListByCId", { commentaryId })
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
                    setLineRatio(formattedData.lineRatio)
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
                if (response?.result?.es) setCommentaryInfo(response.result.es)
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
        handleValueChange(record, "line", newValue);
        handleValueChange(record, "layPrice", Math.round(+newValue));
        handleValueChange(record, "backPrice", Math.round(+newValue) + 1);
    }
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
                <>
                    <div>{`${text}[${record.runnerId}]`}</div>
                    <div className={record.isNewSocketData ? "bg-yellow" : ""}>{record?.marketName}</div>
                </>
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
        const key = event.key.toLowerCase(); // Convert to lowercase to simplify the switch cases
        switch (key) {
            case '+':
                handleAction(data, "isSendData", true);
                break;
            case '-':
                handleAction(data, "status", OPEN_VALUE);
                break;
            case '*':
                updateRecords();
                break;
            case 'i':
                handleAction(data, "status", INACTIVE_VALUE)
                break;
            case 's':
                handleAction(data, "status", SUSPEND_VALUE)
                break;
            case 'l':
                handleAction(data, "isAllow", true)
                break;
            case 'n':
                handleAction(data, "isAllow", false)
                break;
            case 'a':
                handleAction(data, "isActive", true)
                break;
            case 'd':
                handleAction(data, "isActive", false)
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
                                        <button className="table-header-button btn btn-color-yellow" onClick={() => handleAction(data, "status", INACTIVE_VALUE)}>{INACTIVE}</button>
                                        <button className="table-header-button btn btn-color-orange" onClick={() => handleAction(data, "status", SUSPEND_VALUE)}>{SUSPEND}</button>
                                    </Col>
                                    <Col className="p-0" xs={2} md={2} lg={1}>
                                        <Button color="primary" className="table-header-button" onClick={() => handleAction(data, "isAllow", true)}>{ALLOW}</Button>
                                        <Button color="danger" className="table-header-button" onClick={() => handleAction(data, "isAllow", false)}>{NOT_ALLOW}</Button>
                                    </Col>
                                    <Col className="p-0" xs={2} md={2} lg={1}>
                                        <Button color="primary" className="table-header-button" onClick={() => handleAction(data, "isActive", true)}>{ACTIVE}</Button>
                                        <Button color="danger" className="table-header-button" onClick={() => handleAction(data, "isActive", false)}>{DEACTIVE}</Button>
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
                                        {lineRatioField}
                                        <Col className="p-0 d-flex" xs={12} md={6} lg={6}>
                                            <Button color="primary" className="table-header-button" onClick={() => handleAction(data, "isSendData", true)}>{`${SEND_ALL} (+)`}</Button>
                                            <Button color="primary" className="table-header-button" onClick={() => handleAction(data, "status", OPEN_VALUE)}>{`Publish (-)`}</Button>
                                            <Button color="primary" className="table-header-button" onClick={() => updateRecords()}>{`Save All (*)`}</Button>
                                        </Col>
                                    </Row>}
                                {Object.keys(categorisedData).map((category, index) => {
                                    return <Accordion open={openAccordions} toggle={toggleAccordion} key={category} className="market-category-accordian">
                                        <AccordionItem >
                                            <AccordionHeader className="market-category-header" targetId={category}><b>{category}</b></AccordionHeader>
                                            <AccordionBody className="market-category-body" accordionId={category}>
                                                {categorisedData?.[category].length > 0 ? <>
                                                    <Row>
                                                        <Col>
                                                            <ListingElement
                                                                columns={columns}
                                                                dataSource={categorisedData?.[category] || []}
                                                                tableElement={tableElement}
                                                                tableClassName="open-market-table-class"
                                                                hideHeader={true}
                                                            />
                                                        </Col>
                                                    </Row>
                                                </> : <div className=" m-4 text-center">No record found</div>}
                                            </AccordionBody>
                                        </AccordionItem >
                                    </Accordion>
                                })}
                            </CardBody>
                        </Card>
                    </Row>
                </Container>
            </div>
        </React.Fragment >

    )
}
