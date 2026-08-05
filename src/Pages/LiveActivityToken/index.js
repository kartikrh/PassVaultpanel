import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { Container } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import axiosInstance from "../../Features/axios";
import { useNavigate } from "react-router-dom";
import {
  LIVE_ACTIVITY_TOKEN,
  ERROR,
  PERMISSION_VIEW,
  SUCCESS,
  PERMISSION_DELETE
} from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import { checkPermission, convertDateLocalToUTC, convertDateUtcFormat, convertDateUtcFormat24, convertDateUTCToLocal2, convertDateUTCToLocal2_24 } from "../../components/Common/Reusables/reusableMethods";
import { isEmpty, isEqual } from "lodash";
import { updateToastData } from "../../Features/toasterSlice";
import DeleteTabModel from "../../components/Model/DeleteModel";

const Index = () => {
  const storedPageSize = localStorage.getItem("pageSize");
  const storedDateType = localStorage.getItem("DateType");
  let parsedDateType = null;

  try {
    parsedDateType = storedDateType ? JSON.parse(storedDateType) : null;
  } catch (error) {
    console.error("Error parsing DateType from localStorage:", error);
  }

  const globalPageSize = storedPageSize || 10;
  const globalDateType = parsedDateType;
  const pageName = LIVE_ACTIVITY_TOKEN;
  const dispatch = useDispatch();
  const finalizeRef = useRef(null);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  document.title = LIVE_ACTIVITY_TOKEN;
  const [data, setData] = useState([]);
  const [checekedList, setCheckedList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearch, setIsSearch] = useState(true);
  const [dateType, setDateType] = useState(globalDateType || { label: "Local Timezone", value: 1 });
  const [dateRange, setDateRange] = useState({
    startDate: `${new Date().toISOString().split("T")[0]}T00:00:00`,
    endDate: `${new Date().toISOString().split("T")[0]}T23:59:00`,
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(globalPageSize || 10);
  const [total, setTotal] = useState(0);
  const [selectedTableElements, setSelectedTableElements] = useState({
    envType: null,
    clientSocketId: null
  });
  const [tableSearchedData, setTableSearchedData] = useState([]);
  const [clientSocketList, setClientSocketList] = useState([]);
  const [commentaryOptions, setCommentaryOptions] = useState([]);
  const [dataIndexList, setDataIndexList] = useState([]);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);

  const navigate = useNavigate();

  const fetchCommentaryEvents = async () => {
    try {
      const response = await axiosInstance.post("admin/notification/eventList", {});
      if (response?.result) {
        const mapped = response.result.map((item) => ({
          label: `${item.eventName} - ${item.eventRefId} - ${convertDateUTCToLocal2_24(item?.eventDate, "index")}`,
          value: item.commentaryId,
        }));
        setCommentaryOptions([{ label: "Select Commentary Type", value: null }, ...mapped]);
      }
    } catch (error) {
      console.error("Error fetching commentary events:", error);
    }
  };

  const fetchData = async (latestValueFromTable) => {
    setIsLoading(true);
    const tableActions = finalizeRef?.current?.getTableAction?.() || {};
    const tableData = latestValueFromTable || tableActions;
    let payload = {
      ...tableData,
      page: currentPage == 0 ? 1 : currentPage,
      limit: Number(pageSize)
    }

    if (isSearch) {
      payload = {
        ...payload,
        startDate: convertDateLocalToUTC(dateRange?.startDate, "index"),
        endDate: convertDateLocalToUTC(dateRange?.endDate, "index"),
      };
    }
    await axiosInstance
      .post(`/admin/liveActivityToken/getAll`, payload)
      .then((response) => {
        const tokenData = response?.result?.data?.sort((a, b) => b?.id - a?.id);
        let logsDataIdList = [];
        tokenData.forEach((ele) => {
          logsDataIdList.push(ele?.id);
        });
        setDataIndexList(logsDataIdList);
        setData(tokenData);
        setTotal(response?.result?.total || 0);
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
      .post(`/admin/liveActivityToken/delete`, {
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

  const handleTableSearchedDataChange = (data) => {
    setTableSearchedData(data);
    setCheckedList([]);
  };

  const mapEnvType = (envType) => {
    switch (parseInt(envType)) {
      case 1:
        return "Production";
      case 2:
        return "Sandbox";
      default:
        return "-";
    }
  }

  //checkbox select
  const getSelectedItemsData = () => {
    return tableSearchedData && tableSearchedData.length > 0
      ? tableSearchedData.map(item => item.id)
      : dataIndexList;
  };

  const checkIfAllSelected = () => {
    const currentItems = getSelectedItemsData();
    return data?.length > 0 &&
      checekedList?.length > 0 &&
      isEqual(checekedList?.sort(), currentItems?.sort());
  };

  const handleSelectAllClick = () => {
    const currentItems = getSelectedItemsData();
    setCheckedList(
      isEqual(checekedList?.sort(), currentItems?.sort())
        ? []
        : currentItems
    );
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
            checked={checkIfAllSelected()}
            onChange={handleSelectAllClick}
          // checked={
          //   data?.length > 0 &&
          //   isEqual(checekedList?.sort(), dataIndexList?.sort())
          // }
          // onChange={() => {
          //   setCheckedList(
          //     isEqual(checekedList?.sort(), dataIndexList?.sort())
          //       ? []
          //       : dataIndexList
          //   );
          // }}
          />
        </div>
      ),
      render: (text, record) => (
        <div className={`form-check d-flex align-items-center justify-between ${checekedList.includes(record.id) ? "selected-row" : ""
          }`}>
          <input
            className="form-check-input"
            type="checkbox"
            name="chk_child"
            value="option1"
            checked={checekedList.includes(record.id)}
            onChange={() => {
              handleSingleCheck(record);
            }}
          />
          {/* <i className="bx bx-move ms-1 mt-1"></i> */}
        </div>
      ), // Use 'select' as a placeholder key for the checkbox column
      key: "select",
      style: { width: "2%" },
    },
    {
      title: "Id",
      dataIndex: "id",
      key: "id",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Username",
      dataIndex: "userName",
      key: "userName",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Event Name",
      dataIndex: "eventName",
      key: "eventName",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "ENV Type",
      dataIndex: "envType",
      key: "envType",
      sort: true,
      style: { width: "10%" },
      render: (text, record) => <span>{mapEnvType(text)}</span>,
    },
    {
      title: "Client Socket",
      dataIndex: "serverName",
      key: "serverName",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Bundle",
      dataIndex: "bundleId",
      key: "bundleId",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Token",
      dataIndex: "apnsToken",
      key: "apnsToken",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Created Date",
      dataIndex: "createdAt",
      render: (text, record) => (
        <span>
          {dateType?.value == 1
            ? convertDateUTCToLocal2_24(text, "index")
            : convertDateUtcFormat24(text, "index")
          }
        </span>
      ),
      key: "createdAt",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Expire Date",
      dataIndex: "expiresAt",
      render: (text, record) => (
        <span>
          {dateType?.value == 1
            ? convertDateUTCToLocal2_24(text, "index")
            : convertDateUtcFormat24(text, "index")
          }
        </span>
      ),
      key: "expiresAt",
      sort: true,
      style: { width: "10%" },
    }
  ];

  //elements required
  const tableElement = {
    title: LIVE_ACTIVITY_TOKEN,
    resetButton: true,
    reloadButton: true,
    isServerPagination: true,
    isDateRange: true,
    isDateTypeSelect: true,
    apnsEnvTypeSelect: true,
    clientSocketSelect: true,
    commentaryTypeSelect: true,
    commentaryTypeOptions: commentaryOptions
  };

  const fetchClientSocketData = async () => {
    await axiosInstance
      .post(`/admin/clientSocket/all`, {
        isActive: true,
      })
      .then((response) => {
        setClientSocketList(response.result?.map((item) => ({
          value: item?.clientSocketId,
          label: item?.serverName
        })));
      })
      .catch((error) => { });
  }

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW) && !isEmpty(permissionObj)) {
      navigate("/dashboard");
      return;
    }
    fetchData();
  }, [currentPage, pageSize, permissionObj, isSearch, dateRange.startDate, dateRange.endDate]);

  useEffect(() => {
    fetchClientSocketData();
    fetchCommentaryEvents();
  }, []);

  const handleReset = (value) => {
    setDateRange({
      startDate: `${new Date().toISOString().split("T")[0]}T00:00:00`,
      endDate: `${new Date().toISOString().split("T")[0]}T23:59:00`,
    })
    setIsSearch(true)
  };

  const handleReload = (value) => {
    fetchData();
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
          <Breadcrumbs title="ScoreCard" breadcrumbItem={LIVE_ACTIVITY_TOKEN} />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            singleCheck={checekedList}
            clientSocketList={clientSocketList}
            reFetchData={fetchData}
            selectedTableElementsLogs={selectedTableElements}
            handleReset={handleReset}
            handleReload={handleReload}
            setDateRange={setDateRange}
            dateRange={dateRange}
            serverCurrentPage={currentPage}
            serverPageSize={pageSize}
            serverTotal={total}
            // setServerCurrentPage={setCurrentPage}
            // setServerPageSize={setPageSize}
            setServerCurrentPage={(value) => {
              setCheckedList([]);
              setTableSearchedData([]);
              setCurrentPage(value);
            }}
            setServerPageSize={(value) => {
              setCheckedList([]);
              setTableSearchedData([]);
              setPageSize(value);
            }}
            setParentSearchedData={handleTableSearchedDataChange}
            isSearch={isSearch}
            setIsSearch={setIsSearch}
            dateType={dateType}
            setDateType={setDateType}
            isDeletePermission={checkPermission(
              permissionObj,
              pageName,
              PERMISSION_DELETE
            )}
            deleteModelFunction={setDeleteModelVisable}
          />
          <DeleteTabModel
            deleteModelVisable={deleteModelVisable}
            setDeleteModelVisable={setDeleteModelVisable}
            handleDelete={handleDelete}
            singleCheck={checekedList}
          />
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
