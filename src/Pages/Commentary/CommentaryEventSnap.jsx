import React, { useState, useEffect } from "react";
import axiosInstance from "../../Features/axios";
import { Button, Card, CardBody, Container, Row, Col, Table } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useNavigate } from "react-router-dom";
import "../../components/Common/Reusables/CustomCss.css";
import { convertDateUTCToLocal } from "../../components/Common/Reusables/reusableMethods";
import "./CommentaryCss.css";

export const CommentaryEventSnap = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [eventSnapData, setEventSnapData] = useState(null);
  document.title = "CommentaryEventSnap";
  let navigate = useNavigate();
  const commentaryId = +sessionStorage.getItem("eventSnapId") || "0";
  const commentaryDetails = JSON.parse(
    sessionStorage.getItem("eventSnapDetails") || "{}"
  );

  const fetchData = async (commentaryId) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post(
        "/admin/commentary/getEventSnap",
        { commentaryId }
      );
      if (response?.result) {
        setEventSnapData(response?.result);
      }
    } catch (error) {
      console.error("Error fetching market data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(commentaryId);
  }, []);

  const handleBackClick = () => {
    navigate("/commentary");
  };

  const MarketDetailsDate = commentaryDetails?.eventDate
    ? convertDateUTCToLocal(commentaryDetails.eventDate, "index")
    : "";

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Row>
            <Card>
              <CardBody className="p-1 event-snap">
                {isLoading && <SpinnerModel />}
                <Row className="mb-3">
                  {commentaryDetails && (
                    <>
                      <Col className="mt-3 mt-lg-3 mt-md-3 float-right">
                        <div className="margin-right-20">
                          <span className="margin-right-10">Date :</span>
                          <strong>{MarketDetailsDate}</strong>
                        </div>
                        <div className="margin-right-20">
                          <span className="margin-right-10">Event :</span>
                          <strong>{commentaryDetails?.eventName}</strong>
                        </div>
                      </Col>
                      <Col className="mt-3 mt-lg-3 mt-md-3 float-right">
                        <div className="margin-right-20">
                          <span className="margin-right-10">Competition :</span>
                          <strong>{commentaryDetails?.competition}</strong>
                        </div>
                        <div className="margin-right-20">
                          <span className="margin-right-10">Ref :</span>
                          <strong>{commentaryDetails?.eventRefId}</strong>
                        </div>
                      </Col>
                    </>
                  )}
                  <Col className="mt-3 mt-lg-3 mt-md-3 float-right">
                    <Button
                      className="btn btn-danger text-right"
                      onClick={handleBackClick}
                    >
                      {" "}
                      Back{" "}
                    </Button>
                  </Col>
                </Row>
                {eventSnapData && (
                  <Table className="table event-snap-table-hover" responsive striped hover bordered style={{ border: "1px black"}}>
                    <tbody>
                      {Object.entries(eventSnapData).map(([key, value]) => {
                        // Capitalize key (you can uncomment and adjust the regex for formatting)
                        const formattedKey = key; // .replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());

                        return (
                          <tr key={key}>
                            <td className="p-2 px-3 custom-event-snap" >
                              {formattedKey}
                            </td>
                            <td className="p-2 px-3">{value}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                )}
              </CardBody>
            </Card>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};
