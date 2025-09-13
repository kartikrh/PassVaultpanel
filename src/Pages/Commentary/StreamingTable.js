import React, { useEffect, useRef, useState } from "react";
import Table from "../../components/Common/Table";
import SpinnerModel from "../../components/Model/SpinnerModel";
import axios from "axios";
import { convertTimeUTCToLocal } from "../../components/Common/Reusables/reusableMethods";
import { Tooltip } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { loadInit } from "../../config";
import { configInit } from "../../Features/Config/configSlice";

const StreamingTable = () => {
  const finalizeRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dataIndexList, setDataIndexList] = useState([]);
  const [clipboard, setClipboard] = useState({});
  const [data, setData] = useState([]);
  const loadInitData = useSelector((state) => state.loadInit.loadInitData);
  let streamingURL = loadInitData.find(item => item.key === loadInit.STREAMINGURL)?.value;
  let streamingXkey = loadInitData.find(item => item.key === loadInit.STREAMINGXKEY)?.value;
  const dispatch = useDispatch();

  const fetchStreamListData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        streamingURL,
        "",
        {
          headers: {
            "X-App": streamingXkey,
            "Content-Type": "application/json",
          },
        }
      );
      const logsData = (await response?.data?.data?.getMatches) || [];
      let logsDataIdList = [];
      logsData.forEach((ele) => {
        logsDataIdList.push(ele?.matchID);
      });
      setDataIndexList(logsDataIdList);
      setData(logsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if(streamingURL && streamingXkey) {
      fetchStreamListData();
    }
  }, [streamingURL, streamingXkey]);

  const handleCopy = (channel, id) => {
    navigator.clipboard.writeText(channel);
    setClipboard((prev) => ({ ...prev, [id]: true }));

    // reset after 2s
    setTimeout(() => {
      setClipboard((prev) => ({ ...prev, [id]: false }));
    }, 2000);
  };

  useEffect(() => {
    dispatch(configInit());
  }, []);

  const columns = [
    {
      title: "Time",
      dataIndex: "timeStart",
      render: (text, record) => (
        <span>{convertTimeUTCToLocal(text, "index")}</span>
      ),
      key: "timeStart",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Event Type",
      dataIndex: "type",
      key: "type",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Competition",
      dataIndex: "league",
      key: "league",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Event",
      dataIndex: "name",
      key: "name",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Ref ID",
      dataIndex: "matchID",
      key: "matchID",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Channel",
      dataIndex: "channel",
      key: "channel",
      render: (text, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <strong>{text}</strong>
          {clipboard?.[record.matchID] ? (
            <Tooltip placement="bottomLeft" open={true} title={"Copied!"}>
              <i
                role="button"
                className="bx bxs-copy"
                style={{ cursor: "pointer" }}
              ></i>
            </Tooltip>
          ) : (
            <i
              role="button"
              onClick={() => handleCopy(text, record.matchID)}
              className="bx bxs-copy"
              style={{ cursor: "pointer" }}
              title="Copy channel"
            ></i>
          )}
        </div>
      ),
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Playing",
      dataIndex: "nowPlaying",
      key: "nowPlaying",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Live",
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
  ];

  const tableElement = {
    title: "Streaming List",
  };

  return (
   <React.Fragment>
      {isLoading && <SpinnerModel />}
      <Table
        ref={finalizeRef}
        columns={columns}
        dataSource={data}
        dataIndexList={dataIndexList}
        tableElement={tableElement}
        reFetchData={fetchStreamListData}
      />
    </React.Fragment>
  );
};

export default StreamingTable;