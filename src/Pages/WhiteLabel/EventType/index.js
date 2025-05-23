import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import Table from "../../../components/Common/Table";
import {
  ERROR,
  SUCCESS,
  PERMISSION_VIEW,
  WHITE_LABEL_EVENT_DATA,
} from "../../../components/Common/Const";
import {
  checkPermission,
  convertDateUTCToLocal,
} from "../../../components/Common/Reusables/reusableMethods";
import { Avatar, Tooltip } from "antd";
import { Button } from "reactstrap";
import Breadcrumbs from "../../../components/Common/Breadcrumb";
import { Card, CardBody, CardHeader, Col, Container, Row } from "reactstrap";
import SpinnerModel from "../../../components/Model/SpinnerModel";
import { updateToastData } from "../../../Features/toasterSlice";
import axiosInstance from "../../../Features/axios";
import { isEmpty } from "lodash";
import _ from "lodash";

const HideEventType = {
  eventType: 1,
  competition: 2,
  commentary: 3,
};

export const ShowHide = () => {
  const [data, setData] = useState([]);
  const pageName = WHITE_LABEL_EVENT_DATA;
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  const location = useLocation();
  let navigate = useNavigate();
  const dispatch = useDispatch();
  const [isDataLoading, setIsDataLoading] = useState(false);
  const whiteLabelId = +localStorage.getItem("whiteLabelEventId") || "0";

  // New state for nested navigation
  const [selectedLevel, setSelectedLevel] = useState({
    id: whiteLabelId,
    eventTypeId: null,
    competitionId: null,
    level: "eventType", // 'eventType', 'competition', 'commentary'
  });
  const [navigationHistory, setNavigationHistory] = useState([]);

  useEffect(() => {
    if (
      !checkPermission(permissionObj, pageName, PERMISSION_VIEW) &&
      !isEmpty(permissionObj)
    ) {
      navigate("/dashboard");
    }
    if (whiteLabelId !== "0") {
      // Initialize navigation history
      setNavigationHistory([
        {
          label: "Event Types",
          value: {
            id: whiteLabelId,
            eventTypeId: null,
            competitionId: null,
            level: "eventType",
          },
        },
      ]);
      fetchData();
    }
  }, [permissionObj]);

  const fetchData = async () => {
    setIsDataLoading(true);
    let endpoint = "";
    let payload = {};
    switch (selectedLevel.level) {
      case "eventType":
        endpoint = "/admin/whitelabel/getEventTypes";
        payload = { id: selectedLevel.id };
        break;
      case "competition":
        endpoint = "/admin/whitelabel/getCompetition";
        payload = {
          id: selectedLevel.id,
          eventTypeId: selectedLevel.eventTypeId,
        };
        break;
      case "commentary":
        endpoint = "/admin/whitelabel/getCommentary";
        payload = {
          id: selectedLevel.id,
          eventTypeId: selectedLevel.eventTypeId,
          competitionId: selectedLevel.competitionId,
        };
        break;
      default:
        setIsDataLoading(false);
        return;
    }

    await axiosInstance
      .post(endpoint, payload)
      .then((response) => {
        setData(response.result || []);
        setIsDataLoading(false);
      })
      .catch((error) => {
        dispatch(
          updateToastData({
            data: error?.message,
            title: error?.title,
            type: ERROR,
          })
        );
        setIsDataLoading(false);
      });
  };

  const handleBackClick = () => {
    navigate("/whiteLabel");
  };

  const handleHideUnhide = async ({ isHide, id, hideEventId, hideType }) => {
    setIsDataLoading(true);

    if (isHide) {
      await axiosInstance
        .post("/admin/whitelabel/unHideEvent", {
          hideEventId: hideEventId,
        })
        .then((response) => {
          dispatch(
            updateToastData({
              data: response?.message || "Item shown successfully",
              title: response?.title || "Success",
              type: SUCCESS,
            })
          );
          fetchData(); // Refresh data
        })
        .catch((error) => {
          dispatch(
            updateToastData({
              data: error?.message,
              title: error?.title,
              type: ERROR,
            })
          );
          setIsDataLoading(false);
        });
    } else {
      // Hide the item
      await axiosInstance
        .post("/admin/whitelabel/hideEvent", {
          id: selectedLevel.id,
          type: hideType,
          refId: id,
        })
        .then((response) => {
          dispatch(
            updateToastData({
              data: response?.message || "Item hidden successfully",
              title: response?.title || "Success",
              type: SUCCESS,
            })
          );
          fetchData(); // Refresh data
        })
        .catch((error) => {
          dispatch(
            updateToastData({
              data: error?.message,
              title: error?.title,
              type: ERROR,
            })
          );
          setIsDataLoading(false);
        });
    }
  };

  const handleItemClick = (record, nextLevel, labelField) => {
    let newSelectedLevel = { ...selectedLevel };
    let currentRecord = {
      label: record[labelField],
      value: { ...selectedLevel },
    };

    // eslint-disable-next-line default-case
    switch (nextLevel) {
      case "competition":
        newSelectedLevel = {
          ...selectedLevel,
          eventTypeId: record.eventTypeId || record.id,
          level: "competition",
        };
        currentRecord.value = newSelectedLevel;
        break;
      case "commentary":
        newSelectedLevel = {
          ...selectedLevel,
          competitionId: record.competitionId,
          level: "commentary",
        };
        currentRecord.value = newSelectedLevel;
        break;
    }

    const newHistory = [...navigationHistory, currentRecord];
    setNavigationHistory(newHistory);
    setSelectedLevel(newSelectedLevel);
    setData([]); // Clear current data
  };

  const handleBreadcrumbClick = (value) => {
    let historyList = _.clone(navigationHistory);
    const index = historyList.findIndex((item) => _.isEqual(item.value, value));
    historyList = index === -1 ? [] : historyList.slice(0, index + 1);
    setNavigationHistory(historyList);
    setSelectedLevel(value);
    setData([]); // Clear current data
  };

  // Event Type Columns
  const eventTypeColumns = [
    {
      title: "Id",
      dataIndex: "refId",
      key: "id",
      style: { width: "10%" },
      sort: true,
    },
    {
      title: "Event Type",
      dataIndex: "eventType",
      key: "eventType",
      style: { width: "80%" },
      render: (text, record) => (
        <Tooltip
          title={text}
          color={"#e8e8ea"}
          overlayInnerStyle={{ color: "#000" }}
        >
          <span
            className="cursor-pointer"
            onClick={() => handleItemClick(record, "competition", "eventType")}
            style={{ cursor: "pointer", color: "#000" }}
          >
            {text}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "S/H",
      dataIndex: "isHide",
      key: "showHide",
      render: (text, record) => (
        <Tooltip
          title={"Hide/Show Event Type"}
          color={"#e8e8ea"}
          overlayInnerStyle={{ color: "#000" }}
        >
          <Button
            color={`${!record.isHide ? "success" : "danger"}`}
            size="sm"
            className="btn"
            style={{marginRight: "350px"}}
            onClick={() =>
              handleHideUnhide({
                isHide: record.isHide,
                hideType: HideEventType.eventType,
                hideEventId: record.hideEventId,
                id: record.eventTypeId,
              })
            }
          >
            <i className={`bx ${!record.isHide ? "bx-check" : "bx-block"}`}></i>
          </Button>
        </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
  ];

  // Competition Columns
  const competitionColumns = [
    {
      title: "Id",
      dataIndex: "refId",
      key: "id",
      style: { width: "10%" },
      sort: true,
    },
    {
      title: "Competition",
      dataIndex: "competition",
      key: "competition",
      style: { width: "60%" },
      render: (text, record) => (
        <Tooltip
          title={text}
          color={"#e8e8ea"}
          overlayInnerStyle={{ color: "#000" }}
        >
          <span
            className="cursor-pointer"
            onClick={() => handleItemClick(record, "commentary", "competition")}
            style={{ cursor: "pointer", color: "#000" }}
          >
            {text}
          </span>
        </Tooltip>
      ),
    },
    // {
    //   title: "Created Date",
    //   dataIndex: "createdDate",
    //   key: "createdDate",
    //   style: { width: "20%" },
    //   render: (text, record) => (
    //     <span>{convertDateUTCToLocal(text, "index")}</span>
    //   ),
    //   sort: true,
    // },
    {
      title: "S/H",
      dataIndex: "isHide",
      key: "isHide",
      render: (text, record) => (
        <Tooltip
          title={"Hide/Show Competition"}
          color={"#e8e8ea"}
          overlayInnerStyle={{ color: "#000" }}
        >
          <Button
            color={`${!record.isHide ? "success" : "danger"}`}
            size="sm"
            className="btn"
            style={{marginRight: "350px"}}
            onClick={() =>
              handleHideUnhide({
                isHide: record.isHide,
                hideType: HideEventType.competition,
                hideEventId: record.hideEventId,
                id: record.competitionId,
              })
            }
          >
            <i className={`bx ${!record.isHide ? "bx-check" : "bx-block"}`}></i>
          </Button>
        </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
  ];

  // Commentary Columns
  const commentaryColumns = [
    {
      title: "Id",
      dataIndex: "eventRefId",
      key: "id",
      style: { width: "10%" },
      sort: true,
    },
    {
      title: "Commentary",
      dataIndex: "eventName",
      key: "eventName",
      style: { width: "50%" },
      render: (text, record) => (
        <Tooltip
          title={text}
          color={"#e8e8ea"}
          overlayInnerStyle={{ color: "#000" }}
        >
          <span>{text}</span>
        </Tooltip>
      ),
    },
    // {
    //   title: "Event Date",
    //   dataIndex: "eventDate",
    //   key: "eventDate",
    //   style: { width: "20%" },
    //   render: (text, record) => (
    //     <span>{convertDateUTCToLocal(text, "index")}</span>
    //   ),
    //   sort: true,
    // },
    // {
    //   title: "Status",
    //   dataIndex: "status",
    //   key: "status",
    //   style: { width: "10%" },
    // },
    {
      title: "S/H",
      dataIndex: "isHide",
      key: "isHide",
      render: (text, record) => (
        <Tooltip
          title={"Hide/Show Commentary"}
          color={"#e8e8ea"}
          overlayInnerStyle={{ color: "#000" }}
        >
          <Button
            color={`${!record.isHide ? "success" : "danger"}`}
            size="sm"
            className="btn"
            style={{marginRight: "350px"}}
            onClick={() =>
              handleHideUnhide({
                isHide: record.isHide,
                hideType: HideEventType.commentary,
                hideEventId: record.hideEventId,
                id: record.commentaryId,
              })
            }
          >
            <i className={`bx ${!record.isHide ? "bx-check" : "bx-block"}`}></i>
          </Button>
        </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
  ];

  // Get current columns based on level
  const getCurrentColumns = () => {
    switch (selectedLevel.level) {
      case "eventType":
        return eventTypeColumns;
      case "competition":
        return competitionColumns;
      case "commentary":
        return commentaryColumns;
      default:
        return eventTypeColumns;
    }
  };

  // Get current title based on level
  const getCurrentTitle = () => {
    switch (selectedLevel.level) {
      case "eventType":
        return "White Label Event Types";
      case "competition":
        return "White Label Competition Data";
      case "commentary":
        return "White Label Commentary Data";
      default:
        return "White Label Event Data";
    }
  };

  const tableElement = {
    title: getCurrentTitle(),
    reloadButton: true,
    isHide: true,
    loadData: true,
    subTable: true,
  };

  // Fetch data when selectedLevel changes
  useEffect(() => {
    if (selectedLevel.id) {
      fetchData();
    }
  }, [selectedLevel]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Row>
            {isDataLoading && <SpinnerModel />}
            <Row>
              <Col>
                <Breadcrumbs
                  title="White Label Event"
                  breadcrumbItem={getCurrentTitle()}
                  page={selectedLevel.level}
                />
              </Col>
              <Col>
                <button
                  className="btn btn-danger text-right"
                  onClick={handleBackClick}
                >
                  Back
                </button>
              </Col>
            </Row>
          </Row>
          <Table
            columns={getCurrentColumns()}
            tableElement={tableElement}
            dataSource={data}
            handleReload={fetchData}
            onBreadCrumbsClick={handleBreadcrumbClick}
            breadCrumbs={navigationHistory}
            reFetchData={fetchData}
          />
        </Container>
      </div>
    </React.Fragment>
  );
};
