import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { ERROR, PERMISSION_VIEW, SUCCESS, TAB_COMMENTARY } from "../../components/Common/Const";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { Button, Card, CardBody, Col, Container, Input, Row } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { updateToastData } from "../../Features/toasterSlice";
import axiosInstance from "../../Features/axios";
import { ACTIVE, ACTIVE_VALUE, ALL, ALLOW, ALLOW_VALUE, DEACTIVE, DEACTIVE_VALUE, INACTIVE, INACTIVE_VALUE, MARKET_STATUS, NOT_ALLOW, NOT_ALLOW_VALUE, REFRESH, SEND_ALL, SUSPEND, SUSPEND_VALUE } from "./CommentartConst";
import { ListingElement } from "../../components/Common/Reusables/ListingComponent";
import "./CommentaryCss.css"
import _, { isEmpty } from "lodash";
const tableElement = {
    title: "Predefined",
    displayTitle: true
};
export const MarketEventAction = () => {
    const pageName = TAB_COMMENTARY;
    const [data, setData] = useState([]);
    const [commentaryInfo, setCommentaryInfo] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const permissionObj = useSelector(state => state.auth?.tabPermissionList);
    let navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const commentaryId = location.state?.commentaryId || "0";

    const formatDataBeforeSend = (dataToChange = []) => {
        const dataToSend = []
        dataToChange.forEach(record => {
            let workingRecord = _.clone(record)
            const recordMarketRunner = {
                ...record.marketRunners[0],
                "line": +record.line,
                "overRate": +record.overRate,
                "underRate": +record.underRate,
                "yesRate": +record.yesRate,
                "yesPoint": +record.yesPoint,
                "noRate": +record.noRate,
                "noPoint": +record.noPoint,
            }




            workingRecord = _.omit(workingRecord,
                ["marketRunners", "line", "overRate", "underRate", "yesRate", "yesPoint", "noRate", "noPoint", "runner", "runnerId", "selectionId", "selectionStatus", "lastUpdate"])
            workingRecord["marketRunners"] = [recordMarketRunner]
            console.log(workingRecord)
            dataToSend.push(workingRecord)
        })
        return dataToSend
    }

    const handleValueChange = (record, key, value) => {
        const indexOfData = data.findIndex(i => i.eventMarketId === record.eventMarketId)
        if (indexOfData !== -1) {
            setData(prev => [
                ...prev.slice(0, indexOfData),
                {
                    ...prev[indexOfData],
                    [key]: value
                },
                ...prev.slice(indexOfData + 1, prev.length),
            ])
        }
    }

    const handleAction = (status, changeIn = []) => {
        let dataToUpdate = []
        changeIn.forEach(record => {
            if (!_.isEqual(+record.status, +status))
                dataToUpdate.push({ ...record, "status": status })
        })
        dataToUpdate = formatDataBeforeSend(dataToUpdate)
        // Add Api Call Here
        console.log(dataToUpdate)
    }

    const updateRecords = (record) => {
        let dataToSend = []
        if (record) dataToSend = [record]
        else dataToSend = data
        dataToSend = formatDataBeforeSend(dataToSend)
        // Add Api Call Here
        console.log(dataToSend)
    }

    const handleSingleAction = (record, key, value) => {
        const updatedRecord = { ...record, [key]: value }
        const dataToSend = formatDataBeforeSend([updatedRecord])
        // Add Api Call Here
        console.log(dataToSend)
    }

    const handleSave = async () => {
        const validateData = data.filter(value => value.isCreate)
        setIsLoading(true);
        if (!validateData.length) {
            setIsLoading(false);
            return dispatch(updateToastData({ data: "No isCreate has been selected", title: pageName, type: ERROR }));
        }
        await axiosInstance
            .post(`/admin/eventMarket/saveEventMarket`, {
                eventMarket: validateData,
            })
            .then((response) => {
                fetchTableData(commentaryId);
                dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
            })
            .catch((error) => {
                setIsLoading(false);
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
            });
    };

    const fetchTableData = async (commentaryId) => {
        setIsLoading(true);
        await axiosInstance
            .post("/admin/eventMarket/marketListByCId", { commentaryId })
            .then((response) => {
                if (response?.result) {
                    console.log(response?.result)
                    const dataList = response?.result || []
                    let updatedDatalist = dataList.map(eventMarket => {
                        if (eventMarket.marketRunners)
                            return {
                                ...eventMarket,
                                ...eventMarket.marketRunners[0]
                            }
                        else return null
                    }).filter(x => x)
                    setData(updatedDatalist);
                }
                setIsLoading(false);
            })
            .catch((error) => {
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                setIsLoading(false);
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
    // const fetchTeamName = (id) => {
    //     const teamOption = allTeams.find(element => element.value === id)
    //     return teamOption.label
    // }
    //elements required
    const columns = [
        {
            title: "Inning",
            dataIndex: "inningsId",
            render: (text) => (<span>{`Innings ${text}`}</span>),
            key: "inningsId",
        },
        {
            title: "Team",
            dataIndex: "teamId",
            // render: (text) => (<span>{fetchTeamName(text)}</span>),
            key: "teamId",
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
                    onChange={(e) => handleValueChange(record, "line", e.target.value)}
                />
            ),
            key: "line",
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
            title: "No Rate",
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
            title: "No Point",
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
            title: "Yes Rate",
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
            title: "Yes Point",
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
            dataIndex: "isSend",
            render: (text, record) => (
                <Button
                    color={`${record.isActive ? "primary" : "danger"}`}
                    size="sm"
                    className="btn"
                    onClick={() => {
                        handleSingleAction(record, "isSend", !record.isActive);
                    }}
                >
                    <i className={`bx ${record.isSend ? "bx-check" : "bx-block"}`}></i>
                </Button>
            ),
            style: { width: "2%", textAlign: "center" },
        },
        {
            title: "Save",
            render: (text, record) => (
                <Button color="primary" className="small-button" onClick={() => updateRecords(record)}>Save</Button>
            ),
            key: "isSend",
        },
    ];

    useEffect(() => {
        if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
            navigate("/dashboard")
        }
        if (commentaryId !== "0") {
            fetchTableData(commentaryId);
            fetchCommentaryInfo(commentaryId)
        }
    }, []);

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
                                        <Button color="danger" className="table-header-button" onClick={() => handleAction(INACTIVE_VALUE, data)}>{INACTIVE}</Button>
                                        <Button color="danger" className="table-header-button" onClick={() => handleAction(SUSPEND_VALUE, data)}>{SUSPEND}</Button>
                                    </Col>
                                    <Col className="p-0" xs={12} md={3} lg={2}>
                                        <Button color="success" className="table-header-button" onClick={() => handleAction(ALLOW_VALUE, data)}>{ALLOW}</Button>
                                        <Button color="danger" className="table-header-button" onClick={() => handleAction(NOT_ALLOW_VALUE, data)}>{NOT_ALLOW}</Button>
                                    </Col>
                                    <Col className="p-0" xs={12} md={3} lg={2}>
                                        <Button color="success" className="table-header-button" onClick={() => handleAction(ACTIVE_VALUE, data)}>{ACTIVE}</Button>
                                        <Button color="danger" className="table-header-button" onClick={() => handleAction(DEACTIVE_VALUE, data)}>{DEACTIVE}</Button>
                                    </Col>
                                    <Col className="p-0" xs={12} md={3} lg={{ span: 1, offset: 3 }}>
                                        <Button color="success" className="table-header-button" onClick={() => handleAction(REFRESH, data)}>{REFRESH}</Button>
                                        <Button color="success" className="table-header-button" onClick={() => updateRecords()}>{SEND_ALL}</Button>
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
                                <Row className='mb-3'>
                                    <Col className="mt-3 mt-lg-3 mt-md-3">
                                        <Button color="primary" className="btn text-right" onClick={handleSave}>Save</Button>
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
