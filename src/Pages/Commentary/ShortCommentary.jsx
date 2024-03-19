import React, { useEffect, useRef, useState } from 'react';
import { AccordionBody, AccordionHeader, AccordionItem, Button, Card, CardBody, Col, Container, Row, UncontrolledAccordion } from 'reactstrap';
import { BAT, BOWL, TOSS_SELECTION } from './CommentartConst';
import { isEmpty } from 'lodash';
import CardComponent from './CardComponent';
import { STRING_SEPERATOR } from '../../components/Common/Const';
import { ShortCommentaryTeams } from './ShortCommentaryTeams';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import { useDispatch } from 'react-redux';
import { saveShortCommentary } from '../../Features/Tabs/commentarySlice';

function ShortCommentaryScreen({ commentaryData, CommentaryFormatedData, totalInnings, backClick }) {
    const shortCommentaryTeamsRef = useRef()
    const [commentaryDetails, setCommentaryDetails] = useState({});
    const [disableAccordian, setDisableAccordian] = useState({});
    const [inningsTeam, setInningsTeam] = useState({});
    const [nextBattingTeam, setNextBattingTeam] = useState(undefined)
    const [showInningsUpdate, setShowInningsUpdate] = useState(undefined)
    const dispatch = useDispatch();

    const fetchTeamData = (teamId, key) => {
        return CommentaryFormatedData["1_##_" + teamId]?.[key]
    }
    const getBattingTeam = () => {
        let battingTeam = undefined
        if (commentaryDetails.choseToLocal === BAT) {
            if (commentaryDetails.tossWonByLocal === commentaryDetails.team1Id) {
                battingTeam = commentaryDetails.team1Id
                setNextBattingTeam(commentaryDetails.team2Id)
            } else {
                battingTeam = commentaryDetails.team2Id
                setNextBattingTeam(commentaryDetails.team1Id)
            }
        }
        else {
            if (commentaryDetails.tossWonByLocal === commentaryDetails.team1Id) {
                battingTeam = commentaryDetails.team2Id
                setNextBattingTeam(commentaryDetails.team1Id)
            } else {
                battingTeam = commentaryDetails.team1Id
                setNextBattingTeam(commentaryDetails.team2Id)
            }
        }
        return battingTeam
    }
    const generateTeam = () => {
        setDisableAccordian({ ...disableAccordian, "toss": true })
        const battingTeam = nextBattingTeam || getBattingTeam()
        const uniqueTeamId = commentaryDetails.currentInnings + STRING_SEPERATOR + battingTeam
        handleTeamChange(uniqueTeamId, CommentaryFormatedData[uniqueTeamId])
    }
    const saveDetails = (isGameEnd) => {
        const objToSave = {}
    }
    const handleTeamChange = (key, value) => {
        setInningsTeam({ ...inningsTeam, [key]: value })
    }
    const handleCommentaryChange = (objToSave) => {
        setCommentaryDetails({
            ...commentaryDetails,
            ...objToSave
        })
    }
    const selectTossAccordian = () => {
        const winningTeam = commentaryDetails.tossWonBy
        const chooseTo = commentaryDetails.choseTo
        return <AccordionItem >
            <AccordionHeader targetId="1">{`Toss ${winningTeam ? `: Won by ${fetchTeamData(winningTeam, "teamName")} and choose to ${TOSS_SELECTION[chooseTo]}` : ""} `}</AccordionHeader>
            <AccordionBody accordionId="1">
                <Row>
                    <Col xs={12} md={12} lg={12} >Toss Won By :</Col>
                    <Col xs={6} md={6} lg={6} onClick={() =>
                        handleCommentaryChange(
                            {
                                "tossWonBy": fetchTeamData(commentaryDetails.team1Id, "teamId"),
                                "tossWonByLocal": fetchTeamData(commentaryDetails.team1Id, "teamId")
                            })}>
                        <CardComponent
                            title={fetchTeamData(commentaryDetails.team1Id, "teamName")}
                            selectIcon={"bx bxs-check-circle"}
                            onClickColor={"#099680"}
                            bgColor={"#55c6b4"}
                            check={fetchTeamData(commentaryDetails.team1Id, "teamId") === commentaryDetails.tossWonBy}
                        />
                    </Col>
                    <Col xs={6} md={6} lg={6} onClick={() =>
                        handleCommentaryChange(
                            {
                                "tossWonBy": fetchTeamData(commentaryDetails.team2Id, "teamId"),
                                "tossWonByLocal": fetchTeamData(commentaryDetails.team2Id, "teamId")
                            })}
                    >
                        <CardComponent
                            title={fetchTeamData(commentaryDetails.team2Id, "teamName")}
                            selectIcon={"bx bxs-check-circle"}
                            onClickColor={"#099680"}
                            bgColor={"#55c6b4"}
                            check={fetchTeamData(commentaryDetails.team2Id, "teamId") === commentaryDetails.tossWonBy}
                        />
                    </Col>
                </Row>
                {winningTeam && <Row>
                    <Col xs={12} md={12} lg={12} >Choose to :</Col>
                    <Col xs={6} md={6} lg={6}
                        onClick={() =>
                            handleCommentaryChange(
                                { "choseTo": BAT, "choseToLocal": BAT })}
                    >
                        <CardComponent
                            title="Batting"
                            titleIcon="CommentaryIcons/bat1.png"
                            selectIcon={"bx bxs-check-circle"}
                            onClickColor={"#FCB92C"}
                            bgColor={"#ffcd6b"}
                            check={commentaryDetails.choseTo === BAT}
                        />
                    </Col>
                    <Col xs={6} md={6} lg={6}
                        onClick={() =>
                            handleCommentaryChange(
                                { "choseTo": BOWL, "choseToLocal": BOWL })}
                    >
                        <CardComponent
                            title="Bowling"
                            titleIcon="CommentaryIcons/ball1.png"
                            selectIcon={"bx bx-circle"}
                            onClickColor={"#FCB92C"}
                            bgColor={"#ffcd6b"}
                            check={commentaryDetails.choseTo === BOWL}
                        />
                    </Col>
                </Row>
                }
            </AccordionBody>
        </AccordionItem >
    }
    const selectNextInningsAccordian = () => {
        return <>
            <Row>
                <Col xs={12} md={12} lg={12} >
                    Choose Next Batting Team :
                </Col>
                <Col xs={6} md={6} lg={6} onClick={() =>
                    handleCommentaryChange(
                        { "tossWonByLocal": fetchTeamData(commentaryDetails.team1Id, "teamId"), "choseToLocal": BAT })}
                >
                    <CardComponent
                        title={fetchTeamData(commentaryDetails.team1Id, "teamName")}
                        selectIcon={"bx bxs-check-circle"}
                        onClickColor={"#099680"}
                        bgColor={"#55c6b4"}
                        check={fetchTeamData(commentaryDetails.team1Id, "teamId") === commentaryDetails.tossWonByLocal}
                    />
                </Col>
                <Col xs={6} md={6} lg={6} onClick={() =>
                    handleCommentaryChange(
                        { "tossWonByLocal": fetchTeamData(commentaryDetails.team2Id, "teamId"), "choseToLocal": BAT })}
                >
                    <CardComponent
                        title={fetchTeamData(commentaryDetails.team2Id, "teamName")}
                        selectIcon={"bx bxs-check-circle"}
                        onClickColor={"#099680"}
                        bgColor={"#55c6b4"}
                        check={fetchTeamData(commentaryDetails.team2Id, "teamId") === commentaryDetails.tossWonByLocal}
                    />
                </Col>
            </Row >
            <Button color="primary" className="decision-Button"
                onClick={() => {
                    generateTeam()
                    setNextBattingTeam(undefined)
                    setShowInningsUpdate(undefined)
                }}>
                Generate Next team
            </Button>
        </>
    }
    const generateNextButtons = () => {
        if (!isEmpty(inningsTeam)) {
            if (Object.values(inningsTeam).length % 2 === 0) {
                if (commentaryDetails.currentInnings === totalInnings)
                    return <Button color="primary" className="decision-Button" onClick={saveDetails}>End Game</Button>
                else return <>
                    {!showInningsUpdate && <Button color="primary" className="decision-Button"
                        onClick={() => {
                            handleCommentaryChange({ "currentInnings": commentaryDetails.currentInnings + 1 })
                            setShowInningsUpdate(true)
                        }}>Change Innings</Button>}
                </>
            }
            else return <Button color="primary" className="decision-Button" onClick={generateTeam}>Generate Next team</Button>
        }
    }
    const handleSaveData = () => {
        const data = shortCommentaryTeamsRef.current.getData()
        dispatch(saveShortCommentary({ commentaryDetails: commentaryDetails, ...data }))
    }
    useEffect(() => {
        if (isEmpty(commentaryDetails) && !isEmpty(commentaryData)) setCommentaryDetails(commentaryData.commentaryDetails)
    }, [commentaryData, CommentaryFormatedData])

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid={true}>
                    <Row>
                        <Card>
                            <CardBody>
                                <Row>
                                    <Col xs={6} md={8} lg={9} className="mt-3 mt-lg-4 mt-md-4">
                                        <Breadcrumbs title="ScoreCard" breadcrumbItem="Short Commentary" page="updatecp" />
                                    </Col>
                                    <Col xs={6} md={4} lg={3} className="mt-3 mt-lg-2 mt-md-2">
                                        <Button color='primary' className="table-header-button" onClick={handleSaveData}>Save</Button>
                                        <Button color='danger' className="table-header-button" onClick={backClick}>Exit</Button>
                                    </Col>
                                </Row>
                                <Row>
                                    {!isEmpty(commentaryDetails) && <Col className='mb-3'>
                                        <div className='match-details-breadcrumbs'>{`${commentaryDetails.ety}/ ${commentaryDetails.com}/ ${commentaryDetails.en}`}</div>
                                        <div>{`Ref: ${commentaryDetails.eid} [ ${commentaryDetails.ed + " " + commentaryDetails.et} ]`}</div>
                                    </Col>}
                                </Row>
                                <UncontrolledAccordion defaultOpen="0">
                                    {selectTossAccordian()}
                                    {(commentaryDetails.tossWonBy && commentaryDetails.choseTo && isEmpty(inningsTeam)) &&
                                        <div className='generate-team-button'>
                                            <Button color="primary" className="decision-Button"
                                                onClick={generateTeam}>Generate first team</Button>
                                        </div>
                                    }
                                    <ShortCommentaryTeams
                                        teamDetails={inningsTeam}
                                        ref={shortCommentaryTeamsRef} />
                                    <div className='generate-team-button'>{generateNextButtons()}</div>
                                    {showInningsUpdate && selectNextInningsAccordian()}
                                </UncontrolledAccordion>
                            </CardBody>
                        </Card>
                    </Row>
                </Container>
            </div>
        </React.Fragment >
    );
}

export default ShortCommentaryScreen;
