import React, { useState, useEffect } from 'react';
import { AiOutlinePlus, AiOutlineMinus } from 'react-icons/ai';
import { Container, Row, Col, ButtonDropdown, DropdownItem, DropdownToggle, DropdownMenu, Card, CardBody, Button, Input } from 'reactstrap';
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { isEmpty } from 'lodash';
import axiosInstance from "../../Features/axios.js";
import { updateToastData } from "../../Features/toasterSlice.js";
import { ERROR, INNINGS_CONNECT, INNINGS_RUN_DATA, SAVE, SAVE_AND_CLOSE, SAVE_AND_NEW, SUCCESS } from "../../components/Common/Const.js";
import { useDispatch } from "react-redux";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { useLocation, useNavigate } from 'react-router-dom';
import createSocket from '../../Features/socket.js';
import Select from "react-select";
import { convertDateUTCToLocal } from '../../components/Common/Reusables/reusableMethods.js';

export const AddManualOdds = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const [selectedTableElements, setSelectedTableElements] = useState({
        eventType: null,
        competition: null,
        eventName: null,
    });
    
    const commentaryId = location?.state?.eventName?.value || selectedTableElements?.eventName?.value || location?.state?.commentaryId;

    // const rawDetails = sessionStorage.getItem('updateManualOddsCommentaryDetails');
    const commentaryDetails = {};
    const [drp_up, setDrp_up] = useState(false);
    const [isEdit , setIsEdit] = useState(location?.state?.isEdit || false)
    const [eventTypes, setEventTypes] = useState([]);
    const [eventList, setEventList] = useState([]);
    const [competitionList, setCompetitionList] = useState([]);
    const [eventMarketId, setEventMarketId] = useState(location?.state?.eventMarketId || 0);
    const [eventTypeId, setEventTypeId] = useState(null);
    const [competitionId, setCompetitionId] = useState(
        commentaryId ? commentaryDetails?.competitionId : null
      );
    const [formErrors, setFormErrors] = useState({});
    const [EventTypeActive, setEventTypeActive] = useState(true);
    const [formData, setFormData] = useState({
        marketName: '',
        runner: [
            { id: 1, name: '', teamId: '', runnerId: 0 }
        ],
        isActive: false,
        isAllow: false,
        margin: 1,
        delay: 2,
        lineRatio: 3,
        isConnectedMarket: false,
        eventRefId: '',
        inningsId: "",
        rateDiff: '0.01',
        rateSourceRefID: "",
        favRatio: "",
    });

    useEffect(() => {
        if (location?.state && typeof location.state?.eventType == 'object') {
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
        tpMarkets: [], // Add this
        market: []
    });
    const socket = createSocket();

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!isEmpty(commentaryDetails) && !(eventData?.comDetails)) {
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

    
    useEffect(() => {
        if (eventData?.market) {
            const selectedMarket = eventData.market; // or filter by some ID if needed
            const {
                marketName,
                isActive,
                isAllow,
                margin,
                delay,
                eventRefId,
                inningsId,
                rateDiff,
                rateSourceRefID,
                favRatio,
                lineRatio,
                runners = [],
                teamId
            } = selectedMarket;

            const formattedRunners = runners?.map((runner, index) => {
                return {
                id: index + 1,
                name: runner.runner || '',
                teamId: runner.teamId || '',
                runnerId: runner.runnerId || 0
            }});

            setFormData(prev => ({
                ...prev,
                marketName: marketName || '',
                isActive: isActive ?? false,
                isAllow: isAllow ?? false,
                margin: margin || 1,
                delay: delay || 2,
                eventRefId: eventRefId || '',
                inningsId: inningsId ?? '',
                rateDiff: rateDiff?.toString() || '0.01',
                rateSourceRefID: rateSourceRefID?.toString() || '',
                favRatio: favRatio?.toString() || '',
                lineRatio: lineRatio || 3,
                runner: formattedRunners,
            }));
        }
    }, [eventData.market]);

    const fetchMarketData = async (e) => {
        setIsLoading(true);
        await axiosInstance.post('/admin/eventMarket/getManualMarket', { commentaryId, eventMarketId: e})
            .then((response) => {
                if (response?.result) {
                    // if (response.result.market) {
                    //     handleDynamicNavigation("/updateManualOdds")
                    //     return;
                    // }
                    const selectedMarket = response.result.market?.find(
                        (m) => m.eventMarketId === location?.state?.eventMarketId
                    ) || null;
                    setEventData({
                        comDetails: response.result.comDetails || null,
                        teams: response.result.teams || [],
                        commentaryDetails: response.result.commentaryDetails || null,
                        tpMarkets: response.result.tpMarkets || [], // Add this
                        market: selectedMarket
                    });
                    if (selectedMarket) {
                        setFormData({
                            marketName: selectedMarket.marketName || '',
                            runner: selectedMarket?.runners || [{ id: 1, name: '', teamId: ''}],
                            isActive: selectedMarket.isActive ?? false,
                            isAllow: selectedMarket.isAllow ?? false,
                            margin: Number(selectedMarket.margin) || 1,
                            delay: Number(selectedMarket.delay) || 2,
                            lineRatio: Number(selectedMarket.lineRatio) || 3,
                            isConnectedMarket: selectedMarket.isConnectedMarket ?? false,
                            eventRefId: selectedMarket.eventRefId || '',
                            inningsId: selectedMarket.inningsId || '',
                            rateDiff: selectedMarket.rateDiff || '0.01',
                            rateSourceRefID: selectedMarket.rateSourceRefID || '',
                            favRatio: selectedMarket.favRatio || '',
                        });
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

    // useEffect(() => {
    //     if (location?.state?.isEdit) {
    //         const {
    //         marketName,
    //         isActive,
    //         isAllow,
    //         margin,
    //         delay,
    //         eventRefId,
    //         inningsId,
    //         lineRatio
    //         } = location.state;

    //         setFormData((prev) => ({
    //         ...prev,
    //         marketName: marketName || '',
    //         isActive: isActive ?? false,
    //         isAllow: isAllow ?? false,
    //         margin: Number(margin) || 0,
    //         delay: Number(delay) || 0,
    //         eventRefId: eventRefId || '',
    //         inningsId: inningsId ?? '',
    //         lineRatio: Number(lineRatio)|| 0
    //         }));
    //     }
    // }, [location?.state]);

    // useEffect(() => {
    //     const commentaryDetails = JSON.parse(sessionStorage.getItem('updateManualOddsCommentaryDetails') || '{}');

    //     if (Object.keys(commentaryDetails).length > 0) {
    //         setSelectedTableElements({
    //             eventType: {
    //                 label: commentaryDetails.eventTypeName,
    //                 value: commentaryDetails.eventTypeName, // or an ID if available
    //             },
    //             competition: {
    //                 label: commentaryDetails.competitionName,
    //                 value: commentaryDetails.competitionName, // or an ID if available
    //             },
    //             eventName: {
    //                 label: commentaryDetails.eventName,
    //                 value: commentaryDetails.eventName, // or eventRefId or similar unique value
    //             },
    //         });
    //     }
    // }, []);

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

    // useEffect(() => {
    // if (eventTypeId) {
    //     fetchCompetitionList(eventTypeId);
    // } else if (!eventTypeId) {
    //     setCompetitionList([]);
    //     setEventList([]);
    // }
    // }, [eventTypeId]);

    useEffect(() => {
        if(commentaryId){
            fetchMarketData(eventMarketId);
        }
    }, [commentaryId]);

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
        if (eventData.teams.length > 0 && !isEdit) {
            const defaultRunners = eventData.teams.slice(0, 2).sort((a, b) => a?.teamNo - b?.teamNo).map((team, index) => {
                let selectionId = `${commentaryId}0${index}`;

                if (isEdit && eventData.tpMarkets?.[0]?.runners?.[index]?.selectionId) {
                   selectionId = eventData.market?.runners[index].selectionId;
                }

                const previousRunner = formData?.runner?.find(
                    (r) => r.selectionId?.toString() === selectionId?.toString()
                );

                return {
                    id: index + 1,
                    name: team.teamName,
                    teamId: team.teamId,
                    runnerId: previousRunner?.runnerId ?? undefined,
                    selectionId: isEdit ? eventData.market?.runners[index].selectionId : selectionId,
                };
            });

            setFormData(prev => ({
                ...prev,
                runner: defaultRunners,
            }));
        }
        if(eventData?.market?.runners && isEdit){
            const defaultRunners = eventData.market.runners.map((runner, index) => {
            const matchingTpRunner = eventData.tpMarkets?.[0]?.runners?.find(
                (tp) => tp.selectionId?.toString() === runner.selectionId?.toString()
            );

            // const previousRunner = formData?.runner?.find(
            //     (r) => r.selectionId?.toString() === runner.selectionId?.toString()
            // );

            return {
                id: index + 1,
                name: runner.runner,
                teamId: matchingTpRunner?.teamId ?? runner.teamId ?? null,
                runnerId: runner?.runnerId,
                selectionId: runner.selectionId
            };
        });



            setFormData(prev => ({
                ...prev,
                runner: defaultRunners,
            }));
        }
    }, [eventData.teams, eventData.tpMarkets, isEdit, commentaryId]);

    const handleDynamicNavigation = (navigateTo) => {
        navigate(navigateTo, {state: selectedTableElements.eventName != null ? selectedTableElements : location?.state });
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.marketName || formData.marketName.trim() === "") {
            errors.marketName = "Market name is required";
        }
        if (!formData.margin) {
            errors.margin = "Margin is required";
        }

        if (!formData.lineRatio) {
            errors.lineRatio = "Line Ratio is required";
        }

        if (!formData.delay) {
            errors.delay = "Delay is required";
        }

        return errors;
    };

    const handleSave = async (type) => {
        const errors = validateForm();

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return; // Stop submission
        }
        // setIsLoading(true); // Use the same loading state
        const formattedRunners = formData.runner.map((runner, index) => {
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
            margin: Number(formData.margin),
            delay: Number(formData.delay),
            lineRatio: Number(formData.lineRatio),
            runner: formattedRunners,
            commentaryId,
            marketTypeId: 5,
            marketTypeCategoryId: 8,
            eventMarketId: isEdit ? location?.state?.eventMarketId : 0,
            inningsId: formData.inningsId || "0",
            rateSourceRefID: formData?.rateSourceRefID || 0,
            status: isEdit && eventData.market.status
        };
        await axiosInstance.post('/admin/eventMarket/saveManualMarket', dataToSend)
            .then((response) => {
                if (response?.result?.success || response?.success) {
                    dispatch(updateToastData({
                        data: response?.result || response?.message,
                        title: response?.title || "Success",
                        type: SUCCESS
                    }));
                    if(type === "SAVE_AND_CLOSE"){
                        handleDynamicNavigation("/manualOddsMarkets")
                    }else if(type === 'SAVE_AND_NEW'){
                        if(commentaryId){
                            if(isEdit){
                                setEventMarketId(0)
                                setIsEdit(false)
                            }else{
                            setSelectedTableElements({
                                eventType: location.state.eventType,
                                competition: location.state.competition,
                                eventName: location.state.eventName,
                            })}
                        }
                        else{
                            setSelectedTableElements({
                                eventType: null,
                                competition: null,
                                eventName: null,
                            })
                        }
                        if(location.state.eventName){
                            fetchMarketData()
                        }
                        setFormErrors({})
                        setFormData({
                            commentaryId: dataToSend.commentaryId,
                            eventRefId: dataToSend.eventRefId,
                            marketName: '',
                            runner: [
                                { id: 1, name: '', teamId: '', runnerId: 0 }
                            ],
                            isActive: false,
                            isAllow: false,
                            margin: 1,
                            delay: 2,
                            lineRatio: 3,
                            isConnectedMarket: false,
                            inningsId: "",
                            rateDiff: '0.01',
                            rateSourceRefID: "",
                            favRatio: "",
                        })
                        setEventData({
                            comDetails: null,
                            teams: [],
                            commentaryDetails: null,
                            tpMarkets: [] // Add this
                        })
                    }else if(type === "SAVE"){
                        setFormErrors({})
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

    const handleBackClick = () => {
        handleDynamicNavigation("/manualOddsMarkets")
    };

    const addRunner = () => {
        const newId = formData.runner.length + 1;
        const newRunner = {
            id: newId,
            name: '',
            teamId: '',
            selectionId: `${commentaryId}0${newId}`,
        };

        setFormData({
            ...formData,
            runner: [...formData.runner, newRunner]
        });
    };

    const removeRunner = (id) => {
        if (formData.runner.length <= 1) {
            return;
        }

        const updatedRunners = formData.runner
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
            runner: updatedRunners
        });
    };

    const handleRunnerChange = (id, field, value) => {
        setFormData({
            ...formData,
            runner: formData.runner.map(runner =>
                runner.id === id
                    ? field === 'runner'
                        ? value  // If updating entire runner object
                        : { ...runner, [field]: value }  // If updating single field
                    : runner
            )
        });
    };

    const handleFormFieldChange = (fieldName, isRequired = true) => (e) => {
        const rawValue = e.target.value;
        const trimmedValue = rawValue.trimStart(); // Remove leading spaces

        // Update the form data
        setFormData((prev) => ({
            ...prev,
            [fieldName]: trimmedValue,
        }));

        // Update form errors
        setFormErrors((prevErrors) => {
            const newErrors = { ...prevErrors };

            if (isRequired && trimmedValue.trim() === "") {
                newErrors[fieldName] = `${fieldName[0].toUpperCase() + fieldName.slice(1)} is required`;
            } else {
                delete newErrors[fieldName];
            }

            return newErrors;
        });
    };
    useEffect(() => {
        if (location?.state && isEdit) {
            setSelectedTableElements({
                eventType: {
                    value: location.state.eventTypeId,
                    label: location.state.eventTypeName,
                },
                competition: {
                    value: location.state.competitionId,
                    label: location.state.competitionName,
                },
                eventName: {
                    value: location.state.commentaryId,
                    label: location.state.eventName,
                },
            });
        }
    }, [location?.state]);

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid={true}>
                    <Row>
                        <Card>
                            <CardBody>
                                <Row className="align-items-center">
                                    <Col xs={8}>
                                        <Breadcrumbs title="ScoreCard" breadcrumbItem={isEdit ? 'Update Manual Odds Market' : 'Add Manual Odds Market'} page="updatecp" />
                                    </Col>
                                    <Col xs={4} className="text-end">
                                        <div className="d-flex gap-2 justify-content-end">
                                            <Button color="danger" onClick={handleBackClick}>Exit</Button>
                                            <ButtonDropdown
                                            direction="down"
                                            isOpen={drp_up}
                                            toggle={() => setDrp_up(!drp_up)}
                                            >
                                            <Button
                                                id="caret"
                                                color="primary"
                                                onClick={() => handleSave(SAVE_AND_CLOSE)}
                                            >
                                                Save & Close
                                            </Button>
                                            <DropdownToggle caret color="primary">
                                                <i className="mdi mdi-chevron-down" />
                                            </DropdownToggle>
                                            <DropdownMenu>
                                                <DropdownItem onClick={() => handleSave(SAVE)}>Save</DropdownItem>
                                                <DropdownItem onClick={() => handleSave(SAVE_AND_NEW)}>Save & New</DropdownItem>
                                            </DropdownMenu>
                                            </ButtonDropdown>
                                        </div>
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
                                                {`Ref: ${eventData.comDetails.eventRefId} [ ${new Date(eventData.comDetails.eventDate).toLocaleString()} ]`}
                                            </div>
                                        </Col>
                                    )}
                                </Row>
                                <Row>
                                    {/* Left Side Form Fields */}
                                    <Col md={6}>
                                        <Card className="h-100">
                                            <CardBody className="py-0">
                                                {<div className='d-flex justify-content-between gap-2 mb-3'>
                                                    {/* Event Type */}
                                                    <div>
                                                        <label className="form-label">Event Type:</label>
                                                        <Select
                                                            styles={{ control: (base) => ({ ...base, width: 180 }) }}
                                                            value={selectedTableElements?.eventType}
                                                            isDisabled = {location?.state?.eventType?.value || location?.state?.eventTypeName && isEdit}
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
                                                    </div>

                                                    {/* Competition */}
                                                    <div>
                                                        <label className="form-label">Competition:</label>
                                                        <Select
                                                            styles={{ control: (base) => ({ ...base, width: 180 }) }}
                                                            value={selectedTableElements?.competition}
                                                            isDisabled = {location?.state?.competition || location?.state?.competitionName && isEdit}
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
                                                    </div>

                                                    {/* Event List */}
                                                    <div>
                                                        <label className="form-label">Event List:</label>
                                                        <Select
                                                            styles={{ control: (base) => ({ ...base, width: 180 }) }}
                                                            value={selectedTableElements?.eventName}
                                                            isDisabled = {location?.state?.eventName && isEdit}
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
                                                </div>}
                                                <div className="space-y-4">
                                                    <div className="mb-3">
                                                        <span className="text-danger">*&nbsp;</span><label className="form-label">Market Name:</label>
                                                        <Input
                                                            required={true}
                                                            invalid={formErrors?.marketName}
                                                            type="text"
                                                            className="form-control"
                                                            disabled={isEdit}
                                                            value={formData.marketName}
                                                            // onChange={(e) => {
                                                            //     setFormData({ ...formData, marketName: e.target.value.trimStart() })
                                                            //     setFormErrors((prevErrors) => {
                                                            //         const newErrors = { ...prevErrors };

                                                            //         if (e.target.value.trim() === "") {
                                                            //             newErrors.marketName = "Market name is required";
                                                            //         } else {
                                                            //             delete newErrors.marketName;
                                                            //         }

                                                            //         return newErrors;
                                                            //     });
                                                            // }}
                                                            onChange={handleFormFieldChange("marketName")}
                                                        />
                                                        {formErrors?.marketName && <span style={{ color: "red" }}>{formErrors?.marketName}</span>}
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
                                                    <div className='d-flex justify-content-between mb-3 gap-2'>
                                                        <div>
                                                            <span className="text-danger">*&nbsp;</span><label className="form-label">Margin:</label>
                                                            <Input
                                                                required={true}
                                                                invalid={formErrors?.margin}
                                                                type="number"
                                                                className="form-control"
                                                                value={formData.margin}
                                                                // onChange={(e) => {
                                                                //     const value = e.target.value;

                                                                //     setFormData((prev) => ({
                                                                //         ...prev,
                                                                //         margin: value.trimStart(), // optional: trim leading spaces
                                                                //     }));

                                                                //     setFormErrors((prevErrors) => {
                                                                //         const newErrors = { ...prevErrors };

                                                                //         if (value.trim() === "") {
                                                                //             newErrors.margin = "Margin is required";
                                                                //         } else {
                                                                //             delete newErrors.margin;
                                                                //         }

                                                                //         return newErrors;
                                                                //     });
                                                                // }}
                                                                onChange={handleFormFieldChange("margin")}
                                                            />
                                                            {formErrors?.margin && <span style={{ color: "red" }}>{formErrors?.margin}</span>}
                                                        </div>

                                                        <div>
                                                            <span className="text-danger">*&nbsp;</span><label className="form-label">Delay:</label>
                                                            <Input
                                                                required={true}
                                                                invalid={formErrors?.delay}
                                                                type="number"
                                                                className="form-control"
                                                                value={formData.delay}
                                                                onChange={handleFormFieldChange("delay")}
                                                                // onChange={(e) => setFormData({ ...formData, delay: e.target.value })}
                                                            />
                                                            {formErrors?.delay && <span style={{ color: "red" }}>{formErrors?.delay}</span>}
                                                        </div>

                                                        <div>
                                                            <span className="text-danger">*&nbsp;</span><label className="form-label">Line Ratio:</label>
                                                            <Input
                                                                invalid={formErrors?.lineRatio}
                                                                required={true}
                                                                type="number"
                                                                className="form-control"
                                                                value={formData.lineRatio}
                                                                onChange={handleFormFieldChange("lineRatio")}
                                                                // onChange={(e) => setFormData({ ...formData, lineRatio: e.target.value })}
                                                            />
                                                            {formErrors?.lineRatio && <span style={{ color: "red" }}>{formErrors?.lineRatio}</span>}
                                                        </div>
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
                                    <Col md={6} className="mt-4">
                                        <Card className="h-100">
                                            <CardBody className="py-0">
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <h5 className="mb-0 modal-header-title">Runners</h5>
                                                    {!isEdit && <Button
                                                        color="primary"
                                                        size="sm"
                                                        onClick={addRunner}
                                                        className="d-flex align-items-center"
                                                    >
                                                        <AiOutlinePlus size={16} className="me-1" />
                                                        Add Runner
                                                    </Button>}
                                                </div>
                                                <div className="runners-container">
                                                    {formData.runner?.map((runner, index) => {
                                                        return <Card key={runner.id} className="mb-2 runner-card">
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
                                                                        disabled={isEdit}
                                                                    />
                                                                    {/* {console.log("runner.selectionId eventData.eventData.tpMarkets[0].runners", eventData?.tpMarkets[0]?.runners)} */}
                                                                    {eventData.tpMarkets?.length > 0 && (
                                                                        <select
                                                                            className="form-select form-select-sm"
                                                                            value={runner.selectionId}
                                                                            onChange={(e) => {
                                                                                
                                                                                const selectedRunner = eventData.tpMarkets[0]?.runners.find(
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
                                                                            {eventData.tpMarkets[0]?.runners.map(tpRunner => {
                                                                                return <option key={tpRunner.selectionId} value={tpRunner.selectionId}>
                                                                                    {tpRunner.runner}
                                                                                </option>
                                                                            })}
                                                                        </select>
                                                                    )}
                                                                    {(index >= 0 && !isEdit) && (
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
                                                    })}
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