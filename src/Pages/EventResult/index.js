import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { Container } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import TabModel from "../../components/Model/AddTabModel";
import CancelCalculationModel from "../../components/Model/CancelCalculationModel";
import axiosInstance from "../../Features/axios";
import { useNavigate } from "react-router-dom";
import {
  ERROR,
  PERMISSION_VIEW,
  SUCCESS,
  TAB_EVENT_RESULT,
} from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import { isEqual } from "lodash";
import { checkPermission, convertDateLocalToUTC, convertDateUTCToLocal2, convertDateUTCToLocal2_24 } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";

const Index = () => {
  const pageName = TAB_EVENT_RESULT;
  const finalizeRef = useRef(null);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  document.title = "Event Result";
  const [data, setData] = useState([]);
  const [checekedList, setCheckedList] = useState([]);
  const [dataIndexList, setDataIndexList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addModelVisable, setAddModelVisable] = useState(false);
  const [cancelCalculateModelVisable, setCancelCalculateModelVisable] = useState(false);
  const [competitions, setCompetitions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [CompetitionId, setCompetitionId] = useState(0);
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
  const dispatch = useDispatch();

  const fetchData = async (latestValueFromTable) => {
    setIsLoading(true);
    const tableActions = finalizeRef.current.getTableAction();
    const data = latestValueFromTable || tableActions
    let payload = {
      ...data,
      page: currentPage == 0 ? 1 : currentPage,
      limit: pageSize,
    }
    if(competitionId !== 0 || teamId !== 0) {
      payload = {
        ...data,
        page: currentPage == 0 ? 1 : currentPage,
        limit: pageSize,
        competitionId: competitionId,
        teamId: teamId ? teamId : data?.teamId,
      };
    }
    if (isSearch) {
      payload = {
        ...payload,
        startDate: convertDateLocalToUTC(latestValueFromTable?.startDate ? latestValueFromTable?.startDate : dateRange?.startDate, "index"),
        endDate: convertDateLocalToUTC(latestValueFromTable?.endDate ? latestValueFromTable?.endDate : dateRange?.endDate, "index"),
      };
    }
    await axiosInstance
      .post(`/admin/competition/result`, payload)
      .then((response) => {
        const logsData = response?.result?.data?.sort((a,b)=>b?.commentaryId - a?.commentaryId);
        let logsDataIdList = [];
        logsData.forEach((ele) => {
          logsDataIdList.push(ele?.commentaryId);
        });
        setData(logsData);
        setDataIndexList(logsDataIdList);
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
    } else {
      setIsSearch(true);
    }
  },[competitionId, teamId])

  useEffect(()=>{
    fetchCompetitionData();
    fetchTeamData();
  },[])

  const handleSingleCheck = (e) => {
    let updateSingleCheck = [];
    if (checekedList.includes(e.commentaryId)) {
      updateSingleCheck = checekedList.filter(
        (item) => item !== e.commentaryId
      );
    } else {
      updateSingleCheck = [...checekedList, e.commentaryId];
    }
    setCheckedList(updateSingleCheck);
  };

  useEffect(() => {
    if ((competitionDetails?.competitionId || competitionDetails?.teamId)) {
      const competitionData = competitions.find(c => c.competitionId === competitionDetails?.competitionId)
      const teamData = teams.find(c => c.teamId === competitionDetails?.teamId)
      setSelectedTableElements({
        competition: competitionDetails?.competitionId ? {value: competitionData?.competitionId || competitionDetails?.competitionId, label: competitionData?.competition || competitionDetails?.competition} : null,
        team: competitionDetails?.teamId ? {value: teamData?.teamId || competitionDetails?.teamId, label: teamData?.teamName || competitionDetails?.teamName } : null,
      });
    }
  }, [competitionDetails?.competitionId, competitionDetails?.teamId, competitions, teams]);

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

  const handleNoCalculate = async (e) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/commentary/changeIsCountInPoint`, {
        commentaryId: checekedList,
      })
      .then((response) => {
        fetchData();
        setCancelCalculateModelVisable(false);
        dispatch(
          updateToastData({
            data: response?.message,
            title: response?.title,
            type: SUCCESS,
          })
        );
        setCheckedList([]);
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
        setCheckedList([]);
      });
  };

  // const handleIsCountInPoint = async (pType, record, cState) => {
  //   setIsLoading(true);
  //   await axiosInstance
  //     .post(`/admin/commentary/isCountInPoint`, {
  //       commentaryId: record?.commentaryId,
  //       [pType]: cState ? false : true,
  //     })
  //     .then((response) => {
  //       fetchData();
  //       dispatch(
  //         updateToastData({
  //           data: response?.message,
  //           title: response?.title,
  //           type: SUCCESS,
  //         })
  //       );
  //     })
  //     .catch((error) => {
  //       setIsLoading(false);
  //       dispatch(
  //         updateToastData({
  //           data: error?.message,
  //           title: error?.title,
  //           type: ERROR,
  //         })
  //       );
  //     });
  // };
  //table columns
  const columns = [
    {
          // title: (
          //   <div className="form-check">
          //     <input
          //       className="form-check-input"
          //       type="checkbox"
          //       name="chk_child"
          //       value="option1"
          //       checked={
          //         data?.length > 0 &&
          //         isEqual(checekedList?.sort(), dataIndexList?.sort())
          //       }
          //       onChange={() => {
          //         setCheckedList(
          //           isEqual(checekedList?.sort(), dataIndexList?.sort())
          //             ? []
          //             : dataIndexList
          //         );
          //       }}
          //     />
          //   </div>
          // ),
          render: (text, record) => (
            <div className="form-check d-flex align-items-center justify-between">
              <input
                className="form-check-input"
                type="checkbox"
                name="chk_child"
                value="option1"
                checked={checekedList.includes(record.commentaryId)}
                onChange={() => {
                  handleSingleCheck(record);
                }}
              />
            </div>
          ),
          key: "select",
          style: { width: "2%" },
    },
    {
      title: "Id",
      dataIndex: "commentaryId",
      key: "commentaryId",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Date",
      dataIndex: "eventDate",
      render: (text, record) => (
        <span>
          {convertDateUTCToLocal2_24(text, "index")}
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
      title: "Team1 Score",
      dataIndex: "team1Score",
      render: (text, record) => (
        <span>
          {text != null ? `${text} runs / ${record?.team1Wicket} wicket [${record?.team1Over} over]` : ""}
        </span>
      ),
      key: "team1Score",
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
      title: "Team2 Score",
      dataIndex: "team2Score",
      render: (text, record) => (
        <span>
          {text != null ? `${text} runs / ${record?.team2Wicket} wicket [${record?.team2Over} over]` : ""}
        </span>
      ),
      key: "team2Score",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Toss Won By",
      dataIndex: "tossWonTeam",
      key: "tossWonTeam",
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
    {
      title: "Result",
      dataIndex: "result",
      key: "result",
      sort: true,
      style: { width: "10%" },
    },
    // {
    //   title: "Count In Point",
    //   key: "isCountInPoint",
    //   render: (text, record) => (
    //     <Tooltip title={"Active/Inactive Count In Point"} color={"#e8e8ea"} overlayInnerStyle={{ color: '#000' }}>
    //       <Button
    //         color={`${record.isCountInPoint ? "primary" : "danger"}`}
    //         size="sm"
    //         className="btn"
    //         onClick={() => {
    //           handleIsCountInPoint("isCountInPoint", record, record?.isCountInPoint);
    //         }}
    //       >
    //         <i
    //           className={`bx ${record?.isCountInPoint ? "bx-check" : "bx-block"}`}
    //         ></i>
    //       </Button>
    //     </Tooltip>
    //   ),
    //   style: { width: "2%", textAlign: "center" },
    // },
  ];
  //elements required
  const tableElement = {
    title: "Event Result",
    competitionsSelect: true,
    teamsList:true,
    resetButton: true,
    reloadButton: true,
    isServerPagination: true,
    isNotCalculate: true,
    isDateRange: true,
  };

  useEffect(() => {
    // if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
    //   navigate("/dashboard");
    // }
    fetchData();
  },[isSearch, currentPage, pageSize]);

  useEffect(() => {
    fetchCompetitionData();
    fetchTeamData();
  }, []);

  const handleReset = (value) => {
    const newDateRange = {
      startDate: `${new Date().toISOString().split("T")[0]}T00:00:00`,
      endDate: `${new Date().toISOString().split("T")[0]}T23:59:00`,
    };

    setDateRange(newDateRange);
    setIsSearch(true)
    fetchData({
      ...value,
      startDate: convertDateLocalToUTC(newDateRange.startDate, "index"),
      endDate: convertDateLocalToUTC(newDateRange.endDate, "index"),
    });
    fetchCompetitionData();
    fetchTeamData();
  };

  const handleReload = (value) => {
    fetchData();
    // fetchCompetitionData();
    // fetchTeamData();
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
            noCalculateModelFunction={setCancelCalculateModelVisable}
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
            setCompetitionId={setCompetitionId}
          />
          <CancelCalculationModel
            cancelCalculateModelVisable={cancelCalculateModelVisable}
            setCancelCalculateModelVisable={setCancelCalculateModelVisable}
            handleNoCalculate={handleNoCalculate}
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