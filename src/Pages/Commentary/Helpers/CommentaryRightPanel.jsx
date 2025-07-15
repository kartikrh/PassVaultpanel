import React, { useState } from "react";
import OversAccordion from "./OverAccordian";
import { useEffect } from "react";
import PartnershipAccordian from "./PartnershipAccordian";
import DRSAccordion from "./DRSAccordion";

const CommentaryRightPanel = ({ overBalls, partnerships, teamDetails, overHistory, players, currentOver, refId, allteams, fetchData }) => {
    const [activeTab, setActiveTab] = useState('overs'); // 'overs' or 'partnerships' or 'drs'
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
            <div className="partnership-tab-navigation mb-1">
                <div className="d-flex justify-content-between align-items-center mt-1">
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
                <button
                    className={`tab-button ${activeTab === 'drs' ? 'active' : ''}`}
                    onClick={() => setActiveTab('drs')}
                >
                    DRS
                </button>
                </div>
                <p className="d-flex align-items-center m-0 modal-header-title">refId: {refId}</p>
            </div>

            <div className="tab-content mt-1">
                {activeTab === 'overs' ? (
                    <OversAccordion
                        overBalls={overBalls}
                        teamDetails={teamDetails}
                        overHistory={overHistory}
                        playersList={players}
                        currentOver={currentOver}
                        allteams={allteams}
                    />
                ) : activeTab === 'partnerships' ? (
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
                ) : activeTab === 'drs' ? (
                    <div className="drs-container">
                        <DRSAccordion
                            fetchData={fetchData}
                            overBalls={overBalls}
                            teamDetails={allteams}
                            currentOver={currentOver}
                        />
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default CommentaryRightPanel;