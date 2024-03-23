import { forwardRef, useImperativeHandle, useState } from "react";
import { AccordionBody, AccordionHeader, AccordionItem, Col, Input, Row, UncontrolledAccordion } from "reactstrap";
import { COUNTER, STRING_SEPERATOR } from "../../components/Common/Const";
import { PLAYER, TEAM } from "./CommentartConst";
import { SHORT_COMMENTARY_BATTING_PLAYER, SHORT_COMMENTARY_BOWLING_PLAYER, SHORT_COMMENTARY_TEAM } from "../../constants/FieldConst/CommentaryConst";
import "./CommentaryCss.css"
import _ from "lodash";

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
    const renderTextFields = (fields = [], uniqueId, dataObject) => {
        return <Row>
            {fields.map((field, index) => {
                return <>
                    <Col
                        key={index}
                        xs={field.labelColspan?.xs || 3}
                        md={field.labelColspan?.md || 2}
                        lg={field.labelColspan?.lg || 2}
                        className="d-flex p-0"
                    >
                        <div className="lablediv small-label-div ">
                            <label
                                htmlFor={field.name}
                                className="dynamic-label-right form-label-class small-labels"
                            >   {field.label}</label>
                        </div>
                    </Col>
                    <Col
                        className={`mb-4`}
                        key={index}
                        xs={field.fieldColspan?.xs || 9}
                        md={field.fieldColspan?.md || 4}
                        lg={field.fieldColspan?.lg || 4}
                    >
                        {field.type === COUNTER && <Input
                            className="form-control small-text-fields"
                            type="number"
                            step={1}
                            min={0}
                            id={field.name}
                            placeholder={field?.placeholder}
                            name={field.name}
                            value={teamData[uniqueId]?.[field.name] || field.defaultValue}
                            onChange={(e) => handleChange(field, e.target.value, uniqueId, dataObject)}
                        />}
                    </Col>
                </>
            })}
        </Row>

    }
    const renderBatters = (playerList = [], teamUniqueId) => {
        return playerList.map(batter => {
            const uniqueId = teamUniqueId + STRING_SEPERATOR + batter.commentaryPlayerId
            return <>
                <div className="player-header">{batter.playerName}</div>
                {renderTextFields(SHORT_COMMENTARY_BATTING_PLAYER, uniqueId, batter)}
            </>
        })

    }
    const renderBowler = (playerList = [], teamUniqueId) => {
        return playerList.map(bowler => {
            const uniqueId = teamUniqueId + STRING_SEPERATOR + bowler.commentaryPlayerId
            return <>
                <div className="player-header">{bowler.playerName}</div>
                {renderTextFields(SHORT_COMMENTARY_BOWLING_PLAYER, uniqueId, bowler)}
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
                {renderTextFields(SHORT_COMMENTARY_TEAM, uniqueId, teamDetails)}
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