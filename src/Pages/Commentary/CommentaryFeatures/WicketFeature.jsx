import { Button, Card, CardBody, CardHeader, Col, Row } from "reactstrap"
import { FieldRenderer } from "../../../components/Common/Reusables/FieldRenderer"
import { WICKET_FEATURE_FIELD } from "../../../constants/FieldConst/CommentaryConst"

export const WicketFeature = ({ wicketList, handleValueChange, updatedData, deletedList, handleDeleteChange }) => {
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
                    const renderWicket = <Row>
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
                                <Col xs={1} md={1} lg={2}>
                                    <Button color="danger" className={"delete-item-button"} onClick={() => handleDeleteChange(wicketInfo.commentaryWicketId)}>
                                        <i class="bi bi-trash"></i>
                                    </Button>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    if (deletedList.includes(wicketInfo.commentaryWicketId)) return <></>
                    else return renderWicket
                })}
            </Row>
        </CardBody>
    </Card>
}