import React, { useState, useEffect } from 'react';
import { AiOutlinePlus, AiOutlineMinus } from 'react-icons/ai';
import { Container, Row, Col, Card, CardBody, Button } from 'reactstrap';
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { isEmpty } from 'lodash';
import axiosInstance from "../../Features/axios.js";
import { updateToastData } from "../../Features/toasterSlice.js";
import { ERROR, INNINGS_CONNECT, INNINGS_RUN_DATA, SUCCESS } from "../../components/Common/Const.js";
import { useDispatch } from "react-redux";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { useLocation, useNavigate } from 'react-router-dom';
import createSocket from '../../Features/socket.js';
import Select from "react-select";
import { convertDateUTCToLocal, convertDateUTCToLocalWithSec24, convertDateUtcFormatWithSec24 } from '../../components/Common/Reusables/reusableMethods.js';

export const ManualOddsMarket = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const [selectedTableElements, setSelectedTableElements] = useState({
        eventType: {label : "Cricket", value : 1},
        competition: null,
        eventName: null,
    });
    
    const commentaryId = sessionStorage.getItem("updateManualOddsCommentaryId") || location?.state?.eventName?.value || selectedTableElements?.eventName?.value;
    const commentaryDetails = JSON.parse(sessionStorage.getItem('updateManualOddsCommentaryDetails') || "{}");
    
    const [eventTypes, setEventTypes] = useState([]);
    const [eventList, setEventList] = useState([]);
    const [competitionList, setCompetitionList] = useState([]);
    const [eventTypeId, setEventTypeId] = useState(null);
    const [competitionId, setCompetitionId] = useState(
        commentaryId ? commentaryDetails?.competitionId : null
      );
    const [EventTypeActive, setEventTypeActive] = useState(true);
    const [formData, setFormData] = useState({
        marketName: '',
        runners: [
            { id: 1, name: '', teamId: '' }
        ],
        isActive: false,
        isAllow: false,
        margin: '',
        delay: '',
        lineRatio: '',
        isConnectedMarket: false,
        eventRefId: '',
        inningsId: "",
        rateDiff: '0.01',
        rateSourceRefID: "",
        favRatio: "",
    });
    

    useEffect(() => {
        if (location?.state) {
            setSelectedTableElements({
            eventType: location?.state?.eventType ?? null,
            competition: location?.state?.competition ?? null,
            eventName: location?.state?.eventName ?? null,
            });

            // Optional: Set related IDs if needed
            setEventTypeId(location?.state?.eventType?.value || null);
            setCompetitionId(location?.state?.competition?.value || null);
        }
    }, [location?.state]);
    // const commentaryId = localStorage.getItem("updateManualOddsCommentaryId");
    // const commentaryDetails = JSON.parse(localStorage.getItem('updateManualOddsCommentaryDetails') || "{}");

    let navigate = useNavigate();
    const [eventData, setEventData] = useState({
        comDetails: null,
        teams: [],
        commentaryDetails: null,
        tpMarkets: [] // Add this
    });
    const socket = createSocket();

    const [isLoading, setIsLoading] = useState(false);
    const dateTyp = JSON.parse(localStorage.getItem("DateType"));

    useEffect(() => {
        if (!isEmpty(commentaryDetails)) {
            document.title = `Bookmakers - ${commentaryDetails?.eventName} [${commentaryDetails?.eventRefId}]`;

            if (formData.eventRefId !== commentaryDetails?.eventRefId) {
                setFormData((prev) => ({
                    ...prev,
                    eventRefId: commentaryDetails?.eventRefId,
                }));
            }
        } else if (location?.state && eventData?.comDetails?.eventRefId) {
            if (formData.eventRefId !== eventData?.comDetails?.eventRefId) {
                setFormData((prev) => ({
                    ...prev,
                    eventRefId: eventData?.comDetails?.eventRefId,
                }));
            }
        }
    }, [commentaryDetails, location?.state, eventData?.comDetails?.eventRefId, formData.eventRefId]);


    const fetchMarketData = async () => {
        setIsLoading(true);
        await axiosInstance.post('/admin/eventMarket/getManualMarket', { commentaryId: commentaryId ? commentaryId : location?.state ? location?.state?.eventName.value : selectedTableElements?.eventName?.value })
            .then((response) => {
                if (response?.result) {
                    if (response.result.market) {
                        handleDynamicNavigation("/updateManualOdds")
                        return;
                    }
                    setEventData({
                        comDetails: response.result.comDetails || null,
                        teams: response.result.teams || [],
                        commentaryDetails: response.result.commentaryDetails || null,
                        tpMarkets: response.result.tpMarkets || [] // Add this
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

    const fetchEventTypeData = async () => {
        await axiosInstance
          .post(`/admin/eventMarket/eventTypeList`, {
            isActive: EventTypeActive,
          })
          .then((response) => {
            setEventTypes(response.result);
            setIsLoading(false);
          })
          .catch((error) => {});
      };
    const fetchCompetitionList = async (eventTypeId) => {
    await axiosInstance
        .post(`/admin/eventMarket/competitionListByEventTypeId`, {
        eventTypeId: eventTypeId,
        })
        .then((response) => {
        setCompetitionList(response.result);
        setIsLoading(false);
        })
        .catch((error) => {});
    };
    const fetchEventList = async (competitionId) => {
    await axiosInstance
        .post(`/admin/eventMarket/commListByCompetitionId`, {
        competitionId: competitionId,
        })
        .then((response) => {
            const result = response.result || [];
            setEventList(result);
            setIsLoading(false);

            const matchedEvent = result.find(
            (event) => event.commentaryId === Number(commentaryId)
            );

            if (matchedEvent) {
            setSelectedTableElements((prev) => ({
                ...prev,
                eventName: {
                value: matchedEvent.commentaryId,
                label: matchedEvent.eventName,
                },
            }));
            setIsLoading(false);
            }
        })
        .catch((error) => {});
    };
    useEffect(() => {
        fetchEventTypeData()
    }, [
        commentaryId,
        commentaryDetails?.commentaryId,
    ])

    useEffect(() => {
        if(commentaryDetails?.competitionId || competitionId){
            fetchEventList(commentaryDetails?.competitionId || competitionId);
        }
    }, [commentaryDetails?.competitionId, competitionId])
    
    useEffect(() => {
        if(commentaryDetails?.eventTypeId || eventTypeId){
            fetchCompetitionList(commentaryDetails?.eventTypeId || eventTypeId);
        }
    }, [commentaryDetails?.eventTypeId, eventTypeId])

    useEffect(() => {
    if (eventTypeId) {
        fetchCompetitionList(eventTypeId);
    } else if (!eventTypeId) {
        setCompetitionList([]);
        setEventList([]);
    }
    }, [eventTypeId]);

    useEffect(() => {
        fetchMarketData();
    }, [selectedTableElements?.eventName?.value]);

    useEffect(() => {
        if (!socket) return;

        if (commentaryId) {
            socket.emit(INNINGS_CONNECT, commentaryId);

            socket.on(INNINGS_RUN_DATA, (data) => {
                //   console.log("innings run data", data);
            });
        }

        return () => {
            socket.off(INNINGS_RUN_DATA);
        };
    }, [socket, commentaryId]);

    useEffect(() => {
        if (eventData?.tpMarkets?.length > 0) {
            const market = eventData.tpMarkets[0]; // Taking first market
            setFormData(prev => ({
                ...prev,
                isConnectedMarket: true,
                eventRefId: market.eventRefId,
                rateSourceRefID: market.eventMarketId,
                inningsId: market.inningsId,
                // rateDiff: market.rateDiff,
                // margin: market.margin // Note: fixing the spelling from 'margin'
            }));
        }
    }, [eventData.tpMarkets]);

    useEffect(() => {
        // Initialize with 2 default runners using team data
        if (eventData.teams.length > 0) {
            const defaultRunners = eventData.teams.slice(0, 2).sort((a,b)=> a?.teamNo - b?.teamNo).map((team, index) => {
                const tpRunner = eventData.tpMarkets?.[0]?.runners?.find(r => r.teamId === team.teamId);
                const selectionId = tpRunner ?
                    tpRunner.selectionId :
                    `${commentaryId}0${index}`;

                return {
                    id: index + 1,
                    name: team.teamName,
                    teamId: team.teamId,
                    selectionId,
                };
            });

            setFormData(prev => ({
                ...prev,
                runners: defaultRunners
            }));
        }
    }, [eventData.teams, eventData.tpMarkets]);

    const handleDynamicNavigation = (navigateTo) => {
        navigate(navigateTo, {state: selectedTableElements.eventName != null ? selectedTableElements : location?.state });
    };


    const handleSave = async () => {
        setIsLoading(true); // Use the same loading state
        const formattedRunners = formData.runners.map((runner, index) => {
            if (runner.selectionId && runner.selectionId.includes(commentaryId)) {
                return {
                    ...runner,
                    selectionId: `${commentaryId}0${index}`,
                };
            }
            return runner;
        });

        const dataToSend = {
            ...formData,
            runners: formattedRunners,
            commentaryId,
            marketTypeId: 5,
            marketTypeCategoryId: 8,
            inningsId: formData.inningsId || "0",
            rateSourceRefID: formData?.rateSourceRefID || 0,
        };
        await axiosInstance.post('/admin/eventMarket/saveManualMarket', dataToSend)
            .then((response) => {
                if (response?.result?.success || response?.success) {
                    dispatch(updateToastData({
                        data: response?.result || response?.message,
                        title: response?.title || "Success",
                        type: SUCCESS
                    }));
                    handleDynamicNavigation("/updateManualOdds")
                }
            })
            .catch((error) => {
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const handleBackClick = () => {
        handleDynamicNavigation("/commentary")
    };

    const addRunner = () => {
        const newId = formData.runners.length + 1;
        const newRunner = {
            id: newId,
            name: '',
            teamId: '',
            selectionId: `${commentaryId}0${newId}`,
        };

        setFormData({
            ...formData,
            runners: [...formData.runners, newRunner]
        });
    };

    const removeRunner = (id) => {
        if (formData.runners.length <= 1) {
            return;
        }

        const updatedRunners = formData.runners
            .filter(runner => runner.id !== id)
            .map((runner, index) => ({
                ...runner,
                id: index + 1,
                selectionId: runner.selectionId.includes(commentaryId) ?
                    `${commentaryId}0${index + 1}` :
                    runner.selectionId
            }));

        setFormData({
            ...formData,
            runners: updatedRunners
        });
    };

    const handleRunnerChange = (id, field, value) => {
        setFormData({
            ...formData,
            runners: formData.runners.map(runner =>
                runner.id === id
                    ? field === 'runner'
                        ? value  // If updating entire runner object
                        : { ...runner, [field]: value }  // If updating single field
                    : runner
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
                                
                                {isLoading && <SpinnerModel />}
                                <Row>
                                    {!isEmpty(eventData?.comDetails) && (
                                        <Col className="mb-3">
                                            <div className="match-details-breadcrumbs">
                                                {eventData.comDetails.eventName}
                                            </div>
                                            <div>
                                                {`Ref: ${eventData.comDetails.eventRefId} [ ${dateTyp?.value == 1 ? convertDateUTCToLocalWithSec24(eventData?.comDetails?.eventDate, "index") : convertDateUtcFormatWithSec24(eventData?.comDetails?.eventDate, "index")} ]`}
                                                {/* {`Ref: ${eventData.comDetails.eventRefId} [ ${new Date(eventData.comDetails.eventDate).toLocaleString()} ]`} */}
                                            </div>
                                        </Col>
                                    )}
                                </Row>
                                <Row>
                                    <div className='d-flex'>
                                    {/* Event Type */}
                                    <Select
                                        styles={{ control: (base) => ({ ...base, width: 180 }) }}
                                        value={selectedTableElements?.eventType}
                                        isDisabled = {location?.state?.eventType}
                                        placeholder="Event Type"
                                        onChange={(e) => {
                                        setSelectedTableElements({
                                            eventType: e,
                                            competition: null,
                                            eventName: null,
                                        });
                                        setEventTypeId(e?.value);
                                        setCompetitionId(null);
                                        }}
                                        options={[
                                        { label: "Select Event Type", value: null },
                                        ...eventTypes.map((item) => ({
                                            label: item?.eventType,
                                            value: item?.eventTypeId,
                                        })),
                                        ]}
                                        classNamePrefix="filter-dropdown"
                                    />

                                    {/* Competition */}
                                    <Select
                                        styles={{ control: (base) => ({ ...base, width: 180 }) }}
                                        value={selectedTableElements?.competition}
                                        isDisabled = {location?.state?.competition}
                                        placeholder="Competition List"
                                        onChange={(e) => {
                                        setCompetitionId(e?.value);
                                        setSelectedTableElements((prev) => ({
                                            ...prev,
                                            competition: e,
                                            eventName: null,
                                        }));
                                        }}
                                        options={competitionList.map((item) => {
                                            return {
                                            label: item?.competition,
                                            value: item?.competitionId,
                                            }
                                        })}
                                        classNamePrefix="filter-dropdown"
                                    />

                                    {/* Event List */}
                                    <Select
                                        styles={{ control: (base) => ({ ...base, width: 180 }) }}
                                        value={selectedTableElements?.eventName}
                                        isDisabled = {location?.state?.eventName}
                                        placeholder="Event List"
                                        onChange={(e) => {
                                        setSelectedTableElements((prev) => ({
                                            ...prev,
                                            eventName: e,
                                        }));
                                        }}
                                        options={eventList
                                        .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
                                        .map((item) => ({
                                            label: `${item?.eventName} (${convertDateUTCToLocal(item?.eventDate, "index")})`,
                                            value: item?.commentaryId,
                                        }))}
                                        classNamePrefix="filter-dropdown"
                                    />
                                    </div>
                                </Row>
                                <Row>
                                    {!isEmpty(eventData?.commentaryDetails) && (
                                        <Col className='mb-3'>
                                            <div className='match-details-breadcrumbs'>
                                                {`${eventData.commentaryDetails.ety}/ ${eventData.commentaryDetails.com}/ ${eventData.commentaryDetails.en}`}
                                            </div>
                                            <div>
                                                {`Ref: ${eventData.commentaryDetails.eid} [ ${eventData.commentaryDetails.ed + " " + eventData.commentaryDetails.et} ]`}
                                                {/* {`Ref: ${eventData.commentaryDetails.eid} [ ${dateTyp?.value == 1 ? convertDateUTCToLocalWithSec24(eventData?.commentaryDetails?.eventDate, "index") : convertDateUtcFormatWithSec24(eventData?.commentaryDetails.eventDate, "index")} ]`} */}
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
                                                        <label className="form-label">Margin:</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={formData.margin}
                                                            onChange={(e) => setFormData({ ...formData, margin: e.target.value })}
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
                                                            value={formData.lineRatio}
                                                            onChange={(e) => setFormData({ ...formData, lineRatio: e.target.value })}
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

                                                    {formData.isConnectedMarket && <div className="mb-3">
                                                        <label className="form-label">Market RefID:</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={formData.rateSourceRefID}
                                                            onChange={(e) => setFormData({ ...formData, rateSourceRefID: e.target.value })}
                                                        />
                                                    </div>}

                                                    <div className="mb-3">
                                                        <label className="form-label">Rate Difference:</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={formData.rateDiff}
                                                            onChange={(e) => setFormData({ ...formData, rateDiff: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="mb-3">
                                                        <label className="form-label">Fav Ratio:</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={formData.favRatio}
                                                            onChange={(e) => setFormData({ ...formData, favRatio: e.target.value })}
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
                                                    <h5 className="mb-0 modal-header-title">Runners</h5>
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
                                                    {formData.runners?.map((runner, index) => (
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
                                                                    {eventData.tpMarkets?.length > 0 && (
                                                                        <select
                                                                            className="form-select form-select-sm"
                                                                            value={runner.selectionId || ''}
                                                                            onChange={(e) => {
                                                                                const selectedRunner = eventData.tpMarkets[0].runners.find(
                                                                                    r => r.selectionId === e.target.value
                                                                                );

                                                                                if (selectedRunner) {
                                                                                    // Create a new runner object with all fields from the selected TP runner
                                                                                    // but keep the existing name
                                                                                    const updatedRunner = {
                                                                                        ...runner,
                                                                                        teamId: selectedRunner.teamId,
                                                                                        selectionId: selectedRunner.selectionId,
                                                                                    };
                                                                                    // Update the entire runner object at once
                                                                                    handleRunnerChange(runner.id, 'runner', updatedRunner);
                                                                                } else {
                                                                                    // If "None" is selected, reset the runner to default values but keep the name
                                                                                    const defaultRunner = {
                                                                                        ...runner,
                                                                                        // name: '',  // Remove this line to keep existing name
                                                                                        teamId: '',
                                                                                        selectionId: `${commentaryId}0${index}`,
                                                                                    };
                                                                                    handleRunnerChange(runner.id, 'runner', defaultRunner);
                                                                                }
                                                                            }}
                                                                            style={{ width: '150px' }}
                                                                        >
                                                                            <option value="">None</option>
                                                                            {eventData.tpMarkets[0].runners.map(tpRunner => (
                                                                                <option key={tpRunner.selectionId} value={tpRunner.selectionId}>
                                                                                    {tpRunner.runner}
                                                                                </option>
                                                                            ))}
                                                                        </select>
                                                                    )}
                                                                    {index >= 0 && (
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