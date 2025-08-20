// SLFieldRenderer.jsx
import React from "react";
import { Input } from "reactstrap";
import { COUNTER, SELECT, TEXT, SWITCH, DATE_TIME_PICKER } from "../Const";
import Select from "react-select";
import "./CustomCss.css";

export const SLFieldRenderer = ({ field, value, onChange }) => {
    return (
        <React.Fragment key={field.name}>
            {field.type === TEXT && (
                <Input
                    className="form-control small-text-fields"
                    style={field?.customStyle}
                    placeholder={field?.placeholder}
                    type="text"
                    disabled={field.isDisable}
                    id={field.name}
                    name={field.name}
                    value={value ?? field.defaultValue ?? ""}
                    onChange={(e) => onChange(field, e.target.value)}
                />
            )}
            {field.type === COUNTER && (
                <Input
                    className={`form-control ${field.className} small-text-fields`}
                    type="number"
                    step={1}
                    min={0}
                    id={field.name}
                    placeholder={field?.placeholder}
                    name={field.name}
                    value={value ?? field.defaultValue ?? 0}
                    onChange={(e) => onChange(field, +e.target.value)}
                />
            )}
            {field.type === SELECT && (
              <div className="s-update-select">
                <Select
                    classNamePrefix="select2-selection"
                    style={field?.customStyle}
                    id={field.name}
                    name={field.name}
                    value={field.options.find((option) => value === option.value) || null}
                    options={field.options}
                    onChange={(selectedOption) =>
                        onChange(field, selectedOption?.value)
                    }
                    closeMenuOnSelect={!field.isMulti}
                    required={field.isRequired}
                    isMulti={field.isMulti}
                    menuPortalTarget={document.body}
                    styles={{
                        control: (base, state) => ({
                            ...base,
                            minHeight: "27.6px",
                            fontSize: "12px",
                            padding: "0 2px",
                        }),
                        valueContainer: (base) => ({
                            ...base,
                            padding: "0 4px",
                            height: "26px",
                        }),
                        indicatorsContainer: (base) => ({
                            ...base,
                            height: "26px",
                        }),
                        dropdownIndicator: (base) => ({
                            ...base,
                            padding: "2px",
                        }),
                        clearIndicator: (base) => ({
                            ...base,
                            padding: "2px",
                        }),
                        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    }}
                />
              </div>
            )}
            {field.type === SWITCH && (
                <div className="form-check form-switch form-switch-lg mb-1">
                    <input
                        className="form-check-input"
                        style={field?.customStyle}
                        type="checkbox"
                        id={`${field.name}-switch`}
                        checked={!!value}
                        onChange={() => {
                            onChange(field, value ? null : true);
                        }}
                    />
                </div>
            )}
            {field.type === DATE_TIME_PICKER && (
                <Input
                    className="form-control small-text-fields"
                    style={field?.customStyle}
                    type="datetime-local"
                    id={field.name}
                    name={field.name}
                    disabled={field.isDisable}
                    value={value ?? field.defaultValue ?? ""}
                    onChange={(e) => onChange(field, e.target.value)}
                />
            )}
        </React.Fragment>
    );
};