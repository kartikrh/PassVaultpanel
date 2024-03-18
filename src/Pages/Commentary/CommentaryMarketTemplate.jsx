import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { ERROR, PERMISSION_VIEW, SUCCESS, TAB_COMMENTARY } from "../../components/Common/Const";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { Button, Card, CardBody, CardHeader, Col, Container, Input, Row } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { updateToastData } from "../../Features/toasterSlice";
import axiosInstance from "../../Features/axios";
import Table from "../../components/Common/Table";
import { MARKET_STATUS } from "./CommentartConst";


const CommentaryMarketTemplate = () => {
    const pageName = TAB_COMMENTARY;
    const permissionObj = useSelector(state => state.auth?.tabPermissionList);
    const location = useLocation();
    let navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const commentaryId = location.state?.commentaryId || "0";
    const dispatch = useDispatch();
    const finalizeRef = useRef(null);
    const [checekedList, setCheckedList] = useState([]);
    const [data, setData] = useState([]);
    const [allInnings, setAllInnings] = useState([]);
    const [allTeams, setAllTeams] = useState([]);

    useEffect(() => {
        setCheckedList(data.filter(i => i.isCreate).map(i => i.index))
    }, [data])

    const handleValueChange = (record, key, value) => {
        const indexOfData = data.findIndex(i => i.index === record.index)
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

    const handleSave = async () => {
        let validateData = data.filter(value => value.isCreate)
        if (!validateData.length) {
            return dispatch(updateToastData({ data: "No isCreate has been selected", title: pageName, type: ERROR }));
        }
        setData(prevData => prevData.map(value => {
            let { error, ...newData } = value;
            return newData;
        }));
        let isError = false;
        const DECIMAL_REGEX = /^\d*\.?\d*$/
        validateData.forEach((item, index) => {
            let error = {};
            for (const field in item) {
                if (["marketName", "line", "overRate", "underRate"].includes(field)) {
                    if (!item[field] && item[field] !== 0) {
                        isError = true
                        error[field] = `required`;
                        setData(prevData => {
                            const newDataArray = [...prevData];
                            let updatedItem = { ...item, error: { ...error } };
                            newDataArray[index] = updatedItem;
                            return newDataArray;
                        });
                    }
                }
                if (["line", "overRate", "underRate"].includes(field) && !DECIMAL_REGEX.test(item[field])) {
                    isError = true
                    error[field] = `invaild value`;
                    setData(prevData => {
                        const newDataArray = [...prevData];
                        let updatedItem = { ...item, error: { ...error } };
                        newDataArray[index] = updatedItem;
                        return newDataArray;
                    });
                }
            }
        })
        if (!isError) {
            setIsLoading(true);
            validateData = validateData.map(element => {
                return {
                    ...element,
                    "eventMarketId": +element.eventMarketId
                }
            })
            await axiosInstance
                .post(`/admin/eventMarket/saveEventMarket`, {
                    eventMarket: validateData,
                })
                .then((response) => {
                    fetchData(commentaryId);
                    dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
                })
                .catch((error) => {
                    setIsLoading(false);
                    dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                });
        }
    };

    const fetchData = async (commentaryId) => {
        setIsLoading(true);
        await axiosInstance
            .post("/admin/eventMarket/getDetailsByCId", { commentaryId })
            .then((response) => {
                if (response?.result) {
                    const teamAndPlayers = response?.result?.teamAndPlayers;
                    const marketTemplate = response?.result?.marketTemplate;
                    const commentary = response?.result?.commentary;
                    const predefinedMarket = marketTemplate?.filter(value => value?.isPredefineMarket);
                    const eventMarket = response?.result?.eventMarket;
                    if (teamAndPlayers?.length) {
                        const uniqueInnings = teamAndPlayers?.filter(value => value.teamId === teamAndPlayers[0].teamId)
                        setAllInnings(uniqueInnings.map(option => ({ label: `Inning ${option.currentInnings}`, value: option.currentInnings })))
                        const uniqueTeams = teamAndPlayers?.filter(value => value.currentInnings === 1)
                        setAllTeams(uniqueTeams.map(option => ({ label: option.shortName, value: option.teamId })))
                    }
                    let newData = [];
                    predefinedMarket.forEach((market, marketIndex) => {
                        teamAndPlayers.forEach((team, teamIndex) => {
                            newData.push(({
                                eventMarketId: "0",
                                index: marketIndex * teamAndPlayers.length + teamIndex,
                                isCreate: false,
                                status: "1",
                                overRate: "",
                                underRate: "",
                                margin: null,
                                line: "",
                                isAllow: true,
                                data: "", // not getting from market
                                playerId: null, // not getting from market
                                ...market,
                                commentaryId: commentary.commentaryId,
                                eventRefId: commentary.eventRefId,
                                marketName: market.templateName,
                                teamId: team.teamId,
                                inningsId: team.currentInnings,
                            }))
                        });
                    });
                    newData = newData.map((market) => {
                        const eventMarketIndex = eventMarket.findIndex((value) => market.over == value.over && market.teamId == value.teamId && market.inningsId == value.inningsId)
                        if (eventMarketIndex !== -1) {
                            return {
                                ...market,
                                ...eventMarket[eventMarketIndex]
                            }
                        }
                        return market;
                    }).sort((a, b) => {
                        if (a.over !== b.over) {
                            return a.over - b.over;
                        }
                        if (a.inningsId !== b.inningsId) {
                            return a.inningsId - b.inningsId;
                        }
                        return a.teamId - b.teamId;
                    });
                    setData(newData);
                }
                setIsLoading(false);
            })
            .catch((error) => {
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                setIsLoading(false);
            });
    };

    const handleBackClick = () => {
        navigate("/commentary");
    };

    //elements required
    const tableElement = {
        title: "Predefined",
        displayTitle: true
    };

    //table columns
    const columns = [
        {
            title: "isCreate",
            render: (text, record) => (
                <div className="form-check d-flex align-items-center justify-between">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        name="chk_child"
                        value="option1"
                        checked={checekedList.includes(record.index)}
                        onChange={() => {
                            handleValueChange(record, "isCreate", !checekedList.includes(record.index));
                        }}
                    />
                </div>
            ),
            key: "isCreate",
            style: { width: "2%" },
        },
        {
            title: "Inning",
            dataIndex: "inningsId",
            render: (text, record) => (
                <select
                    className="form-select"
                    value={text}
                    disabled={true}
                    onChange={(e) => {
                        handleValueChange(record, "inningsId", e.target.value);
                    }}
                    closeMenuOnSelect={true}
                >
                    {allInnings.map((option) =>
                        <option value={option.value}>{option.label}</option>
                    )}
                </select>
            ),
            key: "inningsId",
            sort: true,
            style: { width: "10%" },
        },
        {
            title: "Team",
            dataIndex: "teamId",
            render: (text, record) => (
                <select
                    className="form-select"
                    value={text}
                    disabled={true}
                    onChange={(e) => {
                        handleValueChange(record, "teamId", e.target.value);
                    }}
                    closeMenuOnSelect={true}
                >
                    {allTeams.map((option) =>
                        <option value={option.value}>{option.label}</option>
                    )}
                </select>
            ),
            key: "teamId",
            sort: true,
            style: { width: "10%" },
        },
        {
            title: "Market",
            dataIndex: "marketName",
            render: (text, record) => (
                <>
                    <Input
                        className="form-control"
                        type="text"
                        value={text}
                        onChange={(e) => handleValueChange(record, "marketName", e.target.value)}
                    />
                    <span className="text-danger">
                        {record?.error?.marketName}
                    </span>
                </>
            ),
            key: "marketName",
            sort: true,
            style: { width: "10%" },
        },
        {
            title: "Status",
            dataIndex: "status",
            render: (text, record) => (
                <select
                    className="form-select"
                    value={text}
                    onChange={(e) => {
                        handleValueChange(record, "status", e.target.value);
                    }}
                    closeMenuOnSelect={true}
                >
                    {Object.entries(MARKET_STATUS).map(([key, value]) =>
                        <option value={key}>{value}</option>
                    )}
                </select>
            ),
            key: "status",
            sort: true,
            style: { width: "10%" },
        },
        {
            title: "Line",
            dataIndex: "line",
            render: (text = "", record) => (
                <>
                    <Input
                        className="form-control"
                        type="text"
                        value={text}
                        onChange={(e) => handleValueChange(record, "line", e.target.value)}
                    />
                    <span className="text-danger">
                        {record?.error?.line}
                    </span>
                </>
            ),
            key: "line",
            sort: true,
            style: { width: "10%" },
        },
        {
            title: "Over",
            dataIndex: "overRate",
            render: (text = "", record) => (
                <>
                    <Input
                        className="form-control"
                        type="text"
                        value={text}
                        onChange={(e) => handleValueChange(record, "overRate", e.target.value)}
                    />
                    <span className="text-danger">
                        {record?.error?.overRate}
                    </span>
                </>

            ),
            key: "overRate",
            sort: true,
            style: { width: "10%" },
        },
        {
            title: "Under",
            dataIndex: "underRate",
            render: (text, record) => (
                <>
                    <Input
                        className="form-control"
                        type="text"
                        value={text}
                        onChange={(e) => handleValueChange(record, "underRate", e.target.value)}
                    />
                    <span className="text-danger">
                        {record?.error?.underRate}
                    </span>
                </>
            ),
            key: "underRate",
            sort: true,
            style: { width: "10%" },
        },
        {
            title: "Margin",
            dataIndex: "margin",
            render: (text, record) => (
                <Input
                    className="form-control"
                    type="text"
                    value={text}
                    onChange={(e) => handleValueChange(record, "margin", e.target.value)}
                />

            ),
            key: "margin",
            sort: true,
            style: { width: "10%" },
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
    ];

    useEffect(() => {
        if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
            navigate("/dashboard")
        }
        if (commentaryId !== "0") {
            fetchData(commentaryId);
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
                                <Row className='mb-3'>
                                    <Col className="mt-3 mt-lg-4 mt-md-4">
                                        <Breadcrumbs title="ScoreCard" breadcrumbItem="Commentary Market Template" page="updatecp" />
                                    </Col>
                                    <Col className="mt-3 mt-lg-3 mt-md-3">
                                        <button className="btn btn-danger text-right" onClick={handleBackClick}>Back</button>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <Table
                                            ref={finalizeRef}
                                            columns={columns}
                                            dataSource={data}
                                            tableElement={tableElement}
                                            singleCheck={checekedList}
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

export default CommentaryMarketTemplate;