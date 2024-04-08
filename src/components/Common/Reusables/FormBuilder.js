import React, {
  forwardRef,
  useEffect,
  useState,
  useImperativeHandle,
} from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import Creatable from "react-select/creatable";
import { isEmpty, isEqual } from "lodash";
import {
  isValueEmpty,
  sanitizeFormData,
  compareNumStringValues,
  convertDateUTCToLocal,
} from "./reusableMethods.js";
import {
  COUNTER,
  DATE_TIME_PICKER,
  DIVIDER,
  EMAIL,
  FILE_TYPE,
  MULTI_SELECT,
  SELECT,
  SWITCH,
  TEXT,
  TEXT_AREA,
  IMAGE,
  RADIO_BUTTON,
  TEXT_EDITOR,
  ERROR,
  TEXT_BUTTON,
  BUTTON,
  COLOR_PICKER,
} from "../Const.js";
import "./CustomCss.css";
import { Row, Col, Input, Form, Button } from "reactstrap";
import ImageField from "./ImageField.jsx";
import MyUploadAdapter from "./MyUploadAdapter.js";
import { updateToastData } from "../../../Features/toasterSlice.js";
import { useDispatch } from "react-redux";
import MyEditor from "./MyEditor.js";
import { ColorPicker } from "antd";

const FormBuilder = forwardRef(
  (
    {
      fields,
      editFormData,
      masterData,
      disabledFields,
      onFormDataChange,
      generateAlias,
    },
    ref
  ) => {
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({});
    const [fieldErrors, setFieldErrors] = useState({});
    const [viewImage, setViewImage] = useState(null);

    const handleImageChange = (field, event) => {
      const file = event.target.files[0];
      setFormData((prevFormData) => ({
        ...prevFormData,
        [field.name]: file,
      }));
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          setViewImage((prev) => ({
            ...prev,
            [field.name]: e.target.result,
          }));
        };
        reader.readAsDataURL(file);
      }
    };

    useEffect(() => {
      let defaultValueObj = {};
      fields?.forEach((field) => {
        if (field.defaultValue) {
          defaultValueObj[field.name] = field.defaultValue;
        }
      });
      if (
        isEmpty(formData) &&
        isEmpty(editFormData) &&
        !isEmpty(defaultValueObj)
      ) {
        setFormData(defaultValueObj);
      } else if (
        !isEmpty(editFormData) &&
        (isEmpty(formData) || isEqual(formData, defaultValueObj))
      ) {
        fields.forEach(async (element) => {
          if (element.type === IMAGE && editFormData[element.name]) {
            fetch(editFormData[element.name])
              .then((response) => response.blob())
              .then((blob) => {
                // Convert th e image data to base64
                const reader = new FileReader();
                reader.onloadend = () => {
                  setViewImage((prev) => ({
                    ...prev,
                    [element.name]: reader.result,
                  }));
                };
                reader.readAsDataURL(blob);
              });
          }
        });
        setFormData(editFormData);
      }
    }, [editFormData, fields, formData]);

    useEffect(() => {
      updateParentFormData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData]);

    const updateParentFormData = () => {
      if (typeof onFormDataChange === "function") {
        onFormDataChange(formData);
      }
    };

    const validateAllFields = (doNotValidateFields) => {
      const errors = {};
      fields.forEach((field) => {
        const value = formData[field.name];
        const shouldValidate =
          !doNotValidateFields.includes(field.name) &&
          (!field.dependsOnField ||
            formData[field.dependsOnField] === field.dependsOnValue);

        if (
          shouldValidate &&
          field.isRequired &&
          isValueEmpty(
            value,
            field.type === SELECT || field.type === MULTI_SELECT
          )
        ) {
          errors[field.name] =
            field.requiredErrorMessage || `Please Enter ${field.label}`;
        }
        if (field.regex && !field.regex.test(value || "")) {
          errors[field.name] = field.regexErrorMessage || "Invalid input.";
        }
      });

      setFieldErrors(errors);
      return errors;
    };

    const filterData = (data) => {
      const imageFields = fields
        .filter((field) => field.type === IMAGE)
        .map((value) => value.name);
      for (const key in data) {
        if (imageFields.includes(key)) {
          typeof data[key] === "string" && delete data[key];
          data[key] === null && delete data[key];
        }
      }
      return data;
    };

    const finalizeData = (doNotValidateFields = []) => {
      const errors = validateAllFields(doNotValidateFields);
      if (isValueEmpty(errors)) {
        const filteredData = filterData(formData);
        return sanitizeFormData(filteredData);
      } else {
        console.error(
          "There are errors in the form. Please correct them before saving."
        );
        return null;
      }
    };
    const getCurrentFormData = () => {
      const filteredData = filterData(formData);
      return sanitizeFormData(filteredData);
    }
    const resetForm = () => {
      setFormData({});
      setViewImage(null);
    };

    const updateFormFromParent = (newData) => {
      setFormData((oldData) => ({
        ...oldData,
        ...newData,
      }));
    };

    const handleChange = (field, value) => {
      const errors = { ...fieldErrors };
      const dependentFieldValue = formData[field.dependsOnField];
      if (
        (!field.dependsOnField ||
          dependentFieldValue === field.dependsOnValue) &&
        field.isRequired &&
        isValueEmpty(
          value,
          field.type === SELECT || field.type === MULTI_SELECT
        )
      ) {
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
      setFieldErrors(errors);
    };

    const fetchIsDependable = (field) => {
      if (field.dependsOnField) {
        return formData[field.dependsOnField] === field.dependsOnValue;
      } else {
        return true;
      }
    };
    // Expose the finalizeData & reset function to the parent using a ref
    useImperativeHandle(ref, () => ({
      finalizeData,
      resetForm,
      updateFormFromParent,
      getCurrentFormData
    }));
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
          {fields?.map((field, key) => {
            function MyCustomUploadAdapterPlugin(editor) {
              if (field?.type === TEXT_EDITOR && field?.imageType) {
                editor.plugins.get("FileRepository").createUploadAdapter = (
                  loader
                ) => {
                  const newAdapter = new MyUploadAdapter(loader);
                  newAdapter.url = `/ckUpload?type=${field.imageType}`;
                  return newAdapter;
                };
                const notifications = editor.plugins.get("Notification");
                notifications.on("show:warning", (evt, error) => {
                  dispatch(
                    updateToastData({
                      data: error.message,
                      title: error.title,
                      type: ERROR,
                    })
                  );
                  evt.stop();
                });
              }
            }
            return (
              <React.Fragment key={key}>
                {field.type === DIVIDER && (
                  <>
                    <h5>{field.sectionLabel}</h5>
                    <div className="dropdown-divider"></div>
                  </>
                )}
                <Col
                  className={`${field.label ? "" : "d-none"} ${fetchIsDependable(field) ? "" : "invisible"
                    }`}
                  xs={field.labelColspan?.xs || 3}
                  md={field.labelColspan?.md || 2}
                  lg={field.labelColspan?.lg || 2}
                >
                  <div className="lablediv">
                    <label
                      htmlFor={field.name}
                      className="col-form-label dynamic-label-right form-label-class"
                    >
                      {field.isRequired && (
                        <span className="text-danger">*&nbsp;</span>
                      )}
                      {field.label}
                    </label>
                  </div>
                </Col>
                <Col
                  className={`${field.type !== DIVIDER ? "" : "d-none"}${fetchIsDependable(field) ? "" : "invisible"
                    } mb-4`}
                  xs={field.fieldColspan?.xs || 9}
                  md={field.fieldColspan?.md || 4}
                  lg={field.fieldColspan?.lg || 4}
                >
                  <div className="col-md-10">
                    {field.type === TEXT && (
                      <Input
                        className="form-control"
                        style={field?.customStyle}
                        placeholder={field?.placeholder}
                        type="text"
                        disabled={disabledFields?.[field.name]}
                        id={field.name}
                        name={field.name}
                        value={formData[field.name] || ""}
                        onChange={(e) => handleChange(field, e.target.value)}
                        required={field.isRequired}
                        invalid={fieldErrors[field.name]}
                      />
                    )}

                    {field.type === TEXT_BUTTON && (
                      <div className="d-flex">
                        <Input
                          className="form-control"
                          style={field?.customStyle}
                          type="text"
                          disabled={disabledFields?.[field.name]}
                          id={field.name}
                          name={field.name}
                          value={formData[field.name] || ""}
                          onChange={(e) => handleChange(field, e.target.value)}
                          required={field.isRequired}
                          invalid={fieldErrors[field.name]}
                        />
                        <Button type="button" onClick={generateAlias}>
                          {field?.btnLable}
                        </Button>
                      </div>
                    )}

                    {field.type === EMAIL && (
                      <input
                        className="inputtag input_elem normal_input"
                        style={field?.customStyle}
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
                        style={field?.customStyle}
                        className="inputtag input_elem normal_input form-control"
                        type="password"
                        id={field.name}
                        name={field.name}
                        value={
                          formData[field.name] || formData[field.dataKey] || ""
                        }
                        onChange={(e) => handleChange(field, e.target.value)}
                        required={field.isRequired}
                      />
                    )}
                    {field.type === TEXT_AREA && (
                      <textarea
                        className="inputtag input_elem textarea w-100 form-control"
                        style={field?.customStyle}
                        id={field.name}
                        rows={field?.defaultRows || 2}
                        name={field.name}
                        disabled={disabledFields?.[field.name]}
                        value={
                          formData[field.name] || formData[field.dataKey] || ""
                        }
                        onChange={(e) => handleChange(field, e.target.value)}
                        required={field.isRequired}
                      />
                    )}
                    {field.type === SELECT && (
                      <Select
                        classNamePrefix="select2-selection"
                        style={field?.customStyle}
                        id={field.name}
                        name={field.name}
                        isDisabled={disabledFields?.[field.name]}
                        value={[]
                          .concat(field.options, masterData?.[field.name] || [])
                          .filter((e) => {
                            if (formData[field.name])
                              return compareNumStringValues(
                                e?.value,
                                formData[field.name]
                              );
                            else
                              return compareNumStringValues(
                                e?.value,
                                formData[field.name]
                              );
                          })}
                        options={[].concat(
                          field.options,
                          masterData?.[field.name] || []
                        )}
                        onChange={(selectedOption) => {
                          handleChange(field, selectedOption?.value || null);
                        }}
                        closeMenuOnSelect={!field.isMulti}
                        required={field.isRequired}
                        isMulti={field.isMulti}
                      />
                    )}
                    {field.type === MULTI_SELECT &&
                      (() => {
                        // Define options within the function scope
                        let options = [].concat(
                          field.options,
                          masterData[field.name] || []
                        );
                        if (field.showSelectAll) {
                          options = [
                            { label: "Select All", value: "all" },
                            ...options,
                          ];
                        }
                        return (
                          <Select
                            classNamePrefix="select2-selection"
                            style={field?.customStyle}
                            id={field.name}
                            name={field.name}
                            isDisabled={disabledFields?.[field.name]}
                            value={formData[field.name]?.map((val) =>
                              options.find((option) => option.value === val)
                            )}
                            options={options}
                            onChange={(selectedOptions) => {
                              if (
                                selectedOptions.some(
                                  (option) => option.value === "all"
                                )
                              ) {
                                // Select All option was chosen
                                const allValues = options
                                  .filter((opt) => opt.value !== "all")
                                  .map((opt) => opt.value);
                                handleChange(field, allValues);
                              } else {
                                // Regular selection
                                const values = selectedOptions
                                  ? selectedOptions.map(
                                    (option) => option.value
                                  )
                                  : [];
                                handleChange(field, values);
                              }
                            }}
                            closeMenuOnSelect={!field.isMulti}
                            required={field.isRequired}
                            isMulti={true}
                          />
                        );
                      })()}
                    {field.type === "creatable_select" && (
                      <Creatable
                        className="inputtag input_elem"
                        style={field?.customStyle}
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
                            border: state.isFocused
                              ? baseStyles.border
                              : "gray",
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
                    {field.type === RADIO_BUTTON && (
                      <div className="radio-button-styling radio_options_list d-flex">
                        {[]
                          .concat(
                            field?.options,
                            masterData?.[field?.name] || []
                          )
                          .map((option) => (
                            <label
                              key={option?.value}
                              className="radio_option_label"
                              style={{ marginRight: "30px" }}
                            >
                              <input
                                className="inputtag normal_input"
                                style={{
                                  transform: "scale(1.5)",
                                  marginRight: "10px",
                                }}
                                type="radio"
                                name={field?.name}
                                value={[]
                                  .concat(
                                    field?.options,
                                    masterData?.[field?.name] || []
                                  )
                                  .filter((e) => {
                                    if (formData[field?.name])
                                      return compareNumStringValues(
                                        e?.value,
                                        formData[field?.name]
                                      );
                                    else
                                      return compareNumStringValues(
                                        e?.value,
                                        formData[field?.name]
                                      );
                                  })}
                                onChange={() =>
                                  handleChange(field, option?.value)
                                }
                                required={field.isRequired}
                              />
                              {option?.label}
                            </label>
                          ))}
                      </div>
                    )}
                    {field.type === FILE_TYPE && (
                      <input
                        className="file_input"
                        style={field?.customStyle}
                        type="file"
                        name={field.name}
                        multiple={field.isMulti}
                        onChange={(e) => handleChange(field, e.target.files)}
                        accept={field?.acceptedFileTypes}
                      />
                    )}
                    {field.type === SWITCH && (
                      <div className="form-check form-switch form-switch-lg mb-3">
                        <input
                          className="form-check-input"
                          style={field?.customStyle}
                          type="checkbox"
                          id="customSwitchsizelg"
                          // defaultChecked
                          disabled={disabledFields?.[field.name]}
                          checked={formData[field.name]}
                          onChange={(e) => {
                            handleChange(field, !formData[field.name]);
                          }}
                          value={formData[field.name]}
                        />
                      </div>
                    )}
                    {field.type === TEXT_EDITOR && (
                      <>
                        <MyEditor
                          field={field}
                          formData={formData[field.name]}
                          handleChange={handleChange}
                          fieldErrors={fieldErrors}
                        />
                      </>
                    )}
                    {field.type === DATE_TIME_PICKER && (
                      <input
                        className="form-control"
                        style={field?.customStyle}
                        type="datetime-local"
                        disabled={disabledFields?.[field.name]}
                        value={
                          convertDateUTCToLocal(formData[field.name]) || ""
                        }
                        id={field.name}
                        onChange={(e) => handleChange(field, e.target.value)}
                      />
                    )}
                    {field.type === COUNTER && (
                      <input
                        className="form-control"
                        style={field?.customStyle}
                        type="number"
                        disabled={disabledFields?.[field.name]}
                        value={formData[field.name] || field.defaultValue || ""}
                        id={field.name}
                        onChange={(e) => handleChange(field, e.target.value)}
                        min={field.min}
                        max={field.max}
                        step={field.step}
                      />
                    )}
                    {field.type === IMAGE && (
                      <ImageField
                        field={field}
                        handleImageChange={handleImageChange}
                        src={viewImage?.[field.name]}
                      />
                    )}
                    {field.type === COLOR_PICKER && (
                      <ColorPicker
                        value={formData[field.name]}
                        onChange={(color) => handleChange(field, color.toHexString())}
                        className="ml-2"
                      />
                    )}
                    {field.type === BUTTON && (
                      <Button
                        type="button"
                        onClick={generateAlias}
                        disabled={disabledFields?.[field.name]}
                      >
                        {field?.btnLable}
                      </Button>
                    )}
                  </div>
                  <span className="text-danger">
                    {fieldErrors[field.name] && (
                      <p>{fieldErrors[field.name]}</p>
                    )}
                  </span>
                </Col>
              </React.Fragment>
            );
          })}
        </Row>
      </Form>
    );
  }
);

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
        RADIO_BUTTON,
        FILE_TYPE,
        SWITCH,
        MULTI_SELECT,
        DATE_TIME_PICKER,
        TEXT_EDITOR,
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
  // onFormDataChange: PropTypes.func.isRequired,
};

export default FormBuilder;
