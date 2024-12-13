import React, { useState } from "react";
import { Row, Col } from "reactstrap";
import { STRING_SEPERATOR } from "../../components/Common/Const";
import { generateBallLabelFromBall } from "./functions";
import { CURRENT_BOWLER } from "./CommentartConst";

const CommentaryRightPanel = ({ overBalls, onPitchPlayers, partnerships }) => {
    console.log({ partnerships });
    const [activeTab, setActiveTab] = useState('overs'); // 'overs' or 'partnerships'

    const generateBallfromArray = (ballArray = []) => {
        return ballArray?.map((element, index) => {
            const previousValue = ballArray[index - 1]
            const nextValue = ballArray[index + 1]
            const isWicket = +element?.isWicket !== 0
            const isBoundary = +element?.isBoundary !== 0
            const ballTypeAdd = generateBallLabelFromBall(element?.type, isWicket)
            const ballColor = isWicket ? "bg-danger" : ballTypeAdd ? "bg-warning" : isBoundary ? "bg-success" : "ball-white"
            const ballValue = ballTypeAdd ?
                element.value > 0 ?
                    element.value : ""
                : element.value
            if (previousValue && previousValue.isWicket && previousValue?.overCount === element?.overCount) {
                return null;
            }
            let displayValue
            if (isWicket && nextValue && nextValue?.overCount === element?.overCount) {
                const nextIsWicket = +nextValue?.isWicket !== 0
                const nextBallTypeAdd = generateBallLabelFromBall(nextValue?.type, nextIsWicket)
                const nextBallValue = nextBallTypeAdd ?
                    nextValue.value > 0 ?
                        nextValue.value : ""
                    : nextValue.value
                displayValue = `${nextBallValue} ${(nextBallTypeAdd && nextBallValue) ? "|" : ""}${nextBallTypeAdd || ""}W`
            } else {
                displayValue = `${ballValue} ${(ballTypeAdd && ballValue) ? "| " : ""} ${ballTypeAdd || ""}`;
            }
            return <div key={`ball ${index}`} className={`px-3 py-md-2 py-1 shadow-sm rounded mx-1 over-ball-display ${ballColor}`}>
                {displayValue}
            </div>
        })
    }

    const generateRightSideOvers = () => {
        return Object.keys(overBalls).map((over, index) =>
            <div key={`over ${index}`} className={`ball-by-ball-display ${index % 2 !== 0 ? "background-nth " : ""} `}>
                <b>Ov-{over.split(STRING_SEPERATOR)?.[2]} : </b>
                {(overBalls[over].length === 0 && (onPitchPlayers[CURRENT_BOWLER]?.bowlerOver || 0) % 1 === 0) &&
                    <> Yet to start Over </>
                }
                {generateBallfromArray(overBalls[over])}
            </div>)
    }

    const renderPartnerships = () => {
        return partnerships.map((partnership, index) => {
            return (
                <div
                    key={`partnership-${index}`}
                    className={`mb-3 ${index === 0 ? 'first-card' : 'remaining-card'}`}
                >
                    <div className={`${index === 0 ? 'first-card-header' : 'remaining-card-header'}`}>
                        {partnership.batter1Name} & {partnership.batter2Name} Partnership
                    </div>
                    <div className={`${index === 0 ? 'first-card-body' : 'remaining-card-body'}`}>
                        {/* className="player-section left-player" */}
                        <div className={`${index === 0 ? 'first-card-player-section  left-player' : 'remaining-card-player-section left-player'}`}>
                            <img
                                src={partnership.player1image}
                                alt={partnership.batter1Name}
                                // className="player-image"
                                className={`${index === 0 ? 'first-player-image' : 'remaining-player-image'}`}
                                onError={(e) => e.target.src = 'icons/default-player.png'}
                            />
                            <div className={`${index === 0 ? 'first-player-name' : 'remaining-player-name'}`}>{partnership.batter1Name}</div>
                            <div className={`${index === 0 ? 'first-player-stats' : 'remaining-player-stats'}`}>
                                {partnership.batter1Runs || 0}({partnership.batter1Balls || 0})
                            </div>
                        </div>
                        <div className={`${index === 0 ? 'first-partnership-stats' : 'remaining-partnership-stats'}`}>
                            <div className={`${index === 0 ? 'first-total-runs' : 'remaining-total-runs'}`}>{partnership.totalRuns}</div>
                            <div className={`${index === 0 ? 'first-total-balls' : 'remaining-total-balls'}`}>({partnership.totalBalls} balls)</div>
                            <div className={`${index === 0 ? 'first-partnership-extras' : 'remaining-partnership-extras'}`}>
                                Extras: {partnership.extras || 0}
                            </div>
                        </div>
                        <div className={`right-player ${index === 0 ? 'first-card-player-section  left-player' : 'remaining-card-player-section left-player'}`}>
                            <img
                                src={partnership.player2image}
                                alt={partnership.batter2Name}
                                className={`${index === 0 ? 'first-player-image' : 'remaining-player-image'}`}
                                onError={(e) => e.target.src = 'icons/default-player.png'}
                            />
                            <div className={`${index === 0 ? 'first-player-name' : 'remaining-player-name'}`}>{partnership.batter2Name}</div>
                            <div className={`${index === 0 ? 'first-player-stats' : 'remaining-player-stats'}`}>
                                {partnership.batter2Runs || 0}({partnership.batter2Balls || 0})
                            </div>
                        </div>
                    </div>
                </div>
            )
        });
    };

    return (
        <div className="commentary-right-panel">
            <div className="partnership-tab-navigation mb-3">
                <button
                    className={`tab-button ${activeTab === 'overs' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overs')}
                >
                    Overs
                </button>
                <button
                    className={`tab-button ${activeTab === 'partnerships' ? 'active' : ''}`}
                    onClick={() => setActiveTab('partnerships')}
                >
                    Partnerships
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'overs' ? (
                    <Row>
                        {generateRightSideOvers()}
                    </Row>
                ) : (
                    <div className="partnerships-container">
                        {renderPartnerships()}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommentaryRightPanel;