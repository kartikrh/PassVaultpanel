import { Button, Card, CardBody, CardHeader, Col, Row } from "reactstrap"
import { FieldRenderer } from "../../../components/Common/Reusables/FieldRenderer"
import { PARTNERSHIP_FEATURE_FIELD } from "../../../constants/FieldConst/CommentaryConst"

export const PartnershipFeature = ({ partnershipList, handleValueChange, updatedData, deletedList, handleDeleteChange }) => {
    const onValueChange = (partnershipInfo, key, value) => {
        const dataToSend = updatedData
        const updatedPartnershipData = updatedData[partnershipInfo.commentaryPartnershipId] || partnershipInfo
        updatedPartnershipData[key] = value
        dataToSend[partnershipInfo.commentaryPartnershipId] = updatedPartnershipData
        handleValueChange(dataToSend)
    }

    return <Card>
        <CardHeader className="feature-card-header">
            Partnerships
            <div className="section-info">[Runs - Ball - 4s - 6s - Wide - No-Ball - Extras]</div>
        </CardHeader>
        <CardBody>
            <Row>
                {partnershipList.length === 0 && <div className="text-center">No partnership data to show</div>}
                {partnershipList?.map((partnershipInfo, index) => {

                    const renderPartnership = <Row>
                        <hr />
                        <Col xs={12} md={4} lg={4}>
                            <div className="header-section">{`${partnershipInfo.batter1Name} and ${partnershipInfo.batter2Name} : `}</div>
                        </Col>
                        <Col xs={12} md={8} lg={8}>
                            <Row>
                                <FieldRenderer
                                    key={index}
                                    index={index}
                                    fields={PARTNERSHIP_FEATURE_FIELD}
                                    value={updatedData[partnershipInfo.commentaryPartnershipId] || partnershipInfo}
                                    onChange={(field, value) => onValueChange(partnershipInfo, field.name, value)}
                                />
                                <Col xs={1} md={1} lg={2}>
                                    <Button color="danger" className={"delete-item-button"} onClick={() => handleDeleteChange(partnershipInfo.commentaryPartnershipId)}>
                                        <i class="bi bi-trash"></i>
                                    </Button>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    if (deletedList.includes(partnershipInfo.commentaryPartnershipId)) return <></>
                    else return renderPartnership
                })}
            </Row>
        </CardBody>
    </Card>
}