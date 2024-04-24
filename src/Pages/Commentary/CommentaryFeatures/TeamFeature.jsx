import { Card, CardBody, CardHeader, Col, Row } from "reactstrap"
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
            <div className="section-info">[Score - Wicket - Over - WD - B - LB - NB - Trial - Lead - Status]</div>
        </CardHeader>
        <CardBody>
            <Row>
                {teamlist.length === 0 && <div className="text-center">No team data to show</div>}
                {teamlist?.map((teamInfo, index) => {
                    return <Row>
                        <hr />
                        <Col xs={6} md={4} lg={3}>
                            <div className="header-section">{`${teamInfo.teamName} : `}</div>
                        </Col>
                        <Col xs={12} md={8} lg={9}>
                            <Row>
                                <FieldRenderer
                                    key={index}
                                    index={index}
                                    fields={TEAM_FEATURE_FIELDS}
                                    value={updatedData[teamInfo.commentaryTeamId] || teamInfo}
                                    onChange={(field, value) => onValueChange(teamInfo, field.name, value)}
                                />
                            </Row>
                        </Col>
                    </Row>
                })}
            </Row>
        </CardBody>
    </Card>
}