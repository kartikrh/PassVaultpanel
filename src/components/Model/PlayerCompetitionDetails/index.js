import React, { useEffect, useRef, useState } from "react";
import { Button, Card, CardBody, CardHeader, Modal, ModalBody, ModalHeader } from "reactstrap";
import Table from "../../Common/Table";
import axiosInstance from "../../../Features/axios";
import { useDispatch } from "react-redux";
import { updateToastData } from "../../../Features/toasterSlice";
import { ERROR } from "../../Common/Const";
import SpinnerModel from "../SpinnerModel";
import { Avatar, Tooltip } from "antd";
import { convertDateUTCToLocalWithoutSec24 } from "../../Common/Reusables/reusableMethods";

const Index = ({
  competitionModelVisible,
  setCompetitionModelVisible,
  competitionRecord,
  fetchData,
}) => {
  const [upcomingComp, setUpcomingComp] = useState([]);
  const [completedComp, setCompletedComp] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const upcomingCompRef = useRef(null);
  const completedCompRef = useRef(null);


  const dispatch = useDispatch();

  const fetchTemplateByComm = async (playerId) => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.post(
        "/admin/player/competitionList",
        {
          playerId: playerId,
        }
      );
      setUpcomingComp(response?.result?.notEnded);
      setCompletedComp(response?.result?.ended);
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

  const upcomingCompColumns = [
      {
        title: "Reference Id",
        dataIndex: "wrRefID",
        key: "wrRefID",
        style: { width: "10%" },
      },
      {
        title: "Competition",
        dataIndex: "wrCompetition",
        key: "wrCompetition",
        style: { width: "10%" },
      },
      // {
      //   title: "Status",
      //   dataIndex: "wrStatus",
      //   render: (text, record) => {
      //     const statusLabels = {
      //       1: "Upcoming",
      //       2: "Started",
      //       3: "Completed",
      //       4: "Stop",
      //     };
      //     return (
      //       <span>
      //         {statusLabels[text] || " "}
      //       </span>
      //     );
      //   },
      //   key: "wrStatus",
      //   style: { width: "10%" },
      // },
      {
        title: "TPID",
        dataIndex: "wrTpId",
        key: "wrTpId",
        style: { width: "10%" },
        sort: true,
      },
      {
        title: "CID",
        dataIndex: "wrCompetitionId",
        key: "wrCompetitionId",
        style: { width: "10%" },
        sort: true,
      },
      {
        title: "Start Date",
        dataIndex: "wrStartDate",
        render: (text, record) => (
          <span>
            {convertDateUTCToLocalWithoutSec24(text, "index")}
          </span>
        ),
        key: "wrStartDate",
        style: { width: "10%" },
        sort: true,
      },
      {
        title: "End Date",
        dataIndex: "wrEndDate",
        render: (text, record) => (
          <span>
            {convertDateUTCToLocalWithoutSec24(text, "index")}
          </span>
        ),
        key: "wrEndDate",
        style: { width: "10%" },
        sort: true,
      },
    ];

  const completedCompColumns = [
      {
        title: "Reference Id",
        dataIndex: "wrRefID",
        key: "wrRefID",
        style: { width: "10%" },
      },
      {
        title: "Competition",
        dataIndex: "wrCompetition",
        key: "wrCompetition",
        style: { width: "10%" },
      },
      // {
      //   title: "Status",
      //   dataIndex: "wrStatus",
      //   render: (text, record) => {
      //     const statusLabels = {
      //       1: "Upcoming",
      //       2: "Started",
      //       3: "Completed",
      //       4: "Stop",
      //     };
      //     return (
      //       <span>
      //         {statusLabels[text] || " "}
      //       </span>
      //     );
      //   },
      //   key: "wrStatus",
      //   style: { width: "10%" },
      // },
      {
        title: "TPID",
        dataIndex: "wrTpId",
        key: "wrTpId",
        style: { width: "10%" },
        sort: true,
      },
      {
        title: "CID",
        dataIndex: "wrCompetitionId",
        key: "wrCompetitionId",
        style: { width: "10%" },
        sort: true,
      },
      {
        title: "Start Date",
        dataIndex: "wrStartDate",
        render: (text, record) => (
          <span>
            {convertDateUTCToLocalWithoutSec24(text, "index")}
          </span>
        ),
        key: "wrStartDate",
        style: { width: "10%" },
        sort: true,
      },
      {
        title: "End Date",
        dataIndex: "wrEndDate",
        render: (text, record) => (
          <span>
            {convertDateUTCToLocalWithoutSec24(text, "index")}
          </span>
        ),
        key: "wrEndDate",
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
            <div style={{
              maxHeight: "350px",
              overflowY: "auto",
              overflowX: "hidden",
            }}>
              <Table
                ref={upcomingCompRef}
                columns={upcomingCompColumns}
                dataSource={upcomingComp}
                tableElement={tableElement}
                cardHeaderData={"Upcoming Competition"}
              />
            </div>
            <div style={{
              maxHeight: "350px",
              overflowY: "auto",
              overflowX: "hidden",
            }}>
              <Table
                ref={completedCompRef}
                columns={completedCompColumns}
                dataSource={completedComp}
                tableElement={tableElement}
                cardHeaderData={"Completed Competition"}
              />
            </div>
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