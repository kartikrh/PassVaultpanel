import React from "react";
import { CardBody } from "reactstrap";

const CardComponent = ({ title, name, icon, bgColor, onClickColor, onClick, check, isPlayerName= false }) => {
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

              className={ check ? "bx bxs-check-circle" : "bx bx-circle"}
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
            {isPlayerName && (<span
              className=""
              style={{
                fontWeight: 600,
                fontSize: "20px",
                marginLeft: "15px",
                color: "white",
              }}
            >
              {name || "Player Name"}
            </span>)}
          </div>
        </div>
      </CardBody>
    </div>
  );
};

export default CardComponent;
