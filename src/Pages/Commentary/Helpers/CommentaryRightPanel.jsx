import { useState } from "react";
import OversAccordion from "./OverAccordian";
import PartnershipAccordian from "./PartnershipAccordian";
import DRSAccordion from "./DRSAccordion";

const CommentaryRightPanel = ({ overBalls, partnerships, teamDetails, overHistory, players, currentOver, refId, allteams, fetchData }) => {
    const [activeTab, setActiveTab] = useState('overs'); // 'overs' or 'partnerships' or 'drs'
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