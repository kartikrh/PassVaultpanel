import { Accordion, AccordionBody, AccordionHeader, AccordionItem, Button, Card, CardBody, CardHeader, Col, Row, Table } from "reactstrap"
import { FieldRenderer } from "../../../components/Common/Reusables/FieldRenderer"
import { PARTNERSHIP_FEATURE_FIELD } from "../../../constants/FieldConst/CommentaryConst"
import { useState } from "react";
import { SLFieldRenderer } from "../../../components/Common/Reusables/SLFieldRenderer";
import { SELECT, SWITCH } from "../../../components/Common/Const";

export const PartnershipFeature = ({ partnershipList, handleValueChange, updatedData, deletedList, handleDeleteChange, selectedItems, setSelectedItems, playerList }) => {
    const [open, setOpen] = useState("");
        
    const toggle = (id) => {
        if (open === id) {
            setOpen(""); // collapse
        } else {
            setOpen(id); // expand
        }
    };
    const onValueChange = (partnershipInfo, key, value) => {
        const dataToSend = updatedData
        const updatedPartnershipData = updatedData[partnershipInfo.commentaryPartnershipId] || partnershipInfo
        updatedPartnershipData[key] = value
        dataToSend[partnershipInfo.commentaryPartnershipId] = updatedPartnershipData
        handleValueChange(dataToSend)
    }

    return <Accordion open={open} toggle={toggle}>
        <AccordionItem>
            <AccordionHeader targetId="partnership-accordion" className="accordion-header-custom">
                Partnerships
                {/* <div className="section-info">[Runs - Ball - 4s - 6s - Wide - No-Ball - Extras]</div> */}
            </AccordionHeader>
            <AccordionBody accordionId="partnership-accordion" className="accordion-body-custom">
                <Table className="p-0 mb-0" hover responsive>
                    <thead>
                        <tr>
                            <th></th>
                            {PARTNERSHIP_FEATURE_FIELD(playerList).map((field, idx) => (
                                <th key={idx}>{field.placeholder || field.name}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {partnershipList.length === 0 && <tr><td colSpan={PARTNERSHIP_FEATURE_FIELD(playerList).length + 1} className="text-center">No partnership data to show</td></tr>}
                        {partnershipList?.sort((a,b)=>b?.order - a?.order)?.map((partnershipInfo, index) => {
                            const currentValues = updatedData[partnershipInfo.commentaryPartnershipId] || partnershipInfo;
                            return (
                            <tr key={`${partnershipInfo.commentaryPartnershipId}-${index}`}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={!!selectedItems.partnerships[partnershipInfo.commentaryPartnershipId]}
                                        onChange={(e) => {
                                        const updated = { ...selectedItems };
                                        if (e.target.checked) {
                                            updated.partnerships[partnershipInfo.commentaryPartnershipId] = partnershipInfo;
                                        } else {
                                            delete updated.partnerships[partnershipInfo.commentaryPartnershipId];
                                        }
                                        setSelectedItems(updated);
                                        }}
                                    />
                                </td>
                                {PARTNERSHIP_FEATURE_FIELD(playerList).map((field, idx) => {
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
                                        {selectedItems.partnerships[partnershipInfo.commentaryPartnershipId] ? (
                                            <SLFieldRenderer
                                                field={field}
                                                value={fieldValue ?? ""}
                                                onChange={(field, value) => onValueChange(partnershipInfo, field.name, value)}
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
                    {partnershipList.length === 0 && <div className="text-center">No partnership data to show</div>}
                    {partnershipList?.sort((a,b)=>b?.order - a?.order)?.map((partnershipInfo, index) => {
                        const renderPartnership = <Row key={`${partnershipInfo.commentaryPartnershipId}-${index}`}>
                            <Col xs={1} md={1} lg={1}>
                                <input
                                    type="checkbox"
                                    checked={!!selectedItems.partnerships[partnershipInfo.commentaryPartnershipId]}
                                    onChange={(e) => {
                                    const updated = { ...selectedItems };
                                    if (e.target.checked) {
                                        updated.partnerships[partnershipInfo.commentaryPartnershipId] = partnershipInfo;
                                    } else {
                                        delete updated.partnerships[partnershipInfo.commentaryPartnershipId];
                                    }
                                    setSelectedItems(updated);
                                    }}
                                />
                            </Col>
                            <Col xs={11} md={11} lg={11}>
                                <Row>
                                    <FieldRenderer
                                        // key={`${partnershipInfo.commentaryPartnershipId}-${index}`}
                                        index={`${partnershipInfo.commentaryPartnershipId}-${index}`}
                                        fields={PARTNERSHIP_FEATURE_FIELD(playerList)}
                                        value={updatedData[partnershipInfo.commentaryPartnershipId] || partnershipInfo}
                                        onChange={(field, value) => onValueChange(partnershipInfo, field.name, value)}
                                    />
                                    <Col xs={4} md={1} lg={2}>
                                        <Button color="danger" className={"delete-item-button"} onClick={() => handleDeleteChange(partnershipInfo.commentaryPartnershipId)}>
                                            <i className="bi bi-trash"></i>
                                        </Button>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        if (deletedList.includes(partnershipInfo.commentaryPartnershipId)) return <></>
                        else return renderPartnership
                    })}
                </Row> */}
            </AccordionBody>
        </AccordionItem>
    </Accordion>
}