import React from "react";
import { CardBody } from "reactstrap";

const CardComponent = ({ title, name, icon, bgColor, onClickColor, onClick, check }) => {
  return (
    <div className="card">
      <CardBody
        className="rounded"
        onClick={onClick}
        style={{ backgroundColor: check ? onClickColor : bgColor }}
      >
        <div className="">
          <div className="d-flex flex-column justify-content-center align-items-center">
            <i

              className={icon && icon}
              style={{ fontSize: "25px", color: "white" }}
            ></i>
            <span
              className=""
              style={{
                fontWeight: 600,
                fontSize: "20px",
                marginLeft: "15px",
                color: "white",
              }}
            >
              {title}
            </span>
            {name && (<span
              className=""
              style={{
                fontWeight: 600,
                fontSize: "20px",
                marginLeft: "15px",
                color: "white",
              }}
            >
              {name}
            </span>)}
          </div>
        </div>
      </CardBody>
    </div>
  );
};

export default CardComponent;
