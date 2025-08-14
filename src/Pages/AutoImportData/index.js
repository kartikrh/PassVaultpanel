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
    ERROR,
  PERMISSION_DELETE,
  PERMISSION_EDIT,
  PERMISSION_VIEW,
  SUCCESS,
  TAB_AUTO_IMPORT,
} from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import { checkPermission, convertDateLocalToUTC, convertDateUtcFormat, convertDateUTCToLocal2 } from "../../components/Common/Reusables/reusableMethods";
import { isEmpty, isEqual } from "lodash";
import { updateToastData } from "../../Features/toasterSlice";
import { Tooltip } from "antd";
import { Button } from "reactstrap";

const Index = () => {
  const globalPageSize = localStorage.getItem("pageSize")
  const pageName = TAB_AUTO_IMPORT;
  const dispatch = useDispatch();
  const finalizeRef = useRef(null);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  document.title = "Auto Import";
  const [data, setData] = useState([]);
  const [checekedList, setCheckedList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addModelVisable, setAddModelVisable] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const [eventTypes, setEventTypes] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [commentary, setCommentary] = useState([]);
  const [eventTypeId, setEventTypeId] = useState(null);
  const [competitionId, setCompetitionId] = useState(null);
  const [isSearch, setIsSearch] = useState(true);
  const [dateType, setDateType] = useState({ label: "Local Timezone", value: 1 });
  const [dateRange, setDateRange] = useState({
    startDate: `${new Date().toISOString().split("T")[0]}T00:00:00`,
    endDate: `${new Date().toISOString().split("T")[0]}T23:59:00`,
  });
  const [cloneValues, setCloneValues] = useState({
      eventName: "",
      eventRefId: "",
  });
  const [dataIndexList, setDataIndexList] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(globalPageSize || 10);
  const [total, setTotal] = useState(0);
  const [selectedTableElements, setSelectedTableElements] = useState({
    eventType: null,
    competition: null,
    commentary: null,
  });

  const navigate = useNavigate();


  const fetchData = async (latestValueFromTable) => {
    setIsLoading(true);
    const tableActions = finalizeRef.current.getTableAction();
    const data = latestValueFromTable || tableActions
    let payload = {
      ...data,
      page: currentPage == 0 ? 1 : currentPage,
      limit: pageSize,
      }
    
    if (isSearch) {
      payload = {
        ...payload,
        startDate: convertDateLocalToUTC(dateRange?.startDate, "index"),
        endDate: convertDateLocalToUTC(dateRange?.endDate, "index"),
      };
    }
    await axiosInstance
      .post(`/admin/autoImportData/getAll`, payload)
      .then((response) => {
        const logsData = response?.result?.data?.sort((a,b)=>b?.id - a?.id);
        let logsDataIdList = [];
        logsData.forEach((ele) => {
          logsDataIdList.push(ele?.id);
        });
        setDataIndexList(logsDataIdList);
        setData(logsData);
        setTotal(response?.result?.totalRecords || 0); 
        setCheckedList([]);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
      });
    
  };

  const handleDelete = async (e) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/autoImportData/delete`, {
        id: checekedList,
      })
      .then((response) => {
        fetchData();
        setDeleteModelVisable(false);
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
  //table columns
  const columns = [
    {
      title: (
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            name="chk_child"
            value="option1"
            checked={
              data?.length > 0 &&
              isEqual(checekedList?.sort(), dataIndexList?.sort())
            }
            onChange={() => {
              setCheckedList(
                isEqual(checekedList?.sort(), dataIndexList?.sort())
                  ? []
                  : dataIndexList
              );
            }}
          />
        </div>
      ),
      render: (text, record) => (
        <div className={`form-check d-flex align-items-center justify-between ${
          checekedList.includes(record.id) ? "selected-row" : ""
        }`}>
          <input
            className="form-check-input"
            type="checkbox"
            name="chk_child"
            value="option1"
            checked={checekedList.includes(record.id)}
            onChange={() => {
              handleSingleCheck(record);
              if (!checekedList.includes(record.id)) {
                setCloneValues({
                  eventName: record?.eventName,
                  eventRefId: record?.eventRefId,
                });
              }
            }}
          />
          {/* <i className="bx bx-move ms-1 mt-1"></i> */}
        </div>
      ), // Use 'select' as a placeholder key for the checkbox column
      key: "select",
      style: { width: "2%" },
    },
    // checkPermission(permissionObj, pageName, PERMISSION_EDIT) && {
    //     title: "Edit",
    //     key: "edit",
    //     render: (text, record) => (
    //     <i
    //         className="bx bx-edit"
    //         onClick={() => {
    //         handleEdit(record.id);
    //         }}
    //     ></i>
    //     ),
    //     style: { width: "2%" },
    // },
    {
      title: "Date",
      dataIndex: "createdDate",
      render: (text, record) => (
        <span>
          {dateType?.value == 1
            ? convertDateUTCToLocal2(text, "index")
            : convertDateUtcFormat(text, "index")
          }
        </span>
      ),
      key: "createdDate",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Id",
      dataIndex: "id",
      key: "id",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Type",
      dataIndex: "refType",
      key: "refType",
      sort: true,
      style: { width: "10%" },
      render:(text, record) => (
        <div>{text == 1 ? "Cricket" : text == 2 ? "Competition" : text == 3 ? "Match" : text == 4 ? "Team" : text == 5 ? "Player" : ""}</div>
        ),
    },
    {
      title: "Source",
      dataIndex: "sourceId",
      key: "sourceId",
      sort: true,
      style: { width: "10%" },
      render:(text, record) => (
        <div>{text == 1 ? "Prediction" : text == 2 ? "Betfair" : text == 3 ? "EntitySport" : ""}</div>
      ),
    },
    {
      title: "Created By",
      dataIndex: "createdBy",
      key: "createdBy",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Ref Id",
      dataIndex: "refId",
      key: "refId",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Import",
      dataIndex: "isImported",
      key: "isImported",
      sort: true,
      render: (text, record) => (
        <Tooltip title={"isImported"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
          <Button
            color={`${record.isImported ? "primary" : "danger"}`}
            size="sm"
            className="btn"
            disabled
            // onClick={() => {
            //   // handlePermissions("isShowContent", record, record.isShowContent);
            // }}
          >
            {" "}
            <i className={`bx ${record.isImported ? "bx-check" : "bx-block"}`}></i>
          </Button>
        </Tooltip>
      ),
      style: { width: "10%" },
    },
    {
      title: "Import Start Time",
      dataIndex: "importStartTime",
      key: "importStartTime",
      sort: true,
      render: (text, record) => (
        <span>
          {dateType?.value == 1
            ? convertDateUTCToLocal2(text, "index")
            : convertDateUtcFormat(text, "index")
          }
        </span>
      ),
      style: { width: "10%" },
    },
    {
      title: "Import End Time",
      dataIndex: "importEndTime",
      key: "importEndTime",
      sort: true,
      render: (text, record) => (
        <span>
          {dateType?.value == 1
            ? convertDateUTCToLocal2(text, "index")
            : convertDateUtcFormat(text, "index")
          }
        </span>
      ),
      style: { width: "10%" },
    },

   
    // {
    //   title: "Import Start",
    //   dataIndex: "isImportStart",
    //   key: "isImportStart",
    //   sort: true,
    //   // render: (text, record) => (
    //   //   <span>
    //   //     {console.log("text", text, record)}
    //   //     {Boolean(record.isImportStart)}
    //   //   </span>
    //   // ),
    //   render: (text, record) => (
    //       <Tooltip title={"isImportStart"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
    //         <Button
    //           color={`${record.isImportStart ? "primary" : "danger"}`}
    //           size="sm"
    //           className="btn"
    //           disabled
    //           // onClick={() => {
    //           //   // handlePermissions("isShowContent", record, record.isShowContent);
    //           // }}
    //         >
    //           {" "}
    //           <i className={`bx ${record.isImportStart ? "bx-check" : "bx-block"}`}></i>
    //         </Button>
    //       </Tooltip>
    //   ),
    //   style: { width: "10%" },
    // },
  ];
  //elements required
  const tableElement = {
    title: "Auto Import",
    // eventTypeSelect: true,
    // competitionsSelect: true,
    // commentarySelect: true,
    resetButton: true,
    reloadButton: true,
    isServerPagination: true,
    isDateRange: true,
    isDateTypeSelect: true,
  };

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW) && !isEmpty(permissionObj)) {
      navigate("/dashboard");
    }
    fetchData();
  },[isSearch, currentPage, pageSize, permissionObj]);



  const handleReset = (value) => {
    setDateRange({
      startDate: `${new Date().toISOString().split("T")[0]}T00:00:00`,
      endDate: `${new Date().toISOString().split("T")[0]}T23:59:00`,
    })
    setIsSearch(true)
  };

  useEffect(() => {
    if (isSearch) {
      fetchData();
    }
  }, [isSearch, dateRange]);

  const handleReload = (value) => {
    fetchData();
    // fetchEventTypeData();
  };
  const handleSingleCheck = (e) => {
    let updateSingleCheck = [];
    if (checekedList.includes(e.id)) {
      updateSingleCheck = checekedList.filter(
        (item) => item !== e.id
      );
    } else {
      updateSingleCheck = [...checekedList, e.id];
    }
    setCheckedList(updateSingleCheck);
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Auto Import" />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={columns}
            dataSource={data}
            dataIndexList={dataIndexList}
            tableElement={tableElement}
            deleteModelFunction={setDeleteModelVisable}
            // deleteModelFunction={setDeleteModelVisable}
            eventTypes={eventTypes}
            competitions={competitions}
            commentary={commentary}
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
            setEventTypeId={setEventTypeId}
            setCompetitionId={setCompetitionId}
            dateType={dateType}
            setDateType={setDateType}
            isDeletePermission={checkPermission(
                permissionObj,
                pageName,
                PERMISSION_DELETE
            )}
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
          {/* {reqModelVisible && (
            <RequestModal
              isOpen={reqModelVisible}
              toggle={() => setReqModelVisible(!reqModelVisible)}
              data={reqBodyData}
              fetchData={fetchData}
            />
          )} */}
          {/* {resModelVisible && (
            <ResponseModal
              isOpen={resModelVisible}
              toggle={() => setResModelVisible(!resModelVisible)}
              data={resBodyData}
              fetchData={fetchData}
            />
          )} */}
        </Container>
      </div>
      <DeleteTabModel
            deleteModelVisable={deleteModelVisable}
            setDeleteModelVisable={setDeleteModelVisable}
            handleDelete={handleDelete}
            singleCheck={checekedList}
          />
    </React.Fragment>
  );
};

export default Index;
