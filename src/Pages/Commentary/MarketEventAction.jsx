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
import { MARKET_STATUS } from "./CommentartConst";
import { ListingElement } from "../../components/Common/Reusables/ListingComponent";

export const MarketEventAction = () => {
    const pageName = TAB_COMMENTARY;
    const permissionObj = useSelector(state => state.auth?.tabPermissionList);
    const location = useLocation();
    let navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const commentaryId = location.state?.commentaryId || "0";
    const dispatch = useDispatch();
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
                fetchData(commentaryId);
                dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
            })
            .catch((error) => {
                setIsLoading(false);
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
            });
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
                                isCreate: true,
                                status: "1",
                                overRate: "",
                                underRate: "",
                                margin: "",
                                line: "",
                                isAllow: true,
                                data: "", // not getting from market
                                playerId: null, // not getting from market
                                ...market,
                                commentaryId: commentary.commentaryId,
                                eventRefId: commentary.eventRefId,
                                market: market.templateName,
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
                    })
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
    const fetchTeamName = (id) => {
        const teamOption = allTeams.find(element => element.value === id)
        return teamOption.value
    }
    //elements required
    const tableElement = {
        title: "Predefined",
        displayTitle: true
    };

    //table columns
    const columns = [
        {
            title: "Inning",
            dataIndex: "inningsId",
            render: (text) => (<span>{`Innings ${text}`}</span>),
            key: "inningsId",
            sort: true,
            style: { width: "10%" },
        },
        {
            title: "Team",
            dataIndex: "teamId",
            render: (text) => (<span>{fetchTeamName(text)}</span>),
            key: "teamId",
            sort: true,
            style: { width: "10%" },
        },
        {
            title: "Market",
            dataIndex: "market",
            render: (text, record) => (
                <Input
                    className="form-control"
                    type="text"
                    value={text || ""}
                    onChange={(e) => handleValueChange(record, "market", e.target.value)}
                />
            ),
            key: "market",
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
            title: "Over",
            dataIndex: "overRate",
            render: (text, record) => (
                <Input
                    className="form-control"
                    type="text"
                    value={text || ""}
                    onChange={(e) => handleValueChange(record, "overRate", e.target.value)}
                />
            ),
            key: "overRate",
            sort: true,
            style: { width: "10%" },
        },
        {
            title: "Line",
            dataIndex: "line",
            render: (text, record) => (
                <Input
                    className="form-control"
                    type="text"
                    value={text || ""}
                    onChange={(e) => handleValueChange(record, "line", e.target.value)}
                />
            ),
            key: "line",
            sort: true,
            style: { width: "10%" },
        },
        {
            title: "Under",
            dataIndex: "underRate",
            render: (text, record) => (
                <Input
                    className="form-control"
                    type="text"
                    value={text || ""}
                    onChange={(e) => handleValueChange(record, "underRate", e.target.value)}
                />
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
                    value={text || ""}
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
