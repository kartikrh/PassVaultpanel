import { Card, CardBody, CardHeader, Col, Row } from "reactstrap"
import { FieldRenderer } from "../../../components/Common/Reusables/FieldRenderer"
import { PLAYER_FEATURE_FIELD } from "../../../constants/FieldConst/CommentaryConst"

export const PlayerFeature = ({ playerList, handleValueChange, updatedData }) => {
    const onValueChange = (playerInfo, key, value) => {
        const dataToSend = updatedData
        const updatedPlayerData = updatedData[playerInfo.commentaryPlayerId] || playerInfo
        updatedPlayerData[key] = value
        dataToSend[playerInfo.commentaryPlayerId] = updatedPlayerData
        handleValueChange(dataToSend)
    }

    return <Card>
        <CardHeader className="feature-card-header">
            Players
            <div className="section-info">[Bat-R - Bat-B - 4s - 6s - Ball-O - Ball-B - Ball-R - Ball-M - Ball-W - isPlay - onStrike]</div>
        </CardHeader>
        <CardBody>
            <Row>
                {playerList?.length === 0 && <div className="text-center">No Players data to show</div>}
                {playerList?.map((playerInfo, index) => {
                    return <Row>
                        <hr />
                        <Col xs={11} md={11} lg={11}>
                            <Row>
                                <FieldRenderer
                                    key={index}
                                    index={index}
                                    fields={PLAYER_FEATURE_FIELD}
                                    value={updatedData[playerInfo.commentaryPlayerId] || playerInfo}
                                    onChange={(field, value) => onValueChange(playerInfo, field.name, value)}
                                />
                            </Row>
                        </Col >
                    </Row>
                })}
            </Row>
        </CardBody>
    </Card>
}