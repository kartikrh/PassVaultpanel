import React, { useEffect } from 'react';
import { Button, Modal, ModalBody, ModalHeader } from 'reactstrap';
import { NON_STRIKE, ON_STRIKE } from '../CommentartConst';

const ChangeOverModal = ({
    isOpen,
    toggle,
    onYesClick,
    onNoClick,
    overBalls = {},
    currentOver,
    battingTeam,
    bowlerName,
    onPitchPlayers
}) => {
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && e.shiftKey) onNoClick();
        else if (e.key === 'Enter') onYesClick();
    };

    useEffect(() => {
        document.addEventListener('keydown', handleKeyPress);
        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, []);

    const generateBallLabel = (type, isWicket) => {
        if (isWicket) return "W";
        switch (type) {
            case 2: return "WD";
            case 3: return "NB";
            case 4: return "B";
            case 5: return "LB";
            default: return "";
        }
    };

    const generateBalls = (ballArray = []) => {
        if (!Array.isArray(ballArray)) return null;

        return ballArray.map((element, index) => {
            const previousValue = ballArray[index - 1];
            const nextValue = ballArray[index + 1];
            const isWicket = +element?.isWicket !== 0;
            const isBoundary = +element?.isBoundary !== 0;
            const ballTypeAdd = generateBallLabel(element?.type, isWicket);
            const ballColor = isWicket ? "over-modal-wicket" :
                ballTypeAdd ? "over-modal-extra" :
                    isBoundary ? "over-modal-boundary" :
                        "over-modal-normal";

            const ballValue = ballTypeAdd ?
                (element.value > 0 ? element.value : "") :
                element.value;

            if (previousValue && previousValue.isWicket &&
                previousValue?.overCount === element?.overCount) {
                return null;
            }

            let displayValue;
            if (isWicket && nextValue && nextValue?.overCount === element?.overCount) {
                const nextIsWicket = +nextValue?.isWicket !== 0;
                const nextBallTypeAdd = generateBallLabel(nextValue?.type, nextIsWicket);
                const nextBallValue = nextBallTypeAdd ?
                    (nextValue.value > 0 ? nextValue.value : "") :
                    nextValue.value;
                displayValue = `${nextBallValue} ${(nextBallTypeAdd && nextBallValue) ? "|" : ""}${nextBallTypeAdd || ""}W`;
            } else {
                displayValue = `${ballValue} ${(ballTypeAdd && ballValue) ? "| " : ""} ${ballTypeAdd || ""}`;
            }

            return (
                <div key={`ball ${index}`} className={`over-modal-ball ${ballColor}`}>
                    {displayValue}
                </div>
            );
        });
    };

    const nextOverNumber = Math.ceil(currentOver?.over || 0) + 1;
    const overKey = `${currentOver?.currentInnings}_##_${battingTeam?.teamId}_##_${nextOverNumber}`;
    const currentOverBalls = overBalls[overKey] || [];

    const stats = {
        runs: battingTeam?.teamScore || 0,
        overs: Math.ceil(battingTeam?.teamOver || 0),
        wickets: battingTeam?.teamWicket || 0,
        extras: (battingTeam?.teamWideRuns || 0) +
            (battingTeam?.teamByRuns || 0) +
            (battingTeam?.teamLegByRuns || 0) +
            (battingTeam?.teamNoBallRuns || 0) +
            (battingTeam?.teamPenaltyRuns || 0)
    };

    return (
        <Modal backdrop="static" isOpen={isOpen} toggle={toggle} className="over-modal-container">
            <ModalHeader className="over-modal-header">
                <span className="over-modal-title">Over Complete</span>
            </ModalHeader>
            <ModalBody className="over-modal-body">
                <div className="over-modal-stats-grid">
                    <div className="over-modal-stat">
                        <div className="over-modal-stat-value">{stats.runs}</div>
                        <div className="over-modal-stat-label">Runs</div>
                    </div>
                    <div className="over-modal-stat">
                        <div className="over-modal-stat-value">{stats.overs}</div>
                        <div className="over-modal-stat-label">Overs</div>
                    </div>
                    <div className="over-modal-stat">
                        <div className="over-modal-stat-value">{stats.wickets}</div>
                        <div className="over-modal-stat-label">Wickets</div>
                    </div>
                    <div className="over-modal-stat">
                        <div className="over-modal-stat-value">{stats.extras}</div>
                        <div className="over-modal-stat-label">Extras</div>
                    </div>
                </div>

                <div className="over-modal-player-stats">
                    <div className="over-modal-player-row over-modal-header-row">
                        <div className="over-modal-player-name">Batter</div>
                        <div className="over-modal-player-stat">R</div>
                        <div className="over-modal-player-stat">B</div>
                        <div className="over-modal-player-stat">4s</div>
                        <div className="over-modal-player-stat">6s</div>
                    </div>
                    <div className="over-modal-player-row">
                        <div className="over-modal-player-name">
                            <strong>
                                {onPitchPlayers[ON_STRIKE]?.playerName + "*" || '-'}
                            </strong>
                        </div>
                        <div className="over-modal-player-stat">{onPitchPlayers[ON_STRIKE]?.batRun || 0}</div>
                        <div className="over-modal-player-stat">{onPitchPlayers[ON_STRIKE]?.batBall || 0}</div>
                        <div className="over-modal-player-stat">{onPitchPlayers[ON_STRIKE]?.batFour || 0}</div>
                        <div className="over-modal-player-stat">{onPitchPlayers[ON_STRIKE]?.batSix || 0}</div>
                    </div>
                    <div className="over-modal-player-row">
                        <div className="over-modal-player-name">{onPitchPlayers[NON_STRIKE]?.playerName || '-'}</div>
                        <div className="over-modal-player-stat">{onPitchPlayers[NON_STRIKE]?.batRun || 0}</div>
                        <div className="over-modal-player-stat">{onPitchPlayers[NON_STRIKE]?.batBall || 0}</div>
                        <div className="over-modal-player-stat">{onPitchPlayers[NON_STRIKE]?.batFour || 0}</div>
                        <div className="over-modal-player-stat">{onPitchPlayers[NON_STRIKE]?.batSix || 0}</div>
                    </div>
                </div>

                <div className="over-modal-info">
                    <div className="over-modal-over-text">
                        End of over {Math.ceil(battingTeam?.teamOver || 0)} by {bowlerName}
                    </div>
                    <div className="over-modal-balls-container">
                        {generateBalls(currentOverBalls)}
                        <span className="over-modal-total">= {currentOver?.totalRun}</span>
                    </div>
                </div>

                <div className="over-modal-actions">
                    <Button
                        className="over-modal-start-btn"
                        onClick={onYesClick}
                    >
                        START NEXT OVER
                    </Button>
                    <Button
                        className="over-modal-continue-btn"
                        onClick={onNoClick}
                    >
                        CONTINUE THIS OVER
                    </Button>
                    <Button color="light" className="decision-Button" onClick={() => toggle()}>Close</Button>
                </div>
            </ModalBody>
        </Modal >
    );
};

export default ChangeOverModal;