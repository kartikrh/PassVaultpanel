import { Card, CardBody, CardHeader, Row } from "reactstrap"
import { FieldRenderer } from "../../../components/Common/Reusables/FieldRenderer"
import { TEAM_FEATURE_FIELDS } from "../../../constants/FieldConst/CommentaryConst"

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
        </CardHeader>
        <CardBody>
            <Row>
                {wicketList.length === 0 && <div className="text-center">No wicket data to show</div>}
                {wicketList?.map((wicketInfo, index) => {
                    return <>
                        <div className="section-header">{`Wicket :  ${wicketInfo.batterName}`}</div>
                        <FieldRenderer
                            key={index}
                            index={index}
                            fields={TEAM_FEATURE_FIELDS}
                            value={updatedData[wicketInfo.commentaryWicketId] || wicketInfo}
                            onChange={(field, value) => onValueChange(wicketInfo, field.name, value)}
                        />
                    </>
                })}
            </Row>
        </CardBody>
    </Card>
}