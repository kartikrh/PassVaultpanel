import React, { useState, useEffect } from 'react';
import { Button, Col, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'reactstrap';
import Select from "react-select";
import { useDispatch } from 'react-redux';
import { updateToastData } from '../../../Features/toasterSlice';
import { ERROR } from '../../../components/Common/Const';
import { BOLD, CATCH, CURRENT_BOWLER, EXTRAS_WICKET_TYPE, HIT_BALL_TWICE, HIT_WICKET, LBW, LIST_TO_EXCLUDE_WICKET_FOR_BOWLER, NON_STRIKE, OBSTRACT_THE_FIELDING, ON_STRIKE, RETIRED_OUT, RUN_OUT, STUMP, TIMED_OUT, WICKET_TYPE_LIST } from '../CommentartConst';
import CardComponent from '../CardComponent';

const WicketModal = ({ onPitchPlayers, bowlingTeam, bowlingTeamDetails, toggle, isOpen, onSubmit, extraType }) => {
    
    const [currentStep, setCurrentStep] = useState(1);
    const [wicketData, setWicketData] = useState({
        wicketType: null,
        batterId: null,
        runs: "0",
        fielder1: null,
        fielder2: null
    });
    const [showFields, setShowFields] = useState({
        batterId: false,
        runs: false,
        fielder1: false,
        fielder2: false
    });
    const [bowlingPlayerList, setBowlingPlayerList] = useState([]);
    const dispatch = useDispatch();

    useEffect(() => {
        setBowlingPlayerList(bowlingTeam?.map(player => ({
            label: player.playerName,
            value: player.commentaryPlayerId
        })) || []);
    }, [bowlingTeam]);

    useEffect(() => {
        if (!isOpen) {
            setCurrentStep(1);
            setWicketData({
                wicketType: null,
                batterId: null,
                runs: "0",
                fielder1: null,
                fielder2: null
            });
            setShowFields({
                batterId: false,
                runs: false,
                fielder1: false,
                fielder2: false
            });
        }
    }, [isOpen]);

    const handleChange = (field, value) => {
        const newWicketData = { ...wicketData, [field]: value };

        if (field === "wicketType") {
            const newShowFields = { batterId: false, runs: false, fielder1: false, fielder2: false };

            switch (value) {
                case BOLD:
                case LBW:
                case HIT_WICKET:
                case HIT_BALL_TWICE:
                    newWicketData.batterId = onPitchPlayers?.[ON_STRIKE]?.commentaryPlayerId;
                    break;

                case RETIRED_OUT:
                case OBSTRACT_THE_FIELDING:
                case TIMED_OUT:
                    newShowFields.batterId = true;
                    newShowFields.runs = true;
                    break;

                case RUN_OUT:
                    newShowFields.batterId = true;
                    newShowFields.runs = true;
                    newShowFields.fielder1 = true;
                    newShowFields.fielder2 = true;
                    break;

                case CATCH:
                case STUMP:
                    newShowFields.fielder1 = true;
                    newWicketData.batterId = onPitchPlayers?.[ON_STRIKE]?.commentaryPlayerId;
                    if (value === STUMP) {
                        newWicketData.fielder1 = bowlingTeamDetails?.commentaryPlayerTeamKipper;
                    }
                    break;

                default:
                    break;
            }

            setShowFields(newShowFields);
        }

        setWicketData(newWicketData);
    };
    const getOutBatsman = () => {
        const player = !wicketData.batterId ? onPitchPlayers[ON_STRIKE] :
            wicketData.batterId === onPitchPlayers[ON_STRIKE]?.commentaryPlayerId ?
                onPitchPlayers[ON_STRIKE] : onPitchPlayers[NON_STRIKE];

        // Add extra runs to player stats if available
        if (player && extraType) {
            return {
                ...player,
                batRun: (player.batRun || 0) + parseInt(wicketData.runs || 0),
                // Add other extra calculations as needed
            };
        }
        return player;
    };

    const handleNext = () => {
        if (!wicketData.wicketType) {
            dispatch(updateToastData({
                data: "Please select a wicket type",
                title: "Required Error",
                type: ERROR
            }));
            return;
        }

        const fieldsToCheck = { ...showFields };
        if (wicketData.wicketType === RUN_OUT) {
            fieldsToCheck.fielder2 = false;
        }

        const missingFields = Object.keys(fieldsToCheck)
            .filter(field => fieldsToCheck[field] && !wicketData[field]);

        if (missingFields.length > 0) {
            dispatch(updateToastData({
                data: `Please fill: ${missingFields.join(", ")}`,
                title: "Required Error",
                type: ERROR
            }));
            return;
        }

        setCurrentStep(2);
    };

    const handleBack = () => {
        setCurrentStep(1);
    };

    const handleSubmit = () => {
        const outPlayer = getOutBatsman();

        const finalData = {
            wicketType: wicketData.wicketType,
            batterId: outPlayer?.commentaryPlayerId,
            runs: showFields.runs ? parseInt(wicketData.runs) : 0,
            fielder1: showFields.fielder1 ? wicketData.fielder1 : onPitchPlayers?.[CURRENT_BOWLER]?.commentaryPlayerId,
            fielder2: showFields.fielder2 ? wicketData.fielder2 : onPitchPlayers?.[CURRENT_BOWLER]?.commentaryPlayerId,
            isExtraWicket: !!extraType
        };

        onSubmit(finalData);
    };

    const renderPlayerCard = (player, type) => {
        if (!player) return null;

        if (type === 'bowler') {
            const isWicketCountable = !LIST_TO_EXCLUDE_WICKET_FOR_BOWLER.includes(wicketData.wicketType);
            const updatedWickets = isWicketCountable ?
                (player.bowlerTotalWicket || 0) + 1 :
                (player.bowlerTotalWicket || 0);

            const totalBalls = (player.bowlerTotalBall || 0) + (!wicketData.isExtraWicket ? 1 : 0);
            const totalOvers = Math.floor(totalBalls / 6);
            const remainingBalls = totalBalls % 6;
            const currentOver = `${totalOvers}.${remainingBalls}`;

            // Calculate economy
            const totalRuns = player.bowlerRun || 0;
            const economy = totalOvers > 0 ?
                ((totalRuns / totalOvers)).toFixed(2) :
                "0.00";
            return (
                <>
                    <div className="wicket-modal-player-stats">
                        <div className="wicket-modal-player-row wicket-modal-header-row">
                            <div className="wicket-modal-player-name">Bowler</div>
                            <div className="wicket-modal-player-stat">O</div>
                            <div className="wicket-modal-player-stat">W</div>
                            <div className="wicket-modal-player-stat">R</div>
                            <div className="wicket-modal-player-stat">Eco</div>
                            <div className="wicket-modal-player-stat">M</div>
                            <div className="wicket-modal-player-stat">Wides</div>
                            <div className="wicket-modal-player-stat">No-B</div>
                            <div className="wicket-modal-player-stat">Dot-B</div>
                        </div>
                        <div className="wicket-modal-player-row">
                            <div className="wicket-modal-player-name">{player.playerName}</div>
                            <div className="wicket-modal-player-stat">{currentOver}</div>
                            <div className="wicket-modal-player-stat">{updatedWickets}</div>
                            <div className="wicket-modal-player-stat">{totalRuns}</div>
                            <div className="wicket-modal-player-stat">{economy}</div>
                            <div className="wicket-modal-player-stat">{player.bowlerMaidenOver || 0}</div>
                            <div className="wicket-modal-player-stat">{player.bowlerWideBall || 0}</div>
                            <div className="wicket-modal-player-stat">{player.bowlerNoBall || 0}</div>
                            <div className="wicket-modal-player-stat">{player.bowlerDotBall || 0}</div>
                        </div>
                    </div>
                </>
            );
        }
        if (type === 'batsman') {
            const isStrikerOut = wicketData.batterId === onPitchPlayers[ON_STRIKE]?.commentaryPlayerId;
            // Add runs only if striker is out and there are runs
            const updatedRuns = isStrikerOut && showFields.runs ?
                (player.batRun || 0) + parseInt(wicketData.runs || 0) :
                (player.batRun || 0);

            // Update balls - add 1 ball if not extra wicket and if it's run out, add ball only to striker
            const updatedBalls = (player.batBall || 0) +
                (!wicketData.isExtraWicket && isStrikerOut ? 1 : 0);

            // Calculate updated strike rate
            const updatedStrikeRate = updatedBalls > 0 ?
                ((updatedRuns / updatedBalls) * 100).toFixed(2) :
                "0.00";

            // Get fielder names from bowlingTeam list
            const getFielderName = (fielderId) => {
                const fielder = bowlingTeam?.find(p => p.commentaryPlayerId === fielderId);
                return fielder?.playerName || '';
            };

            // Get wicket type label
            const getWicketTypeLabel = () => {
                const wicketTypeObj = [...WICKET_TYPE_LIST, ...EXTRAS_WICKET_TYPE]
                    .find(w => w.value === wicketData.wicketType);
                return wicketTypeObj?.label || '';
            };

            return (<>
                {/* <h3>Batsman Details</h3> */}
                <div className="wicket-modal-player-stats">
                    <div className="wicket-modal-player-row wicket-modal-header-row">
                        <div className="wicket-modal-player-name">Batter</div>
                        <div className="wicket-modal-player-stat">R</div>
                        <div className="wicket-modal-player-stat">B</div>
                        <div className="wicket-modal-player-stat">S R</div>
                        <div className="wicket-modal-player-stat">4s</div>
                        <div className="wicket-modal-player-stat">6s</div>
                        <div className="wicket-modal-player-stat">Dot-B</div>
                        <div className="wicket-modal-player-stat">Extras</div>
                        <div className="wicket-modal-player-stat">Wicket</div>
                    </div>
                    <div className="wicket-modal-player-row">
                        <div className="wicket-modal-player-name">{player.playerName}</div>
                        <div className="wicket-modal-player-stat">{updatedRuns}</div>
                        <div className="wicket-modal-player-stat">{updatedBalls}</div>
                        <div className="wicket-modal-player-stat">{updatedStrikeRate}</div>
                        <div className="wicket-modal-player-stat">{player.batFour || 0}</div>
                        <div className="wicket-modal-player-stat">{player.batSix || 0}</div>
                        <div className="wicket-modal-player-stat">{player.batDotBall || 0}</div>
                        <div className="wicket-modal-player-stat">{(player.wideRuns || 0) + (player.noBallRuns || 0) + (player.byeRuns || 0) + (player.legByeRuns || 0)}</div>
                        <div className="wicket-modal-player-stat">{getWicketTypeLabel()}</div>
                    </div>
                </div>
            </>
            );
        }

    };

    return (
        <Modal backdrop="static" size="lg" className="wicket-modal" zIndex={1000} isOpen={isOpen} toggle={toggle} keyboard={false} scrollable>
            <ModalHeader toggle={toggle}>
                <div className="wicket-modal-header">Wicket</div>
            </ModalHeader>
            <ModalBody className="wicket-modal-body">
                {currentStep === 1 ? (
                    <>
                        {extraType && <Row className="mb-3">Ball Type: {extraType}</Row>}
                        <Row className="mb-3">
                            {!extraType && showFields.runs && (
                                <Col xs={6} md={6} lg={4}>
                                    Runs
                                    <input
                                        className="form-control"
                                        type="number"
                                        value={wicketData.runs}
                                        onChange={(e) => handleChange("runs", e.target.value)}
                                        min={0}
                                        max={99}
                                        step={1}
                                    />
                                </Col>
                            )}
                            {showFields.fielder1 && (
                                <Col xs={6} md={6} lg={4}>
                                    Fielder 1
                                    <Select
                                        classNamePrefix="select2-selection"
                                        value={bowlingPlayerList.find(p => p.value === wicketData.fielder1)}
                                        options={bowlingPlayerList}
                                        onChange={(option) => handleChange("fielder1", option?.value)}
                                    />
                                </Col>
                            )}
                            {showFields.fielder2 && (
                                <Col xs={6} md={6} lg={4}>
                                    Fielder 2
                                    <Select
                                        classNamePrefix="select2-selection"
                                        value={bowlingPlayerList.find(p => p.value === wicketData.fielder2)}
                                        options={bowlingPlayerList}
                                        onChange={(option) => handleChange("fielder2", option?.value)}
                                    />
                                </Col>
                            )}
                        </Row>
                        {showFields.batterId && (
                            <div className="mb-4">
                                <div className="wicket-section-header mb-2">Select Batsman:</div>
                                <Row>
                                    <Col xs={6}>
                                        <CardComponent
                                            title={onPitchPlayers?.[ON_STRIKE]?.playerName}
                                            selectIcon="bx bxs-check-circle"
                                            onClickColor="#099680"
                                            bgColor="#55c6b4"
                                            check={onPitchPlayers?.[ON_STRIKE]?.commentaryPlayerId === wicketData.batterId}
                                            onClick={() => handleChange("batterId", onPitchPlayers?.[ON_STRIKE]?.commentaryPlayerId)}
                                        />
                                    </Col>
                                    <Col xs={6}>
                                        <CardComponent
                                            title={onPitchPlayers?.[NON_STRIKE]?.playerName}
                                            selectIcon="bx bxs-check-circle"
                                            onClickColor="#099680"
                                            bgColor="#55c6b4"
                                            check={onPitchPlayers?.[NON_STRIKE]?.commentaryPlayerId === wicketData.batterId}
                                            onClick={() => handleChange("batterId", onPitchPlayers?.[NON_STRIKE]?.commentaryPlayerId)}
                                        />
                                    </Col>
                                </Row>
                            </div>
                        )}
                        <Row>
                            {(extraType ? EXTRAS_WICKET_TYPE : WICKET_TYPE_LIST).map((wicketType, index) => (
                                <Col key={index} xs={4} md={4} lg={3}>
                                    <CardComponent
                                        title={wicketType.label}
                                        selectIcon="bx bxs-check-circle"
                                        onClickColor="#099680"
                                        bgColor="#55c6b4"
                                        check={wicketType.value === wicketData.wicketType}
                                        onClick={() => handleChange("wicketType", wicketType.value)}
                                    />
                                </Col>
                            ))}
                        </Row>
                    </>
                ) : (
                    <div className="wicket-modal-summary">
                        {renderPlayerCard(getOutBatsman(), 'batsman')}
                        {renderPlayerCard(onPitchPlayers[CURRENT_BOWLER], 'bowler')}
                    </div>
                )}
            </ModalBody>
            <ModalFooter className="wicket-modal-footer">
                {currentStep === 1 ? (
                    <div>
                      <Button color="success" className="wicket-modal-next-btn" onClick={handleNext}>
                          Next
                      </Button>
                      <Button color="light" className="decision-Button mx-2" onClick={() => toggle()}>Close</Button>
                    </div>
                ) : (
                    <div className="wicket-modal-actions">
                        <Button color="secondary" className="wicket-modal-back-btn" onClick={handleBack}>
                            Back
                        </Button>
                        <div>
                        <Button color="success" className="wicket-modal-confirm-btn" onClick={handleSubmit}>
                            Confirm
                        </Button>
                        <Button color="light" className="decision-Button mx-2" onClick={() => toggle()}>Close</Button>
                        </div>
                    </div>
                )}
            </ModalFooter>
        </Modal>
    );
};

export default WicketModal;