import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { Tooltip } from "antd";
import { Button, Container } from "reactstrap";
import DeleteTabModel from "../../components/Model/DeleteModel";
import SpinnerModel from "../../components/Model/SpinnerModel";
import axiosInstance from "../../Features/axios";
import { useNavigate } from "react-router-dom";
import { isEmpty, isEqual } from "lodash";
import { TAB_PAYMENT_METHOD, PERMISSION_ADD, PERMISSION_DELETE, PERMISSION_EDIT, PERMISSION_VIEW, SUCCESS, ERROR } from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";

const Index = () => {
  const pageName = TAB_PAYMENT_METHOD;
  const finalizeRef = useRef(null);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  document.title = TAB_PAYMENT_METHOD;
  const [data, setData] = useState([]);
  const [dataIndexList, setDataIndexList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const [checekedList, setCheckedList] = useState([]);
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
      .post(`/admin/paymentMethod/all`, {
        ...(latestValueFromTable || tableActions),
      })
      .then((response) => {
        const apiData = response?.result?.sort((a, b) => a?.id - b?.id) || [];
        setData(apiData);
        setDataIndexList(apiData.map((ele) => ele?.id));
        setCheckedList([]);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  };

  const handleSingleCheck = (e) => {
    setCheckedList(
      checekedList.includes(e.id)
        ? checekedList.filter((item) => item !== e.id)
        : [...checekedList, e.id]
    );
  };

  const handlePermissions = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`${pType === "isActive" ? "/admin/paymentMethod/activeInactive" : "/admin/paymentMethod/isDefault"}`, {
        id: record.id,
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

  const handleDelete = async () => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/paymentMethod/delete`, { id: checekedList })
      .then((response) => {
        fetchData();
        setDeleteModelVisable(false);
        dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
        setCheckedList([]);
      })
      .catch((error) => {
        setIsLoading(false);
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
        setCheckedList([]);
      });
  };

  const handleEdit = (id) => {
    navigate("/addPaymentMethod", { state: { paymentMethodId: id } });
  };

  const handleReset = (value) => {
    fetchData(value);
  };

  const getSelectedItemsData = () => {
    const newCurrentPage = currentPage > 0 ? currentPage : 1;
    const startIndex = (newCurrentPage - 1) * pageSize;
    const endIndex = +startIndex + +pageSize;
    const sourceList =
      tableSearchedData && tableSearchedData.length > 0
        ? tableSearchedData.map((item) => item.id)
        : dataIndexList;
    return sourceList.slice(startIndex, endIndex);
  };

  const handleSelectAllClick = () => {
    const currentItems = getSelectedItemsData();
    setCheckedList(isEqual(checekedList?.sort(), currentItems?.sort()) ? [] : currentItems);
  };

  const checkIfAllSelected = () => {
    const currentItems = getSelectedItemsData();
    return data?.length > 0 && checekedList?.length > 0 && isEqual(checekedList?.sort(), currentItems?.sort());
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
            checked={checkIfAllSelected()}
            onChange={handleSelectAllClick}
          />
        </div>
      ),
      render: (text, record) => (
        <div className="form-check d-flex align-items-center justify-between">
          <input
            className="form-check-input"
            type="checkbox"
            checked={checekedList.includes(record.id)}
            onChange={() => handleSingleCheck(record)}
          />
        </div>
      ),
      key: "select",
      style: { width: "2%" },
    },
    checkPermission(permissionObj, pageName, PERMISSION_EDIT) && {
      title: "Edit",
      key: "edit",
      render: (text, record) => <i className="bx bx-edit" onClick={() => handleEdit(record.id)}></i>,
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      style: { width: "10%" },
    },
    {
      title: "Label",
      dataIndex: "label",
      key: "label",
      sort: true,
      style: { width: "20%" },
    },
    {
      title: "Details",
      key: "details",
      render: (text, record) =>
        record.type === "QR" ? (
          <span>{record.upiId || record.qrImageUrl}</span>
        ) : (
          <span>
            {record.bankName} · {record.accountNumber}
          </span>
        ),
      style: { width: "35%" },
    },
    {
      title: "Active",
      key: "isActive",
      render: (text, record) => (
        <Tooltip title={"Payment Method"} color={"#e8e8ea"} overlayInnerStyle={{ color: "#000" }}>
          <Button
            color={`${record.isActive ? "primary" : "danger"}`}
            size="sm"
            className="btn"
            onClick={() => handlePermissions("isActive", record, record.isActive)}
          >
            <i className={`bx ${record.isActive ? "bx-check" : "bx-block"}`}></i>
          </Button>
        </Tooltip>
      ),
      style: { width: "10%", textAlign: "center" },
    },
    {
      title: "Default",
      key: "isDefault",
      render: (text, record) => (
        <Tooltip title={"Set as Default"} color={"#e8e8ea"} overlayInnerStyle={{ color: "#000" }}>
          <Button
            color={`${record.isDefault ? "primary" : "danger"}`}
            size="sm"
            className="btn"
            onClick={() => handlePermissions("isDefault", record, record.isDefault)}
          >
            <i className={`bx ${record.isDefault ? "bx-check" : "bx-block"}`}></i>
          </Button>
        </Tooltip>
      ),
      style: { width: "10%", textAlign: "center" },
    },
  ];

  const tableElement = {
    title: "Payment Method",
    isActive: true,
    reloadButton: true,
  };

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW) && !isEmpty(permissionObj)) {
      navigate("/dashboard");
    }
    fetchData();
  }, [permissionObj]);

  const handleReload = () => {
    fetchData();
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="Vault" breadcrumbItem="Payment Method" />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            deleteModelFunction={setDeleteModelVisable}
            singleCheck={checekedList}
            onAddNavigate={"/addPaymentMethod"}
            handleReset={handleReset}
            reFetchData={fetchData}
            handleReload={handleReload}
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
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
