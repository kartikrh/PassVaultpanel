import React, { useState } from "react"
import { Col, Row } from "reactstrap"
import "./CommentaryCss.css"
import { BALL_BYE, BALL_LEG_BYE, BALL_WIDE, BATTING_TEAM, BOWLER_CHANGE_DISPLAY_STATUS, BOWLING_TEAM, CURRENT_BOWLER, NON_STRIKE, NO_BALL, ON_STRIKE } from "./CommentartConst"
import IsBoundaryModal from "./CommentaryModels/IsBoundaryModal"
import { generateBallLabelFromBall } from "./functions"
import CommentaryAction from "./CommentaryModels/CommentaryAction"
import { STRING_SEPERATOR } from "../../components/Common/Const"

export const CommentaryScreen = ({
    teamDetails, onPitchPlayers, updateRuns, changePlayer, changeOver, updateExtras, onWicketClick,
    onUndoClick, changeStrike, endInnings, isLoading, changeBowler, updateDisplayStatus, showPaneltyRuns,
    overBalls, handleRetiredHurt = {} }) => {
    document.title = "Scoring";
    const [isBoundary, setIsBoundary] = useState(false)
    const [actionPopup, setActionPopup] = useState(undefined)
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
            if (previousValue && previousValue.isWicket && previousValue.overCount === element.overCount) {
                return null;
            }
            let displayValue
            if (isWicket && nextValue && nextValue.overCount === element.overCount) {
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
            return <div className={` px-3 py - md - 2 py - 1 shadow - sm rounded mx - 1 over-ball-display ${ballColor}`}>
                {/* {`${ballValue} ${(ballTypeAdd && ballValue) ? "| " : ""} ${ballTypeAdd || ""}`} */}
                {displayValue}
            </div>
        })
    }

    const generateRightSideOvers = () => {
        return Object.keys(overBalls).map((over, index) =>
            <>
                {/* <span>{onPitchPlayers[ON_STRIKE]?.playerName}</span> */}
                <div className={`ball-by-ball-display ${index % 2 !== 0 ? "background-nth " : ""} `} xs={12} md={12} lg={12}>
                    <b>Ov-{over.split(STRING_SEPERATOR)?.[2]} : </b>
                    {(overBalls[over].length === 0 && (onPitchPlayers[CURRENT_BOWLER]?.bowlerOver || 0) % 1 === 0) &&
                        <> Yet to start Over </>
                    }
                    {generateBallfromArray(overBalls[over])}
                </div > </>)
    }

    // const handleKeyPress = (event) => {
    //     const key = event.key.toLowerCase(); // Convert to lowercase to simplify the switch cases
    //     switch (key) {
    //         case '0':
    //             handleRuns(0, 1);
    //             break;
    //         case '1':
    //             handleRuns(1, 1);
    //             break;
    //         case '2':
    //             handleRuns(2, 1);
    //             break;
    //         case 'u':
    //             onUndoClick();
    //             break;
    //         case '3':
    //             handleRuns(3, 1);
    //             break;
    //         case '4':
    //             setIsBoundary(4);
    //             break;
    //         case '6':
    //             setIsBoundary(6);
    //             break;
    //         case '/':
    //             updateExtras(BALL_WIDE)
    //             break;
    //         case '*':
    //             updateExtras(NO_BALL);
    //             break;
    //         case '+':
    //             updateDisplayStatus(BOWLER_CHANGE_DISPLAY_STATUS);
    //             break;
    //         case '-':
    //             setStatusPopup(true)
    //             break;
    //         case 'a':
    //             updateExtras(BALL_BYE)
    //             break;
    //         case 's':
    //             updateExtras(NO_BALL_BYE);
    //             break;
    //         case 'c':
    //             console.log("Actions")
    //             break;
    //         case '.':
    //             onWicketClick();
    //             break;
    //         default:
    //             break;
    //     }
    // }

    const handleRuns = (run, ball, isBoundary = false) => {
        updateRuns(
            {
                run: run,
                ball: ball,
                batter: onPitchPlayers[ON_STRIKE],
                bowler: onPitchPlayers[CURRENT_BOWLER],
                isBoundary
            }
        )
    }
    // useEffect(() => {
    //     if (anyPopup || isBoundary || statusPopup) window.removeEventListener('keydown', handleKeyPress);
    //     else { window.addEventListener('keydown', handleKeyPress); }
    //     return () => {
    //         window.removeEventListener('keydown', handleKeyPress);
    //     };
    // }, [onPitchPlayers, onUndoClick, anyPopup, isBoundary, statusPopup]);

    return <React.Fragment>
        <Row>
            {/* {isLoading && <SpinnerModel />} */}
            <Col xs={12} md={6} lg={6}>
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
                            {teamDetails?.[BATTING_TEAM]?.teamScore || 0}/{teamDetails?.[BATTING_TEAM].teamWicket || 0}
                            &nbsp;({teamDetails?.[BATTING_TEAM].teamOver || 0})
                            &nbsp;</span>
                    </Col>
                    <Col className="bowling-team-score-header" xs={6} md={6} lg={6}>
                        <span className="bowling-team-name">{teamDetails?.[BOWLING_TEAM]?.shortName?.toUpperCase()}&nbsp;</span>
                        <span className="bowling-team-score">
                            {teamDetails?.[BOWLING_TEAM]?.teamScore || 0}/{teamDetails?.[BOWLING_TEAM].teamWicket || 0}
                            &nbsp;({teamDetails?.[BOWLING_TEAM].teamOver || 0})
                            &nbsp;</span>
                    </Col>
                </Row>
                <Row>
                    {onPitchPlayers[ON_STRIKE]?.batterOrder > onPitchPlayers[NON_STRIKE]?.batterOrder ? (
                        <>
                            <Col className="non-striker-end" xs={12} md={6} lg={6}>
                                <span onClick={() => { changeStrike(onPitchPlayers[NON_STRIKE].commentaryPlayerId) }}>{onPitchPlayers[NON_STRIKE]?.playerName}&nbsp;</span>
                                <span>{onPitchPlayers[NON_STRIKE]?.batRun || 0}</span>
                                <span>({onPitchPlayers[NON_STRIKE]?.batBall || 0}) &nbsp;</span>
                                <button onClick={() => { changePlayer(NON_STRIKE) }} className="change-button text-right">C</button>
                            </Col>
                            <Col className="striker-end" xs={12} md={6} lg={6}>
                                <span onClick={() => { changeStrike(onPitchPlayers[ON_STRIKE].commentaryPlayerId) }}>{onPitchPlayers[ON_STRIKE]?.playerName}*&nbsp;</span>
                                <span>{onPitchPlayers[ON_STRIKE]?.batRun || 0}</span>
                                <span>({onPitchPlayers[ON_STRIKE]?.batBall || 0}) &nbsp;</span>
                                <button onClick={() => { changePlayer(ON_STRIKE) }} className="change-button text-right">C</button>
                            </Col>
                        </>
                    ) : (
                        <>
                            <Col className="striker-end" xs={12} md={6} lg={6}>
                                <span onClick={() => { changeStrike(onPitchPlayers[ON_STRIKE].commentaryPlayerId) }}>{onPitchPlayers[ON_STRIKE]?.playerName}*&nbsp;</span>
                                <span>{onPitchPlayers[ON_STRIKE]?.batRun || 0}</span>
                                <span>({onPitchPlayers[ON_STRIKE]?.batBall || 0}) &nbsp;</span>
                                <button onClick={() => { changePlayer(ON_STRIKE) }} className="change-button text-right">C</button>
                            </Col>
                            <Col className="non-striker-end" xs={12} md={6} lg={6}>
                                <span onClick={() => { changeStrike(onPitchPlayers[NON_STRIKE].commentaryPlayerId) }}>{onPitchPlayers[NON_STRIKE]?.playerName}&nbsp;</span>
                                <span>{onPitchPlayers[NON_STRIKE]?.batRun || 0}</span>
                                <span>({onPitchPlayers[NON_STRIKE]?.batBall || 0}) &nbsp;</span>
                                <button onClick={() => { changePlayer(NON_STRIKE) }} className="change-button text-right ">C</button>
                            </Col>
                        </>
                    )}
                </Row>

                <Row className="Bowler-header">
                    <Col xs={12} md={12} lg={12}>
                        {onPitchPlayers[CURRENT_BOWLER]?.playerName} &nbsp;
                        <span>{onPitchPlayers[CURRENT_BOWLER]?.bowlerOver || 0}-{onPitchPlayers[CURRENT_BOWLER]?.bowlerMaidenOver || 0}
                            -{onPitchPlayers[CURRENT_BOWLER]?.bowlerRun || 0}-{onPitchPlayers[CURRENT_BOWLER]?.bowlerTotalWicket || 0}</span>
                        <button onClick={changeBowler} className=" text-right change-button">C</button>
                    </Col>
                    {/* {(onPitchPlayers[CURRENT_BOWLER]?.bowlerOver || 0) % 1 === 0 &&
                        < Col xs={12} md={12} lg={12}>
                            &nbsp;&nbsp;&nbsp; Yet to start Over
                        </Col>} */}
                </Row>
                <Row className={isLoading ? "disable-button" : ""} >
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
                        onClick={() => setIsBoundary(4)}>
                        <img className="button-icon" src="icons/4.png" alt="Icon" />
                    </Col>
                    <Col role="button" className=" score-button" xs={3} md={3} lg={3}
                        onClick={() => setIsBoundary(6)}>
                        <img className="button-icon" src="icons/6.png" alt="Icon" />
                    </Col>
                    <Col role="button" className=" score-button" xs={3} md={3} lg={3}
                        onClick={() => updateDisplayStatus(BOWLER_CHANGE_DISPLAY_STATUS)}>
                        <img className="button-icon" src="icons/b.png" alt="Icon" />
                    </Col>
                    <Col role="button" className=" score-button" xs={3} md={3} lg={3}
                        onClick={() => updateExtras(BALL_WIDE)}>
                        <img className="button-icon-lg" src="icons/wide-ball.png" alt="Icon" />
                    </Col>
                    <Col role="button" className=" score-button" xs={3} md={3} lg={3}
                        onClick={() => updateExtras(NO_BALL)}>
                        <img className="button-icon-lg" src="icons/no-ball.png" alt="Icon" />
                    </Col>
                    <Col role="button" className=" score-button" xs={6} md={6} lg={6}
                        onClick={() => setActionPopup(true)}>
                        <img className="button-icon" src="icons/action.png" alt="Icon" />
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
            </Col>
            <Col className="over-render" xs={12} md={6} lg={6}>
                <Row>
                    <div className="team-name overs-header">Overs</div>
                </Row>
                <Row>
                    {generateRightSideOvers()}
                </Row>
            </Col>
        </Row >
        {isBoundary &&
            <IsBoundaryModal
                isOpen={isBoundary}
                toggle={() => { setIsBoundary(undefined) }}
                onNoClick={() => {
                    handleRuns(isBoundary, 1)
                    setIsBoundary(undefined)
                }}
                onYesClick={() => {
                    handleRuns(isBoundary, 1, true)
                    setIsBoundary(undefined)
                }}
            />}

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
        />}
    </React.Fragment >
}