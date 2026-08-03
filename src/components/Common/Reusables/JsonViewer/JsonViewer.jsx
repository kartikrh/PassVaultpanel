import React, { useState } from "react";
import "./JsonViewer.css";

const Primitive = ({ value }) => {
  if (value === null) return <span className="jv-null">null</span>;
  switch (typeof value) {
    case "string":
      return <span className="jv-string">"{value}"</span>;
    case "number":
      return <span className="jv-number">{value}</span>;
    case "boolean":
      return <span className="jv-boolean">{String(value)}</span>;
    default:
      return <span className="jv-null">{String(value)}</span>;
  }
};

const JsonValue = ({ data }) => {
  if (data === null || typeof data !== "object") {
    return <Primitive value={data} />;
  }
  return <JsonContainer data={data} />;
};

const JsonContainer = ({ data }) => {
  const [open, setOpen] = useState(true);
  const isArray = Array.isArray(data);
  const entries = Object.entries(data);
  const openBracket = isArray ? "[" : "{";
  const closeBracket = isArray ? "]" : "}";

  return (
    <div className="jv-container">
      <button
        type="button"
        className="jv-toggle"
        onClick={() => setOpen(!open)}
      >
        <span className="jv-caret">{open ? "\u25BC" : "\u25B6"}</span>
        <span className="jv-bracket">{openBracket}</span>
        {!open && (
          <span className="jv-preview">
            {"\u2026"}
            {closeBracket}
            <span className="jv-count">{entries.length}</span>
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="jv-children">
            {entries.map(([key, value], index) => (
              <div className="jv-row" key={key}>
                {!isArray && (
                  <span className="jv-key">"{key}"</span>
                )}
                {!isArray && <span className="jv-sep">: </span>}
                <JsonValue data={value} />
                {index < entries.length - 1 && (
                  <span className="jv-comma">,</span>
                )}
              </div>
            ))}
          </div>
          <div className="jv-closing">
            <span className="jv-bracket">{closeBracket}</span>
          </div>
        </>
      )}
    </div>
  );
};

const JsonViewer = ({ data }) => {
  if (data === null || typeof data !== "object") {
    return <Primitive value={data} />;
  }
  return <JsonContainer data={data} />;
};

export default JsonViewer;
