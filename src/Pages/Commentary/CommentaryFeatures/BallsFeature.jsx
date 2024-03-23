import { Card, CardBody, CardHeader, Row } from "reactstrap"
import { FieldRenderer } from "../../../components/Common/Reusables/FieldRenderer"
import { BALL_FEATURE_FIELDS } from "../../../constants/FieldConst/CommentaryConst"

export const BallFeature = ({ ballList, handleValueChange, updatedData }) => {

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
        </CardHeader>
        <CardBody>
            <Row>
                {ballList.length === 0 && <div className="text-center">No balls data to show</div>}
                {ballList?.map((ballInfo, index) => {
                    return <>
                        <div className="section-header">{`Ball :  ${+(ballInfo.overCount || 0)}`}</div>
                        <FieldRenderer
                            key={index}
                            index={index}
                            fields={BALL_FEATURE_FIELDS}
                            value={updatedData[ballInfo.commentaryBallByBallId] || ballInfo}
                            onChange={(key, value) => onValueChange(ballInfo, key, value)}
                        />
                    </>
                })}
            </Row>
        </CardBody>
    </Card>
}