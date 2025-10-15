import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { Tooltip } from "antd";
import { Button, Container } from "reactstrap";
import DeleteTabModel from "../../components/Model/DeleteModel";
import SpinnerModel from "../../components/Model/SpinnerModel";
import axiosInstance from "../../Features/axios";
import { useNavigate } from "react-router-dom";
import { isEqual, isEmpty } from "lodash";
import {
  WHITE_LABEL,
  PERMISSION_ADD,
  PERMISSION_DELETE,
  PERMISSION_EDIT,
  PERMISSION_VIEW,
  SUCCESS,
  ERROR,
  MODULE_WHITE_LABEL,
} from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import LoadDataModal from "../../components/Model/LoadDataModal";

const Index = () => {
  const pageName = WHITE_LABEL;
  const finalizeRef = useRef(null);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  document.title = WHITE_LABEL;
  const [data, setData] = useState([]);

  const [dataIndexList, setDataIndexList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const [checekedList, setCheckedList] = useState([]);
  const [loadDataModelVisable, setLoadDataModelVisable] = useState(false);
  const globalPageSize = localStorage.getItem("pageSize");
  const [tableSearchedData, setTableSearchedData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(globalPageSize || 10);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchData = async (latestValueFromTable) => {
    setIsLoading(true);
    const tableActions = finalizeRef.current.getTableAction();
    await axiosInstance
      .post(`/admin/whitelabel/all`, {
        ...(latestValueFromTable || tableActions),
      })
      .then((response) => {
        const apiData = response?.result;
        let apiDataIdList = [];
        apiData.forEach((ele) => {
          apiDataIdList.push(ele?.id);
        });
        setData(apiData);
        setDataIndexList(apiDataIdList);
        setCheckedList([]);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
      });
  };

  const handleSingleCheck = (e) => {
    let updateSingleCheck = [];
    if (checekedList.includes(e.id)) {
      updateSingleCheck = checekedList.filter((item) => item !== e.id);
    } else {
      updateSingleCheck = [...checekedList, e.id];
    }
    setCheckedList(updateSingleCheck);
  };

  const handlePermissions = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/whitelabel/activeInactive`, {
        id: record.id,
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

  const handleIsDemoClientEnableInIOS = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/whitelabel/demoClientEnableInIOS`, {
        id: record.id,
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

  const handleIsDemoClientLogin = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/whitelabel/demoClientLogin`, {
        id: record.id,
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

  const handleLoadData = async (password) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/loadPanelData`, { module: [MODULE_WHITE_LABEL], password })
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
    await axiosInstance
      .post(`/admin/whitelabel/delete`, {
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
  const handleEdit = (id) => {
    navigate("/addWhiteLabel", { state: { whiteLabelId: id } });
  };
  const handleReset = (value) => {
    fetchData(value);
  };

  const handleToggleDefault = async (record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/whitelabel/upIsDefault`, {
        id: record.id,
        isDefault: cState ? false : true,
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

  const handleShowHideClick = (id,domainName) => {
    // console.log(id,domainName)
    localStorage.setItem(
      "whiteLabelEventId",
      "" + id
    );
      localStorage.setItem(
      "whiteLabelDomain",
      "" + domainName
    );
    // console.log("id : ",id);
    navigate("/whiteLabelEventData", { state: { whiteLabelEventId: id,whiteLabelDomain :domainName } });

    // const url = new URL(window.location.origin + "/whiteLabelEventData");
    // window.open(url.href, "_blank");
  };

  //checkbox select
  const getSelectedItemsData = () => {
    const newCurrentPage = currentPage > 0 ? currentPage : 1;
    const startIndex = (newCurrentPage - 1) * pageSize;
    const endIndex = +startIndex + +pageSize;

    const sourceList = tableSearchedData && tableSearchedData.length > 0
      ? tableSearchedData.map(item => item.id)
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
            // indeterminate={
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
    checkPermission(permissionObj, pageName, PERMISSION_EDIT) && {
      title: "Edit",
      key: "edit",
      render: (text, record) => (
        <i
          className="bx bx-edit"
          onClick={() => {
            handleEdit(record.id);
          }}
        ></i>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Domain",
      dataIndex: "domain",
      key: "domain",
      style: { width: "10%" },
      sort: true,
    },
    {
      title: "Image",
      dataIndex: "imagePath",
      key: "imagePath",
      style: { width: "80%" },
      sort: true,
    },
    {
      title: "S/H",
      key: "getEventTypes",
      printType: "ignore",
      render: (text, record) => (
        <Tooltip
          title={"Show Hide"}
          color={"#e8e8ea"}
          overlayInnerStyle={{ color: "#000" }}
        >
          <Button
            color={"info"}
            size="sm"
            className="btn"
            onClick={() => {
              handleShowHideClick(record.id, record.domain);
            }}
          >
            <i class="bx bxs-up-arrow-square"></i>
          </Button>
        </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Demo Android",
      key: "isDemoClientLogin",
      render: (text, record) => (
        <Tooltip
          title={"Demo Android"}
          color={"#e8e8ea"}
          overlayInnerStyle={{ color: "#000" }}
        >
          <Button
            color={`${record.isDemoClientLogin ? "primary" : "danger"}`}
            size="sm"
            className="btn"
            onClick={() => {
              handleIsDemoClientLogin(
                "isDemoClientLogin",
                record,
                record.isDemoClientLogin
              );
            }}
          >
            <i
              className={`bx ${
                record.isDemoClientLogin ? "bx-check" : "bx-block"
              }`}
            ></i>
          </Button>
        </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Demo IOS",
      key: "isDemoClientEnableInIOS",
      render: (text, record) => (
        <Tooltip
          title={"Demo IOS"}
          color={"#e8e8ea"}
          overlayInnerStyle={{ color: "#000" }}
        >
          <Button
            color={`${record.isDemoClientEnableInIOS ? "primary" : "danger"}`}
            size="sm"
            className="btn"
            onClick={() => {
              handleIsDemoClientEnableInIOS(
                "isDemoClientEnableInIOS",
                record,
                record.isDemoClientEnableInIOS
              );
            }}
          >
            <i
              className={`bx ${
                record.isDemoClientEnableInIOS ? "bx-check" : "bx-block"
              }`}
            ></i>
          </Button>
        </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Active",
      key: "IsActive",
      render: (text, record) => (
        <Tooltip
          title={"White Label"}
          color={"#e8e8ea"}
          overlayInnerStyle={{ color: "#000" }}
        >
          <Button
            color={`${record.isActive ? "primary" : "danger"}`}
            size="sm"
            className="btn"
            onClick={() => {
              handlePermissions("isActive", record, record.isActive);
            }}
          >
            <i
              className={`bx ${record.isActive ? "bx-check" : "bx-block"}`}
            ></i>
          </Button>
        </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },

    {
      title: "reCATCH",
      key: "isRecatchEnable",
      render: (text, record) => (
        <Button color="primary" size="sm" className="btn" disabled={true}>
          <i
            className={`bx ${record.isRecatchEnable ? "bx-check" : "bx-block"}`}
          ></i>
        </Button>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Google Login",
      key: "isGoogleLogin",
      render: (text, record) => (
        <Button color="primary" size="sm" className="btn" disabled={true}>
          <i
            className={`bx ${record.isGoogleLogin ? "bx-check" : "bx-block"}`}
          ></i>
        </Button>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "FB Login",
      key: "isFacebookLogin",
      render: (text, record) => (
        <Button color="primary" size="sm" className="btn" disabled={true}>
          <i
            className={`bx ${record.isFacebookLogin ? "bx-check" : "bx-block"}`}
          ></i>
        </Button>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Mobile OTP",
      key: "isSendMobileOTP",
      render: (text, record) => (
        <Button color="primary" size="sm" className="btn" disabled={true}>
          <i
            className={`bx ${record.isSendMobileOTP ? "bx-check" : "bx-block"}`}
          ></i>
        </Button>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "OTP Type",
      dataIndex: "sendMobileOTPType",
      key: "sendMobileOTPType",
      render: (text, record) => {
        switch (record.sendMobileOTPType) {
          case 1:
            return "OTP Login";
          case 2:
            return "OTPless SDK";
          default:
            return "-";
        }
      },
      style: { width: "5%" },
    },
    {
      title: "Mail OTP",
      key: "isSendMailOTP",
      render: (text, record) => (
        <Button color="primary" size="sm" className="btn" disabled={true}>
          <i
            className={`bx ${record.isSendMailOTP ? "bx-check" : "bx-block"}`}
          ></i>
        </Button>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Mail Type",
      dataIndex: "sendMailType",
      key: "sendMailType",
      render: (text, record) => {
        switch (record.sendMailType) {
          case 1:
            return "Gmail";
          case 2:
            return "SMTP";
          default:
            return "-";
        }
      },
      style: { width: "5%" },
    },
    {
      title: "Recatch Key",
      dataIndex: "recatchKey",
      key: "recatchKey",
      style: { width: "10%" },
    },
    {
      title: "Google Key",
      dataIndex: "googleKey",
      key: "googleKey",
      style: { width: "10%" },
    },
    {
      title: "Facebook Key",
      dataIndex: "facebookKey",
      key: "facebookKey",
      style: { width: "10%" },
    },
    {
      title: "Mobile Google Firebase Key",
      dataIndex: "mobileGoogleFirebaseKey",
      key: "mobileGoogleFirebaseKey",
      style: { width: "10%" },
    },
    {
      title: "Mobile Google Firebase Url",
      dataIndex: "mobileGoogleFirebaseUrl",
      key: "mobileGoogleFirebaseUrl",
      style: { width: "10%" },
    },
    {
      title: "Mobile OTP Max Limit",
      dataIndex: "sendMobileOTPMaxSendLimit",
      key: "sendMobileOTPMaxSendLimit",
      style: { width: "10%" },
    },
    {
      title: "Mobile OTP Auth Key",
      dataIndex: "mobileOTPAuthKey",
      key: "mobileOTPAuthKey",
      style: { width: "10%" },
    },
    {
      title: "Mobile OTP Expiry Time",
      dataIndex: "mobileOTPExpired",
      key: "mobileOTPExpired",
      style: { width: "10%" },
    },
    {
      title: "Mobile Seamless OTP Key",
      dataIndex: "mobileSemlessOTPKey",
      key: "mobileSemlessOTPKey",
      style: { width: "10%" },
    },
    {
      title: "Mobile OTP SendUrl",
      dataIndex: "mobileOTPSendUrl",
      key: "mobileOTPSendUrl",
      style: { width: "10%" },
    },
    {
      title: "Mobile OTP Resend Url",
      dataIndex: "mobileOTPResendUrl",
      key: "mobileOTPResendUrl",
      style: { width: "10%" },
    },
    {
      title: "Mobile OTP Forgot Url",
      dataIndex: "mobileOTPForgotUrl",
      key: "mobileOTPForgotUrl",
      style: { width: "10%" },
    },
    {
      title: "Mobile OTP Verification Url",
      dataIndex: "mobileOTPVerify",
      key: "mobileOTPVerify",
      style: { width: "10%" },
    },
    {
      title: "Mail Max Send Limit",
      dataIndex: "sendMailMaxSendLimit",
      key: "sendMailMaxSendLimit",
      style: { width: "10%" },
    },
    {
      title: "Client OTP",
      dataIndex: "clientOTP",
      key: "sclientOTP",
      style: { width: "10%" },
    },
    {
      title: "Default",
      key: "isDefault",
      render: (text, record) => (
        <Tooltip
          title={"Set as Default"}
          color={"#e8e8ea"}
          overlayInnerStyle={{ color: "#000" }}
        >
          <Button
            color={`${record.isDefault ? "primary" : "danger"}`}
            size="sm"
            className="btn"
            onClick={() => {
              handleToggleDefault(record, record.isDefault);
            }}
          >
            <i
              className={`bx ${record.isDefault ? "bx-check" : "bx-block"}`}
            ></i>
          </Button>
        </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
  ];
  const tableElement = {
    title: "White Label",
    reloadButton: true,
    isActive: true,
    loadData: true,
  };

  useEffect(() => {
    if (!isEmpty(permissionObj) && !checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard");
    }
    fetchData();
  }, []);

  const handleReload = (value) => {
    fetchData();
  };
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="White Label" />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            deleteModelFunction={setDeleteModelVisable}
            singleCheck={checekedList}
            onAddNavigate={"/addWhiteLabel"}
            handleReset={handleReset}
            handleReload={handleReload}
            loadDataModelFunction={setLoadDataModelVisable}
            reFetchData={fetchData}
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
          {loadDataModelVisable && (
            <LoadDataModal
              loadDataModelVisable={loadDataModelVisable}
              setLoadDataModelVisable={setLoadDataModelVisable}
              handleLoadData={handleLoadData}
              moduleName={"White Label"}
            />
          )}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
