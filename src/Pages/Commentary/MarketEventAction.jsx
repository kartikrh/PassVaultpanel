import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ERROR, SUCCESS } from "../../components/Common/Const";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { Button, Card, CardBody, Col, Container, Input, Row } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { updateToastData } from "../../Features/toasterSlice";
import axiosInstance from "../../Features/axios";
import { ACTIVE, ALLOW, DEACTIVE, INACTIVE, INACTIVE_VALUE, NOT_ALLOW, MARKET_STATUS, REFRESH, SEND_ALL, SUSPEND, SUSPEND_VALUE } from "./CommentartConst";
import { ListingElement } from "../../components/Common/Reusables/ListingComponent";
import "./CommentaryCss.css"
import _, { isEmpty } from "lodash";
import { generateOverUnder } from "./functions";
const tableElement = {
    title: "Predefined",
    displayTitle: true
};
export const MarketEventAction = () => {
    const [data, setData] = useState([]);
    const [commentaryInfo, setCommentaryInfo] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isAutoUpdate, setIsAutoUpdate] = useState(false);
    const [autoInterval, setAutoInterval] = useState(500)
    let navigate = useNavigate();
    const dispatch = useDispatch();
    const commentaryId = +localStorage.getItem('openMarketCommentaryId') || "0";
    const intervalIdRef = useRef(null);

    const formatDataBeforeSend = (dataToChange = []) => {
        const dataToSend = []
        dataToChange.forEach(record => {
            let workingRecord = _.clone(record)
            const recordMarketRunner = {
                ...record.marketRunners[0],
                "line": +record.line,
                "margin": +record.margin,
                "overRate": +record.overRate,
                "underRate": +record.underRate,
                "yesRate": +record.yesRate,
                "yesPoint": +(record.yesPoint || 100),
                "noRate": +record.noRate,
                "noPoint": +(record.noPoint || 100),
            }
            workingRecord = _.omit(workingRecord,
                ["marketRunners", "line", "overRate", "underRate", "yesRate", "yesPoint", "noRate", "noPoint", "runner", "runnerId", "selectionId", "selectionStatus", "lastUpdate"])
            workingRecord["marketRunners"] = [recordMarketRunner]
            dataToSend.push(workingRecord)
        })
        return dataToSend
    }

    const handleValueChange = (record, key, value) => {
        const indexOfData = data.findIndex(i => i.eventMarketId === record.eventMarketId)
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
            if (!_.isEqual(+record[key], +value))
                dataToUpdate.push({ ...record, [key]: value })
        })
        dataToUpdate = formatDataBeforeSend(dataToUpdate)
        saveData(dataToUpdate)
    }

    const updateRecords = (record) => {
        let dataToSend = []
        if (record) dataToSend = [record]
        else dataToSend = data
        dataToSend = formatDataBeforeSend(dataToSend)
        saveData(dataToSend)
    }

    const handleSingleAction = (record, key, value) => {
        const updatedRecord = { ...record, [key]: value }
        const dataToSend = formatDataBeforeSend([updatedRecord])
        saveData(dataToSend)
    }

    const saveData = async (dataToSave) => {
        setIsLoading(true);
        await axiosInstance
            .post(`/admin/eventMarket/updateMarketRate`, {
                eventMarket: dataToSave,
            })
            .then((response) => {
                fetchTableData(commentaryId);
                setIsLoading(false);
                setIsAutoUpdate(true)
                dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
            })
            .catch((error) => {
                setIsLoading(false);
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
            });
    };

    const fetchTableData = async (commentaryId) => {
        // setIsLoading(true);
        await axiosInstance
            .post("/admin/eventMarket/marketListByCId", { commentaryId })
            .then((response) => {
                if (response?.result) {
                    const dataList = response?.result || []
                    let updatedDatalist = dataList.map(eventMarket => {
                        if (eventMarket.marketRunners)
                            return {
                                ...eventMarket,
                                ...eventMarket.marketRunners[0]
                            }
                        else return null
                    }).filter(x => x)
                    updatedDatalist = _.orderBy(updatedDatalist, ['eventMarketId'], ['asc']);
                    setData(updatedDatalist);
                }
                // setIsLoading(false);
            })
            .catch((error) => {
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                // setIsLoading(false);
            });
    };

    const fetchCommentaryInfo = async () => {
        setIsLoading(true);
        await axiosInstance
            .post("/admin/commentary/getEventDetailsByCId", { commentaryId })
            .then((response) => {
                if (response?.result?.es) setCommentaryInfo(response?.result?.es)
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
    const columns = [
        {
            title: "Inning",
            dataIndex: "inningsId",
            render: (text) => (<span>{`Innings ${text}`}</span>),
            key: "inningsId",
        },
        {
            title: "M-Id",
            dataIndex: "eventMarketId",
            key: "eventMarketId",
        },
        {
            title: "Team",
            dataIndex: "teamName",
            // render: (text) => (<span>{fetchTeamName(text)}</span>),
            key: "teamName",
        },
        {
            title: "Market",
            dataIndex: "marketName",
            key: "marketName",
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
                        <option value={key}>{value}</option>
                    )}
                </select>
            ),
            key: "status",
        },
        {
            title: "Line",
            dataIndex: "line",
            render: (text, record) => (
                <Input
                    className="form-control small-text-fields"
                    type="number"
                    step={1}
                    min={0}
                    value={text || ""}
                    onChange={(e) => {
                        handleValueChange(record, "line", e.target.value)
                        handleValueChange(record, "noRate", Math.round(+e.target.value))
                        handleValueChange(record, "yesRate", Math.round(+e.target.value) + 1)
                    }}
                />
            ),
            key: "line",
        },
        {
            title: "Margin",
            dataIndex: "margin",
            render: (text, record) => (
                <Input
                    className="form-control small-text-fields"
                    type="number"
                    step={1}
                    min={0}
                    value={text || ""}
                    onChange={(e) => handleValueChange(record, "margin", e.target.value)}
                />
            ),
            key: "margin",
        },
        {
            title: "Under",
            dataIndex: "underRate",
            render: (text, record) => (
                <Input
                    className="form-control small-text-fields"
                    type="number"
                    step={1}
                    min={0}
                    value={text || ""}
                    onChange={(e) => handleValueChange(record, "underRate", e.target.value)}
                />
            ),
            key: "underRate",
        },
        {
            title: "Over",
            dataIndex: "overRate",
            render: (text, record) => (
                <Input
                    className="form-control small-text-fields"
                    type="number"
                    step={1}
                    min={0}
                    value={text || ""}
                    onChange={(e) => handleValueChange(record, "overRate", e.target.value)}
                />
            ),
            key: "overRate",
        },
        {
            title: "R-No",
            dataIndex: "noRate",
            render: (text, record) => (
                <Input
                    className="form-control small-text-fields"
                    type="number"
                    step={1}
                    min={0}
                    value={text || ""}
                    onChange={(e) => handleValueChange(record, "noRate", e.target.value)}
                />
            ),
            key: "noRate",
        },
        {
            title: "R-Yes",
            dataIndex: "yesRate",
            render: (text, record) => (
                <Input
                    className="form-control small-text-fields"
                    type="number"
                    step={1}
                    min={0}
                    value={text || ""}
                    onChange={(e) => handleValueChange(record, "yesRate", e.target.value)}
                />
            ),
            key: "yesRate",
        },
        {
            title: "P-No",
            dataIndex: "noPoint",
            render: (text, record) => (
                <Input
                    className="form-control small-text-fields"
                    type="number"
                    step={1}
                    min={0}
                    value={text || ""}
                    onChange={(e) => handleValueChange(record, "noPoint", e.target.value)}
                />
            ),
            key: "noPoint",
        },
        {
            title: "P-Yes",
            dataIndex: "yesPoint",
            render: (text, record) => (
                <Input
                    className="form-control small-text-fields"
                    type="number"
                    step={1}
                    min={0}
                    value={text || ""}
                    onChange={(e) => handleValueChange(record, "yesPoint", e.target.value)}
                />
            ),
            key: "yesPoint",
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
                        handleSingleAction(record, "isSendData", !record.isActive);
                    }}
                >
                    <i className={`bx ${record.isSendData ? "bx-check" : "bx-block"}`}></i>
                </Button>
            ),
            style: { width: "2%", textAlign: "center" },
        },
        {
            title: "Save",
            render: (text, record) => (
                <Button color="primary" className="small-button" onClick={() => updateRecords(record)}>Save</Button>
            ),
            key: "isSendData",
        },
    ];

    useEffect(() => {
        if (commentaryId !== "0") {
            fetchTableData(commentaryId);
            fetchCommentaryInfo(commentaryId)
        }
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
        fetchConfigAll();
    }, []);

    useEffect(() => {
        if (isAutoUpdate) {
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
    }, [isAutoUpdate])
    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid={true}>
                    <Row>
                        <Card>
                            <CardBody>
                                {isLoading && <SpinnerModel />}
                                <Row className=''>
                                    <Col className="mt-3 mt-lg-4 mt-md-4">
                                        <Breadcrumbs title="ScoreCard" breadcrumbItem="Open Market" page="updatecp" />
                                    </Col>
                                    <Col className="mt-3 mt-lg-3 mt-md-3">
                                        <button className="btn btn-danger text-right" onClick={handleBackClick}>Back</button>
                                    </Col>
                                </Row>
                                <Row>
                                    {!isEmpty(commentaryInfo) && <Col className="mb-3">
                                        <div className='match-details-breadcrumbs'>{`${commentaryInfo.ety}/ ${commentaryInfo.com}/ ${commentaryInfo.en}`}</div>
                                        <div>{`Ref: ${commentaryInfo.eid} [ ${commentaryInfo.ed + " " + commentaryInfo.et} ]`}</div>
                                    </Col>
                                    }
                                </Row>
                                <Row>
                                    <Col className="p-0" xs={12} md={3} lg={2}>
                                        <button className="table-header-button btn btn-color-yellow" onClick={() => handleAction(data, "status", INACTIVE_VALUE)}>{INACTIVE}</button>
                                        <button className="table-header-button btn btn-color-orange" onClick={() => handleAction(data, "status", SUSPEND_VALUE)}>{SUSPEND}</button>
                                    </Col>
                                    <Col className="p-0" xs={12} md={3} lg={2}>
                                        <Button color="primary" className="table-header-button" onClick={() => handleAction(data, "isAllow", true)}>{ALLOW}</Button>
                                        <Button color="danger" className="table-header-button" onClick={() => handleAction(data, "isAllow", false)}>{NOT_ALLOW}</Button>
                                    </Col>
                                    <Col className="p-0" xs={12} md={3} lg={2}>
                                        <Button color="primary" className="table-header-button" onClick={() => handleAction(data, "isActive", true)}>{ACTIVE}</Button>
                                        <Button color="danger" className="table-header-button" onClick={() => handleAction(data, "isActive", false)}>{DEACTIVE}</Button>
                                    </Col>
                                    <Col className="p-0" xs={12} md={3} lg={2}>
                                        <Button color="primary" className="table-header-button" onClick={() => handleAction(data, "isSendData", true)}>{SEND_ALL}</Button>
                                        <Button color={isAutoUpdate ? "danger" : "primary"} className="table-header-button" onClick={() => setIsAutoUpdate(!isAutoUpdate)}>{isAutoUpdate ? "Auto End" : "Auto Start"}</Button>
                                    </Col>
                                    <Col className="p-0" xs={12} md={3} lg={{ span: 1, offset: 1 }}>
                                        <Button color="primary" className="table-header-button" onClick={() => fetchTableData(commentaryId)}>{REFRESH}</Button>
                                        <Button color="primary" className="table-header-button" onClick={() => updateRecords()}>Save All</Button>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <ListingElement
                                            columns={columns}
                                            dataSource={data}
                                            tableElement={tableElement}
                                        />
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
                    </Row>
                </Container>
            </div>
        </React.Fragment >

    )
}
