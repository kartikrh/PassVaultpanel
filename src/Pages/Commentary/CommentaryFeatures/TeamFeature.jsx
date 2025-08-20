import { Accordion, AccordionBody, AccordionHeader, AccordionItem, Card, CardBody, CardHeader, Col, Row, Table } from "reactstrap"
import { FieldRenderer } from "../../../components/Common/Reusables/FieldRenderer"
import { TEAM_FEATURE_FIELDS } from "../../../constants/FieldConst/CommentaryConst"
import { useState } from "react";
import { SLFieldRenderer } from "../../../components/Common/Reusables/SLFieldRenderer";
import { SELECT, SWITCH } from "../../../components/Common/Const";

export const TeamFeature = ({ teamlist, handleValueChange, updatedData, selectedItems, setSelectedItems }) => {
    const [open, setOpen] = useState("");

    const toggle = (id) => {
        if (open === id) {
            setOpen(""); // collapse
        } else {
            setOpen(id); // expand
        }
    };
    const onValueChange = (teamInfo, key, value) => {
        const dataToSend = updatedData
        const updatedTeamData = updatedData[teamInfo.commentaryTeamId] || teamInfo
        updatedTeamData[key] = value
        dataToSend[teamInfo.commentaryTeamId] = updatedTeamData
        handleValueChange(dataToSend)
    }

    return <Accordion open={open} toggle={toggle}>
        <AccordionItem>
            <AccordionHeader targetId="teams-accordion" className="accordion-header-custom">
                Teams
            </AccordionHeader>
            <AccordionBody accordionId="teams-accordion" className="accordion-body-custom">
                <Table className="p-0 mb-0" hover responsive>
                    <thead>
                        <tr>
                            <th></th>
                            <th>Team</th>
                            {TEAM_FEATURE_FIELDS.map((field, idx) => (
                                <th key={idx}>{field.placeholder || field.name}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {teamlist.length === 0 && <tr><td colSpan={TEAM_FEATURE_FIELDS.length + 2} className="text-center">No team data to show</td></tr>}
                        {teamlist?.map((teamInfo, index) => {
                            const currentValues = updatedData[teamInfo.commentaryTeamId] || teamInfo;
                            return (
                            <tr key={`${teamInfo.commentaryTeamId}-${index}`}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={!!selectedItems.teams[teamInfo.commentaryTeamId]}
                                        onChange={(e) => {
                                        const updated = { ...selectedItems };
                                        if (e.target.checked) {
                                            updated.teams[teamInfo.commentaryTeamId] = teamInfo;
                                        } else {
                                            delete updated.teams[teamInfo.commentaryTeamId];
                                        }
                                        setSelectedItems(updated);
                                        }}
                                    />
                                </td>
                                <td>
                                    <strong>{`${teamInfo.teamName} [${teamInfo?.currentInnings} Innings] : `}</strong>
                                </td>
                                {TEAM_FEATURE_FIELDS.map((field, idx) => {
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
                                        {selectedItems.teams[teamInfo.commentaryTeamId] ? (
                                            <SLFieldRenderer
                                                field={field}
                                                value={fieldValue ?? ""}
                                                onChange={(field, value) => onValueChange(teamInfo, field.name, value)}
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
                    {teamlist.length === 0 && <div className="text-center">No team data to show</div>}
                    {teamlist?.map((teamInfo, index) => {
                        return <Row key={`${teamInfo.commentaryTeamId}-${index}`}>
                            <hr />
                            <Col xs={1} md={1} lg={1}>
                                <input
                                    type="checkbox"
                                    checked={!!selectedItems.teams[teamInfo.commentaryTeamId]}
                                    onChange={(e) => {
                                    const updated = { ...selectedItems };
                                    if (e.target.checked) {
                                        updated.teams[teamInfo.commentaryTeamId] = teamInfo;
                                    } else {
                                        delete updated.teams[teamInfo.commentaryTeamId];
                                    }
                                    setSelectedItems(updated);
                                    }}
                                />
                            </Col>
                            <Col xs={5} md={3} lg={2}>
                                <div className="header-section">{`${teamInfo.teamName} [${teamInfo?.currentInnings} Innings] : `}</div>
                            </Col>
                            <Col xs={6} md={8} lg={9}>
                                <Row>
                                    <FieldRenderer
                                        // key={`${teamInfo.commentaryTeamId}-${index}`}
                                        index={`${teamInfo.commentaryTeamId}-${index}`}
                                        fields={TEAM_FEATURE_FIELDS}
                                        value={updatedData[teamInfo.commentaryTeamId] || teamInfo}
                                        onChange={(field, value) => onValueChange(teamInfo, field.name, value)}
                                    />
                                </Row>
                            </Col>
                        </Row>
                    })}
                </Row> */}
            </AccordionBody>
        </AccordionItem>
    </Accordion>
}