import { Accordion, AccordionBody, AccordionHeader, AccordionItem, Button, Card, CardBody, CardHeader, Col, Row, Table } from "reactstrap"
import { FieldRenderer } from "../../../components/Common/Reusables/FieldRenderer"
import { WICKET_FEATURE_FIELD } from "../../../constants/FieldConst/CommentaryConst"
import { useState } from "react";
import { SLFieldRenderer } from "../../../components/Common/Reusables/SLFieldRenderer";
import { SELECT, SWITCH } from "../../../components/Common/Const";

export const WicketFeature = ({ wicketList, handleValueChange, updatedData, deletedList, handleDeleteChange, selectedItems, setSelectedItems, battingPlayers, bowlingPlayers, overList }) => {
    const [open, setOpen] = useState("");
        
    const toggle = (id) => {
        if (open === id) {
            setOpen(""); // collapse
        } else {
            setOpen(id); // expand
        }
    };
    const onValueChange = (wicketInfo, key, value) => {
        const dataToSend = updatedData
        const updatedWicketData = updatedData[wicketInfo.commentaryWicketId] || wicketInfo
        updatedWicketData[key] = value
        dataToSend[wicketInfo.commentaryWicketId] = updatedWicketData
        handleValueChange(dataToSend)
    }

    const WICKET_FIELD = WICKET_FEATURE_FIELD(battingPlayers, bowlingPlayers, overList);

    return <Accordion open={open} toggle={toggle}>
        <AccordionItem>
            <AccordionHeader targetId="wicket-accordion" className="accordion-header-custom">
                Wickets
                {/* <div className="section-info">[Wicket Type - Bowler ]</div> */}
            </AccordionHeader>
            <AccordionBody accordionId="wicket-accordion" className="accordion-body-custom">
                <Table className="p-0 mb-0" hover responsive>
                    <thead>
                        <tr>
                            <th></th>
                            {WICKET_FIELD.map((field, idx) => (
                                <th key={idx}>{field.placeholder || field.name}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {wicketList.length === 0 && <tr><td colSpan={WICKET_FIELD.length + 1} className="text-center">No wicket data to show</td></tr>}
                        {wicketList?.sort((a,b)=> b?.commentaryWicketId - a?.commentaryWicketId)?.map((wicketInfo, index) => {
                            const currentValues = updatedData[wicketInfo.commentaryWicketId] || wicketInfo;
                            return (
                            <tr key={`${wicketInfo.commentaryWicketId}-${index}`}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={!!selectedItems.wickets[wicketInfo.commentaryWicketId]}
                                        onChange={(e) => {
                                        const updated = { ...selectedItems };
                                        if (e.target.checked) {
                                            updated.wickets[wicketInfo.commentaryWicketId] = wicketInfo;
                                        } else {
                                            delete updated.wickets[wicketInfo.commentaryWicketId];
                                        }
                                        setSelectedItems(updated);
                                        }}
                                    />
                                </td>
                                {WICKET_FIELD.map((field, idx) => {
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
                                        {selectedItems.wickets[wicketInfo.commentaryWicketId] ? (
                                            <SLFieldRenderer
                                                field={field}
                                                value={fieldValue ?? ""}
                                                onChange={(field, value) => onValueChange(wicketInfo, field.name, value)}
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
                    {wicketList.length === 0 && <div className="text-center">No wicket data to show</div>}
                    {wicketList?.sort((a,b)=> b?.commentaryWicketId - a?.commentaryWicketId)?.map((wicketInfo, index) => {
                        const renderWicket = <Row key={`${wicketInfo.commentaryWicketId}-${index}`}>
                            <Col xs={1} md={1} lg={1}>
                                <input
                                    type="checkbox"
                                    checked={!!selectedItems.wickets[wicketInfo.commentaryWicketId]}
                                    onChange={(e) => {
                                    const updated = { ...selectedItems };
                                    if (e.target.checked) {
                                        updated.wickets[wicketInfo.commentaryWicketId] = wicketInfo;
                                    } else {
                                        delete updated.wickets[wicketInfo.commentaryWicketId];
                                    }
                                    setSelectedItems(updated);
                                    }}
                                />
                            </Col>
                            <Col xs={11} md={11} lg={11}>
                                <Row>
                                    <FieldRenderer
                                        // key={`${wicketInfo.commentaryWicketId}-${index}`}
                                        index={`${wicketInfo.commentaryWicketId}-${index}`}
                                        fields={WICKET_FIELD}
                                        value={updatedData[wicketInfo.commentaryWicketId] || wicketInfo}
                                        onChange={(field, value) => onValueChange(wicketInfo, field.name, value)}
                                    />
                                    <Col xs={1} md={1} lg={2}>
                                        <Button color="danger" className={"delete-item-button"} onClick={() => handleDeleteChange(wicketInfo.commentaryWicketId)}>
                                            <i className="bi bi-trash"></i>
                                        </Button>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        if (deletedList.includes(wicketInfo.commentaryWicketId)) return <></>
                        else return renderWicket
                    })}
                </Row> */}
            </AccordionBody>
        </AccordionItem>
    </Accordion>
}