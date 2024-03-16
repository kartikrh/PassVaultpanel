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
import { MARKET_STATUS } from "./CommentartConst";
import { ListingElement } from "../../components/Common/Reusables/ListingComponent";
import "./CommentaryCss.css"

export const MarketEventAction = () => {
    const pageName = TAB_COMMENTARY;
    const permissionObj = useSelector(state => state.auth?.tabPermissionList);
    const location = useLocation();
    let navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const commentaryId = location.state?.commentaryId || "0";
    const dispatch = useDispatch();
    const [data, setData] = useState([]);

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
            .post("/admin/eventMarket/marketListByCId", { commentaryId })
            .then((response) => {
                if (response?.result) {
                    console.log(response?.result)
                    const dataList = response?.result || []
                    let updatedDatalist = dataList.map(eventMarket => {
                        return {
                            ...eventMarket,
                            ...eventMarket.marketRunners[0]
                        }
                    })
                    // const updatedDataList = dataList.
                    // newData = newData.map((market) => {
                    //     const eventMarketIndex = eventMarket.findIndex((value) => market.over == value.over && market.teamId == value.teamId && market.inningsId == value.inningsId)
                    //     if (eventMarketIndex !== -1) {
                    //         return {
                    //             ...market,
                    //             ...eventMarket[eventMarketIndex]
                    //         }
                    //     }
                    //     return market;
                    // })
                    setData(updatedDatalist);
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
    // const fetchTeamName = (id) => {
    //     const teamOption = allTeams.find(element => element.value === id)
    //     return teamOption.label
    // }
    //elements required
    const tableElement = {
        title: "Predefined",
        displayTitle: true
    };
    const saveData = (records = []) => {
        records.forEach(data => {
            console.log(data)
        })
    }
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
                    onChange={(e) => handleValueChange(record, "YesPoint", e.target.value)}
                />
            ),
            key: "YesPoint",
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
            title: "Allow",
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
            title: "Is Send",
            dataIndex: "isSend",
            render: (text, record) => (
                <Button
                    color={`${record.isActive ? "primary" : "danger"}`}
                    size="sm"
                    className="btn"
                    onClick={() => {
                        handleValueChange(record, "isSend", !record.isActive);
                    }}
                >
                    <i className={`bx ${record.isSend ? "bx-check" : "bx-block"}`}></i>
                </Button>
            ),
            key: "isSend",
            style: { width: "2%", textAlign: "center" },
        },
        {
            title: "Save",
            render: (text, record) => (
                <Button color="primary" className="btn" onClick={() => saveData(record)}>
                    <i>Save</i>
                </Button>
            ),
            key: "isSend",
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
                                        <Breadcrumbs title="ScoreCard" breadcrumbItem="Open Market" page="updatecp" />
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
