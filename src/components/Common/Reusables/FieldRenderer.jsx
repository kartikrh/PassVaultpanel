import { Col, Input } from "reactstrap"
import { COUNTER, SELECT, TEXT, SWITCH } from "../Const"
import Select from "react-select";
import "./CustomCss.css"

export const FieldRenderer = ({ fields, value, onChange, index }) => {
    return fields.map((field, index) => {
        return <>
            <Col
                key={index}
                xs={field.labelColspan?.xs || 3}
                md={field.labelColspan?.md || 2}
                lg={field.labelColspan?.lg || 2}
                className={`d-flex p-0 ${field.label ? "" : "d-none"}`}
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
                    className="form-control  small-text-fields"
                    style={field?.customStyle}
                    placeholder={field?.placeholder}
                    type="text"
                    disabled={field.isDisable}
                    id={field.name}
                    name={field.name}
                    value={value[field.name] || field.defaultValue}
                    onChange={(e) => onChange(field, e.target.value)}
                />}
                {field.type === COUNTER && <Input
                    className={`form-control ${field.className} small-text-fields`}
                    type="number"
                    step={1}
                    min={0}
                    id={field.name}
                    placeholder={field?.placeholder}
                    name={field.name}
                    value={value[field.name] || field.defaultValue}
                    onChange={(e) => onChange(field, +e.target.value)}
                />}
                {field.type === SELECT && (
                    <Select
                        classNamePrefix="select2-selection small-text-fields"
                        style={field?.customStyle}
                        id={field.name}
                        name={field.name}
                        value={field.options.filter((option) => value[field.name] === option.value)}
                        options={field.options}
                        onChange={(selectedOption) => onChange(field, selectedOption?.value)}
                        closeMenuOnSelect={!field.isMulti}
                        required={field.isRequired}
                        isMulti={field.isMulti}
                    />
                )}
                {field.type === SWITCH && (
                    <div className="form-check form-switch form-switch-lg mb-3">
                        <input
                            className="form-check-input"
                            style={field?.customStyle}
                            type="checkbox"
                            id="customSwitchsizelg"
                            checked={value[field.name]}
                            onChange={(e) => {
                                onChange(field, value[field.name] ? null : true);
                            }}
                            value={value[field.name]}
                        />
                    </div>
                )}
            </Col>
        </>
    })
}