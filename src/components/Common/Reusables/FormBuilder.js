import React, { forwardRef, useState } from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import Creatable from 'react-select/creatable';
import { capitalize } from "lodash";
import { useImperativeHandle } from "react";
import { isValueEmpty, sanitizeFormData } from "./reusableMethods.js";
import { EMAIL, FILE_TYPE, SELECT, SWITCH, TEXT, TEXT_AREA } from "../Const.js";
import "./CustomCss.css"
import {
  Row,
  Col,
  Card,
  CardBody,
  FormGroup,
  Button,
  CardTitle,
  CardSubtitle,
  Label,
  Input,
  Container,
  FormFeedback,
  Form,
} from "reactstrap";

const FormBuilder = forwardRef(({ fields, propsFormData }, ref) => {
  const [formData, setFormData] = useState(propsFormData || {});
  const [fieldErrors, setFieldErrors] = useState({});

  const validateAllFields = (doNotValidateFields) => {
    let errors = {};

    fields.forEach((field) => {
      const value = formData[field.name];

      if (field.isRequired && isValueEmpty(value) && !doNotValidateFields.includes(field.name)) {
        errors[field.name] =
          field.requiredErrorMessage || "This field is required.";
      } else if (field.isRequired && field.regex && !field.regex.test(value)) {
        errors[field.name] = field.regexErrorMessage || "Invalid input.";
      }
    });
    // console.log('+++++ errors +++++', errors);
    setFieldErrors(errors);
    return errors;
  };

  const finalizeData = (doNotValidateFields = []) => {
    const errors = validateAllFields(doNotValidateFields);
    if (isValueEmpty(errors)) {
      return sanitizeFormData(formData);
    } else {
      console.error(
        "There are errors in the form. Please correct them before saving."
      );
      return null;
    }
  };

  const resetForm = () => {
    setFormData(propsFormData || {});
  };

  // Expose the finalizeData & reset function to the parent using a ref
  useImperativeHandle(ref, () => ({ finalizeData, resetForm }));

  const handleChange = (field, value) => {
    // console.log(field, value, formData)
    const errors = { ...fieldErrors };
    console.log(value);
    if (field.isRequired && isValueEmpty(value)) {
      errors[field.name] =
        field.requiredErrorMessage || "This field is required.";
    } else if (field.regex && !field.regex.test(value)) {
      errors[field.name] =
        field.regexErrorMessage || "Regex is not correct in this field";
    } else {
      delete errors[field.name];
    }
    setFormData((prevFormData) => ({
      ...prevFormData,
      [field.name]: value,
    }));
    // formData[field.name] !== value && propsFormData[field.name] !== value
    setFieldErrors(errors);
    // console.log(formData, errors);
    console.log(formData)
  };

  return (

    <Form
      className="needs-validation"
      onSubmit={(e) => {
        e.preventDefault();
        // validation.handleSubmit();
        return false;
      }}
    >

      <Row>
        {fields?.map((field) => (
          ((field.dependsOnField && formData[field.dependsOnField])
            || !field.dependsOnField)
          &&
          <>
            <Col className="mb-4" xs={field.labelColspan?.xs || 3} md={field.labelColspan?.md || 2} lg={field.labelColspan?.lg || 2}>
              <div className="lablediv">
                <label
                  htmlFor={field.name}
                  className="col-form-label dynamic-label-right"
                >
                  {field.isRequired && <span className="text-danger">*&nbsp;</span>}
                  {field.label}
                </label>
              </div>
            </Col >
            <Col className="mb-4" xs={field.fieldColspan?.xs || 9} md={field.fieldColspan?.md || 4} lg={field.fieldColspan?.lg || 4}>
              <div className="col-md-10">
                {field.type === TEXT && (
                  <Input
                    className="form-control"
                    type="text"
                    disabled={field.disabled}
                    id={field.name}
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={(e) => handleChange(field, e.target.value)}
                    required={field.isRequired}
                    invalid={fieldErrors[field.name]}
                  />
                )}

                {field.type === EMAIL && (
                  <input
                    className="inputtag input_elem normal_input"
                    type={EMAIL}
                    id={field.name}
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={(e) => handleChange(field, e.target.value)}
                    required={field.isRequired}
                  />
                )}
                {field.type === "password" && (
                  <input
                    className="inputtag input_elem normal_input"
                    type="password"
                    id={field.name}
                    name={field.name}
                    value={formData[field.name] || formData[field.dataKey] || ""}
                    onChange={(e) => handleChange(field, e.target.value)}
                    required={field.isRequired}
                  />
                )}
                {field.type === TEXT_AREA && (
                  <textarea
                    className="inputtag input_elem textarea"
                    id={field.name}
                    name={field.name}
                    value={formData[field.name] || formData[field.dataKey] || ""}
                    onChange={(e) => handleChange(field, e.target.value)}
                    required={field.isRequired}
                  />
                )}
                {field.type === SELECT && (
                  <Select
                    classNamePrefix="select2-selection"
                    id={field.name}
                    name={field.name}
                    value={
                      (formData[field.name] &&
                        (typeof formData[field.name] === "string"
                          ? {
                            label: formData[field.name],
                            value: formData[field.name],
                          }
                          : formData[field.name])) ||
                      field.defaultOption
                    }
                    options={field.options}
                    onChange={(selectedOption) => {
                      handleChange(field, selectedOption || null);
                    }}
                    closeMenuOnSelect={!field.isMulti}
                    required={field.isRequired}
                    isMulti={field.isMulti}
                  />
                )}
                {field.type === "creatable_select" && (
                  <Creatable
                    className="inputtag input_elem"
                    id={field.name}
                    name={field.name}
                    isClearable
                    value={
                      (formData[field.name] &&
                        (typeof formData[field.name] === "string"
                          ? {
                            label: formData[field.name],
                            value: formData[field.name],
                          }
                          : formData[field.name])) ||
                      field.defaultOption
                    }
                    options={field.options}
                    styles={{
                      control: (baseStyles, state) => ({
                        ...baseStyles,
                        width: "auto",
                        display: "flex",
                        alignItems: "center",
                        border: state.isFocused ? baseStyles.border : "gray",
                        borderBottom: "1px solid #ccc",
                        borderRadius: state.isFocused
                          ? baseStyles.borderRadius
                          : "",
                        textAlign: "left",
                      }),
                    }}
                    onChange={(selectedOption) => {
                      handleChange(field, selectedOption || null);
                    }}
                    closeMenuOnSelect={!field.isMulti}
                    required={field.isRequired}
                    isMulti={field.isMulti}
                  />
                )}
                {field.type === "radio" && (
                  <div className="radio-button-styling radio_options_list">
                    {field.options.map((option) => (
                      <label key={option.value} className="radio_option_label">
                        <input
                          className="inputtag normal_input"
                          type="radio"
                          name={field.name}
                          value={option.value}
                          checked={
                            (formData[field.name] &&
                              capitalize(formData[field.name]) === option.value) ||
                            capitalize(formData[field.dataKey]) === option.value
                          }
                          onChange={() => handleChange(field, option.value)}
                          required={field.isRequired}
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                )}
                {field.type === FILE_TYPE && (
                  <input
                    className="file_input"
                    type="file"
                    name={field.name}
                    multiple={field.isMulti}
                    onChange={(e) => handleChange(field, e.target.files)}
                    accept={field?.acceptedFileTypes}
                  />
                )}
                {
                  field.type === SWITCH && (
                    <div className="form-check form-switch form-switch-lg mb-3">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="customSwitchsizelg"
                        // defaultChecked
                        onChange={(e) => {
                          // console.log(e.target.value, "hello")
                          handleChange(field, !formData[field.name])
                        }}
                        value={formData[field.name]}
                      />
                    </div>)}
              </div>
              <span className="text-danger">
                {fieldErrors[field.name] && <p>{fieldErrors[field.name]}</p>}
              </span>
            </Col>
          </>
        ))}
      </Row>
    </Form >

  );
});

FormBuilder.propTypes = {
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      type: PropTypes.oneOf([
        TEXT,
        EMAIL,
        "password",
        TEXT_AREA,
        SELECT,
        "radio",
        FILE_TYPE,
        SWITCH
      ]).isRequired,
      isRequired: PropTypes.bool.isRequired,
      regex: PropTypes.instanceOf(RegExp),
      regexErrorMessage: PropTypes.string,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.string.isRequired,
          label: PropTypes.string.isRequired,
        })
      ),
    })
  ).isRequired,
  onFormDataChange: PropTypes.func.isRequired,
};

export default FormBuilder;
