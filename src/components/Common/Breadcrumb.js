import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Breadcrumb, BreadcrumbItem, Button, Col, Row } from "reactstrap";

const Breadcrumbs = (props) => {
  const theme = useSelector((state) => state.layout.panelTheme);
  return (
    <React.Fragment>
      <Row>
        <Col xs="12">
          <div className="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 className="mb-0 font-size-18 breadcrumb-text">{props.breadcrumbItem}</h4>
            {/* <div className="page-title-right">
              <Breadcrumb listClassName="m-0"> */}
                {/* <BreadcrumbItem>
                  <Link to="#">{props.title}</Link>
                </BreadcrumbItem>
                <BreadcrumbItem active>
                  <Link to="#">{props.breadcrumbItem}</Link>
                </BreadcrumbItem> */}
              {/* </Breadcrumb>
            </div> */}
            {props?.isDashboard && <div>
              <Button
                color="warning"
                onClick={() => {
                  props.handleLoadData();
                }}
                className="d-flex align-items-center gap-1 w-auto"
              >
                <i className="ri-refresh-line"></i>
                Load Data
              </Button>
            </div>}
          </div>
        </Col>
      </Row>
    </React.Fragment>
  );
}



export default Breadcrumbs;
