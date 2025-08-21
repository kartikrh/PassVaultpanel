import { useState } from "react";
import { Button, Card, CardBody, CardHeader, Col, Row, Table } from "reactstrap"
import { FieldRenderer } from "../../../components/Common/Reusables/FieldRenderer"
import { BALL_FEATURE_FIELDS } from "../../../constants/FieldConst/CommentaryConst"
import { SLFieldRenderer } from "../../../components/Common/Reusables/SLFieldRenderer"
import { SELECT, SWITCH } from "../../../components/Common/Const"
import { isEmpty } from "lodash";

export const BallFeature = ({ ballList, handleValueChange, updatedData, deletedList, handleDeleteChange, selectedItems, setSelectedItems, battingPlayers }) => {
    const [newBall, setNewBall] = useState(null);
    const onValueChange = (ballInfo, key, value) => {
        const dataToSend = updatedData
        const updatedBallData = updatedData[ballInfo.commentaryBallByBallId] || ballInfo
        updatedBallData[key] = value
        dataToSend[ballInfo.commentaryBallByBallId] = updatedBallData
        if (key === "ballType") {
            setNewBall(updatedBallData);
        }
        handleValueChange(dataToSend)
    }

    const handleAddRow = () => {
        const newBallData = {
            commentaryBallByBallId: 0,
            commentaryId: newBall?.commentaryId,
            teamId: newBall?.teamId,
            overId: newBall?.overId,
            commentaryPartnershipId: newBall?.commentaryPartnershipId,
            currentInnings: newBall?.currentInnings,
            overCount: newBall?.overCount,
            currentOverBalls: 0,
            bowlerId: 0,
            batStrikeId: 0,
            batNonStrikeId: 0,
            ballType: 0,
            teamScore: "",
            ballRun: 0,
            ballFour: 0,
            ballSix: 0,
            ballExtraRun: 0,
            ballWicketType: 1,
            ballPlayerId: 0,
            ballBowlerId: 0,
            ballFielderId1: 0,
            ballFielderId2: 0,
            teamWicket: 0,
            ballIsWicket: false,
            ballIsBoundry: false,
            overIsMaiden: false,
            nextBatStrikeId: 0,
            nextBatNonStrikeId: 0,
            ballIsDot: false,
            ballIsCount: false,
            isDelete: false,
            autoStrikeBallCount: 0
        };

        const dataToSend = {
            ...updatedData,
            0: newBallData,
        };

        handleValueChange(dataToSend);
        setNewBall(null);
    };

    const BALL_FIELDS = BALL_FEATURE_FIELDS(battingPlayers);

    return <>
            <Table className="p-0 mb-0 table-dark" hover responsive>
                <thead>
                    <tr>
                        <th>
                            {!isEmpty(newBall) ? (
                                <Button color="success" size="sm" onClick={handleAddRow}>
                                    +
                                </Button>
                            ) : null}
                        </th>
                        <th>Over Count</th>
                        {BALL_FIELDS.map((field, idx) => (
                            <th key={idx}>{field.placeholder || field.name}</th>
                        ))}
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {ballList.length === 0 && <tr><td colSpan={BALL_FIELDS.length + 3} className="text-center">No balls data to show</td></tr>}
                    {[...ballList, ...(updatedData[0] ? [updatedData[0]] : [])]?.map((ballInfo, index) => {
                        const currentValues = updatedData[ballInfo.commentaryBallByBallId] || ballInfo;
                        return (
                        <tr key={`${ballInfo.commentaryBallByBallId}-${index}`}>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={!!selectedItems.balls[ballInfo.commentaryBallByBallId]}
                                    onChange={(e) => {
                                    const updated = { ...selectedItems };
                                    if (e.target.checked) {
                                        updated.balls[ballInfo.commentaryBallByBallId] = ballInfo;
                                    } else {
                                        delete updated.balls[ballInfo.commentaryBallByBallId];
                                    }
                                    setSelectedItems(updated);
                                    }}
                                />
                            </td>
                            <td>
                                <strong>{`${+(ballInfo?.overCount || 0)}`}</strong>
                            </td>
                            {BALL_FIELDS.map((field, idx) => {
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
                                    {selectedItems.balls[ballInfo.commentaryBallByBallId] ? (
                                        <SLFieldRenderer
                                            field={field}
                                            value={fieldValue ?? ""}
                                            onChange={(field, value) => onValueChange(ballInfo, field.name, value)}
                                        />
                                    ) : (
                                        displayValue || 0
                                    )}
                                </td>
                            )})}
                            <td>
                                <Button color="danger" className={"delete-item-button"} onClick={() => handleDeleteChange(ballInfo.commentaryBallByBallId)}>
                                    <i className="bi bi-trash"></i>
                                </Button>
                            </td>
                        </tr>
                    )})}
                </tbody>
            </Table>
            {/* <Row className="p-0">
                {ballList.length === 0 && <div className="text-center">No balls data to show</div>}
                {ballList?.map((ballInfo, index) => {
                    const renderBalls = <Row key={`${ballInfo.commentaryBallByBallId}-${index}`}>
                        <Col xs={1} md={1} lg={1}>
                            <input
                                type="checkbox"
                                checked={!!selectedItems.balls[ballInfo.commentaryBallByBallId]}
                                onChange={(e) => {
                                const updated = { ...selectedItems };
                                if (e.target.checked) {
                                    updated.balls[ballInfo.commentaryBallByBallId] = ballInfo;
                                } else {
                                    delete updated.balls[ballInfo.commentaryBallByBallId];
                                }
                                setSelectedItems(updated);
                                }}
                            />
                        </Col>
                        <Col xs={1} md={1} lg={1}>
                            <div className="header-section">{`${+(ballInfo?.overCount || 0)}`}</div>
                        </Col>
                        <Col xs={10} md={10} lg={10}>
                            <Row className="p-0">
                                <FieldRenderer
                                    // key={`${ballInfo.commentaryBallByBallId}-${index}`}
                                    index={`${ballInfo.commentaryBallByBallId}-${index}`}
                                    fields={BALL_FIELDS}
                                    value={updatedData[ballInfo.commentaryBallByBallId] || ballInfo}
                                    onChange={(field, value) => onValueChange(ballInfo, field.name, value)}
                                />
                                <Col xs={1} md={1} lg={1}>
                                    <Button color="danger" className={"delete-item-button"} onClick={() => handleDeleteChange(ballInfo.commentaryBallByBallId)}>
                                        <i className="bi bi-trash"></i>
                                    </Button>
                                </Col>
                            </Row>
                        </Col >
                    </Row>
                    if (deletedList.includes(ballInfo.commentaryBallByBallId)) return <></>
                    else return renderBalls
                })}
            </Row> */}
    </>
}