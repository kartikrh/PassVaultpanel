import React, { useState } from "react";
import OversAccordion from "./OverAccordian";
import { useEffect } from "react";
import PartnershipAccordian from "./PartnershipAccordian";

const CommentaryRightPanel = ({ overBalls, partnerships, teamDetails, overHistory, players, currentOver }) => {
    const [activeTab, setActiveTab] = useState('overs'); // 'overs' or 'partnerships'
    // const renderPartnerships = () => {
    //     return partnerships.map((partnership, index) => {
    //         return (
    //             <div
    //                 key={`partnership-${index}`}
    //                 className={`mb-3 ${index === 0 ? 'first-card' : 'remaining-card'}`}
    //             >
    //                 <div className={`${index === 0 ? 'first-card-header' : 'remaining-card-header'}`}>
    //                     {(partnerships.length - index)}`{
    //                         partnerships.length - index === 1 ? "st" :
    //                             partnerships.length - index === 2 ? "nd" :
    //                                 partnerships.length - index === 3 ? "rd" :
    //                                     "th"
    //                     } Partnership
    //                 </div>
    //                 <div className={`${index === 0 ? 'first-card-body' : 'remaining-card-body'}`}>
    //                     <div className={`${index === 0 ? 'first-card-player-section  left-player' : 'remaining-card-player-section left-player'}`}>
    //                         <img
    //                             src={partnership.player1image}
    //                             alt={partnership.batter1Name}
    //                             className={`${index === 0 ? 'first-player-image' : 'remaining-player-image'}`}
    //                             onError={(e) => e.target.src = 'icons/default-player.png'}
    //                         />
    //                         <div className="player-details">
    //                             <div className={`${index === 0 ? 'first-player-name' : 'remaining-player-name'}`}>{partnership.batter1Name}</div>
    //                             <div className={`${index === 0 ? 'first-player-stats' : 'remaining-player-stats'}`}>
    //                                 {partnership.batter1Runs || 0}({partnership.batter1Balls || 0})
    //                             </div>
    //                         </div>
    //                     </div>
    //                     <div className={`${index === 0 ? 'first-partnership-stats' : 'remaining-partnership-stats'}`}>
    //                         <div className={`${index === 0 ? 'first-total-runs' : 'remaining-total-runs'}`}>{partnership.totalRuns}<span className="first-total-balls-span text-secondary small fs-6 fw-normal">({partnership.totalBalls})</span></div>
    //                         <div className={`${index === 0 ? 'first-total-balls' : 'remaining-total-balls'}`}>{partnership.totalFour} 4s {" "}{partnership.totalSix} 6s</div>
    //                         <div className={`${index === 0 ? 'first-partnership-extras' : 'remaining-partnership-extras'}`}>
    //                             Extras: {partnership.extras || 0}
    //                         </div>
    //                     </div>
    //                     <div className={`right-player ${index === 0 ? 'first-card-player-section  left-player' : 'remaining-card-player-section left-player'}`}>
    //                         <img
    //                             src={partnership.player2image}
    //                             alt={partnership.batter2Name}
    //                             className={`${index === 0 ? 'first-player-image' : 'remaining-player-image'}`}
    //                             onError={(e) => e.target.src = 'icons/default-player.png'}
    //                         />
    //                         <div>
    //                             <div className={`${index === 0 ? 'first-player-name' : 'remaining-player-name'}`}>{partnership.batter2Name}</div>
    //                             <div className={`${index === 0 ? 'first-player-stats' : 'remaining-player-stats'}`}>
    //                                 {partnership.batter2Runs || 0}({partnership.batter2Balls || 0})
    //                             </div>
    //                         </div>
    //                     </div>
    //                 </div>
    //             </div>
    //         )
    //     });
    // };
    // useEffect(() => {
    //     console.log("partnerships", partnerships)
    // },[])

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
                        <PartnershipAccordian
                            partnerships={partnerships}
                            overBalls={overBalls}
                            teamDetails={teamDetails}
                            overHistory={overHistory}
                            playersList={players}
                            currentOver={currentOver}
                        />
                        {/* {renderPartnerships()} */}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommentaryRightPanel;