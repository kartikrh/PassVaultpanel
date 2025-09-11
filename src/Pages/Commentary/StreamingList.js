import React, { useState, useRef } from "react";
import Table from "../../components/Common/Table";
import { Button, Card, CardBody, Col, Container, Input, Row } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import axiosInstance from "../../Features/axios";
import { useDispatch } from "react-redux";
import {
  convertDateUTCToLocal,
  convertTimeUTCToLocal,
} from "../../components/Common/Reusables/reusableMethods";
import { isEmpty } from "lodash";
import { useNavigate } from "react-router-dom";
import { ERROR, SUCCESS } from "../../components/Common/Const";
import { updateToastData } from "../../Features/toasterSlice";
import axios from "axios";

const StreamingList = () => {
  const finalizeRef = useRef(null);
  document.title = "Streaming List";
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingType, setStreamingType] = useState("0");
  const [showStreamTable, setShowStreamTable] = useState(false);
  const [dataIndexList, setDataIndexList] = useState([]);
  const commentaryId = +sessionStorage.getItem("streamingListId") || 0;
  const commentaryDetails = JSON.parse(
    sessionStorage.getItem("streamingListDetails") || "{}"
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchStreamListData = async (latestValueFromTable) => {
    setIsLoading(true);
    // await axios.post(
    //     "https://streaming.cloudd.in/stream/getchanel",
    //     "",
    //     {
    //       headers: {
    //         "X-App": "123456",
    //       },
    //     }
    //   )
    //   .then((response) => {
    //     console.log("response", response);
    //     const logsData = response?.data?.getMatches || [];
    //     let logsDataIdList = [];
    //     logsData.forEach((ele) => {
    //       logsDataIdList.push(ele?.matchID);
    //     });
    //     setDataIndexList(logsDataIdList);
    //     setData(logsData);
    //     setIsLoading(false);
    //   })
    //   .catch((error) => {
    //     setIsLoading(false);
    //   });
    const url = 'https://streaming.cloudd.in/stream/getchanel';
 
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'X-App': '123456',
            'Content-Type': 'application/json',
            'Content-Length': '0',
        },
    });
    
    const logsData = await response?.data?.getMatches || [];
    let logsDataIdList = [];
    logsData.forEach((ele) => {
      logsDataIdList.push(ele?.matchID);
    });
    setDataIndexList(logsDataIdList);
    setData(logsData);
    setIsLoading(false);
  };

  const handleStreamingTypeChange = (e) => {
    setStreamingType(e.target.value);
    setShowStreamTable(false);
  };

  const streamingTypeOptions = [
    { label: "Select Streaming Type", value: "0" },
    { label: "URL", value: 1 },
    { label: "Streams", value: 2 },
  ];

  const columns = [
    {
      title: "Start Time",
      dataIndex: "timeStart",
      render: (text, record) => (
        <span>{convertTimeUTCToLocal(text, "index")}</span>
      ),
      key: "timeStart",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "League",
      dataIndex: "league",
      key: "league",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Match ID",
      dataIndex: "matchID",
      key: "matchID",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Now Playing",
      dataIndex: "nowPlaying",
      key: "nowPlaying",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Is Live",
      dataIndex: "isLive",
      key: "isLive",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "State",
      dataIndex: "state",
      key: "state",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Channel",
      dataIndex: "channel",
      key: "channel",
      render: (text, record) => (
        <strong>{text}</strong>
      ),
      sort: true,
      style: { width: "10%" },
    },
  ];

  const tableElement = {
    title: "Streaming List",
  };

  const handleSaveClick = async () => {
    const objToSave = {};
    try {
      let success = false;
      if (!isEmpty(objToSave)) {
        const response = await axiosInstance.post(
          "/admin/commentary/saveCommentaryDetails",
          { ...objToSave, commentaryId }
        );
        if (response?.result) {
          dispatch(
            updateToastData({
              data: response?.message,
              title: response?.title,
              type: SUCCESS,
            })
          );
        }
      }
    } catch (error) {
      dispatch(
        updateToastData({
          data: error?.message,
          title: error?.title,
          type: ERROR,
        })
      );
    }
  };

  const handleBackClick = () => {
    navigate("/commentary");
  };

  const EventDate = commentaryDetails?.eventDate
    ? convertDateUTCToLocal(commentaryDetails.eventDate, "index")
    : "";

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Row className="p-0">
            <Card className="p-0">
              <CardBody className="p-2">
                <Row>
                  {!isEmpty(commentaryDetails) && (
                    <Col xs={4} md={4} lg={4}>
                      <div>Date : {EventDate}</div>
                      <div className="match-details-breadcrumbs">{`${commentaryDetails?.eventType}/ ${commentaryDetails?.competition}/ ${commentaryDetails?.eventName}`}</div>
                      <div>Ref: {commentaryDetails?.eventRefId}</div>
                    </Col>
                  )}
                  <Col xs={5} md={6} lg={6}>
                    <div className="mb-2 d-flex align-items-center">
                      <label className="form-label">Streaming Type</label>
                      <Input
                        type="select"
                        className="mx-3"
                        value={streamingType}
                        onChange={handleStreamingTypeChange}
                        style={{ width: "200px" }}
                      >
                        {streamingTypeOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </Input>
                    </div>

                    <div className="mt-2 d-flex align-items-center">
                      <label className="form-label">Streaming URL</label>
                      <Input
                        type="text"
                        className="mx-3"
                        placeholder="Enter streaming URL"
                        style={{ width: "200px" }}
                      />

                      {streamingType == 2 && (
                        <Button
                          color="primary"
                          size="sm"
                          className="mx-2"
                          onClick={fetchStreamListData}
                        >
                          Show Stream List
                        </Button>
                      )}
                    </div>
                  </Col>
                  <Col xs={3} md={2} lg={2}>
                      <Button color='primary' className="table-header-button" onClick={handleSaveClick}>Save</Button>
                      <Button color='danger' className="table-header-button" onClick={handleBackClick}>Exit</Button>
                  </Col>
                </Row>
                {isLoading && <SpinnerModel />}
                {streamingType == 2 && showStreamTable && (
                  <Table
                    ref={finalizeRef}
                    columns={columns}
                    dataSource={data}
                    dataIndexList={dataIndexList}
                    tableElement={tableElement}
                    reFetchData={fetchStreamListData}
                  />
                )}
              </CardBody>
            </Card>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default StreamingList;
