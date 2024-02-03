import React from "react"
import { Col, Row } from "reactstrap"
import "./CommentaryCss.css"
import { BALL_BYE, BALL_LEG_BYE, BALL_WIDE, BATTING_TEAM, BOWLING_TEAM, CURRENT_BOWLER, FOUR, NON_STRIKE, NO_BALL, ON_STRIKE, SIX } from "./CommentartConst"

export const CommentaryScreen = ({
    teamDetails,
    onPitchPlayers, updateRuns, changePlayer,
    changeOver, updateExtras, onWicketClick, onUndoClick, changeStrike, endInnings }) => {
    const handleRuns = (run, ball, type = "") => {
        updateRuns(
            {
                run: run, ball: ball, batter: onPitchPlayers[ON_STRIKE],
                bowler: onPitchPlayers[CURRENT_BOWLER], type: type, switchBatter: false
            }
        )
    }
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
                        <span className="current-team-name">{teamDetails?.[BATTING_TEAM].shortName?.toUpperCase()}&nbsp;</span>
                        <span className="current-team-score">
                            {teamDetails?.[BATTING_TEAM].teamScore || 0}/{teamDetails?.[BATTING_TEAM].teamWicket || 0}
                            &nbsp;({teamDetails?.[BATTING_TEAM].teamOver || 0})
                            &nbsp;</span>
                    </Col>
                    <Col className="bowling-team-score-header" xs={6} md={6} lg={6}>
                        <span className="bowling-team-name">{teamDetails?.[BOWLING_TEAM].shortName?.toUpperCase()}&nbsp;</span>
                        <span className="bowling-team-score">
                            {teamDetails?.[BOWLING_TEAM].teamScore || 0}/{teamDetails?.[BOWLING_TEAM].teamWicket || 0}
                            &nbsp;({teamDetails?.[BOWLING_TEAM].teamOver || 0})
                            &nbsp;</span>
                    </Col>
                </Row>
                <Row>
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
                </Row>
                <Row className="Bowler-header">
                    <Col xs={12} md={12} lg={12}>
                        {onPitchPlayers[CURRENT_BOWLER]?.playerName} &nbsp;
                        <span>{onPitchPlayers[CURRENT_BOWLER]?.bowlerOver || 0}-{onPitchPlayers[CURRENT_BOWLER]?.bowlerMaidenOver || 0}
                            -{onPitchPlayers[CURRENT_BOWLER]?.bowlerRun || 0}-{onPitchPlayers[CURRENT_BOWLER]?.bowlerTotalWicket || 0}</span>
                        <button onClick={() => { changePlayer(CURRENT_BOWLER) }} className=" text-right change-button">C</button>
                    </Col>
                    {(onPitchPlayers[CURRENT_BOWLER]?.bowlerOver || 0) % 1 === 0 &&
                        < Col xs={12} md={12} lg={12}>
                            &nbsp;&nbsp;&nbsp; Yet to start Over
                        </Col>}
                </Row>
                <Row >
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
                        onClick={() => handleRuns(4, 1, FOUR)}>
                        <img className="button-icon" src="icons/4.png" alt="Icon" />
                    </Col>
                    <Col role="button" className=" score-button" xs={3} md={3} lg={3}
                        onClick={() => handleRuns(6, 1, SIX)}>
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
                        onClick={() => updateExtras(BALL_BYE)}>
                        <img className="button-icon" src="icons/bye-ball.png" alt="Icon" />
                    </Col>
                    <Col role="button" className=" score-button" xs={3} md={3} lg={3}
                        onClick={() => updateExtras(BALL_LEG_BYE)}>
                        <img className="button-icon" src="icons/leg-by.png" alt="Icon" />
                    </Col>
                    <Col role="button" className=" score-button" xs={3} md={3} lg={3}
                        onClick={changeOver}>
                        <img className="button-icon" src="icons/end-over.png" alt="Icon" />
                    </Col>
                    <Col role="button" className=" score-button" xs={3} md={3} lg={3}
                        onClick={endInnings}>
                        <img className="button-icon" src="icons/end-innings.png" alt="Icon" />
                    </Col>
                    <Col role="button" className=" score-button" xs={3} md={3} lg={3}
                        onClick={() => handleRuns(0)}>
                        <img className="button-icon" src="icons/action.png" alt="Icon" />
                    </Col>
                    <Col role="button" className="color-out score-button" xs={3} md={3} lg={3}
                        onClick={onWicketClick}>
                        <img className="button-icon" src="icons/out.png" alt="Icon" />
                    </Col>
                </Row>
            </Col>
        </Row >
    </React.Fragment >
}