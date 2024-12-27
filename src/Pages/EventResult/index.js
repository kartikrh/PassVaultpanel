import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { Container } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import TabModel from "../../components/Model/AddTabModel";
import DeleteTabModel from "../../components/Model/DeleteModel";
import axiosInstance from "../../Features/axios";
import { useNavigate } from "react-router-dom";
import {
  PERMISSION_VIEW,
  TAB_EVENT_RESULT,
} from "../../components/Common/Const";
import { useSelector } from "react-redux";
import { checkPermission, convertDateLocalToUTC, convertDateUTCToLocal } from "../../components/Common/Reusables/reusableMethods";

const Index = () => {
  const pageName = TAB_EVENT_RESULT;
  const finalizeRef = useRef(null);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  document.title = "Event Result";
  const [data, setData] = useState([]);
  const [checekedList, setCheckedList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addModelVisable, setAddModelVisable] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const [competitions, setCompetitions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [isSearch, setIsSearch] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: `${new Date().toISOString().split("T")[0]}T00:00:00`,
    endDate: `${new Date().toISOString().split("T")[0]}T23:59:00`,
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [selectedTableElements, setSelectedTableElements] = useState({
    competition: null,
    team: null,
  });
  const teamId = +sessionStorage.getItem('eventResultTeamId') || 0;
  const competitionId = +sessionStorage.getItem('eventResultCompetitionId') || 0;
  const competitionDetails = JSON.parse(sessionStorage.getItem('eventResultDetails') || "{}");
  
  const navigate = useNavigate();

  const fetchData = async (latestValueFromTable) => {
    setIsLoading(true);
    const tableActions = finalizeRef.current.getTableAction();
    let payload = {
      ...(latestValueFromTable || tableActions),
      page: currentPage+1,
      limit: pageSize,
    }
    if(competitionId !== 0 || teamId !== 0) {
      payload = {
        ...(latestValueFromTable || tableActions),
        page: currentPage+1,
        limit: pageSize,
        competitionId: competitionId,
        teamId: teamId ? teamId : latestValueFromTable?.teamId,
      };
    }
    if (isSearch) {
      payload = {
        ...payload,
        startDate: convertDateLocalToUTC(dateRange?.startDate, "index"),
        endDate: convertDateLocalToUTC(dateRange?.endDate, "index"),
      };
    }
    await axiosInstance
      .post(`/admin/competition/result`, payload)
      .then((response) => {
        const logsData = response?.result?.data?.sort((a,b)=>b?.id - a?.id);
        let logsDataIdList = [];
        logsData.forEach((ele) => {
          logsDataIdList.push(ele?.id);
        });
        setData(logsData);
        setTotal(response?.result?.totalRecords || 0); 
        setCheckedList([]);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
      });
  };
  
  useEffect(()=>{
    if(competitionId !== 0 || teamId !== 0){
      setIsSearch(false);
      fetchCompetitionData();
      fetchTeamData();
    } else {
      setIsSearch(true);
    }
  },[competitionId, teamId])

  useEffect(() => {
    if (competitionId || teamId) {
      const competitionData = competitions.find(c => c.competitionId === competitionId)
      const teamData = teams.find(c => c.teamId === teamId)
      setSelectedTableElements({
        competition: {value: competitionData?.competitionId, label: competitionData?.competition},
        team: {value: teamData?.teamId, label: teamData?.teamName },
      });
    }
  }, [competitionId, teamId, competitions, teams]);

  const fetchCompetitionData = async (value) => {
    await axiosInstance
      .post(`/admin/competition/competitionList`, {})
      .then((response) => {
        setCompetitions(response.result);
      })
      .catch((error) => { });
  };
  const fetchTeamData = async (value) => {
    await axiosInstance
      .post(`/admin/competition/teamList`, {})
      .then((response) => {
        setTeams(response.result);
      })
      .catch((error) => { });
  };
  //table columns
  const columns = [
    {
      title: "Date",
      dataIndex: "eventDate",
      render: (text, record) => (
        <span>
          {convertDateUTCToLocal(text, "index")}
        </span>
      ),
      key: "eventDate",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Event",
      dataIndex: "eventName",
      key: "eventName",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Team1",
      dataIndex: "team1Name",
      key: "team1Name",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Team2",
      dataIndex: "team2Name",
      key: "team2Name",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Winner",
      dataIndex: "winnerName",
      key: "winnerName",
      sort: true,
      style: { width: "10%" },
    },
  ];
  //elements required
  const tableElement = {
    title: "Event Result",
    competitionsSelect: true,
    teamsList:true,
    resetButton: true,
    reloadButton: true,
    isServerPagination: true,
    isDateRange: true,
  };

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard");
    }
    fetchData();
  },[isSearch, currentPage, pageSize]);

  useEffect(() => {
    fetchCompetitionData();
    fetchTeamData();
  }, []);

  const handleReset = (value) => {
    fetchData({ isActive: true });
    fetchCompetitionData();
    fetchTeamData();
  };

  const handleReload = (value) => {
    fetchData({ isActive: true });
    fetchCompetitionData();
    fetchTeamData();
  };

  const title = (competitionDetails?.teamName || competitionDetails?.competition)
  ? competitionDetails?.teamName 
    ? `History of ${competitionDetails?.teamName} In ${competitionDetails?.competition}` 
    : `History of ${competitionDetails?.competition}`
  : "Event Result";

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem={title} />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            deleteModelFunction={setDeleteModelVisable}
            competitions={competitions}
            teams={teams}
            singleCheck={checekedList}
            reFetchData={fetchData}
            selectedTableElementsLogs={selectedTableElements}
            handleReset={handleReset}
            handleReload={handleReload}
            setDateRange={setDateRange}
            dateRange={dateRange}
            serverCurrentPage={currentPage}
            serverPageSize={pageSize}
            serverTotal={total}
            setServerCurrentPage={setCurrentPage}
            setServerPageSize={setPageSize}
            isSearch={isSearch}
            setIsSearch={setIsSearch}
          />
          <DeleteTabModel
            deleteModelVisable={deleteModelVisable}
            setDeleteModelVisable={setDeleteModelVisable}
            singleCheck={checekedList}
          />
          <TabModel
            addModelVisable={addModelVisable}
            setAddModelVisable={setAddModelVisable}
          />
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;