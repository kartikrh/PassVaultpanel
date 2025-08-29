import { Accordion, AccordionBody, AccordionHeader, AccordionItem, Button, Card, CardBody, CardHeader, Col, Row, Table } from "reactstrap"
import { FieldRenderer } from "../../../components/Common/Reusables/FieldRenderer"
import { OVER_FEATURE_FIELD } from "../../../constants/FieldConst/CommentaryConst"
import { BallFeature } from "./BallsFeature"
import { useState } from "react"
import { SLFieldRenderer } from "../../../components/Common/Reusables/SLFieldRenderer"
import { SELECT, SWITCH } from "../../../components/Common/Const"

export const OverBallByBallFeature = ({ overList, ballList, handleValueChange, updatedData, deletedList, handleDeleteChange, ballByBallData, setBallByBallData, deleteBallByBall, setDeleteBallByBall, selectedItems, setSelectedItems, battingPlayers, bowlingPlayers, teamlist, overTypeList }) => {
    const [open, setOpen] = useState("");
    const [expandedOvers, setExpandedOvers] = useState([]);        
    const toggle = (id) => {
        if (open === id) {
            setOpen(""); // collapse
        } else {
            setOpen(id); // expand
        }
    };
    const onValueChange = (overInfo, key, value, label) => {
        const dataToSend = updatedData
        const updatedOverData = updatedData[overInfo.overId] || overInfo
        updatedOverData[key] = value
        if (key === "overType") {
            updatedOverData["overTypeName"] = label;
        }
        dataToSend[overInfo.overId] = updatedOverData
        handleValueChange(dataToSend)
    }
    const getBallsForOver = (overId) => {
        return (ballList || [])
            .filter(ball => ball.overId === overId)
            .sort((a, b) => b.overCount - a.overCount); // latest ball first
    };

    const OVER_FIELD = OVER_FEATURE_FIELD(bowlingPlayers, teamlist, overTypeList);

    return <Accordion open={open} toggle={toggle}>
        <AccordionItem>
            <AccordionHeader targetId="Over-accordion" className="accordion-header-custom">
                Overs with Ball-By-Ball
                {/* <div className="section-info">[B-Count - Runs - 4s - 6s - WDb - WDr - NBb - NBr - Br - LBr - Wk - Dots - T-Score - Completed]</div> */}
            </AccordionHeader>
            <AccordionBody accordionId="Over-accordion" className="accordion-body-custom">
                <Table className="p-0 mb-0" hover responsive>
                    <thead>
                        <tr>
                            <th></th>
                            <th>Over</th>
                            {OVER_FIELD.map((field, idx) => (
                                <th key={idx}>{field.placeholder || field.name}</th>
                            ))}
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {overList.length === 0 && <tr><td colSpan={OVER_FIELD.length + 3} className="text-center">No over data to show</td></tr>}
                        {overList?.map((overInfo, index) => {
                            if (deletedList.includes(overInfo.overId)) return null;
                            const balls = getBallsForOver(overInfo.overId);
                            const currentValues = updatedData[overInfo.overId] || overInfo;

                            const isExpanded = expandedOvers.includes(overInfo.overId);

                            const toggleExpand = () => {
                                if (isExpanded) {
                                    setExpandedOvers(expandedOvers.filter((id) => id !== overInfo.overId));
                                } else {
                                    setExpandedOvers([...expandedOvers, overInfo.overId]);
                                }
                            };
                            return (
                            <>
                                <tr key={`${overInfo.overId}-${index}`}  className="cursor-pointer" onClick={toggleExpand}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={!!selectedItems.overs[overInfo.overId]}
                                            onChange={(e) => {
                                            const updated = { ...selectedItems };
                                            if (e.target.checked) {
                                                updated.overs[overInfo.overId] = overInfo;
                                            } else {
                                                delete updated.overs[overInfo.overId];
                                            }
                                            setSelectedItems(updated);
                                            }}
                                        />
                                    </td>
                                    <td>
                                        <strong>{+overInfo.over + 1} over</strong>
                                    </td>
                                    {OVER_FIELD.map((field, idx) => {
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
                                            {selectedItems.overs[overInfo.overId] ? (
                                                <SLFieldRenderer
                                                    field={field}
                                                    value={fieldValue ?? ""}
                                                    onChange={(field, value, label) => onValueChange(overInfo, field.name, value, label)}
                                                />
                                            ) : (
                                                displayValue || 0
                                            )}
                                        </td>
                                    )})}
                                    <td>
                                        <Button color="danger" className={"delete-item-button"} onClick={() => handleDeleteChange(overInfo.overId)}>
                                            <i className="bi bi-trash"></i>
                                        </Button>
                                    </td>
                                </tr>
                                {isExpanded ? <tr>
                                    <td colSpan={OVER_FIELD.length + 3} className="px-2 py-0">
                                        <BallFeature
                                            ballList={balls.filter((item)=>item?.ballType !== 0) || []}
                                            updatedData={ballByBallData || {}}
                                            handleValueChange={updatedData => setBallByBallData({ ...updatedData })}
                                            deletedList={deleteBallByBall}
                                            handleDeleteChange={(ballId) => {
                                                setDeleteBallByBall([].concat(deleteBallByBall, [ballId]))
                                            }}
                                            selectedItems={selectedItems}
                                            setSelectedItems={setSelectedItems}
                                            battingPlayers={battingPlayers}
                                        />
                                    </td> 
                                </tr> : null}
                            </>
                        )})}
                    </tbody>
                </Table>
                {/* <Row>
                    {overList.length === 0 && <div className="text-center">No over data to show</div>}
                    {overList?.map((overInfo, index) => {
                        if (deletedList.includes(overInfo.overId)) return null;
                        const balls = getBallsForOver(overInfo.overId);
                        return (
                            <div key={`${overInfo.overId}-${index}`} >
                                <Row>
                                    <Col xs={1} md={1} lg={1}>
                                        <input
                                            type="checkbox"
                                            checked={!!selectedItems.overs[overInfo.overId]}
                                            onChange={(e) => {
                                            const updated = { ...selectedItems };
                                            if (e.target.checked) {
                                                updated.overs[overInfo.overId] = overInfo;
                                            } else {
                                                delete updated.overs[overInfo.overId];
                                            }
                                            setSelectedItems(updated);
                                            }}
                                        />
                                    </Col>
                                    <Col xs={1} md={1} lg={1}>
                                        <strong>{+overInfo.over + 1} over</strong>
                                    </Col>
                                    <Col xs={10} md={10} lg={10}>
                                        <Row>
                                            <FieldRenderer
                                                // key={`${overInfo.overId}-${index}`}
                                                index={`${overInfo.overId}-${index}`}
                                                fields={OVER_FIELD}
                                                value={updatedData[overInfo.overId] || overInfo}
                                                onChange={(field, value) => onValueChange(overInfo, field.name, value)}
                                            />
                                            <Col xs={1} md={1} lg={1}>
                                                <Button color="danger" className={"delete-item-button"} onClick={() => handleDeleteChange(overInfo.overId)}>
                                                    <i className="bi bi-trash"></i>
                                                </Button>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>

                                <div style={{ marginLeft: '2rem' }}>
                                    <BallFeature
                                        ballList={balls.filter((item)=>item?.ballType !== 0) || []}
                                        updatedData={ballByBallData || {}}
                                        handleValueChange={updatedData => setBallByBallData({ ...updatedData })}
                                        deletedList={deleteBallByBall}
                                        handleDeleteChange={(ballId) => {
                                            setDeleteBallByBall([].concat(deleteBallByBall, [ballId]))
                                        }}
                                        selectedItems={selectedItems}
                                        setSelectedItems={setSelectedItems}
                                    />
                                    {balls.filter((item)=>item?.ballType !== 0).map(ball => (
                                        <Row key={ball.commentaryBallByBallId} style={{ padding: '0.3rem 0' }}>
                                            <Col xs={2}>{(parseFloat(ball.overCount || 0)).toFixed(1)}</Col>
                                            <Col xs={10}>Runs: {ball.ballRun} | Wicket: {ball.ballIsWicket ? "Yes" : "No"}</Col>
                                        </Row>
                                    ))}
                                </div>
                            </div>
                        );
                        // const renderOver = <Row>
                        //     <hr />
                        //     <Col xs={1} md={1} lg={1}>
                        //         <div className="header-section">{`${+overInfo.over + 1} : `}</div>
                        //     </Col>
                        //     <Col xs={11} md={11} lg={11}>
                        //         <Row>
                        //             <FieldRenderer
                        //                 key={index}
                        //                 index={index}
                        //                 fields={OVER_FIELD}
                        //                 value={updatedData[overInfo.overId] || overInfo}
                        //                 onChange={(field, value) => onValueChange(overInfo, field.name, value)}
                        //             />
                        //             <Col xs={1} md={1} lg={1}>
                        //                 <Button color="danger" className={"delete-item-button"} onClick={() => handleDeleteChange(overInfo.overId)}>
                        //                     <i className="bi bi-trash"></i>
                        //                 </Button>
                        //             </Col>
                        //         </Row>
                        //     </Col>
                        // </Row>
                        // if (deletedList.includes(overInfo.overId)) return <></>
                        // else return renderOver
                    })}
                </Row> */}
            </AccordionBody>
        </AccordionItem>
    </Accordion>
}