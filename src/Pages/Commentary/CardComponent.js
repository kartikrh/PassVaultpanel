import React from "react";
import { CardBody } from "reactstrap";


const CardComponent = ({ title, titleIcon, name, bgColor, onClickColor, onClick, check, isPlayerName = false }) => {
  return (
    <div role="button" className="card">
      <CardBody
        className="rounded"
        onClick={onClick}
        style={{ backgroundColor: check ? onClickColor : bgColor, border: `2px solid ${onClickColor}` }}
      >
        <div className="">
          <div className="d-flex flex-column justify-content-center align-items-center">
            <i
              className={check ? "bx bxs-check-circle circle-display" : "bx bx-circle circle-display"}
              style={{ fontSize: "25px", color: "white" }}
            ></i>
            <span
              className="wicket-card-title"
              style={{
                fontWeight: 600,
                fontSize: "18px",
                color: "white",
                display:"flex", 
                alignItems:"center"
              }}
            >
              {titleIcon && <img src={titleIcon} style={{ marginRight: "10px" }} width={25} height={25} alt="icon" />} {" "}
              {title}
            </span>
            {isPlayerName && (<span
              className=""
              style={{
                fontWeight: 600,
                fontSize: "22px",
                marginLeft: "15px",
                color: "white",
              }}
            >
              {name || "Select Player"}
            </span>)}
          </div>
        </div>
      </CardBody>
    </div>
  );
};

export default CardComponent;
