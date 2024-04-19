import { forwardRef, useImperativeHandle, useState } from "react";
import { AccordionBody, AccordionHeader, AccordionItem, Col, Row, UncontrolledAccordion } from "reactstrap";
import { STRING_SEPERATOR } from "../../components/Common/Const";
import { PLAYER, TEAM } from "./CommentartConst";
import { SHORT_COMMENTARY_BATTING_PLAYER, SHORT_COMMENTARY_BOWLING_PLAYER, SHORT_COMMENTARY_TEAM } from "../../constants/FieldConst/CommentaryConst";
import "./CommentaryCss.css"
import _ from "lodash";
import { FieldRenderer } from "../../components/Common/Reusables/FieldRenderer";

export const ShortCommentaryTeams = forwardRef(({ teamDetails }, ref) => {
    const [teamData, setTeamData] = useState({});
    const [playerData, setPlayerData] = useState({});

    const handleChange = (field, value, uniqueId, dataObject) => {
        const formattedValue = isNaN(+value) ? value : +value
        if (field.formName === TEAM) {
            const updatedTeamData = (_.isEmpty(teamData[uniqueId]) ? dataObject : teamData[uniqueId]) || {}
            updatedTeamData[field.name] = formattedValue
            setTeamData({ ...teamData, [uniqueId]: updatedTeamData })
        }
        else if (field.formName === PLAYER) {
            let updatedPlayerData = _.isEmpty(playerData[uniqueId]) ? dataObject : playerData[uniqueId]
            updatedPlayerData[field.name] = formattedValue
            setPlayerData({ ...playerData, [uniqueId]: updatedPlayerData })
        }
    }
    const renderTextFields = (fields = [], uniqueId, dataObject, index) => {
        return <Row>
            <FieldRenderer
                key={index}
                index={index}
                fields={fields}
                value={teamData[uniqueId] || {}}
                onChange={(field, value) => handleChange(field, value, uniqueId, dataObject)}
            />
        </Row>

    }
    const renderBatters = (playerList = [], teamUniqueId) => {
        return playerList.map((batter, index) => {
            const uniqueId = teamUniqueId + STRING_SEPERATOR + batter.commentaryPlayerId
            return <>
                <Row>
                    <Col xs={12} md={4} lg={3}>
                        <div>{batter.playerName}</div>
                    </Col>
                    <Col xs={12} md={8} lg={9}>
                        {renderTextFields(SHORT_COMMENTARY_BATTING_PLAYER, uniqueId, batter, index)}
                    </Col>
                </Row>
            </>
        })

    }
    const renderBowler = (playerList = [], teamUniqueId) => {
        return playerList.map((bowler, index) => {
            const uniqueId = teamUniqueId + STRING_SEPERATOR + bowler.commentaryPlayerId
            return <>
                <div className="player-header">{bowler.playerName}</div>
                {renderTextFields(SHORT_COMMENTARY_BOWLING_PLAYER, uniqueId, bowler, index)}
            </>
        })

    }
    const renderTeamFields = (teamDetails) => {
        const uniqueId = teamDetails.currentInnings + STRING_SEPERATOR + teamDetails.teamId
        const oppositeTeamUniqueId = teamDetails.currentInnings + STRING_SEPERATOR + teamDetails.oppositeTeam
        return <AccordionItem >
            <AccordionHeader targetId={uniqueId}>
                {`Innings : ${teamDetails.currentInnings} || Team : ${teamDetails.teamName} `}</AccordionHeader>
            <AccordionBody accordionId={uniqueId}>
                {renderTextFields(SHORT_COMMENTARY_TEAM, uniqueId, teamDetails, uniqueId)}
                <UncontrolledAccordion defaultOpen="0">
                    <AccordionItem>
                        <AccordionHeader targetId='Batter'>Batter</AccordionHeader>
                        <AccordionBody accordionId="Batter">
                            {renderBatters(teamDetails.teamPlayers, uniqueId)}
                        </AccordionBody>
                    </AccordionItem >
                    <AccordionItem>
                        <AccordionHeader targetId="Bowler">Bowler</AccordionHeader>
                        <AccordionBody accordionId="Bowler">
                            {renderBowler(teamDetails.bowlers, oppositeTeamUniqueId)}
                        </AccordionBody>
                    </AccordionItem >
                </UncontrolledAccordion>
            </AccordionBody>
        </AccordionItem >
    }
    useImperativeHandle(ref, () => ({
        getData() {
            return { commentaryTeams: Object.values(teamData || {}), commentaryPlayers: Object.values(playerData || {}) }
        }
    }))

    return Object.values(teamDetails).map((team, index) => {
        return <div key={index}>{renderTeamFields(team)}</div>
    })
})