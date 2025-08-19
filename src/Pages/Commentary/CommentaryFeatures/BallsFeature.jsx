import { Button, Card, CardBody, CardHeader, Col, Row, Table } from "reactstrap"
import { FieldRenderer } from "../../../components/Common/Reusables/FieldRenderer"
import { BALL_FEATURE_FIELDS } from "../../../constants/FieldConst/CommentaryConst"
import { SLFieldRenderer } from "../../../components/Common/Reusables/SLFieldRenderer"
import { SELECT, SWITCH } from "../../../components/Common/Const"

export const BallFeature = ({ ballList, handleValueChange, updatedData, deletedList, handleDeleteChange, selectedItems, setSelectedItems }) => {

    const onValueChange = (ballInfo, key, value) => {
        const dataToSend = updatedData
        const updatedBallData = updatedData[ballInfo.commentaryBallByBallId] || ballInfo
        updatedBallData[key] = value
        dataToSend[ballInfo.commentaryBallByBallId] = updatedBallData
        handleValueChange(dataToSend)
    }

    return <>
            <Table className="p-0 mb-0" hover responsive>
                <thead>
                    <tr>
                        <th></th>
                        <th>Over Count</th>
                        {BALL_FEATURE_FIELDS.map((field, idx) => (
                            <th key={idx}>{field.placeholder || field.name}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {ballList.length === 0 && <tr><td colSpan={BALL_FEATURE_FIELDS.length + 2} className="text-center">No balls data to show</td></tr>}
                    {ballList?.map((ballInfo, index) => {
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
                            {BALL_FEATURE_FIELDS.map((field, idx) => {
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
                                    fields={BALL_FEATURE_FIELDS}
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