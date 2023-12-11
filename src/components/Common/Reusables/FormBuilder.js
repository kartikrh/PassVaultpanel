import React, { forwardRef, useState } from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import Creatable from 'react-select/creatable';
import { capitalize } from "lodash";
import { useImperativeHandle } from "react";
import { isValueEmpty } from "./reusableMethods.js";
import { EMAIL, SELECT, SWITCH, TEXT, TEXT_AREA } from "../Const.js";
import Switch from "react-switch";

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
    console.log('+++++ errors +++++', errors);
    setFieldErrors(errors);
    return errors;
  };

  const finalizeData = (doNotValidateFields = []) => {
    const errors = validateAllFields(doNotValidateFields);
    if (isValueEmpty(errors)) {
      return formData;
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
    console.log(field, value, formData)
    const errors = { ...fieldErrors };
    console.log(field, value);
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
    console.log(formData, errors);
    console.log(formData)
  };

  const OffsymbolStatus = () => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          fontSize: 12,
          color: "#fff",
        }}
      />
    );
  };

  const OnSymbolStatus = () => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          fontSize: 12,
          color: "#fff",
        }}
      />
    );
  };
  return (
    <form className="addbtn">
      <div className="formcontainer">
        {fields?.map((field) => (
          <div key={field.name} className={`subform ${field.parentclassName}`}>
            <div className={`label_and_input_wrapper ${field.className} ${field.type === "textarea" ? 'textarea_wrapper' : ''}`}>
              <div className="lablediv">
                <label className="lbel" htmlFor={field.name}>
                  {field.label}:
                </label>
              </div>

              <div className="inputdiv">
                {field.type === TEXT && (
                  <input
                    className="inputtag input_elem normal_input"
                    type={TEXT}
                    disabled={field.disabled}
                    id={field.name}
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={(e) => handleChange(field, e.target.value)}
                    required={field.isRequired}
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
                    className="inputtag input_elem"
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
                {field.type === "file" && (
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
                    <Switch
                      width={70}
                      uncheckedIcon={<OffsymbolStatus />}
                      checkedIcon={<OnSymbolStatus />}
                      className="pe-0"
                      onColor="#02a499"
                      onChange={() => {
                        handleChange(field, !formData[field.name])
                      }}
                      checked={formData[field.name]}
                    />
                  )
                }
              </div>
            </div>
            <span className="input_validation_error_msg">
              {fieldErrors[field.name] && <p>{fieldErrors[field.name]}</p>}
            </span>
          </div>
        ))}
      </div>
    </form>
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
        "file",
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
