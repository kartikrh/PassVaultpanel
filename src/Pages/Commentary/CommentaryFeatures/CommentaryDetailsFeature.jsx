import { Accordion, AccordionBody, AccordionHeader, AccordionItem, Card, CardBody, CardHeader, Col, Row, Table } from "reactstrap"
import { FieldRenderer } from "../../../components/Common/Reusables/FieldRenderer"
import { COMMENTARY_DETAILS_FIELDS } from "../../../constants/FieldConst/CommentaryConst"
import { useState } from "react";
import { isEmpty } from "lodash";
import { SLFieldRenderer } from "../../../components/Common/Reusables/SLFieldRenderer";
import { SELECT, SWITCH } from "../../../components/Common/Const";

export const CommentaryDetailsFeature = ({ commentaryDetailsInfo, handleValueChange, updatedData, selectedItems, setSelectedItems }) => {
    const [open, setOpen] = useState("");

    const toggle = (id) => {
        if (open === id) {
            setOpen(""); // collapse
        } else {
            setOpen(id); // expand
        }
    };
    // const onValueChange = (commentaryDetailsInfo, key, value) => {
    //     const dataToSend = updatedData
    //     const updatedTeamData = updatedData[commentaryDetailsInfo.commentaryId] || commentaryDetailsInfo
    //     dataToSend[commentaryDetailsInfo.commentaryId] = updatedTeamData
    //     handleValueChange(dataToSend)
    // }

    const onValueChange = (commentaryDetailsInfo, key, value) => {
        const updatedDetails = {
            ...commentaryDetailsInfo,
            ...updatedData,
            [key]: value,
        };
        handleValueChange(updatedDetails);
    };
    const currentValues = isEmpty(updatedData) ? commentaryDetailsInfo : updatedData;
    
    return <Accordion open={open} toggle={toggle}>
        <AccordionItem>
            <AccordionHeader targetId="details-accordion" className="accordion-header-custom">
                Commentary Details
            </AccordionHeader>
            <AccordionBody accordionId="details-accordion" className="accordion-body-custom">
                <Table className="p-0 mb-0" hover responsive>
                    <thead>
                        <tr>
                            <th></th>
                            {COMMENTARY_DETAILS_FIELDS.map((field, idx) => (
                                <th key={idx}>{field.placeholder || field.name}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={!!selectedItems.details[commentaryDetailsInfo.commentaryId]}
                                    onChange={(e) => {
                                    const updated = { ...selectedItems };
                                    if (e.target.checked) {
                                        updated.details[commentaryDetailsInfo.commentaryId] = commentaryDetailsInfo;
                                    } else {
                                        delete updated.details[commentaryDetailsInfo.commentaryId];
                                    }
                                    setSelectedItems(updated);
                                    }}
                                />
                            </td>
                            {COMMENTARY_DETAILS_FIELDS.map((field, idx) => {
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
                                    {selectedItems.details[commentaryDetailsInfo.commentaryId] ? (
                                        <SLFieldRenderer
                                            field={field}
                                            value={fieldValue ?? ""}
                                            onChange={(field, value) => onValueChange(commentaryDetailsInfo, field.name, value)}
                                        />
                                    ) : (
                                        displayValue || 0
                                    )}
                                </td>
                            )})}
                        </tr>
                    </tbody>
                </Table>
                {/* <Row>
                    <Col xs={1} md={1} lg={1}>
                        <input
                            type="checkbox"
                            checked={!!selectedItems.details[commentaryDetailsInfo.commentaryId]}
                            onChange={(e) => {
                            const updated = { ...selectedItems };
                            if (e.target.checked) {
                                updated.details[commentaryDetailsInfo.commentaryId] = commentaryDetailsInfo;
                            } else {
                                delete updated.details[commentaryDetailsInfo.commentaryId];
                            }
                            setSelectedItems(updated);
                            }}
                        />
                    </Col>
                    <Col xs={11} md={11} lg={11}>
                        <Row>
                            <FieldRenderer
                                // key={`${commentaryDetailsInfo.commentaryId}-${index}`}
                                index={`${commentaryDetailsInfo.commentaryId}`}
                                fields={COMMENTARY_DETAILS_FIELDS}
                                value={isEmpty(updatedData) ? commentaryDetailsInfo : updatedData}
                                onChange={(field, value) => onValueChange(commentaryDetailsInfo, field.name, value)}
                            />
                        </Row>
                    </Col>
                </Row> */}
            </AccordionBody>
        </AccordionItem>
    </Accordion>
}