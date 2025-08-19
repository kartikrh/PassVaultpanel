import { Accordion, AccordionBody, AccordionHeader, AccordionItem, Card, CardBody, CardHeader, Col, Row, Table } from "reactstrap"
import { FieldRenderer } from "../../../components/Common/Reusables/FieldRenderer"
import { BATTING_PLAYER_FEATURE_FIELD, BOWLING_PLAYER_FEATURE_FIELD } from "../../../constants/FieldConst/CommentaryConst"
import { useState } from "react";
import { SLFieldRenderer } from "../../../components/Common/Reusables/SLFieldRenderer";
import { SELECT, SWITCH } from "../../../components/Common/Const";

export const PlayerFeature = ({ playerList, handleValueChange, updatedData, title, selectedItems, setSelectedItems, battingPlayers, bowlingPlayers }) => {
    const [open, setOpen] = useState("");
    
    const toggle = (id) => {
        if (open === id) {
            setOpen(""); // collapse
        } else {
            setOpen(id); // expand
        }
    };
    const onValueChange = (playerInfo, key, value) => {
        const dataToSend = updatedData
        const updatedPlayerData = updatedData[playerInfo.commentaryPlayerId] || playerInfo
        updatedPlayerData[key] = value
        dataToSend[playerInfo.commentaryPlayerId] = updatedPlayerData
        handleValueChange(dataToSend)
    }
    const PLAYER_FIELD = title === "Player Batting" ? BATTING_PLAYER_FEATURE_FIELD(battingPlayers, bowlingPlayers) : BOWLING_PLAYER_FEATURE_FIELD;

    return <Accordion open={open} toggle={toggle}>
        <AccordionItem>
            <AccordionHeader targetId={`${title}-accordion`} className="accordion-header-custom">
                {title}
                {/* <div className="section-info">[Bat-R - Bat-B - 4s - 6s - Ball-O - Ball-B - Ball-R - Ball-M - Ball-W - isPlay - B-Order - Ball-Order - onStrike]</div> */}
            </AccordionHeader>
            <AccordionBody accordionId={`${title}-accordion`} className="accordion-body-custom">
                <Table className="p-0 mb-0" hover responsive>
                    <thead>
                        <tr>
                            <th></th>
                            {PLAYER_FIELD.map((field, idx) => (
                                <th key={idx}>{field.placeholder || field.name}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {playerList?.length === 0 && <tr><td colSpan={PLAYER_FIELD.length + 1} className="text-center">No Players data to show</td></tr>}
                        {playerList?.sort((a,b)=> b?.displayOrder - a?.displayOrder)?.map((playerInfo, index) => {
                            const currentValues = updatedData[playerInfo.commentaryPlayerId] || playerInfo;
                            return (
                            <tr key={`${playerInfo.commentaryPlayerId}-${index}`}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={!!selectedItems.players[playerInfo.commentaryPlayerId]}
                                        onChange={(e) => {
                                        const updated = { ...selectedItems };
                                        if (e.target.checked) {
                                            updated.players[playerInfo.commentaryPlayerId] = playerInfo;
                                        } else {
                                            delete updated.players[playerInfo.commentaryPlayerId];
                                        }
                                        setSelectedItems(updated);
                                        }}
                                    />
                                </td>
                                {PLAYER_FIELD.map((field, idx) => {
                                    const fieldValue = currentValues[field.name];
                                    let displayValue = fieldValue;

                                    if (field.type === SELECT) {
                                        const option = field.options?.find(opt => opt.value == fieldValue);
                                        displayValue = option ? option.label : "-";
                                    }

                                    if (field.type === SWITCH) {
                                        displayValue = fieldValue === true ? "True" : "False";
                                    }
                                    return (
                                    <td key={idx}>
                                        {selectedItems.players[playerInfo.commentaryPlayerId] ? (
                                            <SLFieldRenderer
                                                field={field}
                                                value={fieldValue ?? ""}
                                                onChange={(field, value) => onValueChange(playerInfo, field.name, value)}
                                            />
                                        ) : (
                                            displayValue || 0
                                        )}
                                    </td>
                                )})}
                            </tr>
                        )})}
                    </tbody>
                </Table>
                {/* <Row>
                    {playerList?.length === 0 && <div className="text-center">No Players data to show</div>}
                    {playerList?.sort((a,b)=> b?.displayOrder - a?.displayOrder)?.map((playerInfo, index) => {
                        return <Row key={`${playerInfo.commentaryPlayerId}-${index}`}>
                            <hr />
                            <Col xs={1} md={1} lg={1}>
                                <input
                                    type="checkbox"
                                    checked={!!selectedItems.players[playerInfo.commentaryPlayerId]}
                                    onChange={(e) => {
                                    const updated = { ...selectedItems };
                                    if (e.target.checked) {
                                        updated.players[playerInfo.commentaryPlayerId] = playerInfo;
                                    } else {
                                        delete updated.players[playerInfo.commentaryPlayerId];
                                    }
                                    setSelectedItems(updated);
                                    }}
                                />
                            </Col>
                            <Col xs={11} md={11} lg={11}>
                                <Row>
                                    <FieldRenderer
                                        // key={`${playerInfo.commentaryPlayerId}-${index}`}
                                        index={`${playerInfo.commentaryPlayerId}-${index}`}
                                        fields={PLAYER_FIELD}
                                        value={updatedData[playerInfo.commentaryPlayerId] || playerInfo}
                                        onChange={(field, value) => onValueChange(playerInfo, field.name, value)}
                                    />
                                </Row>
                            </Col >
                        </Row>
                    })}
                </Row> */}
            </AccordionBody>
        </AccordionItem>
    </Accordion>
}