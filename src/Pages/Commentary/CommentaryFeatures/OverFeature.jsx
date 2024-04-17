import { Card, CardBody, CardHeader, Col, Row } from "reactstrap"
import { FieldRenderer } from "../../../components/Common/Reusables/FieldRenderer"
import { OVER_FEATURE_FIELD } from "../../../constants/FieldConst/CommentaryConst"

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
            <div className="section-info">[B-Count - Runs - 4s - 6s - WDb - WDr - NBb - NBr - Br - LBr - Wk - Dots - T-Score - Completed]</div>
        </CardHeader>
        <CardBody>
            <Row>
                {overList.length === 0 && <div className="text-center">No over data to show</div>}
                {overList?.map((overInfo, index) => {
                    return <Row>
                        <hr />
                        <Col xs={1} md={1} lg={1}>
                            <div className="header-section">{`${+overInfo.over + 1} : `}</div>
                        </Col>
                        <Col xs={11} md={11} lg={11}>
                            <Row>
                                <FieldRenderer
                                    key={index}
                                    index={index}
                                    fields={OVER_FEATURE_FIELD}
                                    value={updatedData[overInfo.overId] || overInfo}
                                    onChange={(field, value) => onValueChange(overInfo, field.name, value)}
                                />
                            </Row>
                        </Col>
                    </Row>
                })}
            </Row>
        </CardBody>
    </Card>
}