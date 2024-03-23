import { Card, CardBody, CardHeader, Row } from "reactstrap"
import { FieldRenderer } from "../../../components/Common/Reusables/FieldRenderer"
import { TEAM_FEATURE_FIELDS } from "../../../constants/FieldConst/CommentaryConst"

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
        </CardHeader>
        <CardBody>
            <Row>
                {partnershipList.length === 0 && <div className="text-center">No partnership data to show</div>}
                {partnershipList?.map((partnershipInfo, index) => {
                    return <>
                        <div className="section-header">{`Partnership :  ${partnershipInfo.batter1Name} and ${partnershipInfo.batter2Name}`}</div>
                        <FieldRenderer
                            key={index}
                            index={index}
                            fields={TEAM_FEATURE_FIELDS}
                            value={updatedData[partnershipInfo.commentaryPartnershipId] || partnershipInfo}
                            onChange={(key, value) => onValueChange(partnershipInfo, key, value)}
                        />
                    </>
                })}
            </Row>
        </CardBody>
    </Card>
}