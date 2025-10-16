import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { Button } from "reactstrap";
import { Container } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import TabModel from "../../components/Model/AddTabModel";
import DeleteTabModel from "../../components/Model/DeleteModel";
import axiosInstance from "../../Features/axios";
import { useNavigate } from "react-router-dom";
import { isEqual, isEmpty } from "lodash";
import {
  ERROR,
  MODULE_CLIENTS,
  PERMISSION_ADD,
  PERMISSION_DELETE,
  PERMISSION_EDIT,
  PERMISSION_VIEW,
  SUCCESS,
  TAB_CLIENT,
} from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import {
  checkPermission,
  convertDateUtcFormat,
  convertDateUtcFormat24,
  convertDateUTCToLocal2,
  convertDateUTCToLocal2_24,
  convertDateUTCToLocalWithoutSec,
} from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import { Tooltip } from "antd";
import LoadDataModal from "../../components/Model/LoadDataModal";
import { oldSchoolCopy } from "../../Hooks/useCopyToClipboard";

const Index = () => {
  const pageName = TAB_CLIENT;
  const finalizeRef = useRef(null);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  document.title = "Registration Pending";
  const globalDateType = JSON.parse(localStorage.getItem("DateType"))
  const [data, setData] = useState([]);
  const [dataIndexList, setDataIndexList] = useState([]);
  const [checekedList, setCheckedList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addModelVisable, setAddModelVisable] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const [loadDataModelVisable, setLoadDataModelVisable] = useState(false);
  const [dateType, setDateType] = useState(globalDateType || {
    label: "Local Timezone",
    value: 1,
  });
  const globalPageSize = localStorage.getItem("pageSize");
  const [tableSearchedData, setTableSearchedData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(globalPageSize || 10);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  // const [visiblePasswords, setVisiblePasswords] = useState({});
  const [clipboard, setClipboard] = useState(null);
  const [decryptedPasswords, setDecryptedPasswords] = useState(null);

  const fetchData = async (latestValueFromTable) => {
    setIsLoading(true);
    const tableActions = finalizeRef.current.getTableAction();
    console.log({ tableActions });
    await axiosInstance
      .post(`/admin/client/all`, {
        ...(latestValueFromTable || tableActions),
        isUserActive: 0,
      })
      .then((response) => {
        const clientData = response?.result;
        let clientDataIdList = [];
        clientData.forEach((ele) => {
          clientDataIdList.push(ele?.clientId);
        });
        setData(clientData);
        setDataIndexList(clientDataIdList);
        setCheckedList([]);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
      });
  };

  const handlePermissions = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/client/activeInactiveClient`, {
        clientId: record.clientId,
        [pType]: cState ? false : true,
      })
      .then((response) => {
        fetchData();
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

  const handleSingleCheck = (e) => {
    let updateSingleCheck = [];
    if (checekedList.includes(e.clientId)) {
      updateSingleCheck = checekedList.filter((item) => item !== e.clientId);
    } else {
      updateSingleCheck = [...checekedList, e.clientId];
    }
    setCheckedList(updateSingleCheck);
  };

  const handleEdit = (clientId) => {
    navigate("/addRegistrationPending", { state: { clientId } });
  };

  const getProviderType = (status) => {
    switch (status) {
      case 1:
        return "Manual";
      case 2:
        return "Google";
      case 3:
        return "Facebook";
      case 4:
        return "OTP Less";
      default:
        return "Unknown";
    }
  };

  const getUserStatus = (status) => {
    switch (status) {
      case 0:
        return "Inactive";
      case 1:
        return "Active";
      default:
        return "Unknown";
    }
  };

  const getProcessStatus = (status) => {
    switch (status) {
      case 1:
        return "Added User Details";
      case 2:
        return "Mobile/Email Verified";
      case 3:
        return "Password set";
      default:
        return "";
    }
  };

  const getDecryptedPassword = async (clientId, copy = false) => {
    await axiosInstance
      .post(`/admin/client/decryptPassword`, {
        clientId: clientId,
      })
      .then((response) => {
        const password = response?.result?.password || "";
        if (copy) {
          navigator.clipboard.writeText(password)
            .then(res => setClipboard({ [clientId]: password }))
            .catch(err => oldSchoolCopy(password))
            .finally(() => setTimeout(() => setClipboard(null), 2000))
        } else {
          setDecryptedPasswords(prev => ({ ...prev, [clientId]: password }));
        }
      })
      .catch((error) => {
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
      });
  }

  const passwordRecord = (clientId) => (
    <div className="d-flex align-items-center justify-content-between me-1">
      <span role="button" onClick={() => getDecryptedPassword(clientId)} >******</span>
      {clipboard?.[clientId] ? 
        <Tooltip placement="bottomLeft" open={true} title={"Copied!"} >
          <i role="button" onClick={() => getDecryptedPassword(clientId, true)} className='bx bxs-copy'></i>
        </Tooltip> :
        <i role="button" onClick={() => getDecryptedPassword(clientId, true)} className='bx bxs-copy'></i>
      }
    </div>
  )

  // const togglePasswordVisibility = (recordKey) => {
  //   setVisiblePasswords((prev) => ({
  //     // Clear all other visible passwords and toggle only the clicked one
  //     [recordKey]: !prev[recordKey],
  //   }));
  // };

  //checkbox select
  const getSelectedItemsData = () => {
    const newCurrentPage = currentPage > 0 ? currentPage : 1;
    const startIndex = (newCurrentPage - 1) * pageSize;
    const endIndex = +startIndex + +pageSize;

    const sourceList = tableSearchedData && tableSearchedData.length > 0
      ? tableSearchedData.map(item => item.clientId)
      : dataIndexList;

    return sourceList.slice(startIndex, endIndex);
  };

  const handleSelectAllClick = () => {
    const currentItems = getSelectedItemsData();
    setCheckedList(
      isEqual(checekedList?.sort(), currentItems?.sort())
        ? []
        : currentItems
    );
  };

  const checkIfAllSelected = () => {
    const currentItems = getSelectedItemsData();
    return data?.length > 0 &&
      checekedList?.length > 0 &&
      isEqual(checekedList?.sort(), currentItems?.sort());
  };

  const handleTableSearchedDataChange = (data) => {
    setTableSearchedData(data);
    setCheckedList([]);
  };

  const handleCurrentPageChange = (page) => {
    setCurrentPage(page);
    setCheckedList([]);
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCheckedList([]);
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
        <div className="form-check d-flex align-items-center justify-between">
          <input
            className="form-check-input"
            type="checkbox"
            name="chk_child"
            value="option1"
            checked={checekedList.includes(record.clientId)}
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
    checkPermission(permissionObj, pageName, PERMISSION_EDIT) && {
      title: "Edit",
      key: "edit",
      render: (text, record) => (
        <i
          className="bx bx-edit"
          onClick={() => {
            handleEdit(record.clientId);
          }}
        ></i>
      ),
      style: { width: "2%" },
    },
    {
      title: "Date",
      dataIndex: "createdDate",
      render: (text, record) => (
        <span>
          {dateType?.value == 1
            ? convertDateUTCToLocal2_24(text, "index")
            : convertDateUtcFormat24(text, "index")}
        </span>
      ),
      key: "eventDate",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
      sort: true,
      style: { width: "20%" },
    },
    {
      title: "User Name",
      dataIndex: "userName",
      key: "userName",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Mobile No",
      dataIndex: "mobileNo",
      key: "mobileNo",
      render: (text, record) => (
        <div className="d-flex">
          {text}{" "}
          {text && (
            <button
              color={`${record.isMobileVerified ? "primary" : "danger"}`}
              size="xs"
              className="btn p-0 mx-1 d-flex justify-content-center align-items-center"
              disabled
              style={{ color: record.isMobileVerified ? "#0bb197" : "#ff3d60" }}
              // onClick={() => {
              //   handlePermissions("isMobileVerified", record, record.isMobileVerified);
              // }}
            >
              {" "}
              <i
                className={`bx ${
                  record.isMobileVerified ? "bx-check" : "bx-block"
                }`}
              ></i>
            </button>
          )}
        </div>
      ),
      sort: true,
      style: { width: "30%" },
    },
    // {
    //   title: "Delete",
    //   dataIndex: "isDelete",
    //   key: "isDelete",
    //   render: (text, record) => (
    //     <Button
    //       color={`${text ? "primary" : "danger"}`}
    //       size="sm"
    //       className="btn"
    //       disabled
    //       // onClick={() => {
    //       //   handlePermissions("isDelete", record, record.isDelete);
    //       // }}
    //     >
    //       {" "}
    //       <i className={`bx ${record.isDelete ? "bx-check" : "bx-block"}`}></i>
    //     </Button>
    //   ),
    //   style: { width: "2%", textAlign: "center" },
    // },
    {
      title: "Email Id",
      dataIndex: "emailId",
      key: "emailId",
      render: (text, record) => (
        <div className="d-flex mx-2">
          {text}{" "}
          {text && (
            <button
              color={`${record.isEmailVerified ? "primary" : "danger"}`}
              size="sm"
              className="btn p-0 mx-1 d-flex justify-content-center align-items-center"
              disabled
              style={{ color: record.isEmailVerified ? "#0bb197" : "#ff3d60" }}
              // onClick={() => {
              //   handlePermissions("isMobileVerified", record, record.isMobileVerified);
              // }}
            >
              {" "}
              <i
                className={`bx ${
                  record.isEmailVerified ? "bx-check" : "bx-block"
                }`}
              ></i>
            </button>
          )}
        </div>
      ),
      sort: true,
      style: { width: "30%" },
    },
    {
      title: "Password",
      dataIndex: "password",
      render: (text, record) => (
        decryptedPasswords?.[record.clientId] ? 
          <Tooltip title={decryptedPasswords?.[record.clientId]}>{passwordRecord(record.clientId)}</Tooltip> :
          passwordRecord(record.clientId)
      ),
      key: "password",
      sort: true,
      style: { width: "5%" },
      printType: "ignore"
    },
    // {
    //   title: "Password",
    //   dataIndex: "password",
    //   key: "password",
    //   render: (text, record) => {
    //     const isVisible = visiblePasswords[record.clientId];

    //     return (
    //       <div className="d-flex mx-2 align-items-center">
    //         <button
    //           type="button"
    //           className="btn btn-sm d-flex justify-content-center align-items-center"
    //           onClick={() => togglePasswordVisibility(record.clientId)}
    //           style={{
    //             backgroundColor: "transparent",
    //             border: "1px solid transparent",
    //             borderRadius: "4px",
    //             color: "#343a40",
    //             cursor: "pointer",
    //             padding: "4px 8px",
    //             fontSize: "14px",
    //           }}
    //         >
    //           <i
    //             className={`bx ${isVisible ? "bx-hide" : "bx-show"}`}
    //             style={{ fontSize: "18px" }}
    //           ></i>
    //         </button>
    //         <span className="me-2">
    //           {isVisible ? record.decryptPassword : record.password}
    //         </span>
    //       </div>
    //     );
    //   },
    //   style: { width: "15%" },
    // },
    // {
    //   title: "Email Verified",
    //   dataIndex: "isEmailVerified",
    //   key: "isEmailVerified",
    //   render: (text, record) => (
    //     <Button
    //       color={`${text ? "primary" : "danger"}`}
    //       size="sm"
    //       className="btn"
    //       disabled
    //       // onClick={() => {
    //       //   handlePermissions("isEmailVerified", record, record.isEmailVerified);
    //       // }}
    //     >
    //       {" "}
    //       <i
    //         className={`bx ${record.isEmailVerified ? "bx-check" : "bx-block"}`}
    //       ></i>
    //     </Button>
    //   ),
    //   style: { width: "2%", textAlign: "center" },
    // },

    // {
    //   title: "Mobile Verified",
    //   dataIndex: "isMobileVerified",
    //   key: "isMobileVerified",
    //   render: (text, record) => (
    //     <Button
    //       color={`${text ? "primary" : "danger"}`}
    //       size="sm"
    //       className="btn"
    //       disabled
    //       // onClick={() => {
    //       //   handlePermissions("isMobileVerified", record, record.isMobileVerified);
    //       // }}
    //     >
    //       {" "}
    //       <i
    //         className={`bx ${
    //           record.isMobileVerified ? "bx-check" : "bx-block"
    //         }`}
    //       ></i>
    //     </Button>
    //   ),
    //   style: { width: "10%", textAlign: "center" },
    // },

    {
      title: "Process Status",
      dataIndex: "registrationProcessStatus",
      render: (text, record) => (
        <span>{getProcessStatus(record?.registrationProcessStatus)}</span>
      ),
      key: "registrationProcessStatus",
      sort: true,
      style: { width: "5%", textAlign: "center" },
    },
    {
      title: "User Status",
      dataIndex: "isUserActive",
      render: (text, record) => (
        <span>{getUserStatus(record?.isUserActive)}</span>
      ),
      key: "isUserActive",
      sort: true,
      style: { width: "5%", textAlign: "center" },
    },
    {
      title: "Provider",
      dataIndex: "provider",
      render: (text, record) => (
        <span>{getProviderType(record?.provider)}</span>
      ),
      key: "provider",
      sort: true,
      style: { width: "5%", textAlign: "center" },
    },
    {
      title: "Active",
      key: "isActive",
      dataIndex: "isActive",
      render: (text, record) => (
        <Tooltip
          title={"User"}
          color={"#e8e8ea"}
          overlayInnerStyle={{ color: "#000" }}
        >
          <Button
            color={`${text ? "primary" : "danger"}`}
            size="sm"
            className="btn"
            onClick={() => {
              handlePermissions("isActive", record, record.isActive);
            }}
          >
            {" "}
            <i
              className={`bx ${record.isActive ? "bx-check" : "bx-block"}`}
            ></i>
          </Button>
        </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Allow Multi Login",
      dataIndex: "isAllowMultiLogin",
      key: "isAllowMultiLogin",
      render: (text, record) => (
        <Button
          color={`${text ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          disabled
          // onClick={() => {
          //   handlePermissions("isAllowMultiLogin", record, record.isAllowMultiLogin);
          // }}
        >
          {" "}
          <i
            className={`bx ${
              record.isAllowMultiLogin ? "bx-check" : "bx-block"
            }`}
          ></i>
        </Button>
      ),
      style: { width: "2%", textAlign: "center" },
    },
  ];
  //elements required
  const tableElement = {
    title: "Registration Pending",
    headerSelect: false,
    isActive: true,
    reloadButton: true,
    clone: false,
    loadData: true,
    isDateTypeSelect: true,
  };

  const handleLoadData = async (password) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/loadPanelData`, { module: [MODULE_CLIENTS], password })
      .then((response) => {
        fetchData();
        setLoadDataModelVisable(false);
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

  //delete row
  const handleDelete = async (e) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/client/delete`, {
        clientId: checekedList,
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
  useEffect(() => {
    if (!isEmpty(permissionObj) && !checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard");
    }
    fetchData();
  }, [permissionObj]);

  const handleReload = (value) => {
    fetchData();
  };
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs
            title="ScoreCard"
            breadcrumbItem="Registration Pending"
          />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            deleteModelFunction={setDeleteModelVisable}
            singleCheck={checekedList}
            reFetchData={fetchData}
            handleReload={handleReload}
            loadDataModelFunction={setLoadDataModelVisable}
            onAddNavigate={"/addRegistrationPending"}
            isAddPermission={checkPermission(
              permissionObj,
              pageName,
              PERMISSION_ADD
            )}
            isDeletePermission={checkPermission(
              permissionObj,
              pageName,
              PERMISSION_DELETE
            )}
            defaultTableActionData={{ isActive: false }}
            dateType={dateType}
            setDateType={setDateType}
            setParentCurrentPage={handleCurrentPageChange}
            setParentPageSize={handlePageSizeChange}
            setParentSearchedData={handleTableSearchedDataChange}
          />
          <DeleteTabModel
            deleteModelVisable={deleteModelVisable}
            setDeleteModelVisable={setDeleteModelVisable}
            handleDelete={handleDelete}
            singleCheck={checekedList}
          />
          <TabModel
            addModelVisable={addModelVisable}
            setAddModelVisable={setAddModelVisable}
          />
          {loadDataModelVisable && (
            <LoadDataModal
              loadDataModelVisable={loadDataModelVisable}
              setLoadDataModelVisable={setLoadDataModelVisable}
              handleLoadData={handleLoadData}
              moduleName={"Registration Pending"}
            />
          )}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
