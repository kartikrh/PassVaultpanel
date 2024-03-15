import { useEffect, useState } from "react";
import { AccordionBody, AccordionHeader, AccordionItem, Col, Input, Row, UncontrolledAccordion } from "reactstrap";
import { STRING_SEPERATOR, TEXT } from "../../components/Common/Const";
import { PLAYER, TEAM } from "./CommentartConst";
import { SHORT_COMMENTARY_BATTING_PLAYER, SHORT_COMMENTARY_TEAM } from "../../constants/FieldConst/CommentaryConst";

export const ShortCommentaryTeams = ({ teamDetails }) => {
    const [teamData, setTeamData] = useState({});
    const [playerData, setPlayerData] = useState({});
    useEffect(() => {
        console.log(teamData, playerData)
    })
    const handleChange = (field, value, uniqueId) => {
        if (field.formName === TEAM)
            setTeamData({
                ...teamData,
                [uniqueId]: {
                    ...teamData[uniqueId],
                    [field.name]: value
                }
            })
        else if (field.formName === PLAYER)
            setPlayerData({
                ...playerData,
                [uniqueId]: {
                    ...playerData[uniqueId],
                    [field.name]: value
                }
            })
    }
    const renderTextFields = (fields = [], uniqueId) => {
        return <Row>
            {fields.map((field, index) => {
                return <>
                    <Col
                        key={index}
                        xs={field.labelColspan?.xs || 3}
                        md={field.labelColspan?.md || 2}
                        lg={field.labelColspan?.lg || 2}
                    >
                        <div className="lablediv">
                            <label
                                htmlFor={field.name}
                                className="col-form-label dynamic-label-right form-label-class"
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
                        {field.type === TEXT && <Input
                            className="form-control"
                            style={field?.customStyle}
                            placeholder={field?.placeholder}
                            type="text"
                            id={field.name}
                            name={field.name}
                            value={teamData[uniqueId]?.[field.name] || field.defaultValue}
                            onChange={(e) => handleChange(field, e.target.value, uniqueId)}
                        />}
                    </Col></>
            })}
        </Row>

    }
    const renderBatters = (playerList = [], teamUniqueId) => {
        return playerList.map((batter, index) => {
            const uniqueId = teamUniqueId + STRING_SEPERATOR + batter.commentaryPlayerId
            return <AccordionItem >
                <AccordionHeader targetId={batter.playerId}>{batter.playerName}</AccordionHeader>
                <AccordionBody accordionId={batter.playerId}>
                    {renderTextFields(SHORT_COMMENTARY_BATTING_PLAYER, uniqueId)}
                </AccordionBody>
            </AccordionItem >
        })

    }
    const renderBowler = (playerList = [], teamUniqueId) => {
        return playerList.map((bowler, index) => {
            const uniqueId = teamUniqueId + STRING_SEPERATOR + bowler.commentaryPlayerId
            return
        })

    }
    const renderTeamFields = (teamDetails) => {
        const uniqueId = teamDetails.currentInnings + STRING_SEPERATOR + teamDetails.teamId
        return <AccordionItem >
            <AccordionHeader targetId={uniqueId}>
                {`Innings : ${teamDetails.currentInnings} || Team : ${teamDetails.teamName} `}</AccordionHeader>
            <AccordionBody accordionId={uniqueId}>
                {renderTextFields(SHORT_COMMENTARY_TEAM, uniqueId)}
                <UncontrolledAccordion defaultOpen="0">
                    <AccordionItem>
                        <AccordionHeader targetId='Batter'>Batter</AccordionHeader>
                        <AccordionBody accordionId="Batter">
                            <UncontrolledAccordion defaultOpen="0">
                                {renderBatters(teamDetails.teamPlayers, uniqueId)}
                            </UncontrolledAccordion>
                        </AccordionBody>
                    </AccordionItem >
                    <AccordionItem>
                        <AccordionHeader targetId="Bowler">Bowler</AccordionHeader>
                        <AccordionBody accordionId="Bowler">
                        </AccordionBody>
                    </AccordionItem >
                </UncontrolledAccordion>
            </AccordionBody>
        </AccordionItem >
    }

    return Object.values(teamDetails).map((team, index) => {
        return <div key={index}>{renderTeamFields(team)}</div>
    })
}