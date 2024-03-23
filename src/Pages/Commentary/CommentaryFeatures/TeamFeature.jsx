import { Card, CardBody, CardHeader, Row } from "reactstrap"
import { FieldRenderer } from "../../../components/Common/Reusables/FieldRenderer"
import { TEAM_FEATURE_FIELDS } from "../../../constants/FieldConst/CommentaryConst"

export const TeamFeature = ({ teamlist, handleValueChange, updatedData }) => {
    const onValueChange = (teamInfo, key, value) => {
        const dataToSend = updatedData
        const updatedTeamData = updatedData[teamInfo.commentaryTeamId] || teamInfo
        updatedTeamData[key] = value
        dataToSend[teamInfo.commentaryTeamId] = updatedTeamData
        handleValueChange(dataToSend)
    }

    return <Card>
        <CardHeader className="feature-card-header">
            Teams
        </CardHeader>
        <CardBody>
            <Row>
                {teamlist.length === 0 && <div className="text-center">No team data to show</div>}
                {teamlist?.map((teamInfo, index) => {
                    return <>
                        <div className="section-header">{`Team :  ${teamInfo.teamName}`}</div>
                        <FieldRenderer
                            key={index}
                            index={index}
                            fields={TEAM_FEATURE_FIELDS}
                            value={updatedData[teamInfo.commentaryTeamId] || teamInfo}
                            onChange={(field, value) => onValueChange(teamInfo, field.name, value)}
                        />
                    </>
                })}
            </Row>
        </CardBody>
    </Card>
}