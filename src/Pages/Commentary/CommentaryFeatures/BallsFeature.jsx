import { Button, Card, CardBody, CardHeader, Col, Row } from "reactstrap"
import { FieldRenderer } from "../../../components/Common/Reusables/FieldRenderer"
import { BALL_FEATURE_FIELDS } from "../../../constants/FieldConst/CommentaryConst"

export const BallFeature = ({ ballList, handleValueChange, updatedData, handleDeleteChange }) => {

    const onValueChange = (ballInfo, key, value) => {
        const dataToSend = updatedData
        const updatedBallData = updatedData[ballInfo.commentaryBallByBallId] || ballInfo
        updatedBallData[key] = value
        dataToSend[ballInfo.commentaryBallByBallId] = updatedBallData
        handleValueChange(dataToSend)
    }

    return <Card>
        <CardHeader className="feature-card-header">
            Balls
            <div className="section-info">[O-count - O-Ball - Run - Extra - 4 - 6]</div>
        </CardHeader>
        <CardBody>
            <Row>
                {ballList.length === 0 && <div className="text-center">No balls data to show</div>}
                {ballList?.map((ballInfo, index) => {

                    return <Row>
                        <hr />
                        <Col xs={1} md={1} lg={1}>
                            <div className="header-section">{`${+(ballInfo.overCount || 0)} : `}</div>
                        </Col>
                        <Col xs={11} md={11} lg={11}>
                            <Row>
                                <FieldRenderer
                                    key={index}
                                    index={index}
                                    fields={BALL_FEATURE_FIELDS}
                                    value={updatedData[ballInfo.commentaryBallByBallId] || ballInfo}
                                    onChange={(field, value) => onValueChange(ballInfo, field.name, value)}
                                />
                                {/* <Col xs={1} md={1} lg={1}>
                                    <Button onClick={handleDeleteChange(ballInfo.commentaryBallByBallId)}>
                                        <i class="bi-trash"></i>
                                    </Button>
                                </Col> */}
                            </Row>
                        </Col >
                    </Row>
                })}
            </Row>
        </CardBody>
    </Card>
}