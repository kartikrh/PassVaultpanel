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
  const [isDownload, setIsDownload] = useState(false);
  const [originalWidth, setoriginalWidth] = useState();
  const [originalheight, setoriginalHeight] = useState();
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

  const previewImage = async () => {
    if (!componentRef.current) return;

    const element = document.querySelector('.event-snap-table-hover');
    const targetDiv = componentRef.current.querySelector('.border.border-dark.border-4');

    // Save original styles
    const originalStyles = {
      containerOverflow: element.style.overflow,
      containerHeight: element.style.height,
      bodyOverflow: document.body.style.overflow,
      targetHeight: targetDiv.style.height,
      position: targetDiv.style.position,
      storedWidth: `${targetDiv.scrollWidth}px`,
      storedHeight: `${targetDiv.scrollHeight}px`
    };
    setoriginalWidth(originalStyles.storedWidth);

    // Apply preview styles
    document.body.style.overflow = 'scroll';
    element.style.overflow = 'visible';
    element.style.height = `${targetDiv.scrollHeight}px`;

    // Set the targetDiv width to 800px and center it
    targetDiv.style.width = '800px'; // Fixed width of 800px for preview
    targetDiv.style.height = `${targetDiv.scrollHeight}px`; // Adjust height according to content
    targetDiv.style.position = 'relative'; // Ensure the div is positioned correctly

    // Center the targetDiv within the parent container (flexbox or absolute positioning)
    const parentDiv = componentRef.current;
    parentDiv.style.display = 'flex';
    parentDiv.style.justifyContent = 'center'; // Horizontally center
    parentDiv.style.alignItems = 'center'; // Vertically center
    parentDiv.style.height = '100%'; // Ensure the parent takes up full height

    // Create watermark
    const watermark = document.createElement('img');
    watermark.src = Crickfeed_logo;
    watermark.alt = 'CRICFEED';
    watermark.style.position = 'absolute';
    watermark.style.width = '200px';
    watermark.style.opacity = '0.3';
    watermark.style.pointerEvents = 'none';
    watermark.style.transform = 'translate(-50%, -50%) rotate(340deg)';
    watermark.style.zIndex = '1000';
    watermark.style.filter = 'brightness(0.7)';
    watermark.style.mixBlendMode = 'multiply';

    const targetRect = targetDiv.getBoundingClientRect();
    watermark.style.top = `${targetRect.height / 2}px`;
    watermark.style.left = `${targetRect.width / 2}px`;

    targetDiv.appendChild(watermark);

    try {
      setDownloadBtnDisabled(true);

      await new Promise((resolve) => requestAnimationFrame(resolve));
      await new Promise((resolve) => setTimeout(resolve, 200));

      setIsDownload(true); // Change button to "Download"
    } catch (error) {
      dispatch(updateToastData({ data: `Preview failed: ${error.message}`, type: ERROR }));
    } finally {
      setDownloadBtnDisabled(false); // Enable the button
      previewImage.originalStyles = originalStyles;
    }
  };
  const downloadImage = async () => {
    if (!componentRef.current) return;

    const element = document.querySelector('.event-snap-table-hover');
    const targetDiv = componentRef.current.querySelector('.border.border-dark.border-4');
    const watermark = targetDiv.querySelector('img[alt="CRICFEED"]');

    try {
      const dataUrl = await toJpeg(componentRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        width: targetDiv.offsetWidth,
        height: targetDiv.scrollHeight,
        backgroundColor: '#ffffff',
      });

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${(commentaryDetails?.eventName || 'image').split(' ').join('-')}.jpeg`;
      link.click();

      setIsDownload(false); // Change button back to "Preview"
    } catch (error) {
      dispatch(updateToastData({ data: `Download failed: ${error.message}`, type: ERROR }));
    } finally {
      // Reset the styles to original
      targetDiv.style.width = originalWidth;
      document.body.style.overflow = "auto"
      // targetDiv.style.height = '823px';
      if (watermark && watermark.parentNode) {
        watermark.parentNode.removeChild(watermark); // Remove watermark after download
      }

      // Enable the image again
      targetDiv.style.pointerEvents = 'auto';
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
                      onClick={isDownload ? downloadImage : previewImage}
                      disabled={downloadBtnDisabled}
                    >
                      {" "}
                      {isDownload ? "Download" : "Preview"}{" "}
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
