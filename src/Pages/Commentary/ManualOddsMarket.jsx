import React, { useState, useEffect } from 'react';
import { AiOutlinePlus, AiOutlineMinus } from 'react-icons/ai';
import { Container, Row, Col, Card, CardBody, Button } from 'reactstrap';
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { isEmpty } from 'lodash';
import axiosInstance from "../../Features/axios.js";
import { updateToastData } from "../../Features/toasterSlice.js";
import { ERROR } from "../../components/Common/Const.js";
import { useDispatch } from "react-redux";

export const ManualOddsMarket = () => {
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        marketName: '',
        runners: [
            { id: 1, name: '', teamId: '' }
        ],
        isActive: false,
        isAllow: false,
        markegin: '',
        delay: '',
        lineRation: '',
        isConnectedMarket: false,
        marketRefID: '',
        rateDiffernet: ''
    });
    const commentaryId = localStorage.getItem("updateManualOddsCommentaryId")

    const [eventData, setEventData] = useState({
        comDetails: null,
        teams: [],
        commentaryDetails: null
    });

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchMarketData();
    }, []);

    const fetchMarketData = async () => {
        setIsLoading(true);
        await axiosInstance.post('/admin/eventMarket/getManualMarket', { commentaryId })
            .then((response) => {
                if (response?.result) {
                    setEventData({
                        comDetails: response.result.comDetails || null,
                        teams: response.result.teams || [],
                        commentaryDetails: response.result.commentaryDetails || null
                    });

                    if (response.result.market) {
                        setFormData(response.result.market);
                    }
                }
            })
            .catch((error) => {
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const handleSave = async () => {
        await axiosInstance.post('/admin/eventMarket/saveManualMarket', formData)
            .then((response) => {
                if (response?.result?.success) {
                    dispatch(updateToastData({
                        data: "Market data saved successfully",
                        title: "Success",
                        type: "success"
                    }));
                }
            })
            .catch((error) => {
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
            });
    };

    const handleBackClick = () => {
        window.history.back();
    };

    const addRunner = () => {
        const newId = formData.runners.length + 1;
        setFormData({
            ...formData,
            runners: [...formData.runners, { id: newId, name: '', teamId: '' }]
        });
    };

    const removeRunner = (id) => {
        setFormData({
            ...formData,
            runners: formData.runners.filter(runner => runner.id !== id)
        });
    };

    const handleRunnerChange = (id, field, value) => {
        setFormData({
            ...formData,
            runners: formData.runners.map(runner =>
                runner.id === id ? { ...runner, [field]: value } : runner
            )
        });
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid={true}>
                    <Row>
                        <Card>
                            <CardBody>
                                <Row className="align-items-center">
                                    <Col xs={8}>
                                        <Breadcrumbs title="ScoreCard" breadcrumbItem="Manual Odds Market" page="updatecp" />
                                    </Col>
                                    <Col xs={4} className="text-end">
                                        <Button color="primary" className="me-2" onClick={handleSave}>Save</Button>
                                        <Button color="danger" onClick={handleBackClick}>Exit</Button>
                                    </Col>
                                </Row>

                                <Row>
                                    {!isEmpty(eventData?.comDetails) && (
                                        <Col className="mb-3">
                                            <div className="match-details-breadcrumbs">
                                                {eventData.comDetails.eventName}
                                            </div>
                                            <div>
                                                {`Ref: ${eventData.comDetails.eventRefId} [ ${new Date(eventData.comDetails.eventDate).toLocaleString()} ]`}
                                            </div>
                                        </Col>
                                    )}
                                </Row>

                                <Row>
                                    {!isEmpty(eventData?.commentaryDetails) && (
                                        <Col className='mb-3'>
                                            <div className='match-details-breadcrumbs'>
                                                {`${eventData.commentaryDetails.ety}/ ${eventData.commentaryDetails.com}/ ${eventData.commentaryDetails.en}`}
                                            </div>
                                            <div>
                                                {`Ref: ${eventData.commentaryDetails.eid} [ ${eventData.commentaryDetails.ed + " " + eventData.commentaryDetails.et} ]`}
                                            </div>
                                        </Col>
                                    )}
                                </Row>

                                <Row className="mt-4">
                                    {/* Left Side Form Fields */}
                                    <Col md={6}>
                                        <Card className="h-100">
                                            <CardBody>
                                                <div className="space-y-4">
                                                    <div className="mb-3">
                                                        <label className="form-label">Market Name:</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={formData.marketName}
                                                            onChange={(e) => setFormData({ ...formData, marketName: e.target.value })}
                                                        />
                                                    </div>

                                                    <div className="mb-3 d-flex gap-4">
                                                        <div className="form-check">
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                checked={formData.isActive}
                                                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                                            />
                                                            <label className="form-check-label">IsActive</label>
                                                        </div>
                                                        <div className="form-check">
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                checked={formData.isAllow}
                                                                onChange={(e) => setFormData({ ...formData, isAllow: e.target.checked })}
                                                            />
                                                            <label className="form-check-label">Is Allow</label>
                                                        </div>
                                                    </div>

                                                    <div className="mb-3">
                                                        <label className="form-label">Markegin:</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={formData.markegin}
                                                            onChange={(e) => setFormData({ ...formData, markegin: e.target.value })}
                                                        />
                                                    </div>

                                                    <div className="mb-3">
                                                        <label className="form-label">Delay:</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={formData.delay}
                                                            onChange={(e) => setFormData({ ...formData, delay: e.target.value })}
                                                        />
                                                    </div>

                                                    <div className="mb-3">
                                                        <label className="form-label">Line Ration:</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={formData.lineRation}
                                                            onChange={(e) => setFormData({ ...formData, lineRation: e.target.value })}
                                                        />
                                                    </div>

                                                    <div className="mb-3">
                                                        <label className="form-label d-block">IsConnected market:</label>
                                                        <div className="form-check form-check-inline">
                                                            <input
                                                                type="radio"
                                                                className="form-check-input"
                                                                name="isConnected"
                                                                checked={formData.isConnectedMarket === true}
                                                                onChange={() => setFormData({ ...formData, isConnectedMarket: true })}
                                                            />
                                                            <label className="form-check-label">True</label>
                                                        </div>
                                                        <div className="form-check form-check-inline">
                                                            <input
                                                                type="radio"
                                                                className="form-check-input"
                                                                name="isConnected"
                                                                checked={formData.isConnectedMarket === false}
                                                                onChange={() => setFormData({ ...formData, isConnectedMarket: false })}
                                                            />
                                                            <label className="form-check-label">False</label>
                                                        </div>
                                                    </div>

                                                    <div className="mb-3">
                                                        <label className="form-label">Market RefID:</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={formData.marketRefID}
                                                            onChange={(e) => setFormData({ ...formData, marketRefID: e.target.value })}
                                                        />
                                                    </div>

                                                    <div className="mb-3">
                                                        <label className="form-label">Rate Differnet:</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={formData.rateDiffernet}
                                                            onChange={(e) => setFormData({ ...formData, rateDiffernet: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    </Col>

                                    {/* Right Side - Runners */}
                                    <Col md={6}>
                                        <Card className="h-100">
                                            <CardBody>
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <h5 className="mb-0">Runners</h5>
                                                    <Button
                                                        color="primary"
                                                        size="sm"
                                                        onClick={addRunner}
                                                        className="d-flex align-items-center"
                                                    >
                                                        <AiOutlinePlus size={16} className="me-1" />
                                                        Add Runner
                                                    </Button>
                                                </div>
                                                <div className="runners-container">
                                                    {formData.runners.map((runner, index) => (
                                                        <Card key={runner.id} className="mb-2 runner-card">
                                                            <CardBody className="py-2">
                                                                <div className="d-flex align-items-center gap-2">
                                                                    <span className="fw-bold" style={{ minWidth: '25px' }}>{index + 1}.</span>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control form-control-sm"
                                                                        placeholder="Runner Name"
                                                                        value={runner.name}
                                                                        onChange={(e) => handleRunnerChange(runner.id, 'name', e.target.value)}
                                                                        style={{ width: '120px' }}
                                                                    />
                                                                    <select
                                                                        className="form-select form-select-sm"
                                                                        value={runner.teamId}
                                                                        onChange={(e) => handleRunnerChange(runner.id, 'teamId', e.target.value)}
                                                                        style={{ width: '150px' }}
                                                                    >
                                                                        <option value="">Select Team</option>
                                                                        {eventData.teams.map(team => (
                                                                            <option key={team.teamId} value={team.teamId}>
                                                                                {team.teamName}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                    {index > 0 && (
                                                                        <Button
                                                                            color="danger"
                                                                            size="sm"
                                                                            onClick={() => removeRunner(runner.id)}
                                                                            className="d-flex align-items-center p-1"
                                                                        >
                                                                            <AiOutlineMinus size={16} />
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </CardBody>
                                                        </Card>
                                                    ))}
                                                </div>
                                            </CardBody>
                                        </Card>
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};