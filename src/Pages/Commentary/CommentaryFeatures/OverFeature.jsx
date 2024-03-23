import { Card, CardBody, CardHeader, Row } from "reactstrap"
import { FieldRenderer } from "../../../components/Common/Reusables/FieldRenderer"
import { TEAM_FEATURE_FIELDS } from "../../../constants/FieldConst/CommentaryConst"

export const OverFeature = ({ overList, handleValueChange, updatedData }) => {
    const onValueChange = (overInfo, key, value) => {
        const dataToSend = updatedData
        const updatedOverData = updatedData[overInfo.overId] || overInfo
        updatedOverData[key] = value
        dataToSend[overInfo.overId] = updatedOverData
        handleValueChange(dataToSend)
    }

    return <Card>
        <CardHeader className="feature-card-header">
            Overs
        </CardHeader>
        <CardBody>
            <Row>
                {overList.length === 0 && <div className="text-center">No over data to show</div>}
                {overList?.map((overInfo, index) => {
                    return <>
                        <div className="section-header">{`Over :  ${overInfo.over}`}</div>
                        <FieldRenderer
                            key={index}
                            index={index}
                            fields={TEAM_FEATURE_FIELDS}
                            value={updatedData[overInfo.overId] || overInfo}
                            onChange={(key, value) => onValueChange(overInfo, key, value)}
                        />
                    </>
                })}
            </Row>
        </CardBody>
    </Card>
}