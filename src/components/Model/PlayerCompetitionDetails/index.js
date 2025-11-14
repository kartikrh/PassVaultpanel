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
      setUpcomingComp(response?.result?.notEnded || []);
      setCompletedComp(response?.result?.ended || []);
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

  const columns = [
      {
        title: "Reference Id",
        dataIndex: "refID",
        key: "refID",
        style: { width: "10%" },
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
            <Table
              ref={upcomingCompRef}
              columns={columns}
              dataSource={upcomingComp}
              tableElement={tableElement}
              cardHeaderData={"Upcoming Competition"}
              maxTableHeight="300px"
            />
            <Table
              ref={completedCompRef}
              columns={columns}
              dataSource={completedComp}
              tableElement={tableElement}
              cardHeaderData={"Completed Competition"}
              maxTableHeight="300px"
            />
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