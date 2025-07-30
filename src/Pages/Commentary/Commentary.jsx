import React, { useEffect, useState } from "react"
import { Col, Row } from "reactstrap"
import "./CommentaryCss.css"
import { BALL_BYE, BALL_LEG_BYE, BALL_WIDE, BATTING_TEAM, BOWLER_CHANGE_DISPLAY_STATUS, BOWLING_TEAM, CURRENT_BOWLER, NON_STRIKE, NO_BALL, ON_STRIKE } from "./CommentartConst"
import CommentaryAction from "./CommentaryModels/CommentaryAction"
import CommentaryRightPanel from "./Helpers/CommentaryRightPanel"
import Switch from "react-switch";
import PlayerImage from "../../components/Common/Reusables/PlayerImage"
import _ from "lodash"

export const CommentaryScreen = ({
    refId, teamDetails, onPitchPlayers, _onPitchPlayers, updateRuns, changePlayer, changeOver, updateExtras, onWicketClick,
    onUndoClick, changeStrike, endInnings, isLoading, changeBowler, updateDisplayStatus, showPaneltyRuns,
    overBalls, anyPopup, handleRetiredHurt = {}, target, partnerships, commentaryId, handleWheelShowToggle, handleRemainingBallsShowToggle, isRemainingBallsShow, isWheelShow, overHistory,
    players, currentOver, currentInnings, isPredict, isPredictToggle, setIsPredictToggle,allteams, fetchData, isSaving, isAnyPopupOpen }) => {
    const [actionPopup, setActionPopup] = useState(undefined);
    const isDarkTheme = document.body.getAttribute('data-theme') === 'dark';

    const OffSymbolStatus = () => {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                    fontSize: 10,
                    color: "#fff",
                    // paddingRight: 2,
                }}
            >
                {" "}
                wheel
            </div>
        );
    };
    const OnSymbolStatus = () => {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                    fontSize: 10,
                    color: "#fff",
                    // paddingRight: 4,
                }}
            >
                {" "}
                wheel
            </div>
        );
    };

    const OffRemainingStatus = () => {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                    fontSize: 10,
                    color: "#fff",
                    // paddingRight: 2,
                }}
            >
                {" "}
                Remain
            </div>
        );
    };
    const OnRemainingStatus = () => {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                    fontSize: 10,
                    color: "#fff",
                    // paddingRight: 4,
                }}
            >
                {" "}
                Remain
            </div>
        );
    };

    const OffSymbolPredict = () => {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                    fontSize: 10,
                    color: "#fff",
                    // paddingRight: 2,
                }}
            >
                {" "}
                predict
            </div>
        );
    };
    const OnSymbolPredict = () => {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                    fontSize: 10,
                    color: "#fff",
                    // paddingRight: 4,
                }}
            >
                {" "}
                predict
            </div>
        );
    };

    const handleKeyPress = (event) => {
        if (isLoading || isSaving || isAnyPopupOpen) return;
        const key = event.key.toLowerCase(); // Convert to lowercase to simplify the switch cases
        switch (key) {
            case '0':
                handleRuns(0, 1);
                break;
            case '1':
                handleRuns(1, 1);
                break;
            case '2':
                handleRuns(2, 1);
                break;
            case '-':
                onUndoClick();
                break;
            case '3':
                handleRuns(3, 1);
                break;
            case '4':
                handleRuns(4, 1, true);
                break;
            case '6':
                handleRuns(6, 1, true);
                break;
            case '7':
                updateExtras(BALL_WIDE);
                break;
            case '8':
                updateExtras(NO_BALL);
                break;
            case '9':
                updateExtras(BALL_LEG_BYE);
                break;
            // case '/':
            //     updateExtras(BALL_WIDE)
            //     break;
            // case '*':
            //     updateExtras(NO_BALL);
            //     break;
            case '+':
                updateDisplayStatus(BOWLER_CHANGE_DISPLAY_STATUS);
                break;
            // case '-':
            //     setStatusPopup(true)
            //     break;
            // case 'a':
            //     updateExtras(BALL_BYE)
            //     break;
            // case 's':
            //     updateExtras(NO_BALL_BYE);
            //     break;
            // case 'c':
            //     console.log("Actions")
            //     break;
            // case '.':
            //     onWicketClick();
            //     break;
            default:
                break;
        }
    }
    const handleRuns = (run, ball, isBoundary = false) => {
        updateRuns(
            {
                run: run,
                ball: ball,
                batter: _onPitchPlayers?.[ON_STRIKE] || onPitchPlayers[ON_STRIKE],
                bowler: _onPitchPlayers?.[CURRENT_BOWLER] || onPitchPlayers[CURRENT_BOWLER],
                isBoundary
            }
        )
    }

    // const handleRuns = useMemo(
    //     () => _.debounce((run, ball, isBoundary) => {
    //         updateRuns({ run, ball, batter: onPitchPlayers[ON_STRIKE], bowler: onPitchPlayers[CURRENT_BOWLER], isBoundary });
    //     }, 300),
    //     [updateRuns, onPitchPlayers]
    // );

    // const debouncedUndoClick = useMemo(
    //     () => _.debounce(() => {
    //         onUndoClick();
    //     }, 300),
    //     [onUndoClick]
    // );

    let filteredPartnerships = partnerships
        .filter(obj => obj.batter1Id !== null && obj.batter2Id !== null) // Filter out entries with null batter IDs
        .filter((value, index, self) =>
            index === self.findLastIndex((t) =>
                (t.batter1Id === value.batter1Id && t.batter2Id === value.batter2Id) ||
                (t.batter1Id === value.batter2Id && t.batter2Id === value.batter1Id) // Check for both combinations to handle swapped order
            )
        ).reverse();


    useEffect(() => {
        if (anyPopup || actionPopup) window.removeEventListener('keydown', handleKeyPress);
        else { window.addEventListener('keydown', handleKeyPress); }
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [onPitchPlayers, onUndoClick, anyPopup, actionPopup]);
    
    return <React.Fragment>
        <Row className='scoring-row'>
            <Col xs={12} md={12} lg={6}>
                <Row>
                    <Col className="team-name team-1" xs={6} md={6} lg={6}>
                        {teamDetails?.[BATTING_TEAM].teamName}
                    </Col>
                    <Col className="team-name team-2" xs={6} md={6} lg={6}>
                        {teamDetails?.[BOWLING_TEAM]?.teamName}
                    </Col>
                </Row>
                <Row>
                    <Col className="current-score-header" xs={6} md={6} lg={6}>
                        <span className="current-team-name">{teamDetails?.[BATTING_TEAM]?.shortName?.toUpperCase()}&nbsp;</span>
                        <span className="current-team-score">
                            {teamDetails?.[BATTING_TEAM]?.teamScore || 0}/{teamDetails?.[BATTING_TEAM]?.teamWicket || 0}
                            &nbsp;({teamDetails?.[BATTING_TEAM]?.teamOver || 0})
                            &nbsp;</span>
                    </Col>
                    <Col className="bowling-team-score-header" xs={6} md={6} lg={6}>
                        <span className="current-team-name">{teamDetails?.[BOWLING_TEAM]?.shortName?.toUpperCase()}&nbsp;</span>
                        {/* <span className="bowling-team-name">{teamDetails?.[BOWLING_TEAM]?.shortName?.toUpperCase()}&nbsp;</span> */}
                        <span className="current-team-score">
                        {/* <span className="bowling-team-score"> */}
                            {teamDetails?.[BOWLING_TEAM]?.teamScore || 0}/{teamDetails?.[BOWLING_TEAM]?.teamWicket || 0}
                            &nbsp;({teamDetails?.[BOWLING_TEAM]?.teamOver || 0})
                            &nbsp;</span>
                    </Col>
                </Row>
                <Row>
                    {onPitchPlayers[ON_STRIKE]?.batterOrder > onPitchPlayers[NON_STRIKE]?.batterOrder ? (
                        <>
                            <Col className="non-striker-end d-flex align-items-center gap-1" xs={12} md={6} lg={6}>
                                <span>
                                    {onPitchPlayers[NON_STRIKE]?.playerimage ?
                                        // <img src={onPitchPlayers[NON_STRIKE]?.playerimage} alt='player image' width={30} />
                                        <PlayerImage
                                                                            // width="30px"
                                            playerImage={onPitchPlayers[NON_STRIKE]?.playerimage}
                                            jerseyImage={teamDetails["BATTING_TEAM"].jersey}
                                        />
                                        : onPitchPlayers[NON_STRIKE]?.playerName.split('')[0]}
                                </span>
                                <span onClick={() => { changeStrike(onPitchPlayers[NON_STRIKE].commentaryPlayerId) }}>{onPitchPlayers[NON_STRIKE]?.playerName}&nbsp;</span>
                                <span>{onPitchPlayers[NON_STRIKE]?.batRun || 0}</span>
                                <span>({onPitchPlayers[NON_STRIKE]?.batBall || 0}) &nbsp;</span>
                                <button onClick={() => { changePlayer(NON_STRIKE) }} className="change-button text-right">C</button>
                            </Col>
                            <Col className="striker-end d-flex align-items-center gap-1" xs={12} md={6} lg={6}>
                                <span>
                                    {onPitchPlayers[ON_STRIKE]?.playerimage ?
                                        // <img src={onPitchPlayers[ON_STRIKE]?.playerimage} alt='player image' width={30} />
                                        <PlayerImage
                                            playerImage={onPitchPlayers[ON_STRIKE]?.playerimage}
                                            jerseyImage={teamDetails["BATTING_TEAM"].jersey}
                                        />
                                        : onPitchPlayers[ON_STRIKE]?.playerName.split('')[0]}
                                </span>
                                <span onClick={() => { changeStrike(onPitchPlayers[ON_STRIKE].commentaryPlayerId) }}>{onPitchPlayers[ON_STRIKE]?.playerName}*&nbsp;</span>
                                <span>{onPitchPlayers[ON_STRIKE]?.batRun || 0}</span>
                                <span>({onPitchPlayers[ON_STRIKE]?.batBall || 0}) &nbsp;</span>
                                <button onClick={() => { changePlayer(ON_STRIKE) }} className="change-button text-right">C</button>
                            </Col>
                        </>
                    ) : (
                        <>
                            <Col className="striker-end d-flex align-items-center gap-1" xs={12} md={6} lg={6}>
                                <span >
                                    {onPitchPlayers[ON_STRIKE]?.playerimage ?
                                        // <img src={onPitchPlayers[ON_STRIKE]?.playerimage} alt='player image' width={30} />
                                        <PlayerImage
                                            playerImage={onPitchPlayers[ON_STRIKE]?.playerimage}
                                            jerseyImage={teamDetails["BATTING_TEAM"].jersey}
                                        />
                                        : onPitchPlayers[ON_STRIKE]?.playerName?.split('')[0]}
                                </span>
                                <span onClick={() => { changeStrike(onPitchPlayers[ON_STRIKE].commentaryPlayerId) }}>{onPitchPlayers[ON_STRIKE]?.playerName}*&nbsp;</span>
                                <span>{onPitchPlayers[ON_STRIKE]?.batRun || 0}</span>
                                <span>({onPitchPlayers[ON_STRIKE]?.batBall || 0}) &nbsp;</span>
                                <button onClick={() => { changePlayer(ON_STRIKE) }} className="change-button text-right">C</button>
                            </Col>
                            <Col className="non-striker-end d-flex align-items-center gap-1" xs={12} md={6} lg={6}>
                                <span >
                                    {onPitchPlayers[NON_STRIKE]?.playerimage ?
                                        // <img src={onPitchPlayers[NON_STRIKE]?.playerimage} alt='player image' width={30} />
                                        <PlayerImage
                                            playerImage={onPitchPlayers[NON_STRIKE]?.playerimage}
                                            jerseyImage={teamDetails["BATTING_TEAM"].jersey}
                                        />
                                        : onPitchPlayers[NON_STRIKE]?.playerName?.split('')[0]}
                                </span>
                                <span onClick={() => { changeStrike(onPitchPlayers[NON_STRIKE].commentaryPlayerId) }}>{onPitchPlayers[NON_STRIKE]?.playerName}&nbsp;</span>
                                <span>{onPitchPlayers[NON_STRIKE]?.batRun || 0}</span>
                                <span>({onPitchPlayers[NON_STRIKE]?.batBall || 0}) &nbsp;</span>
                                <button onClick={() => { changePlayer(NON_STRIKE) }} className="change-button text-right ">C</button>
                            </Col>
                        </>
                    )}
                </Row>

                <Row className="Bowler-header">
                    <Col className={"d-flex align-items-center gap-1"} xs={12} md={12} lg={12}>
                        <span >
                            {onPitchPlayers[CURRENT_BOWLER]?.playerimage ?
                                // <img src={onPitchPlayers[CURRENT_BOWLER]?.playerimage} alt='player image' width={30} />
                                <PlayerImage
                                    playerImage={onPitchPlayers[CURRENT_BOWLER]?.playerimage}
                                    jerseyImage={teamDetails["BOWLING_TEAM"].jersey}
                                />
                                : onPitchPlayers[CURRENT_BOWLER]?.playerName.split('')[0]}
                        </span>
                        {onPitchPlayers[CURRENT_BOWLER]?.playerName} &nbsp;
                        <span>{onPitchPlayers[CURRENT_BOWLER]?.bowlerOver || 0}-{onPitchPlayers[CURRENT_BOWLER]?.bowlerMaidenOver || 0}
                            -{onPitchPlayers[CURRENT_BOWLER]?.bowlerRun || 0}-{onPitchPlayers[CURRENT_BOWLER]?.bowlerTotalWicket || 0}</span>
                        <button onClick={changeBowler} className=" text-right change-button">C</button>
                    </Col>
                </Row>
                <Row className={(isLoading || isSaving || isAnyPopupOpen) ? "disable-button" : ""} >
                    <Col role="button" className=" score-button" xs={3} md={3} lg={3}

                        onClick={() => handleRuns(0, 1)}>
                        <img className="button-icon" src="icons/0.png" alt="Icon" />
                    </Col>
                    <Col role="button" className=" score-button" xs={3} md={3} lg={3}

                        onClick={() => handleRuns(1, 1)}>
                        <img className="button-icon" src="icons/1.png" alt="Icon" />
                    </Col>
                    <Col role="button" className=" score-button" xs={3} md={3} lg={3}

                        onClick={() => handleRuns(2, 1)}>
                        <img className="button-icon" src="icons/2.png" alt="Icon" />
                    </Col>
                    <Col role="button" className=" score-button" xs={3} md={3} lg={3}

                        onClick={onUndoClick}
                    >
                        <img className="button-icon" src="icons/undo.png" alt="Icon" />
                    </Col>
                    <Col role="button" className=" score-button" xs={3} md={3} lg={3}

                        onClick={() => handleRuns(3, 1)}>
                        <img className="button-icon" src="icons/3.png" alt="Icon" />
                    </Col>
                    <Col role="button" className=" score-button" xs={3} md={3} lg={3}

                        onClick={() => handleRuns(4, 1, true)}>
                        <img className="button-icon" src="icons/4.png" alt="Icon" />
                    </Col>
                    <Col role="button" className=" score-button" xs={3} md={3} lg={3}

                        onClick={() => handleRuns(6, 1, true)}>
                        <img className="button-icon" src="icons/6.png" alt="Icon" />
                    </Col>
                    <Col role="button" className=" score-button" xs={3} md={3} lg={3}

                        onClick={() => setActionPopup(true)}>
                        <img className="button-icon" src="icons/action.png" alt="Icon" />
                    </Col>
                    <Col role="button" className=" score-button" xs={3} md={3} lg={3}

                        onClick={() => updateExtras(BALL_WIDE)}>
                        <img className="button-icon-lg" src="icons/wide-ball.png" alt="Icon" />
                    </Col>
                    <Col role="button" className=" score-button" xs={3} md={3} lg={3}

                        onClick={() => updateExtras(NO_BALL)}>
                        <img className="button-icon-lg" src="icons/no-ball.png" alt="Icon" />
                    </Col>
                    <Col role="button" className=" score-button" xs={3} md={3} lg={3}

                        onClick={() => updateDisplayStatus(BOWLER_CHANGE_DISPLAY_STATUS)}>
                        <img className="button-icon" src="icons/b.png" alt="Icon" />
                        all Start
                    </Col>
                    <Col role="button" className=" score-button" xs={3} md={3} lg={3}

                    >
                        <img className="button-icon" src="icons/r.png" alt="Icon" />
                        emark
                    </Col>
                    <Col role="button" className=" score-button" xs={3} md={3} lg={3}

                        onClick={() => updateExtras(BALL_BYE)}>
                        <img className="button-icon-lg" src="icons/bye-ball.png" alt="Icon" />
                    </Col>
                    <Col role="button" className=" score-button" xs={3} md={3} lg={3}

                        onClick={() => updateExtras(BALL_LEG_BYE)}>
                        <img className="button-icon-lg" src="icons/leg-by.png" alt="Icon" />
                    </Col>
                    <Col role="button" className="color-out score-button" xs={6} md={6} lg={6}

                        onClick={onWicketClick}>
                        <img className="button-icon" src="icons/out.png" alt="Icon" />
                    </Col>
                </Row>
                <div className="d-flex justify-content-between">
                <div className="d-flex align-items-center py-2">
                    <span>Tracking a Ball</span>
                    <Switch
                        width={70}
                        uncheckedIcon={<OffSymbolStatus />}
                        checkedIcon={<OnSymbolStatus />}
                        className="pe-0 mx-2"
                        onColor="#02a499"
                        onChange={() => {
                            handleWheelShowToggle(!isWheelShow);
                        }}
                        checked={isWheelShow}
                    />
                </div>
                {isPredict && <div className="py-2">
                    <Switch
                        width={70}
                        uncheckedIcon={<OffSymbolPredict />}
                        checkedIcon={<OnSymbolPredict />}
                        className="pe-0 mx-2"
                        onColor="#02a499"
                        onChange={() => {
                            setIsPredictToggle(!isPredictToggle);
                        }}
                        checked={isPredictToggle}
                    />
                </div>}
                {currentInnings > 0 && 
                    <div className="d-flex align-items-center py-2">
                        <span>Remaining balls</span>
                        <Switch
                            width={70}
                            uncheckedIcon={<OffRemainingStatus />}
                            checkedIcon={<OnRemainingStatus />}
                            className="pe-0 mx-2"
                            onColor="#02a499"
                            onChange={() => {
                                handleRemainingBallsShowToggle();
                            }}
                            checked={isRemainingBallsShow}
                        />
                    </div>
                }
                </div>
                <div
                    style={{
                        background: isDarkTheme ? "#2c2c2c" : "#e0e0e0",
                        color: isDarkTheme ? "#f0f0f0" : "#000",
                        padding: "1rem",
                        borderRadius: "8px",
                        maxWidth: "500px"
                    }}
                >
                    <strong><i>Note: </i></strong>
                    <div style={{ display: "block", marginBottom: "1rem" }}>Keyboard Shortcuts for Scoring:</div>
                    <div
                        style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: "0.75rem 1rem"
                        }}
                    >
                        <div><kbd>0</kbd> = 0 run</div>
                        <div><kbd>1</kbd> = 1 run</div>
                        <div><kbd>2</kbd> = 2 run</div>
                        <div><kbd>3</kbd> = 3 run</div>
                        <div><kbd>4</kbd> = 4 run</div>
                        <div><kbd>6</kbd> = 6 run</div>
                        <div><kbd>-</kbd> = Undo</div>
                        <div><kbd>7</kbd> = Wide Ball</div>
                        <div><kbd>8</kbd> = No Ball</div>
                        <div><kbd>9</kbd> = Leg Bye</div>
                        <div><kbd>+</kbd> = Ball Start </div>
                    </div>
                </div>
            </Col>
            <Col className="over-render p-0 m-0 px-md-2" xs={12} md={12} lg={6}>
                <Row className='px-2'>
                    <div className="team-name overs-header">
                        {(teamDetails?.[BATTING_TEAM]?.teamMaxOver || teamDetails?.[BATTING_TEAM]?.teamTrialRuns) ?
                            `DLS:-  ${teamDetails?.[BATTING_TEAM]?.teamMaxOver ? "Max Overs: " + teamDetails?.[BATTING_TEAM]?.teamMaxOver : ""} ${(target && +target !== 0) ? "Target: " + target : ""} `
                            : "Overs"}
                    </div>
                </Row>
                <CommentaryRightPanel
                    refId={refId}
                    overBalls={overBalls}
                    partnerships={filteredPartnerships}
                    teamDetails={teamDetails}
                    overHistory={overHistory}
                    players={players}
                    currentOver={currentOver}
                    allteams={allteams}
                    fetchData={fetchData}
                />
            </Col>
        </Row >
        {actionPopup && <CommentaryAction
            toggle={() => setActionPopup(false)}
            changeOver={() => {
                changeOver()
                setActionPopup(false)
            }}
            endInnings={() => {
                endInnings()
                setActionPopup(false)
            }}
            updateExtras={(extraType) => {
                updateExtras(extraType)
                setActionPopup(false)
            }}
            handleRuns={(run, ball) => {
                handleRuns(run, ball)
                setActionPopup(false)
            }}
            paneltyRuns={() => {
                setActionPopup(false)
                showPaneltyRuns(true)
            }}
            retiredHurt={() => {
                setActionPopup(false)
                handleRetiredHurt()
            }}
            commentaryId={commentaryId}
        />}
    </React.Fragment >
}