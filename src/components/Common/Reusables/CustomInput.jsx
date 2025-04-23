import React from 'react';
import { Input } from "reactstrap";
import "./CustomInput.css";

const CustomInput = ({ value, onChange, steps, ...rest }) => {
  const handleChange = (e) => {
    const inputValue = e.target.value;
    const isPredefinedValue = rest?.name === "predefinedValue";
    if (inputValue === "") {
      onChange(null);
      return;
    }
    const pattern = isPredefinedValue ? /^-?\d*\.?\d{0,2}$/ : /^\d*\.?\d{0,2}$/;
    const allowedTemp = isPredefinedValue ? ["-", "-.", ".", "0.", "-0."] : [".", "0."];
    // Allow only valid numbers with up to two decimal places OR a single "."
    if (!pattern.test(inputValue) && inputValue !== ".") return;
    // if (!/^\d*\.?\d{0,2}$/.test(inputValue) && inputValue !== ".") return;
  
    // Prevent multiple dots
    if (inputValue.split(".").length > 2) return;
  
    // Prevent leading zeros (e.g., "01" should become "1", but keep "0." valid)
    if (/^0\d/.test(inputValue)) {
      inputValue = inputValue.replace(/^0+/, "");
    }
  
    // Allow standalone "." and "0." without converting them to a number
    if (allowedTemp.includes(inputValue)) {
      onChange(inputValue);
      return;
    }
  
    // Convert to float when valid
    const parsedValue = parseFloat(inputValue);
    if (!isNaN(parsedValue) && (parsedValue >= 0 || isPredefinedValue)) {
      onChange(inputValue); // Keep as string to preserve user input
    }
  };

  const handleIncrement = () => {
    const newValue = +value + (steps || 1);
    onChange(Math.max(newValue.toFixed(2)));
  };

  const handleDecrement = () => {
    if (value !== null && value > 0) {
      const newValue = +value - (steps || 1);
      onChange(Math.max(newValue.toFixed(2), 0));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      handleIncrement();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleDecrement();
    }
  };

  return (
    <div className='spin-buttons-container'>
      <Input
        className="form-control small-text-fields"
        type="number"
        step={steps || 1}
        // min={0}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        {...rest}
      />
      {/* <button onClick={handleIncrement} className="spin-button up" style={{top: 3}}></button>
      <button onClick={handleDecrement} className="spin-button down" style={{bottom: 3}}></button> */}
    </div>
  );
};

export default CustomInput;
