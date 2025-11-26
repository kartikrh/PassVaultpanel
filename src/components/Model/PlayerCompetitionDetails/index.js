import React, { useEffect, useRef, useState } from "react";
import { Accordion, AccordionBody, AccordionHeader, AccordionItem, Button, Card, CardBody, CardHeader, Modal, ModalBody, ModalHeader } from "reactstrap";
import Table from "../../Common/Table";
import axiosInstance from "../../../Features/axios";
import { useDispatch, useSelector } from "react-redux";
import { updateToastData } from "../../../Features/toasterSlice";
import { ERROR, PERMISSION_VIEW, TAB_COMMENTARY, TAB_COMMENTARY_LIST } from "../../Common/Const";
import SpinnerModel from "../SpinnerModel";
import { Avatar, Tooltip } from "antd";
import { checkPermission, convertDateUTCToLocalWithoutSec24 } from "../../Common/Reusables/reusableMethods";

const Index = ({
  competitionModelVisible,
  setCompetitionModelVisible,
  competitionRecord,
  fetchData,
}) => {
  const [upcomingComp, setUpcomingComp] = useState([]);
  const [completedComp, setCompletedComp] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const upcomingCompRef = useRef(null);
  const completedCompRef = useRef(null);
  const competitionRef = useRef(null);
  const [openCompDetails, setOpenCompDetails] = useState([
    "upcoming-comp-details",
    "completed-comp-details",
    "competition-details"
  ]);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  const CommentaryListPage = TAB_COMMENTARY_LIST;
  const CommentaryPage = TAB_COMMENTARY;
  const dispatch = useDispatch();

  const toggle = (id) => {
    setOpenCompDetails((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const fetchTemplateByComm = async (playerId) => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.post(
        "/admin/player/competitionList",
        {
          playerId: playerId,
        }
      );
      // setUpcomingComp(response?.result?.notEnded || []);
      // setCompletedComp(response?.result?.ended || []);

      const list = response?.result?.commentaryList || [];

      const upcoming = list.filter(c => [1, 2, 3].includes(c.commentaryStatus));
      const completed = list.filter(c => [4, 5, 6].includes(c.commentaryStatus));

      setUpcomingComp(upcoming);
      setCompletedComp(completed);
      setCompetitions(response?.result?.competitionList)
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      dispatch(
        updateToastData({
          data: error?.message,
          title: error?.title,
          type: ERROR,
        })
      );
    }
  };

  useEffect(() => {
    if (competitionRecord?.playerId) {
      fetchTemplateByComm(competitionRecord.playerId);
    }
  }, [competitionRecord]);

  const commentaryPermission = checkPermission(permissionObj, CommentaryPage, PERMISSION_VIEW);
  const commentaryListPermission = checkPermission(permissionObj, CommentaryListPage, PERMISSION_VIEW);

  const handleCommentaryClick = (details) => {
    const navUrl = (commentaryPermission && commentaryListPermission) ? "/Commentary" : commentaryPermission ? "/Commentary" : commentaryListPermission ? "/CommentaryList" : ''
    const url = new URL(window.location.origin + navUrl);
    sessionStorage.setItem(
      "commentaryCompetitionId",
      "" + details?.competitionId
    );
    sessionStorage.setItem(
      "commentaryEventTypeId",
      "" + details?.eventTypeId
    );
    window.open(url.href, "_blank");
    sessionStorage.removeItem("commentaryCompetitionId");
    sessionStorage.removeItem("commentaryEventTypeId");
  };

  const handleCompetitionClick = (details) => {
    const url = new URL(window.location.origin + "/Competition");
    sessionStorage.setItem(
      "playerCompetitionDetails",
      "" + details?.competition
    );
    window.open(url.href, "_blank");
    sessionStorage.removeItem("playerCompetitionDetails");
  };

  const statusLabels = {
    1: "Upcoming",
    2: "Started",
    3: "Completed",
    4: "Stop",
  };

  const columns = [
    {
        title: "",
        dataIndex: "commentaryList",
        key: "commentaryList",
        render: (text, record) => {
          return (
            <Tooltip
              title={"Commentary List"}
              color={"#e8e8ea"}
              overlayInnerStyle={{ color: "#000" }}
            >
              <Button
                color={"primary"}
                size="sm"
                className="btn"
                onClick={() => handleCommentaryClick(record)}
              >
                CL
              </Button>
            </Tooltip>
          );
        },
        // sort: true,
        style: { width: "5%" },
      },
      {
        title: "CID",
        dataIndex: "competitionId",
        key: "competitionId",
        style: { width: "10%" },
        sort: true,
      },
      {
        title: "Event",
        dataIndex: "eventName",
        key: "eventName",
        style: { width: "10%" },
      },
      {
        title: "Competition",
        dataIndex: "competition",
        render: (text, record) => (
        <span style={{ cursor: "pointer" }} onClick={() => {handleCompetitionClick(record)}}>{text}</span>
      ),
        key: "competition",
        style: { width: "10%" },
      },
      {
        title: "Match Type",
        dataIndex: "matchType",
        key: "matchType",
        style: { width: "10%" },
      },
      {
        title: "TPID",
        dataIndex: "tpId",
        key: "tpId",
        style: { width: "10%" },
        sort: true,
      },
      {
        title: "Event Date",
        dataIndex: "eventDate",
        render: (text, record) => (
          <span>
            {convertDateUTCToLocalWithoutSec24(text, "index")}
          </span>
        ),
        key: "eventDate",
        style: { width: "10%" },
        sort: true,
      },
      // {
      //   title: "Start Date",
      //   dataIndex: "startDate",
      //   render: (text, record) => (
      //     <span>
      //       {convertDateUTCToLocalWithoutSec24(text, "index")}
      //     </span>
      //   ),
      //   key: "startDate",
      //   style: { width: "10%" },
      //   sort: true,
      // },
      // {
      //   title: "End Date",
      //   dataIndex: "endDate",
      //   render: (text, record) => (
      //     <span>
      //       {convertDateUTCToLocalWithoutSec24(text, "index")}
      //     </span>
      //   ),
      //   key: "endDate",
      //   style: { width: "10%" },
      //   sort: true,
      // },
    ];

  const competitionColumns = [
    {
      title: "",
      dataIndex: "commentaryList",
      key: "commentaryList",
      render: (text, record) => {
        return (
          <Tooltip
            title={"Commentary List"}
            color={"#e8e8ea"}
            overlayInnerStyle={{ color: "#000" }}
          >
            <Button
              color={"primary"}
              size="sm"
              className="btn"
              onClick={() => handleCommentaryClick(record)}
            >
              CL
            </Button>
          </Tooltip>
        );
      },
      // sort: true,
      style: { width: "5%" },
    },
    {
      title: "CID",
      dataIndex: "competitionId",
      key: "competitionId",
      style: { width: "10%" },
      sort: true,
    },
    {
      title: "Competition",
      dataIndex: "competition",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }} onClick={() => { handleCompetitionClick(record) }}>{text}</span>
      ),
      key: "competition",
      style: { width: "10%" },
    },
    {
      title: "Match Type",
      dataIndex: "matchType",
      key: "matchType",
      style: { width: "10%" },
    },
    {
      title: "TPID",
      dataIndex: "tpId",
      key: "tpId",
      style: { width: "10%" },
      sort: true,
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      render: (text, record) => (
        <span>
          {convertDateUTCToLocalWithoutSec24(text, "index")}
        </span>
      ),
      key: "startDate",
      style: { width: "10%" },
      sort: true,
    },
    {
      title: "End Date",
      dataIndex: "endDate",
      render: (text, record) => (
        <span>
          {convertDateUTCToLocalWithoutSec24(text, "index")}
        </span>
      ),
      key: "endDate",
      style: { width: "10%" },
      sort: true,
    },
    {
      title: "Status",
      dataIndex: "commStatus",
      key: "commStatus",
      render: (value) => statusLabels[value] || "",
      style: { width: "10%" },
      sort: true,
    },
  ];

  const tableElement = {
    title: "Player Competition Listing",
  };
  
  return (
    <Modal
      isOpen={competitionModelVisible}
      toggle={() => {
        setCompetitionModelVisible(false);
      }}
      size="xl"
      // style={{ maxWidth: "80%", height: "80vh" }}
      centered
    >
      <ModalHeader
        className="bg-light p-3"
        id="exampleModalLabel"
        toggle={() => {
          setCompetitionModelVisible(false);
        }}
      >
        {competitionRecord?.playerName} [{competitionRecord?.playerId}] Competition Details
      </ModalHeader>
      <div className="tablelist-form">
        <ModalBody>
          <div
            className="d-flex flex-column justify-content-center"
            id="modal-id"
          >
            {isLoading && <SpinnerModel />}
            <Accordion open={openCompDetails} toggle={toggle}>
              <AccordionItem>
                <AccordionHeader targetId={"upcoming-comp-details"} className="market-category-header">
                  <span style={{ color: "green", fontWeight: "600" }}>Fixtures</span>
                </AccordionHeader>
                <AccordionBody accordionId={"upcoming-comp-details"} className="market-category-body p-0">
                  <Table
                    ref={upcomingCompRef}
                    columns={columns}
                    dataSource={upcomingComp}
                    tableElement={tableElement}
                    maxTableHeight="300px"
                  />
                </AccordionBody>
              </AccordionItem>
            </Accordion>
           <Accordion open={openCompDetails} toggle={toggle}>
              <AccordionItem>
                <AccordionHeader targetId={"completed-comp-details"} className="market-category-header">
                  <span style={{ color: "red", fontWeight: "600" }}>Completed</span>
                </AccordionHeader>
                <AccordionBody accordionId={"completed-comp-details"} className="market-category-body p-0">
                  <Table
                    ref={completedCompRef}
                    columns={columns}
                    dataSource={completedComp}
                    tableElement={tableElement}
                    maxTableHeight="300px"
                  />
                </AccordionBody>
              </AccordionItem>
            </Accordion>
            <Accordion open={openCompDetails} toggle={toggle}>
              <AccordionItem>
                <AccordionHeader targetId={"competition-details"} className="market-category-header">
                  <span style={{ color: "blue", fontWeight: "600" }}>Competition</span>
                </AccordionHeader>
                <AccordionBody accordionId={"competition-details"} className="market-category-body p-0">
                  <Table
                    ref={competitionRef}
                    columns={competitionColumns}
                    dataSource={competitions}
                    tableElement={tableElement}
                    maxTableHeight="300px"
                  />
                </AccordionBody>
              </AccordionItem>
            </Accordion>
            <div className="hstack justify-content-end mt-4">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => {
                  setCompetitionModelVisible(false);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </ModalBody>
      </div>
    </Modal>
  );
};

export default Index;