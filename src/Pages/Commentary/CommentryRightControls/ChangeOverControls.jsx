import { generateBallLabelFromBall } from "../functions";

const ChangeOverControls = ({
  stats,
  battingTeam,
  bowlerName,
  currentOver,
  currentOverBalls,
  onYesClick,
  onNoClick,
  onPitchPlayers,
}) => {
  // A reusable component for displaying over stats
  const OverStat = ({ label, value }) => (
    <div className="over-stat text-center p-3">
      <div className="over-modal-stat-value">{value}</div>
      <div className="over-modal-stat-label">{label}</div>
    </div>
  );

  // Function to generate balls from the array
  const generateBallfromArray = (ballArray = []) => {
    return ballArray?.map((element, index) => {
      const previousValue = ballArray[index - 1];
      const nextValue = ballArray[index + 1];
      const isWicket = +element?.isWicket !== 0;
      const isBoundary = +element?.value === 6 || +element?.value === 4;
      const ballTypeAdd = generateBallLabelFromBall(element?.type, isWicket);
      const ballColor = isWicket
        ? "wicket-overball"
        : ballTypeAdd
        ? "extra-overball"
        : isBoundary
        ? "boundary-overball"
        : "regular-overball";
      const ballFontColor = isWicket
        ? "text-white"
        : ballTypeAdd
        ? "text-white"
        : isBoundary
        ? "text-white"
        : "text-muted";
      const ballValue = ballTypeAdd
        ? element.value > 0
          ? element.value
          : ""
        : element.value;
      if (
        previousValue &&
        previousValue.isWicket &&
        previousValue?.overCount === element?.overCount
      ) {
        return null;
      }
      let displayValue;
      if (
        isWicket &&
        nextValue &&
        nextValue?.overCount === element?.overCount
      ) {
        const nextIsWicket = +nextValue?.isWicket !== 0;
        const nextBallTypeAdd = generateBallLabelFromBall(
          nextValue?.type,
          nextIsWicket
        );
        const nextBallValue = nextBallTypeAdd
          ? nextValue.value > 0
            ? nextValue.value
            : ""
          : nextValue.value;
        displayValue = `${nextBallValue} ${
          nextBallTypeAdd && nextBallValue ? "|" : ""
        }${nextBallTypeAdd || ""}W`;
      } else {
        displayValue = `${ballValue} ${ballTypeAdd && ballValue ? "| " : ""} ${
          ballTypeAdd || ""
        }`;
      }
      return (
        <div
          key={`ball ${index}`}
          className={`d-flex justify-content-center align-items-center ${ballColor}`}
        >
          {displayValue}
        </div>
      );
    });
  };

  return (
    <div className="col-10">
      <div className="d-flex align-items-center gap-4">
        <OverStat label="Runs" value={stats.runs} />
        <OverStat label="Overs" value={stats.overs} />
        <OverStat label="Wickets" value={stats.wickets} />
        <OverStat label="Extras" value={stats.extras} />
      </div>

      {/* Batsmen Stats */}
      <div className="over-modal-player-stats" style={{ border: "none" }}>
        <div className="over-modal-player-row over-modal-header-row">
          <div className="over-modal-player-name">Batter</div>
          <div className="over-modal-player-stat">R</div>
          <div className="over-modal-player-stat">B</div>
          <div className="over-modal-player-stat">4s</div>
          <div className="over-modal-player-stat">6s</div>
        </div>

        {/* On-strike batsman stats */}
        <div className="over-modal-player-row" style={{ border: "none" }}>
          <div className="over-modal-player-name">
            <strong>{onPitchPlayers?.ON_STRIKE?.playerName || "-"}</strong>
          </div>
          <div className="over-modal-player-stat">
            {onPitchPlayers?.ON_STRIKE?.batRun || 0}
          </div>
          <div className="over-modal-player-stat">
            {onPitchPlayers?.ON_STRIKE?.batBall || 0}
          </div>
          <div className="over-modal-player-stat">
            {onPitchPlayers?.ON_STRIKE?.batFour || 0}
          </div>
          <div className="over-modal-player-stat">
            {onPitchPlayers?.ON_STRIKE?.batSix || 0}
          </div>
        </div>

        {/* Non-strike batsman stats */}
        <div className="over-modal-player-row">
          <div className="over-modal-player-name">
            {onPitchPlayers?.NON_STRIKE?.playerName || "-"}
          </div>
          <div className="over-modal-player-stat">
            {onPitchPlayers?.NON_STRIKE?.batRun || 0}
          </div>
          <div className="over-modal-player-stat">
            {onPitchPlayers?.NON_STRIKE?.batBall || 0}
          </div>
          <div className="over-modal-player-stat">
            {onPitchPlayers?.NON_STRIKE?.batFour || 0}
          </div>
          <div className="over-modal-player-stat">
            {onPitchPlayers?.NON_STRIKE?.batSix || 0}
          </div>
        </div>
      </div>

      {/* Over Information */}
      <div className="over-modal-info">
        <div className="over-modal-over-text">
          End of over {Math.ceil(battingTeam?.teamOver || 0)} by {bowlerName}
        </div>
        <div className="over-modal-balls-container">
          {generateBallfromArray(currentOverBalls)}
          <span className="over-modal-total">= {currentOver?.totalRun}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="d-flex align-items-center gap-4">
        <button
          className="score-control-confirm-ball-btns"
          onClick={onYesClick}
        >
          START NEXT OVER
        </button>
        <button
          className="score-control-conformation-close-btn"
          onClick={onNoClick}
        >
          CONTINUE THIS OVER
        </button>
      </div>
    </div>
  );
};

export default ChangeOverControls;
