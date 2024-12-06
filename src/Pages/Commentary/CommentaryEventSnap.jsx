import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../../Features/axios";
import { Button, Card, CardBody, Container, Row, Col, Table } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useNavigate } from "react-router-dom";
import "../../components/Common/Reusables/CustomCss.css";
import { convertDateUTCToLocal } from "../../components/Common/Reusables/reusableMethods";
import "./CommentaryCss.css";
import { ERROR, SUCCESS } from "../../components/Common/Const";
import { useDispatch } from "react-redux";
import { updateToastData } from "../../Features/toasterSlice";
import { toJpeg } from 'html-to-image';

export const CommentaryEventSnap = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [downloadBtnDisabled, setDownloadBtnDisabled] = useState(false);
  const [eventSnapData, setEventSnapData] = useState(null);
  document.title = "CommentaryEventSnap";
  let navigate = useNavigate();
  const dispatch = useDispatch();
  const commentaryId = +sessionStorage.getItem("eventSnapId") || "0";
  const commentaryDetails = JSON.parse(
    sessionStorage.getItem("eventSnapDetails") || "{}"
  );
  const componentRef = useRef();

  const downloadImage = async () => {
    if (!componentRef.current) return;
    const watermark = document.createElement('div');
    watermark.innerText = 'CRICFEED';
    watermark.style.position = 'absolute';
    watermark.style.top = '50%';
    watermark.style.left = '50%';
    watermark.style.fontSize = '5em';
    watermark.style.color = 'rgba(0, 0, 0, 0.3)';
    watermark.style.pointerEvents = 'none';
    watermark.style.userSelect = 'none';
    watermark.style.transform = 'translate(-50%, -50%) rotate(340deg)';
    watermark.style.zIndex = 1000;

    componentRef.current.appendChild(watermark);
    try {
      setDownloadBtnDisabled(true)
      const dataUrl = await toJpeg(componentRef.current);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${(commentaryDetails?.eventName).split(" ").join("-")}.jpeg`;
      link.click();
      componentRef.current.removeChild(watermark);
      setDownloadBtnDisabled(false)
    } catch (error) {
      updateToastData({data:error,type: ERROR});
    }
  };

  const formatDate = (date) => {
    const options = {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };

    const formattedDate = new Date(date).toLocaleString('en-GB', options);
    const timePeriod = formattedDate.slice(-2).toUpperCase(); // Extract and capitalize "AM"/"PM"
    const dateWithoutTimePeriod = formattedDate.slice(0, -2); // Remove the "AM"/"PM" part

    return `${dateWithoutTimePeriod} ${timePeriod}`;
  };

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

  const handleUpdate = async (e) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/commentary/updateEventSnap`, {
        commentaryId,
      })
      .then((response) => {
        fetchData(commentaryId);
        dispatch(
          updateToastData({
            data: response?.message,
            title: response?.title,
            type: SUCCESS,
          })
        );
      })
      .catch((error) => {
        setIsLoading(false);
        dispatch(
          updateToastData({
            data: error?.message,
            title: error?.title,
            type: ERROR,
          })
        );
      });
  };
  useEffect(() => {
    if (commentaryId) {
      fetchData(commentaryId);
    }
  }, [commentaryId]);

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
                  <Col className="mt-3 mt-lg-3 mt-md-3 float-right">
                    <Button
                      className="btn btn-danger text-right mx-2"
                      onClick={handleBackClick}
                    >
                      {" "}
                      Back{" "}
                    </Button>
                    <Button
                      color="primary"
                      className="btn text-right"
                      onClick={handleUpdate}
                    >
                      {" "}
                      Update{" "}
                    </Button>
                    <Button
                      color="primary"
                      className="btn text-right text-right mx-2"
                      onClick={downloadImage}
                      disabled={downloadBtnDisabled}
                    >
                      {" "}
                      Download{" "}
                    </Button>
                  </Col>
                </Row>
                <div ref={componentRef} className="border border-dark border-4" style={{background: "white"}}>
                  <div>
                    {commentaryDetails && (
                      <div className="my-2">
                        <div className="d-flex justify-content-center">
                          <h1 className="fs-1 fw-bold m-0">
                            {commentaryDetails?.eventName}
                          </h1>
                        </div>
                        <div className="d-flex justify-content-center">
                          <p className="m-0">
                            {formatDate(MarketDetailsDate)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="border border-bottom border-dark border-2"></div>
                  {eventSnapData && (
                   <Table
                   className="table event-snap-table-hover"
                   responsive
                   bordered
                   style={{ border: "1px solid black", padding: "12px", background: "#ddebf7", margin: "0px" }}
                 >
                   <tbody>
                     {Object.entries(eventSnapData).reduce((rows, [key, value], index) => {
                       const formattedKey = key;
                       if (index % 2 === 0) {
                         rows.push([]);
                       }
                       rows[rows.length - 1].push(
                         <td
                           className="custom-event-snap"
                           style={{ color: "#3783d1", padding: "8px", fontWeight: "bold" }} // Key color
                           key={`${key}-key`}
                         >
                           {formattedKey}
                         </td>,
                         <td
                           style={{ color: "#1f4e78", padding: "8px", fontWeight: "bold" }} // Value color
                           key={`${key}-value`}
                         >
                           {value}
                         </td>
                       );
                       return rows;
                     }, []).map((row, rowIndex) => (
                       <tr key={`row-${rowIndex}`}>{row}</tr>
                     ))}
                   </tbody>
                 </Table>
                 

                  )}
                </div>
              </CardBody>
            </Card>
          </Row>
          {/* <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              opacity: 0.2, // Make the watermark semi-transparent
              fontSize: '5em',
              color: 'rgba(0, 0, 0, 0.5)', // Adjust the color to your liking
              pointerEvents: 'none', // Allow clicking through the watermark
              userSelect: 'none', // Prevent selecting the watermark text
              zIndex: 1000, // Ensure watermark is on top
            }}
          >
            WATERMARK
          </div> */}
        </Container>
      </div>
    </React.Fragment>
  );
};
