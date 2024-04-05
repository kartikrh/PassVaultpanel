import React, { useEffect, useState } from "react"
import { Col, Row } from "reactstrap"
import "./CommentaryCss.css"
import { BALL_BYE, BALL_LEG_BYE, BALL_WIDE, BATTING_TEAM, BOWLER_CHANGE_DISPLAY_STATUS, BOWLING_TEAM, CURRENT_BOWLER, NON_STRIKE, NO_BALL, NO_BALL_BYE, NO_BALL_LEG_BYE, ON_STRIKE } from "./CommentartConst"
import IsBoundaryModal from "./CommentaryModels/IsBoundaryModal"
import ChangeStatusModal from "./CommentaryModels/ChangeStatusModal"
import { generateBallLabelFromBall } from "./functions"
import CommentaryAction from "./CommentaryModels/CommentaryAction"
// import { generateBallLabelFromBall } from "./functions"

export const CommentaryScreen = ({
    teamDetails, onPitchPlayers, updateRuns, changePlayer, changeOver, updateExtras, onWicketClick,
    onUndoClick, changeStrike, endInnings, isLoading, changeBowler, updateDisplayStatus, statusList, anyPopup,
    overBalls }) => {
    const [isBoundary, setIsBoundary] = useState(false)
    const [statusPopup, setStatusPopup] = useState(undefined)
    const [actionPopup, setActionPopup] = useState(undefined)
    // const [renderApi, setRenderApi] = useState({})
    // const { saveCommentaryLog } = useSelector(state => state.tabsData.news);
    const generateBallfromArray = (ballArray = []) => {
        return ballArray?.map(element => {
            const isWicket = +element?.isWicket !== 0
            const ballTypeAdd = generateBallLabelFromBall(element?.type, isWicket)
            const ballColor = isWicket ? "ball-red" : ballTypeAdd ? "ball-blue" : "ball-white"
            return <div className={` over-ball-display ${ballColor}`}>{`${element.value > 0 ? element.value : ""} ${(element.value > 0 && ballTypeAdd) ? "| " : ""} ${ballTypeAdd ? (ballTypeAdd) : ""}`}</div>
        })
    }
    // useEffect(() => {
    //     if (saveCommentaryLog?.length > 0) {
    //         setRenderApi(saveCommentaryLog[saveCommentaryLog.length - 1])
    //     }
    // }, [saveCommentaryLog])
    const handleKeyPress = (event) => {
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
            case 'u':
                onUndoClick();
                break;
            case '3':
                handleRuns(3, 1);
                break;
            case '4':
                setIsBoundary(4);
                break;
            case '5':
                handleRuns(5, 1);
                break;
            case '6':
                setIsBoundary(6);
                break;
            case 'q':
                updateExtras(BALL_WIDE)
                break;
            case 'w':
                updateExtras(NO_BALL);
                break;
            case 'e':
                updateDisplayStatus(BOWLER_CHANGE_DISPLAY_STATUS);
                break;
            case 'r':
                setStatusPopup(true)
                break;
            case 'a':
                updateExtras(BALL_BYE)
                break;
            case 's':
                updateExtras(NO_BALL_BYE);
                break;
            case 'd':
                updateExtras(BALL_LEG_BYE);
                break;
            case 'f':
                updateExtras(NO_BALL_LEG_BYE);
                break;
            case 'z':
                changeOver();
                break;
            case 'x':
                endInnings();
                break;
            case 'c':
                console.log("Actions")
                break;
            case 'v':
                onWicketClick();
                break;
            default:
                break;
        }
    }
    const handleRuns = (run, ball, isBoundary = false) => {
        if (!onPitchPlayers || Object.keys(onPitchPlayers).length === 0) {
            console.error("onPitchPlayers is empty");
            return;
        }
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
    useEffect(() => {
        if (anyPopup || isBoundary || statusPopup) window.removeEventListener('keydown', handleKeyPress);
        else { window.addEventListener('keydown', handleKeyPress); }
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [onPitchPlayers, onUndoClick, anyPopup, isBoundary, statusPopup]);
    return <React.Fragment>
        <Row className="width-full">
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
                            {teamDetails?.[BATTING_TEAM].teamScore || 0}/{teamDetails?.[BATTING_TEAM].teamWicket || 0}
                            &nbsp;({teamDetails?.[BATTING_TEAM].teamOver || 0})
                            &nbsp;</span>
                    </Col>
                    <Col className="bowling-team-score-header" xs={6} md={6} lg={6}>
                        <span className="bowling-team-name">{teamDetails?.[BOWLING_TEAM]?.shortName?.toUpperCase()}&nbsp;</span>
                        <span className="bowling-team-score">
                            {teamDetails?.[BOWLING_TEAM].teamScore || 0}/{teamDetails?.[BOWLING_TEAM].teamWicket || 0}
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
                    {(onPitchPlayers[CURRENT_BOWLER]?.bowlerOver || 0) % 1 === 0 &&
                        < Col xs={12} md={12} lg={12}>
                            &nbsp;&nbsp;&nbsp; Yet to start Over
                        </Col>}
                    {<Col className="ball-by-ball-display" xs={12} md={12} lg={12}>
                        {generateBallfromArray(overBalls)}
                    </Col>}
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
                        onClick={() => handleRuns(5, 1)}>
                        <img className="button-icon" src="icons/5.png" alt="Icon" />
                    </Col>
                    <Col role="button" className=" score-button" xs={3} md={3} lg={3}
                        onClick={() => updateExtras(BALL_WIDE)}>
                        <img className="button-icon" src="icons/wide-ball.png" alt="Icon" />
                    </Col>
                    <Col role="button" className=" score-button" xs={3} md={3} lg={3}
                        onClick={() => updateExtras(NO_BALL)}>
                        <img className="button-icon" src="icons/no-ball.png" alt="Icon" />
                    </Col>
                    <Col role="button" className=" score-button" xs={3} md={3} lg={3}
                        onClick={() => updateDisplayStatus(BOWLER_CHANGE_DISPLAY_STATUS)}>
                        <img className="button-icon" src="icons/b.png" alt="Icon" />
                    </Col>
                    <Col role="button" className=" score-button" xs={3} md={3} lg={3}
                        onClick={() => setStatusPopup(true)}>
                        <img className="button-icon" src="icons/s.png" alt="Icon" />
                    </Col>
                    <Col role="button" className=" score-button" xs={3} md={3} lg={3}
                        onClick={() => updateExtras(BALL_BYE)}>
                        <img className="button-icon" src="icons/bye-ball.png" alt="Icon" />
                    </Col>
                    <Col role="button" className=" score-button" xs={3} md={3} lg={3}
                        onClick={() => updateExtras(BALL_LEG_BYE)}>
                        <img className="button-icon" src="icons/leg-by.png" alt="Icon" />
                    </Col>
                    <Col role="button" className=" score-button" xs={3} md={3} lg={3}
                        onClick={() => setActionPopup(true)}>
                        <img className="button-icon" src="icons/action.png" alt="Icon" />
                    </Col>
                    <Col role="button" className="color-out score-button" xs={3} md={3} lg={3}
                        onClick={onWicketClick}>
                        <img className="button-icon" src="icons/out.png" alt="Icon" />
                    </Col>
                </Row>
            </Col>
            <Col xs={12} md={6} lg={6}>
                <img role="button" className="sticky-button"
                    onClick={() => setStatusPopup(true)}
                    src="icons/commentary.png" alt="Icon" />
            </Col>
        </Row >
        {/* <Row className="mt-4 width-full">
            <Col>
                <Row>
                    <UncontrolledAccordion defaultOpen="0">
                        <AccordionItem>
                            <AccordionHeader targetId='ApiData'>Api</AccordionHeader>
                            <AccordionBody accordionId="ApiData">
                                {(saveCommentaryLog || []).map(element => {
                                    return <div style={{ cursor: "pointer" }} onClick={() => setRenderApi(element)}>{element.api}</div>
                                })}
                                <UncontrolledAccordion defaultOpen="0">
                                    <AccordionItem>
                                        <AccordionHeader targetId='reqRes'>Request and Response</AccordionHeader>
                                        <AccordionBody accordionId="reqRes">
                                            <Row>
                                                <Col xs={12} md={6} lg={6}>
                                                    <span>Request</span>
                                                    <div>{JSON.stringify(renderApi.req || {})}</div>
                                                </Col>
                                                <Col xs={12} md={6} lg={6}>
                                                    <span>Response</span>
                                                    <div>{JSON.stringify(renderApi.res || {})}</div>
                                                </Col>
                                            </Row>
                                        </AccordionBody>
                                    </AccordionItem >
                                </UncontrolledAccordion>
                            </AccordionBody>
                        </AccordionItem >
                    </UncontrolledAccordion>
                </Row>

                
            </Col>
        </Row > */}


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
        {statusPopup && <ChangeStatusModal
            statusList={statusList}
            toggle={() => setStatusPopup(undefined)}
            isOpen={true}
            onSubmit={(displayStatus) => {
                setStatusPopup(undefined)
                updateDisplayStatus(displayStatus)
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
        />}
    </React.Fragment >
}