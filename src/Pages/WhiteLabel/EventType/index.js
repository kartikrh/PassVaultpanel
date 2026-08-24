import React from "react";
import { useNavigate } from "react-router-dom";
import { Col, Container, Row } from "reactstrap";
import Breadcrumbs from "../../../components/Common/Breadcrumb";

// NOTE: The per-event hide/unhide sub-feature that used to live on this page
// (getEventTypes / getCompetition / getCommentary / hideEvent / unHideEvent)
// has been removed because it depended on event/competition/commentary data
// that no longer exists in the CMS-only backend. This component is kept as a
// lightweight placeholder (rather than deleted) because it is still imported
// and routed to from Routes/routes.js (`/whiteLabelEventData`), which is
// owned by another engineer and out of scope for this change.
export const ShowHide = () => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate("/whiteLabel");
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Row>
            <Col>
              <Breadcrumbs
                title="White Label Event"
                breadcrumbItem="Show/Hide Event"
              />
            </Col>
          </Row>
          <Row>
            <Col>
              <p>This feature is no longer available.</p>
            </Col>
          </Row>
          <Row>
            <Col>
              <button className="btn btn-danger" onClick={handleBackClick}>
                Back
              </button>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};
