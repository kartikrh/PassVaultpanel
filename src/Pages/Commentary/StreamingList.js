import React, { useEffect, useState } from "react";
import { Button, Card, CardBody, Col, Container, Input, Row } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import axiosInstance from "../../Features/axios";
import { useDispatch } from "react-redux";
import {
  convertDateUTCToLocal,
} from "../../components/Common/Reusables/reusableMethods";
import { isEmpty } from "lodash";
import { useNavigate } from "react-router-dom";
import { ERROR, SUCCESS } from "../../components/Common/Const";
import { updateToastData } from "../../Features/toasterSlice";
import Select from "react-select";
import "./streamingList.css";
import StreamingTable from "./StreamingTable";

const StreamingList = () => {
  document.title = "Streaming List";
  const commentaryDetails = JSON.parse(
    sessionStorage.getItem("streamingListDetails") || "{}"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [streamingType, setStreamingType] = useState(
    commentaryDetails?.streamingType || "0"
  );
  const [streamingUrl, setStreamingUrl] = useState(
    commentaryDetails?.streamingUrl || ""
  );
  const [showStreamTable, setShowStreamTable] = useState(false);
  const commentaryId = +sessionStorage.getItem("streamingListId") || 0;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const streamingTypeOptions = [
    { label: "Select Streaming Type", value: "0" },
    { label: "URL", value: 1 },
    { label: "Streams", value: 2 },
  ];

  const handleSaveClick = async () => {
    if (!streamingType || streamingType === "0" || !streamingUrl) {
      dispatch(
        updateToastData({
          data: "Please enter Streaming Type & URL",
          title: "Validation Error",
          type: ERROR,
        })
      );
      return;
    }
    try {
      setIsLoading(true);
      const response = await axiosInstance.post(
        "/admin/commentary/updateStreaming",
        { commentaryId, streamingType: +streamingType, streamingUrl }
      );
      if (response?.result) {
        dispatch(
          updateToastData({
            data: response?.message,
            title: response?.title,
            type: SUCCESS,
          })
        );
        navigate("/commentary");
      }
    } catch (error) {
      dispatch(
        updateToastData({
          data: error?.message,
          title: error?.title,
          type: ERROR,
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate("/commentary");
  };

  const EventDate = commentaryDetails?.eventDate
    ? convertDateUTCToLocal(commentaryDetails.eventDate, "index")
    : "";

  useEffect(() => {
    document.title =  "Streaming List";
  }, []);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container className="pb-5" fluid={true}>
          <Row className="p-0 pb-5">
            <Card className="p-0">
              <CardBody className="p-2">
                {isLoading && <SpinnerModel />}
                <Row className="pb-2">
                  {!isEmpty(commentaryDetails) && (
                    <Col xs={4} md={4} lg={4}>
                      <div>Date : {EventDate}</div>
                      <div className="match-details-breadcrumbs">{`${commentaryDetails?.eventType}/ ${commentaryDetails?.competition}/ ${commentaryDetails?.eventName}`}</div>
                      <div>Ref: {commentaryDetails?.eventRefId}</div>
                    </Col>
                  )}
                  <Col xs={5} md={6} lg={6}>
                    <div className="mb-2 d-flex align-items-center">
                      <label className="form-label label-width">Streaming Type</label>
                      <Select
                        styles={{
                          control: (provided) => ({ ...provided, width: 250 }),
                        }}
                        className="mx-3"
                        value={streamingTypeOptions.find((o) => o.value === streamingType) || null}
                        placeholder={"Select Streaming Type"}
                        onChange={(opt) => {
                          setStreamingType(opt?.value ?? "0");
                          setShowStreamTable(false);
                        }}
                        options={streamingTypeOptions}
                        classNamePrefix="filter-dropdown"
                        isSearchable={false}
                      />
                    </div>

                    {streamingType && streamingType != 0 && <div className="mt-2 d-flex align-items-center">
                      <label className="form-label label-width">Streaming URL</label>
                      <Input
                        type="text"
                        className="form-control input-width mx-3"
                        placeholder="Enter streaming URL"
                        value={streamingUrl}
                        onChange={(e) => setStreamingUrl(e.target.value)}
                      />

                      {streamingType == 2 && (
                        <Button
                          color="primary"
                          size="sm"
                          className=""
                          onClick={() => setShowStreamTable(true)}
                        >
                          Show Stream List
                        </Button>
                      )}
                    </div>}
                  </Col>
                  <Col xs={3} md={2} lg={2}>
                      <Button color='primary' className="table-header-button" onClick={handleSaveClick}>Save</Button>
                      <Button color='danger' className="table-header-button" onClick={handleBackClick}>Exit</Button>
                  </Col>
                </Row>
                {showStreamTable && <StreamingTable title={"Streaming List"} />}
              </CardBody>
            </Card>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default StreamingList;
