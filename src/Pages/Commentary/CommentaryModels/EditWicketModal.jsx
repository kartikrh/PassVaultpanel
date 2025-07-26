import React, { useEffect, useState } from 'react'
import { Button, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row, Col, Card, CardBody } from 'reactstrap';
import Select from 'react-select';
import "../CommentaryCss.css"
import axiosInstance from '../../../Features/axios';
import SpinnerModel from "../../../components/Model/SpinnerModel";
import { BOLD, BOLD_LABEL, BOWLING_TEAM, CATCH, CATCH_LABEL, HIT_BALL_TWICE, HIT_BALL_TWICE_LABEL, HIT_WICKET, HIT_WICKET_LABEL, LBW, LBW_LABEL, OBSTRACT_THE_FIELDING, OBSTRACT_THE_FIELDING_LABEL, RETIRED_OUT, RETIRED_OUT_LABEL, RUN_OUT, RUN_OUT_LABEL, STUMP, STUMP_LABEL, TIMED_OUT, TIMED_OUT_LABEL } from '../CommentartConst';

const EditWicketDetails = ({ onClose, ballId, playersList }) => {
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [wicketData, setWicketData] = useState(null)
    const [fielder1, setFielder1] = useState(null)
    const [fielder2, setFielder2] = useState(null)

    const fielderList = playersList[BOWLING_TEAM]?.map(element => {
        return { label: element.playerName, value: element.commentaryPlayerId }
    }) || []

    const wicketTypes = {
        [BOLD]: BOLD_LABEL,
        [CATCH]: CATCH_LABEL,
        [STUMP]: STUMP_LABEL,
        [HIT_WICKET]: HIT_WICKET_LABEL,
        [LBW]: LBW_LABEL,
        [RUN_OUT]: RUN_OUT_LABEL,
        [RETIRED_OUT]: RETIRED_OUT_LABEL,
        [TIMED_OUT]: TIMED_OUT_LABEL,
        [HIT_BALL_TWICE]: HIT_BALL_TWICE_LABEL,
        [OBSTRACT_THE_FIELDING]: OBSTRACT_THE_FIELDING_LABEL
    }

    // Validation logic
    const isFormValid = fielder1 && fielder2;

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await axiosInstance.post(
                    "/admin/commentary/commWicketById",
                    { commentaryWicketId: ballId }
                );
                if (response?.result) {
                    setWicketData(response?.result)
                    // Pre-select current fielders for react-select
                    const currentFielder1 = fielderList.find(p => p.value === response?.result?.fieldPlayerId)
                    const currentFielder2 = fielderList.find(p => p.value === response?.result?.fieldPlayer2Id)
                    setFielder1(currentFielder1 || null)
                    setFielder2(currentFielder2 || null)
                }
            } catch (error) {
                console.error("Error fetching wicket data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData()
    }, [ballId])

    const handleSave = async () => {
        if (!fielder1 || !fielder2) {
            return; // Both fielders are required
        }

        setIsSaving(true);
        try {
            const updateData = {
                ...wicketData,
                fieldPlayerId: fielder1.value,
                fieldPlayer2Id: fielder2.value,
                fieldPlayerName: fielder1.label,
                fieldPlayer2Name: fielder2.label
            };

            const response = await axiosInstance.post(
                "/admin/commentary/updateCommWicket",
                updateData
            );

            if (response?.success) {
                onClose();
            }
        } catch (error) {
            console.error("Error updating wicket:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const customSelectStyles = {
        control: (provided, state) => ({
            ...provided,
            borderColor: state.isFocused ? '#007bff' : '#ced4da',
            boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(0, 123, 255, 0.25)' : null,
            '&:hover': {
                borderColor: '#007bff'
            },
            minHeight: '38px'
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#007bff' : state.isFocused ? '#f8f9fa' : null,
            color: state.isSelected ? 'white' : '#212529'
        }),
        menu: (provided) => ({
            ...provided,
            zIndex: 9999
        }),
        menuPortal: (provided) => ({
            ...provided,
            zIndex: 9999
        })
    };

    const formatOverBall = (overCount) => {
        const over = Math.floor(overCount);
        const ball = Math.round((overCount - over) * 10);
        return `${over}.${ball}`;
    };

    return (
        <Modal backdrop="static" className="commentary-modal" size="lg" zIndex={1000} isOpen={true} onClose={onClose}>
            <ModalHeader className="bg-primary text-white">
                <i className="fas fa-edit me-2"></i>
                Edit Wicket Details
            </ModalHeader>

            {isLoading ? (
                <SpinnerModel />
            ) : wicketData ? (
                <ModalBody className="p-4">
                    {/* Wicket Overview Card */}
                    <Card className="mb-4 border-left-danger">
                        <CardBody>
                            <h5 className="text-danger mb-3">
                                <i className="fas fa-user-times me-2"></i>
                                Wicket Information
                            </h5>
                            <Row>
                                <Col md={6}>
                                    <div className="info-item mb-2">
                                        <strong>Batsman:</strong>
                                        <span className="ms-2 text-primary">{wicketData.batterName}</span>
                                    </div>
                                    <div className="info-item mb-2">
                                        <strong>Bowler:</strong>
                                        <span className="ms-2 text-success">{wicketData.bowlerName}</span>
                                    </div>
                                    <div className="info-item mb-2">
                                        <strong>Wicket Type:</strong>
                                        <span className="ms-2 badge bg-warning text-dark">
                                            {wicketTypes[wicketData.wicketType] || 'Unknown'}
                                        </span>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="info-item mb-2">
                                        <strong>Over.Ball:</strong>
                                        <span className="ms-2 text-info">{formatOverBall(wicketData.overCount)}</span>
                                    </div>
                                    <div className="info-item mb-2">
                                        <strong>Team Score:</strong>
                                        <span className="ms-2 text-dark">{wicketData.teamScore}/{wicketData.wicketCount}</span>
                                    </div>
                                    <div className="info-item mb-2">
                                        <strong>Innings:</strong>
                                        <span className="ms-2">{wicketData.currentInnings}</span>
                                    </div>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>

                    {/* Editable Fielders Section */}
                    <Card className="border-left-primary">
                        <CardBody>
                            <h5 className="text-primary mb-4">
                                <i className="fas fa-users me-2"></i>
                                Fielding Details (Editable)
                            </h5>

                            <Row>
                                <Col md={6}>
                                    <div className="form-group mb-3">
                                        <Label className="form-label fw-bold">
                                            <i className="fas fa-user me-1"></i>
                                            Fielder 1: <span className="text-danger">*</span>
                                            <small className="text-muted ms-2">({fielderList?.length || 0} players available)</small>
                                        </Label>
                                        <Select
                                            value={fielder1}
                                            onChange={setFielder1}
                                            options={fielderList || []}
                                            styles={customSelectStyles}
                                            placeholder={fielderList?.length > 0 ? "Select Fielder 1" : "No players available"}
                                            isClearable
                                            isSearchable
                                            menuPortalTarget={document.body}
                                            menuPosition="fixed"
                                            maxMenuHeight={200}
                                            noOptionsMessage={() => "No players available"}
                                            loadingMessage={() => "Loading players..."}
                                            isDisabled={!fielderList || fielderList.length === 0}
                                        />
                                        <small className="text-muted">
                                            Current: {wicketData.fieldPlayerName || 'Not assigned'}
                                        </small>
                                    </div>
                                </Col>

                                <Col md={6}>
                                    <div className="form-group mb-3">
                                        <Label className="form-label fw-bold">
                                            <i className="fas fa-user me-1"></i>
                                            Fielder 2: <span className="text-danger">*</span>
                                            <small className="text-muted ms-2">({fielderList?.length || 0} players available)</small>
                                        </Label>
                                        <Select
                                            value={fielder2}
                                            onChange={setFielder2}
                                            options={fielderList || []}
                                            styles={customSelectStyles}
                                            placeholder={fielderList?.length > 0 ? "Select Fielder 2" : "No players available"}
                                            isClearable
                                            isSearchable
                                            menuPortalTarget={document.body}
                                            menuPosition="fixed"
                                            maxMenuHeight={200}
                                            noOptionsMessage={() => "No players available"}
                                            loadingMessage={() => "Loading players..."}
                                            isDisabled={!fielderList || fielderList.length === 0}
                                        />
                                        <small className="text-muted">
                                            Current: {wicketData.fieldPlayer2Name || 'Not assigned'}
                                        </small>
                                    </div>
                                </Col>
                            </Row>

                            {/* Validation Message */}
                            {!isFormValid && (fielder1 || fielder2) && (
                                <div className="alert alert-warning mt-3">
                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                    Both fielders are required to save the wicket details.
                                </div>
                            )}

                            {/* Selected Fielders Preview */}
                            {(fielder1 || fielder2) && (
                                <div className="mt-3 p-3 bg-light rounded">
                                    <strong>Updated Fielders:</strong>
                                    <div className="mt-2">
                                        {fielder1 && (
                                            <span className="badge bg-primary me-2">
                                                Fielder 1: {fielder1.label}
                                            </span>
                                        )}
                                        {fielder2 && (
                                            <span className="badge bg-secondary">
                                                Fielder 2: {fielder2.label}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </ModalBody>
            ) : (
                <ModalBody>
                    <div className="text-center text-muted">
                        <i className="fas fa-exclamation-triangle fa-2x mb-3"></i>
                        <p>No wicket data found</p>
                    </div>
                </ModalBody>
            )}

            <ModalFooter className="d-flex justify-content-between bg-light">
                <Button
                    color="secondary"
                    onClick={onClose}
                    disabled={isSaving}
                >
                    <i className="fas fa-times me-1"></i>
                    Cancel
                </Button>
                <Button
                    color="success"
                    onClick={handleSave}
                    disabled={isSaving || !wicketData || !isFormValid}
                >
                    {isSaving ? (
                        <>
                            <i className="fas fa-spinner fa-spin me-1"></i>
                            Saving...
                        </>
                    ) : (
                        <>
                            <i className="fas fa-save me-1"></i>
                            Save Changes
                        </>
                    )}
                </Button>
            </ModalFooter>
        </Modal>
    )
}

export default EditWicketDetails