import Select from "react-select";

const PlayerCommentary = () => {
    return (
        <div class="container text-center" style={{ marginTop: "8%" }}>
            <div class="row">
                {
                    Array(6).fill(null).map((item, index) =>
                        <div class="col-12 col-lg-6 col-sm-6 col-md-6">
                            <div class="card border border-1 border-primary">
                                <div class="card-header">
                                    Team Name
                                </div>
                                <div class="row card-body">
                                    <div class="col">
                                        <Select
                                            classNamePrefix="select2-selection"
                                            // style={field?.customStyle}
                                            // id={field.name}
                                            // name={field.name}
                                            // isDisabled={disabledFields?.[field.name]}
                                            value={["val1","val2","val3"]
                                                // .concat(field.options, masterData?.[field.name] || [])
                                                // .filter((e) => {
                                                //     if (formData[field.name])
                                                //         return compareNumStringValues(
                                                //             e?.value,
                                                //             formData[field.name]
                                                //         );
                                                //     else
                                                //         return compareNumStringValues(
                                                //             e?.value,
                                                //             formData[field.name]
                                                //         );
                                                // })
                                                }
                                            options={["opt1","opt2","opt3"]
                                            // .concat(
                                            //     field.options,
                                            //     masterData?.[field.name] || []
                                            // )
                                            }
                                            // onChange={(selectedOption) => {
                                            //     handleChange(field, selectedOption?.value || null);
                                            // }}
                                            // closeMenuOnSelect={!field.isMulti}
                                            // required={field.isRequired}
                                            // isMulti={field.isMulti}
                                        />
                                    </div>
                                    <div class="col-auto">
                                        <button type="button" class="btn btn-primary mb-3">Add</button>
                                    </div>
                                    <div class="col-auto">
                                        <button type="button" class="btn btn-primary mb-3">Reload</button>
                                    </div>
                                </div>
                                <div class="rounded row border border-success mx-5 mb-2 card-body">
                                    {
                                        Array(4).fill(null).map((item, index) =>
                                            <div>
                                                <div class="col-12 col-lg-6 col-sm-6 col-md-6 d-flex justify-content-center">
                                                    player{index + 1}
                                                </div>
                                                <div class="col-12 col-lg-6 col-sm-6 col-md-6 d-flex justify-content-center">
                                                    <button type="button" class="btn btn-primary mb-3">Delete</button>
                                                </div>
                                            </div>
                                        )
                                    }

                                </div>
                            </div>
                        </div>
                    )
                }
            </div>
        </div>
    )
}

export default PlayerCommentary;