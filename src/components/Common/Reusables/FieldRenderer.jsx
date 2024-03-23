import { Col, Input, Row } from "reactstrap"
import { COUNTER, TEXT } from "../Const"

export const FieldRenderer = ({ fields, value, onChange, index }) => {

    return fields.map((field, index) => {
        return <>
            <Col
                key={index}
                xs={field.labelColspan?.xs || 3}
                md={field.labelColspan?.md || 2}
                lg={field.labelColspan?.lg || 2}
                className="d-flex p-0"
            >
                <div className="lablediv small-label-div ">
                    <label
                        htmlFor={field.name}
                        className="dynamic-label-right form-label-class small-labels"
                    >   {field.label}</label>
                </div>
            </Col>
            <Col
                className={`mb-4`}
                key={index}
                xs={field.fieldColspan?.xs || 9}
                md={field.fieldColspan?.md || 4}
                lg={field.fieldColspan?.lg || 4}
            >
                {field.type === TEXT && <Input
                    className="form-control"
                    style={field?.customStyle}
                    placeholder={field?.placeholder}
                    type="text"
                    id={field.name}
                    name={field.name}
                    value={value[field.name]}
                    onChange={(e) => onChange(field.name, e.target.value)}
                />}
                {field.type === COUNTER && <Input
                    className="form-control small-text-fields"
                    type="number"
                    step={1}
                    min={0}
                    id={field.name}
                    placeholder={field?.placeholder}
                    name={field.name}
                    value={value[field.name]}
                    onChange={(e) => onChange(field.name, +e.target.value)}
                />}
            </Col>
        </>
    })
}