import React, { useState } from "react";
import OversAccordion from "./OverAccordian";

const CommentaryRightPanel = ({ overBalls, partnerships, teamDetails, overHistory, players, currentOver }) => {
    const [activeTab, setActiveTab] = useState('overs'); // 'overs' or 'partnerships'
    console.log({ overHistory, players })
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
                    <OversAccordion
                        overBalls={overBalls}
                        teamDetails={teamDetails}
                        overHistory={overHistory}
                        playersList={players}
                        currentOver={currentOver}
                    />
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