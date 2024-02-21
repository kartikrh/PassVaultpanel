import { Select } from "antd";
import React from "react";

export const RSelect = ({
  value,
  handleTableActions,
  options,
  placeholder,
  items,
  selectedTableElements,
  setSelectedTableElements
}) => {
  console.log(items);
  return (
    <div>
      <Select
        value={value}
        placeholder={placeholder}
        styles={{
          control: (provided) => ({ ...provided, width: 200 }), // Adjust width as needed
        }}
        onChange={(e) => {
            handleTableActions(items.value, e);
            setSelectedTableElements({
            ...selectedTableElements,
            eventType:{label: "common", value : 0}
          })
        }}
        options={options?.map((item) => ({
          label: item[items.label],
          value: item[items.value],
        }))}
        classNamePrefix="select2-selection"
      />
    </div>
  );
};
