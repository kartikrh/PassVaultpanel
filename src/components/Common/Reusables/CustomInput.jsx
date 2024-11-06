import React from 'react';
import { Input } from "reactstrap";
import "./CustomInput.css";

const CustomInput = ({ value, onChange, ...rest }) => {
  const handleChange = (e) => {
    const inputValue = e.target.value;
    if (inputValue === "") {
      onChange(null);
    } else {
      const parsedValue = parseFloat(inputValue);
      if (!isNaN(parsedValue)) {
        onChange(parsedValue);
      }
    }
  };

  const handleIncrement = () => {
    onChange(+value + 1);
  };

  const handleDecrement = () => {
    onChange(+value - 1);
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
        type="text"
        step={1}
        min={0}
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
