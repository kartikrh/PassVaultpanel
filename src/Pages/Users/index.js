import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { Button } from "reactstrap";
import { Container } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { useNavigate } from "react-router-dom";
import ChangePasswordModel from "../../components/Model/changePassword";
import DeleteTabModel from "../../components/Model/DeleteModel";
import axiosInstance from "../../Features/axios";
import { Tooltip } from 'antd';
import { oldSchoolCopy } from "../../Hooks/useCopyToClipboard";
import { isEqual, isEmpty } from "lodash";
import { ERROR, MODULE_USERS, PERMISSION_ADD, PERMISSION_DELETE, PERMISSION_EDIT, PERMISSION_VIEW, SUCCESS, TAB_USERS } from "../../components/Common/Const";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import { useDispatch, useSelector } from "react-redux";
import { updateToastData } from "../../Features/toasterSlice";
import LoadDataModal from "../../components/Model/LoadDataModal";

const Index = () => {
  const pageName = TAB_USERS
  const finalizeRef = useRef(null);
  document.title = "Event Types";
  const [data, setData] = useState([]);
  const [dataIndexList, setDataIndexList] = useState([]);
  const [clipboard, setClipboard] = useState(null);
  const [decryptedPasswords, setDecryptedPasswords] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [userId, setUserId] = useState("");
  const [changePasswordVisible, setChangPasswordModelVisible] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false)
  const [checekedList, setCheckedList] = useState([]);
  const [loadDataModelVisable, setLoadDataModelVisable] = useState(false);
  const globalPageSize = localStorage.getItem("pageSize");
  const [tableSearchedData, setTableSearchedData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(globalPageSize || 10);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const permissionObj = useSelector(state => state.auth?.tabPermissionList);

  const fetchData = async (latestValueFromTable) => {
    setIsLoading(true);
    const tableActions = finalizeRef.current.getTableAction()
    await axiosInstance
      .post(`/admin/user/all`, {
        ...(latestValueFromTable || tableActions)
      })
      .then((response) => {
        const apiData = response?.result?.sort((a,b)=>a?.userId - b?.userId);
        let apiDataIdList = [];
        apiData.forEach(ele => {
          apiDataIdList.push(ele?.userId)
        })
        setData(apiData);
        setDataIndexList(apiDataIdList)
        setChangPasswordModelVisible(false);
        setCheckedList([])
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
      });
  };

  const handleSingleCheck = (e) => {
    let updateSingleCheck = []
    if (checekedList.includes(e.userId)) {
      updateSingleCheck = checekedList.filter((item) => item !== e.userId);
    } else {
      updateSingleCheck = [...checekedList, e.userId];
    }
    setCheckedList(updateSingleCheck)
  };

  //permissions function
  const handlePermissions = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/user/save`, {
        userId: record.userId,
        [pType]: cState ? false : true,
      })
      .then((response) => {
        fetchData();
        dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
      })
      .catch((error) => {
        setIsLoading(false);
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
      });
  };

  const handleLoadData = async (password) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/loadPanelData`, {module: [MODULE_USERS], password})
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

  const handleDelete = async (e) => {
    setIsLoading(true);
    // e.preventDefault()
    await axiosInstance
      .post(`/admin/user/delete`, {
        userId: checekedList,
      })
      .then((response) => {
        fetchData();
        setDeleteModelVisable(false);
        dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
      })
      .catch((error) => {
        setIsLoading(false);
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
      });
  };

  const handleChangePassword = async () => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/user/save`, {
        password: password,
        userId: userId,
      })
      .then((response) => {
        dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
        setIsLoading(false);
        fetchData();
      })
      .catch((error) => {
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
        setIsLoading(false);
      });
  };

  const getDecryptedPassword = async (userId, copy = false) => {
    await axiosInstance
      .post(`/admin/user/decryptPassword`, {
        userId: userId,
      })
      .then((response) => {
        const password = response?.result?.password || "";
        if (copy) {
          navigator.clipboard.writeText(password)
            .then(res => setClipboard({ [userId]: password }))
            .catch(err => oldSchoolCopy(password))
            .finally(() => setTimeout(() => setClipboard(null), 2000))
        } else {
          setDecryptedPasswords(prev => ({ ...prev, [userId]: password }));
        }
      })
      .catch((error) => {
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
      });
  }

  const passwordRecord = (userId) => (<div className="d-flex align-items-center justify-content-between me-1">
    <span role="button" onClick={() => getDecryptedPassword(userId)} >*******</span>
    {clipboard?.[userId] ? <Tooltip placement="bottomLeft" open={true} title={"Copied!"} >
      <i role="button" onClick={() => getDecryptedPassword(userId, true)} className='bx bxs-copy'></i>
    </Tooltip> :
      <i role="button" onClick={() => getDecryptedPassword(userId, true)} className='bx bxs-copy'></i>
    }
  </div>)

  const handleEdit = (id) => {
    navigate("/addUsers", { state: { userId: id } });
  };

  //checkbox select
  const getSelectedItemsData = () => {
    const newCurrentPage = currentPage > 0 ? currentPage : 1;
    const startIndex = (newCurrentPage - 1) * pageSize;
    const endIndex = +startIndex + +pageSize;

    const sourceList = tableSearchedData && tableSearchedData.length > 0
      ? tableSearchedData.map(item => item.userId)
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
            // checked={data?.length > 0 && isEqual(checekedList?.sort(), dataIndexList?.sort())}
            // onChange={() => {
            //   setCheckedList(isEqual(checekedList?.sort(), dataIndexList?.sort()) ? [] : dataIndexList
            //   )
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
            checked={checekedList.includes(record.userId)}
            onChange={() => {
              handleSingleCheck(record);
            }}
          />
        </div>
      ), // Use 'select' as a placeholder key for the checkbox column
      key: "select",
      style: { width: "2%" },
    },
    checkPermission(permissionObj, pageName, PERMISSION_EDIT)
    && {
      title: "Edit",
      key: "edit",
      render: (text, record) => (
        <i
          className="bx bx-edit"
          onClick={() => {
            handleEdit(record.userId);
          }}
        ></i>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "User Name[Full Name]",
      dataIndex: "userName",
      render: (text, record) => (
        <span>
          {text} [{record?.name}]
        </span>
      ),
      key: "userName",
      sort: true,
      style: { width: "100%" },
    },
    {
      title: "Parent Name",
      dataIndex: "parentName",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>
          {record.parentId === "0" ? "Root" : (record?.parentName || null)}
        </span>
      ),
      key: "parentName",
      sort: true,
      style: { width: "100%" },
    },
    {
      title: "Role",
      dataIndex: "roleName",
      key: "roleName",
      sort: true,
      style: { width: "100%" },
    },
    {
      title: "Password",
      dataIndex: "password",
      render: (text, record) => (
        decryptedPasswords?.[record.userId] ?
          <Tooltip title={decryptedPasswords?.[record.userId]}>{passwordRecord(record.userId)}</Tooltip> :
          passwordRecord(record.userId)
      ),
      key: "password",
      sort: true,
      style: { width: "100%" },
      printType: "ignore"
    },
    {
      title: "Change Password",
      dataIndex: "cPassword",
      render: (text, record) => (
        <span
          style={{ cursor: "pointer" }}
          onClick={() => {
            setChangPasswordModelVisible(true);
            setUserId(record.userId);
          }}
        >
          <i className=" bx bx-show-alt" style={{ fontSize: "25px" }} />
        </span>
      ),
      key: "cPassword",
      sort: true,
      style: { width: "100%", textAlign: "center" },
      printType: "ignore"
    },
    {
      title: "Active",
      key: "isActive",
      dataIndex: "isActive",
      render: (text, record) => (
      <Tooltip title={"User"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
        <Button
          color={`${text ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          onClick={() => {
            handlePermissions("isActive", record, record.isActive);
          }}
        >
          {" "}
          <i className={`bx ${record.isActive ? "bx-check" : "bx-block"}`}></i>
        </Button>
      </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
  ];

  useEffect(() => {
    if (!isEmpty(permissionObj) && !checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard")
    }
    setIsLoading(true);
    fetchData({ isActive: true });
  }, [permissionObj]);
  //elements required
  const tableElement = {
    title: "Users",
    headerSelect: false,
    isActive: true,
    reloadButton: true,
    loadData: true,
  };

  const handleReload = (value) => {
    fetchData();
  };
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Users" />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            reFetchData={fetchData}
            handleReload={handleReload}
            loadDataModelFunction={setLoadDataModelVisable}
            setChangPasswordModelVisible={setChangPasswordModelVisible}
            deleteModelFunction={setDeleteModelVisable}
            singleCheck={checekedList}
            onAddNavigate={"/addUsers"}
            isAddPermission={checkPermission(permissionObj, pageName, PERMISSION_ADD)}
            isDeletePermission={checkPermission(permissionObj, pageName, PERMISSION_DELETE)}
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
          <ChangePasswordModel
            changePasswordVisible={changePasswordVisible}
            setChangPasswordModelVisible={setChangPasswordModelVisible}
            setPassword={setPassword}
            handleChangePassword={handleChangePassword}
          />
          {loadDataModelVisable && 
            <LoadDataModal
              loadDataModelVisable={loadDataModelVisable}
              setLoadDataModelVisable={setLoadDataModelVisable}
              handleLoadData={handleLoadData}
              moduleName={"Users"}
            />}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
