import { Card, CardBody, CardHeader, Col, Row } from "reactstrap"
import { FieldRenderer } from "../../../components/Common/Reusables/FieldRenderer"
import { WICKET_FEATURE_FIELD } from "../../../constants/FieldConst/CommentaryConst"

export const WicketFeature = ({ wicketList, handleValueChange, updatedData }) => {
    const onValueChange = (wicketInfo, key, value) => {
        const dataToSend = updatedData
        const updatedWicketData = updatedData[wicketInfo.commentaryWicketId] || wicketInfo
        updatedWicketData[key] = value
        dataToSend[wicketInfo.commentaryWicketId] = updatedWicketData
        handleValueChange(dataToSend)
    }

    return <Card>
        <CardHeader className="feature-card-header">
            Wickets
            <div className="section-info">[Wicket Type]</div>
        </CardHeader>
        <CardBody>
            <Row>
                {wicketList.length === 0 && <div className="text-center">No wicket data to show</div>}
                {wicketList?.map((wicketInfo, index) => {
                    return <Row>
                        <hr />
                        <Col xs={4} md={3} lg={3}>
                            <div className="header-section">{`${wicketInfo.batterName} : `}</div>
                        </Col>
                        <Col xs={8} md={9} lg={9}>
                            <Row>
                                <FieldRenderer
                                    key={index}
                                    index={index}
                                    fields={WICKET_FEATURE_FIELD}
                                    value={updatedData[wicketInfo.commentaryWicketId] || wicketInfo}
                                    onChange={(field, value) => onValueChange(wicketInfo, field.name, value)}
                                />
                            </Row>
                        </Col>
                    </Row>
                })}
            </Row>
        </CardBody>
    </Card>
}