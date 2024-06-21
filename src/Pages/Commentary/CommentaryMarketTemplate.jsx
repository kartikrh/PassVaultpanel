import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { COMMENTARY_STATUS_OPEN, ERROR, PERMISSION_VIEW, SUCCESS, TAB_COMMENTARY } from "../../components/Common/Const";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { Button, Card, CardBody, Col, Container, Input, Row } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { updateToastData } from "../../Features/toasterSlice";
import axiosInstance from "../../Features/axios";
import Table from "../../components/Common/Table";
import { MARKET_STATUS } from "./CommentartConst";
import { generateOverUnder } from "./functions";
import { isEqual } from "lodash";


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
    const [selectedField, setSelectedField] = useState("");
    const [fieldValue, setFieldValue] = useState("");

    useEffect(() => {
        setCheckedList(data.filter(i => i.isCreate).map(i => i.index))
    }, [data])

    const handleValueChange = (record, key, value) => {
        const indexOfData = data.findIndex(i => i.index === record.index)
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

    const handleSave = async () => {
        let validateData = data.filter(value => value.isCreate).sort((a, b) => a.index - b.index)
        if (!validateData.length) {
            return dispatch(updateToastData({ data: "No isCreate has been selected", title: pageName, type: ERROR }));
        }
        setData(prevData => prevData.map(value => {
            let { error, ...newData } = value;
            return newData;
        }));
        let isError = false;
        const DECIMAL_REGEX = /^\d+\.?\d*$/
        let allErrors = [];
        validateData.forEach((item) => {
            let error = {};
            for (const field in item) {
                if (["marketName", "line", "overRate", "underRate", "margin"].includes(field)) {
                    if (!item[field] && item[field] !== 0) {
                        isError = true
                        error[field] = `required`;
                        setData(prevData => {
                            const newDataArray = [...prevData];
                            let updatedItem = { ...item, error: { ...error } };
                            newDataArray[item.index] = updatedItem;
                            return newDataArray;
                        });
                    } else if (["line", "overRate", "underRate"].includes(field) && !DECIMAL_REGEX.test(item[field])) {
                        isError = true
                        error[field] = `invaild value`;
                        setData(prevData => {
                            const newDataArray = [...prevData];
                            let updatedItem = { ...item, error: { ...error } };
                            newDataArray[item.index] = updatedItem;
                            return newDataArray;
                        });
                    }
                }
            }
            if (Object.keys(error).length > 0) allErrors.push(error)
        })
        if (allErrors.length < 1) {
            setIsLoading(true);
            validateData = validateData.map(element => {
                return {
                    ...element,
                    "eventMarketId": +element.eventMarketId,
                    "isActive": element.isActive || false,
                    "isAllow": element.isAllow || false,
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
                    const predefinedOverMarket = marketTemplate?.filter(value => value?.isPredefineMarket && value?.isOver);
                    const predefinedOverFalseMarket = marketTemplate?.filter(value => value?.isPredefineMarket && !value?.isOver);
                    const eventMarket = response?.result?.eventMarket;
                    if (teamAndPlayers?.length) {
                        if (commentary.commentaryStatus === COMMENTARY_STATUS_OPEN) {
                            const uniqueInnings = teamAndPlayers?.filter(value => value.teamId === teamAndPlayers[0].teamId)
                            setAllInnings(uniqueInnings.map(option => ({ label: `Inning ${option.currentInnings}`, value: option.currentInnings })))
                            const uniqueTeams = teamAndPlayers?.filter(value => isEqual(value.currentInnings, commentary.currentInnings))
                            setAllTeams(uniqueTeams.map(option => ({ label: option.shortName, value: option.teamId, fullName: option.teamName })))
                        }
                        else {
                            setAllInnings([{ label: `Inning ${commentary.currentInnings}`, value: commentary.currentInnings }])
                            const uniqueTeams = teamAndPlayers?.filter(value => ((value.teamStatus === 1) && isEqual(value.currentInnings, commentary.currentInnings)))
                            setAllTeams(uniqueTeams.map(option => ({ label: option.shortName, value: option.teamId, fullName: option.teamName })))
                        }

                    }
                    let newData = [];
                    predefinedOverMarket.forEach((market) => {
                        teamAndPlayers.forEach((team) => {
                            newData.push(({
                                eventMarketId: "0",
                                isCreate: false,
                                status: "1",
                                overRate: "",
                                underRate: "",
                                margin: "",
                                line: "",
                                data: "", // not getting from market
                                playerId: null, // not getting from market
                                ...market,
                                commentaryId: commentary.commentaryId,
                                eventRefId: commentary.eventRefId,
                                marketName: market.templateName,
                                teamId: team.teamId,
                                inningsId: team.currentInnings,
                                isActive: market.isDefaultMarketActive,
                                isAllow: market.isDefaultBetAllowed,
                            }))
                        });
                    });
                    predefinedOverFalseMarket.forEach((market) => {
                        newData.push(({
                            eventMarketId: "0",
                            isCreate: false,
                            status: "1",
                            overRate: null,
                            underRate: "",
                            margin: "",
                            line: "",
                            data: "", // not getting from market
                            playerId: null, // not getting from market
                            ...market,
                            commentaryId: commentary.commentaryId,
                            eventRefId: commentary.eventRefId,
                            marketName: market.templateName,
                            teamId: "0",
                            inningsId: "0",
                            isActive: market.isDefaultMarketActive,
                            isAllow: market.isDefaultBetAllowed,
                        }))
                    });
                    newData = newData.sort((a, b) => {
                        if (a.over !== b.over) {
                            return a.over - b.over;
                        }
                        if (a.inningsId !== b.inningsId) {
                            return a.inningsId - b.inningsId;
                        }
                        if (a.teamId !== b.teamId) {
                            return a.teamId - b.teamId;
                        }
                        return a.marketTemplateId - b.marketTemplateId;
                    }).map((market, index) => {
                        let eventMarketIndex = -1;
                        if (market.isOver && market.isPredefineMarket) {
                            eventMarketIndex = eventMarket.findIndex((value) => market.over == value.over && market.teamId == value.teamId && market.inningsId == value.inningsId)
                        } else if (market.isPredefineMarket) {
                            eventMarketIndex = eventMarket.findIndex((value) => market.marketTemplateId == value.marketTemplateId)
                        }
                        let newData = {}
                        if (eventMarketIndex !== -1) {
                            newData = eventMarket[eventMarketIndex]
                        }
                        return {
                            ...market,
                            index,
                            ...newData
                        }
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

    const handleSubmit = () => {
        if (!selectedField || !fieldValue) {
            return dispatch(
                updateToastData({
                    data: "Please select a field and enter a value.",
                    title: pageName,
                    type: ERROR,
                })
            );
        }
        const updatedData = data.map((record) => {
            let updatedRecord = { ...record };
            if (selectedField === 'line') {
                const roundedLine = Math.round(parseFloat(fieldValue) * 10) / 10;
                const thresholdValue = Math.round(roundedLine) + 0.5;
                const marginAdjustment = record.margin ? ((record.margin / 100) + 1) : 1;
                updatedRecord = {
                    ...updatedRecord,
                    [selectedField]: fieldValue,
                    backPrice: Math.round(roundedLine) + 1 || 0,
                    layPrice: Math.round(roundedLine) || 0,
                    backSize: record.backSize || 100,
                    laySize: record.laySize ? record.laySize : 100,
                    overRate: record.margin && (((1 / (marginAdjustment / (1 + Math.exp(-(fieldValue - thresholdValue))))).toFixed(2)) || 0),
                    underRate: record.margin && (((1 / (marginAdjustment / (1 + Math.exp(+(fieldValue - thresholdValue))))).toFixed(2)) || 0),
                };
            } else {
                updatedRecord = {
                    ...updatedRecord,
                    [selectedField]: fieldValue,
                };
            }
            updatedRecord.isCreate = true;
            return updatedRecord;
        });
        setData(updatedData);
        setSelectedField("");
        setFieldValue("");
    };
    //table columns
    const columns = [
        {
            title: "",
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
                    className="small-text-fields"
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
            style: { width: "10%" },
        },
        {
            title: "Team",
            dataIndex: "teamId",
            render: (text, record) => (
                <select
                    className="small-text-fields"
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
            style: { width: "10%" },
        },
        {
            title: "Market",
            dataIndex: "marketName",
            render: (text, record) => (
                <>
                    <Input
                        className="form-control small-text-fields"
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
            style: { width: "30%" },
        },
        {
            title: "Status",
            dataIndex: "status",
            render: (text, record) => (
                <select
                    className="small-text-fields"
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
            style: { width: "10%" },
        },
        {
            title: "Line",
            dataIndex: "line",
            render: (text = "", record) => (
                <>
                    <Input
                        className="form-control small-text-fields input-line-field"
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
            style: { width: "10%" },
            className: "input-line-field"
        },
        {
            title: "Margin",
            dataIndex: "margin",
            render: (text, record) => (
                <>
                    <Input
                        className="form-control small-text-fields"
                        type="text"
                        value={text}
                        onChange={(e) => handleValueChange(record, "margin", e.target.value)}
                    />
                    <span className="text-danger">
                        {record?.error?.margin}
                    </span>
                </>
            ),
            key: "margin",
            style: { width: "10%" },
        },
        {
            title: "Under",
            dataIndex: "underRate",
            render: (text, record) => (
                <>
                    <Input
                        className="form-control small-text-fields input-under-field"
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
            style: { width: "10%" },
            className: "input-under-field"
        },
        {
            title: "Over",
            dataIndex: "overRate",
            render: (text = "", record) => (
                <>
                    <Input
                        className="form-control small-text-fields input-over-field"
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
            style: { width: "10%" },
            className: "input-over-field"
        },
        {
            title: "No Rate",
            dataIndex: "layPrice",
            render: (text = "", record) => (
                <>
                    <Input
                        className="form-control small-text-fields input-no-field"
                        type="text"
                        value={text}
                        onChange={(e) => handleValueChange(record, "layPrice", e.target.value)}
                    />
                    <span className="text-danger">
                        {record?.error?.layPrice}
                    </span>
                </>
            ),
            key: "layPrice",
            style: { width: "10%" },
            className: "input-no-field"
        },
        {
            title: "Yes Rate",
            dataIndex: "backPrice",
            render: (text = "", record) => (
                <>
                    <Input
                        className="form-control small-text-fields input-yes-field"
                        type="text"
                        value={text}
                        onChange={(e) => handleValueChange(record, "backPrice", e.target.value)}
                    />
                    <span className="text-danger">
                        {record?.error?.backPrice}
                    </span>
                </>
            ),
            key: "backPrice",
            style: { width: "10%" },
            className: "input-yes-field"
        },
        {
            title: "No Point",
            dataIndex: "laySize",
            render: (text = "100", record) => (
                <>
                    <Input
                        className="form-control small-text-fields input-no-field"
                        type="text"
                        value={text}
                        onChange={(e) => handleValueChange(record, "laySize", e.target.value)}
                    />
                    <span className="text-danger">
                        {record?.error?.laySize}
                    </span>
                </>
            ),
            key: "laySize",
            style: { width: "10%" },
            className: "input-no-field"
        },
        {
            title: "Yes Point",
            dataIndex: "backSize",
            render: (text = "100", record) => (
                <>
                    <Input
                        className="form-control small-text-fields input-yes-field"
                        type="text"
                        value={text}
                        onChange={(e) => handleValueChange(record, "backSize", e.target.value)}
                    />
                    <span className="text-danger">
                        {record?.error?.backSize}
                    </span>
                </>
            ),
            key: "backSize",
            style: { width: "10%" },
            className: "input-yes-field",
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
                                <Row className='mb-3'>
                                    <Col className="d-flex align-items-center justify-content-start">
                                        <div className="d-flex align-items-center">
                                            <select
                                                className="form-select me-2"
                                                value={selectedField}
                                                onChange={(e) => setSelectedField(e.target.value)}
                                            >
                                                <option value="">Select Field</option>
                                                <option value="line">Line</option>
                                                <option value="overRate">Over</option>
                                                <option value="underRate">Under</option>
                                                <option value="backSize">Yes Point</option>
                                                <option value="laySize">No Point</option>
                                            </select>
                                            <input
                                                type="text"
                                                className="form-control me-2"
                                                value={fieldValue}
                                                onChange={(e) => setFieldValue(e.target.value)}
                                                placeholder="Enter Value"
                                            />
                                            <button
                                                className="btn btn-primary"
                                                onClick={handleSubmit}
                                            >
                                                Submit
                                            </button>
                                        </div>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <Table
                                            ref={finalizeRef}
                                            columns={columns.filter(item => item.dataIndex !== "inningsId" && item.dataIndex !== "teamId")}
                                            dataSource={data.filter(isOverFalse => !isOverFalse.isOver)}
                                            tableElement={tableElement}
                                            singleCheck={checekedList}
                                            isPagination={false}
                                        />
                                    </Col>
                                </Row>
                                {allTeams?.map(teamData =>
                                    <Row>
                                        <Col>
                                            <Table
                                                ref={finalizeRef}
                                                columns={columns.filter(item => item.dataIndex !== "teamId")}
                                                dataSource={data.filter(tId => tId.teamId === teamData.value)}
                                                tableElement={{ ...tableElement, title: teamData.fullName }}
                                                singleCheck={checekedList}
                                                isPagination={false}
                                            />
                                        </Col>
                                    </Row>)}
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