import { Card, CardBody, CardHeader, Col, Row } from "reactstrap"
import { FieldRenderer } from "../../../components/Common/Reusables/FieldRenderer"
import { PARTNERSHIP_FEATURE_FIELD } from "../../../constants/FieldConst/CommentaryConst"

export const PartnershipFeature = ({ partnershipList, handleValueChange, updatedData }) => {
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
            <div className="section-info">[Runs - Ball - Extras]</div>
        </CardHeader>
        <CardBody>
            <Row>
                {partnershipList.length === 0 && <div className="text-center">No partnership data to show</div>}
                {partnershipList?.map((partnershipInfo, index) => {
                    return <Row>
                        <hr />
                        <Col xs={12} md={6} lg={6}>
                            <div className="header-section">{`${partnershipInfo.batter1Name} and ${partnershipInfo.batter2Name} : `}</div>
                        </Col>
                        <Col xs={12} md={6} lg={6}>
                            <Row>
                                <FieldRenderer
                                    key={index}
                                    index={index}
                                    fields={PARTNERSHIP_FEATURE_FIELD}
                                    value={updatedData[partnershipInfo.commentaryPartnershipId] || partnershipInfo}
                                    onChange={(field, value) => onValueChange(partnershipInfo, field.name, value)}
                                />
                            </Row>
                        </Col>
                    </Row>
                })}
            </Row>
        </CardBody>
    </Card>
}