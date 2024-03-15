import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { ERROR, PERMISSION_VIEW, TAB_COMMENTARY } from "../../components/Common/Const";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { Button, Card, CardBody, CardHeader, Col, Container, Input, Row } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { updateToastData } from "../../Features/toasterSlice";
import axiosInstance from "../../Features/axios";
import Table from "../../components/Common/Table";
import { isEqual } from "lodash";
import Select from "react-select";

const STATUS = {
    "0": "NotOpen",
    "1": "Open",
    "2": "inActive",
    "3": "Suspend",
    "4": "Close",
    "5": "Settled",
    "6": "Cancel",
}

const CommentaryMarketTemplate = () => {
    const pageName = TAB_COMMENTARY;
    const permissionObj = useSelector(state => state.auth?.tabPermissionList);
    const location = useLocation();
    let navigate = useNavigate();
    const [isDataLoading, setIsDataLoading] = useState(false);
    const commentaryId = location.state?.commentaryId || "0";
    const dispatch = useDispatch();
    const [teams, setTeams] = useState([]);
    const finalizeRef = useRef(null);
    const [checekedList, setCheckedList] = useState([]);
    const [data, setData] = useState([
        {
            id: 1,
            isCreate: false,
            market: "",
            status: "1",
            over: "",
            under: "",
            margin: "",
            isActive: false,
            isMarketAllow: true,
        }
    ]);
    const [dataIndexList, setDataIndexList] = useState([]);

    useEffect(() => {
        setCheckedList(data.map(i => i.id))
    }, [data])


    const handleSingleCheck = (e) => {
        let updateSingleCheck = []
        if (checekedList.includes(e.isCreate)) {
            updateSingleCheck = checekedList.filter((item) => item !== e.id);
        } else {
            updateSingleCheck = [...checekedList, e.id];
        }
        setCheckedList(updateSingleCheck)
    };

    const handleValueChange = (record, key, value) => {
        const indexOfData = data.findIndex(i => i.id === record.id)
        if (indexOfData !== -1) {
            const newData = {
                ...data[indexOfData],
                [key]: value
            }
            setData(prev => [
                ...prev.slice(0, indexOfData),
                newData,
                ...prev.slice(indexOfData + 1, prev.length),
            ])
        }
    }

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
                        checked={checekedList.includes(record.id)}
                        onChange={() => {
                            handleSingleCheck(record);
                        }}
                    />
                </div>
            ),
            key: "isCreate",
            style: { width: "2%" },
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
                    onChange={(selectedOption) => {
                        handleValueChange(record, "status", selectedOption?.value || null);
                    }}
                    closeMenuOnSelect={true}
                >
                    {
                        Object.entries(STATUS).map(([key, value]) =>
                            <option value={key}>{value}</option>
                        )
                    }
                </select>
            ),
            key: "status",
            sort: true,
            style: { width: "10%" },
        },
        {
            title: "Over",
            dataIndex: "over",
            render: (text, record) => (
                <Input
                    className="form-control"
                    type="text"
                    value={text || ""}
                    onChange={(e) => handleValueChange(record, "over", e.target.value)}
                />
            ),
            key: "over",
            sort: true,
            style: { width: "10%" },
        },
        {
            title: "Under",
            dataIndex: "under",
            render: (text, record) => (
                <Input
                    className="form-control"
                    type="text"
                    value={text || ""}
                    onChange={(e) => handleValueChange(record, "under", e.target.value)}
                />
            ),
            key: "under",
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
            dataIndex: "isMarketAllow",
            render: (text, record) => (
                <Button
                    color={`${record.isMarketAllow ? "primary" : "danger"}`}
                    size="sm"
                    className="btn"
                    onClick={() => {
                        handleValueChange(record, "isMarketAllow", !record.isMarketAllow);
                    }}
                >
                    <i className={`bx ${record.isMarketAllow ? "bx-check" : "bx-block"}`}></i>
                </Button>
            ),
            key: "isMarketAllow",
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

    const fetchData = async (commentaryId) => {
        setIsDataLoading(true);
        await axiosInstance
            .post("/admin/eventMarket/getDetailsByCId", { commentaryId })
            .then((response) => {
                const marketTemplate = response?.result?.marketTemplate;
                if (marketTemplate) {
                    const predefinedMarket = marketTemplate?.filter(value => value?.isPredefineMarket)
                    setData(predefinedMarket.map(value => ({
                        id: "0",
                        isCreate: true,
                        market: value.templateName,
                        status: "1",
                        over: value.over,
                        under: "",
                        margin: "",
                        isActive: false,
                        isMarketAllow: true,
                    })))

                }
                setIsDataLoading(false);
            })
            .catch((error) => {
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                setIsDataLoading(false);
            });
    };

    const handleBackClick = () => {
        navigate("/commentary");
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid={true}>
                    <Row>
                        <Card>
                            <CardBody>
                                {isDataLoading && <SpinnerModel />}
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
                            </CardBody>
                        </Card>
                    </Row>
                </Container>
            </div>
        </React.Fragment >

    )
}

export default CommentaryMarketTemplate;