import React from "react"
import { Col, Row } from "reactstrap"
import "./CommentaryCss.css"

export const Commentary = (props) => {
    const data = {
        eventName: "CWC T20",
        team1Name: "India",
        team1ShortName: "Ind",
        team2Name: "Australia",
        team2ShortName: "Aus",
        team1Players: [],
        team2Players: [],
        currentBowler: { name: "Chris Jordan", }
    }
    return <React.Fragment>
        <Row className="width-full">
            {/* {isLoading && <SpinnerModel />} */}
            <Col xs={12} md={6} lg={6}>
                <Row><Col className="event-name-header" xs={12} md={12} lg={12}>
                    Event : {data.eventName}
                </Col></Row>
                <Row>
                    <Col className="team-name team-1" xs={6} md={6} lg={6}>
                        {data.team1Name}
                    </Col>
                    <Col className="team-name team-2" xs={6} md={6} lg={6}>
                        {data.team2Name}
                    </Col>
                </Row>
                <Row><Col className="current-score-header" xs={12} md={12} lg={12}>
                    <span className="current-team-name">{data.team1ShortName.toUpperCase()}&nbsp;</span>
                    <span className="current-team-score">173/0 (18.4) &nbsp;</span>
                    <button className="change-button">C</button>
                </Col></Row>
                <Row>
                    <Col className="striker-end" xs={12} md={6} lg={6}>
                        Rohit Sharma&nbsp;
                        <spam>97</spam>
                        <span>(60) &nbsp;</span>
                        <button className="change-button text-right">C</button>
                    </Col>
                    <Col className="non-striker-end" xs={12} md={6} lg={6}>
                        Ishan Kisan&nbsp;
                        <spam>70</spam>
                        <span>(52) &nbsp;</span>
                        <button className="change-button text-right ">C</button>
                    </Col>
                </Row>
                <Row className="Bowler-header">
                    <Col xs={12} md={12} lg={12}>
                        Chris Jordan &nbsp;
                        <span>3.4-2-24-0</span>
                        <button className=" text-right change-button">C</button>
                    </Col>
                    < Col xs={12} md={12} lg={12}>
                        &nbsp;&nbsp;&nbsp; Yet to start Over
                    </Col>
                </Row>
                <Row >
                    <Col role="button" className=" score-button" xs={3} md={3} lg={3}>
                        <img className="button-icon" src="icons/0.png" alt="Icon" />
                    </Col>
                    <Col role="button" className=" score-button" xs={3} md={3} lg={3}>
                        <img className="button-icon" src="icons/1.png" alt="Icon" />
                    </Col>
                    <Col role="button" className=" score-button" xs={3} md={3} lg={3}>
                        <img className="button-icon" src="icons/2.png" alt="Icon" />
                    </Col>
                    <Col role="button" className=" score-button" xs={3} md={3} lg={3}>
                        <img className="button-icon" src="icons/undo.png" alt="Icon" />
                    </Col>
                    <Col role="button" className=" score-button" xs={3} md={3} lg={3}>
                        <img className="button-icon" src="icons/3.png" alt="Icon" />
                    </Col>
                    <Col role="button" className=" score-button" xs={3} md={3} lg={3}>
                        <img className="button-icon" src="icons/4.png" alt="Icon" />
                    </Col>
                    <Col role="button" className=" score-button" xs={3} md={3} lg={3}>
                        <img className="button-icon" src="icons/6.png" alt="Icon" />
                    </Col>
                    <Col role="button" className=" score-button" xs={3} md={3} lg={3}>
                        <img className="button-icon" src="icons/5.png" alt="Icon" />
                    </Col>
                    <Col role="button" className=" score-button" xs={3} md={3} lg={3}>
                        <img className="button-icon" src="icons/wide-ball.png" alt="Icon" />
                    </Col>
                    <Col role="button" className=" score-button" xs={3} md={3} lg={3}>
                        <img className="button-icon" src="icons/no-ball.png" alt="Icon" />
                    </Col>
                    <Col role="button" className=" score-button" xs={3} md={3} lg={3}>
                        <img className="button-icon" src="icons/bye-ball.png" alt="Icon" />
                    </Col>
                    <Col role="button" className=" score-button" xs={3} md={3} lg={3}>
                        <img className="button-icon" src="icons/leg-by.png" alt="Icon" />
                    </Col>
                    <Col role="button" className=" score-button" xs={3} md={3} lg={3}>
                        <img className="button-icon" src="icons/end-over.png" alt="Icon" />
                    </Col>
                    <Col role="button" className=" score-button" xs={3} md={3} lg={3}>
                        <img className="button-icon" src="icons/end-innings.png" alt="Icon" />
                    </Col>
                    <Col role="button" className=" score-button" xs={3} md={3} lg={3}>
                        <img className="button-icon" src="icons/action.png" alt="Icon" />
                    </Col>
                    <Col role="button" className="color-out score-button" xs={3} md={3} lg={3}>
                        <img className="button-icon" src="icons/out.png" alt="Icon" />
                    </Col>
                </Row>
            </Col>
        </Row >
    </React.Fragment >
}