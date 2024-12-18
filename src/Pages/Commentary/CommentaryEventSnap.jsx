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
import Crickfeed_logo from '../../assets/images/Crickfeed_logo.png'

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

    // Add temporary classes to center the component and adjust layout
    componentRef.current.classList.add('d-flex', 'justify-content-center');
    const element = document.querySelector('.event-snap-table-hover');
    const targetDiv = componentRef.current.querySelector('.border.border-dark.border-4');

    // Save original styles to restore them later
    const originalStyles = {
      containerOverflow: element.style.overflow,
      containerHeight: element.style.height,
      bodyOverflow: document.body.style.overflow,
    };

    // Temporarily expand the container and disable scrollbars
    document.body.style.overflow = 'hidden'; // Prevent scrollbars on the entire page
    element.style.overflow = 'visible'; // Ensure no scrollbars for the container
    element.style.height = `${targetDiv.scrollHeight}px`; // Match height to table content

    // Create watermark image
    const watermark = document.createElement('img');
    watermark.src = Crickfeed_logo; // Assuming Crickfeed_logo is the path to the logo
    watermark.alt = 'CRICFEED';
    watermark.style.position = 'absolute';
    watermark.style.width = '200px'; // Adjust watermark size
    watermark.style.opacity = '0.3'; // Set watermark opacity
    watermark.style.pointerEvents = 'none'; // Disable pointer events on watermark
    watermark.style.transform = 'rotate(340deg)'; // Rotate watermark for styling
    watermark.style.zIndex = '1000';
    watermark.style.filter = "brightness(0.7)"; // Adjust brightness for blending
    watermark.style.mixBlendMode = "multiply";

    // Dynamically calculate the center of the component
    const targetRect = targetDiv.getBoundingClientRect();
    watermark.style.top = `${targetRect.height / 2}px`;
    watermark.style.left = `${targetRect.width / 2}px`;
    watermark.style.transform = 'translate(-50%, -50%) rotate(340deg)';

    // Ensure the parent element has a relative position to position the watermark correctly
    targetDiv.style.position = 'relative';
    targetDiv.appendChild(watermark); // Append watermark to the component

    try {
      setDownloadBtnDisabled(true);

      // Force a reflow to ensure watermark is rendered before capturing the image
      await new Promise(resolve => requestAnimationFrame(resolve));
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for rendering

      // Generate the image with dynamically calculated dimensions
      const dataUrl = await toJpeg(componentRef.current, {
        cacheBust: true, // To avoid cache issues when generating the image
        pixelRatio: 2, // For higher resolution
        width: targetDiv.offsetWidth, // Use the actual width of the table
        height: targetDiv.scrollHeight, // Use the total height of the table
        backgroundColor: '#ffffff', // Optional: Set a background color
      });

      // Create a link and trigger the download
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${(commentaryDetails?.eventName).split(' ').join('-')}.jpeg`;
      link.click();

      // Clean up
      componentRef.current.classList.remove('d-flex', 'justify-content-center');
      targetDiv.removeChild(watermark); // Remove watermark after image generation

      // Restore original styles
      document.body.style.overflow = originalStyles.bodyOverflow;
      element.style.overflow = originalStyles.containerOverflow;
      element.style.height = originalStyles.containerHeight;

      setDownloadBtnDisabled(false);
    } catch (error) {
      // Restore original styles even in case of error
      document.body.style.overflow = originalStyles.bodyOverflow;
      element.style.overflow = originalStyles.containerOverflow;
      element.style.height = originalStyles.containerHeight;

      dispatch(updateToastData({ data: error.message, type: ERROR }));
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
                <div ref={componentRef}>
                  <div
                    className="border border-dark border-4 "
                    style={{ background: "white", position: 'relative' }}  // Make sure the container is positioned relative
                  >
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
                        style={{
                          // backgroundImage: `url(${Crickfeed_logo})`,
                          // backgroundRepeat: "no-repeat", // Prevent the image from repeating
                          // backgroundSize: "250px", // Make the image cover the table area
                          // backgroundPosition: "center",
                          border: "1px solid black",
                          background: "#ddebf7",
                          margin: "0px",
                          width: "100%",
                          height: "100%",
                          overflow: "fit-content"
                        }}
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
                                style={{
                                  color: "#3783d1",
                                  fontWeight: "bold",
                                  width: "30%",
                                  height: "auto", // Set a fixed width for the key cells
                                  wordBreak: "break-word", // Ensure content does not overflow
                                  textAlign: "left"
                                }} // Key color and reduced width
                                key={`${key}-key`}
                              >
                                {formattedKey}
                              </td>,
                              <td
                                style={{
                                  color: "#1f4e78",
                                  fontWeight: "bold",
                                  height: "auto",
                                  width: "20%", // Set a fixed width for the value cells
                                  wordBreak: "break-word", // Ensure content does not overflow
                                  textAlign: "left"
                                }} // Value color and reduced width
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
                      // <div>dsg</div>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};
