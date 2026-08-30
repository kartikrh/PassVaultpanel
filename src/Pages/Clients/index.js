import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import DeleteTabModel from "../../components/Model/DeleteModel";
import { Tooltip } from "antd";
import { Button, Container } from "reactstrap";
import Select from "react-select";
import SpinnerModel from "../../components/Model/SpinnerModel";
import axiosInstance from "../../Features/axios";
import { useNavigate } from "react-router-dom";
import { isEmpty, debounce } from "lodash";
import {
  TAB_VAULT_CLIENTS,
  PERMISSION_EDIT,
  PERMISSION_VIEW,
  PERMISSION_DELETE,
  SUCCESS,
  ERROR,
} from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import {
  checkPermission,
  convertDateUTCToLocalWithSec24,
  convertDateUtcFormatWithSec24,
  convertDateLocalToUTC,
} from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";

const STATUS_OPTIONS = [
  { value: "", label: "Select Status" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
];

// Vault feature: staff-facing "Clients" screen (spec section 4). List/search/filter
// by plan and status; no vault content (passwords, entries) ever appears here.
const Index = () => {
  const pageName = TAB_VAULT_CLIENTS;
  const finalizeRef = useRef(null);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  document.title = "Clients";
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [checekedList, setCheckedList] = useState([]);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const globalPageSize = localStorage.getItem("pageSize");
  const [tableSearchedData, setTableSearchedData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(globalPageSize || 10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [packageId, setPackageId] = useState("");
  const [packages, setPackages] = useState([]);
  const globalDateType = JSON.parse(localStorage.getItem("DateType"));
  const [dateType, setDateType] = useState(
    globalDateType || { label: "Local Timezone", value: 1 }
  );
  const [isSearch, setIsSearch] = useState(false);
  const defaultDateRange = () => ({
    startDate: `${new Date().toISOString().split("T")[0]}T00:00:00`,
    endDate: `${new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]}T23:59:00`,
  });
  const [dateRange, setDateRange] = useState(defaultDateRange());

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchClients = async (filters) => {
    setIsLoading(true);
    const payload = {
      search: filters.search || undefined,
      status: filters.status || undefined,
      packageId: filters.packageId || undefined,
    };
    if (filters.isSearch) {
      payload.startDate = convertDateLocalToUTC(filters.dateRange?.startDate);
      payload.endDate = convertDateLocalToUTC(filters.dateRange?.endDate);
    }
    await axiosInstance
      .post(`/vault/admin/clients/all`, payload)
      .then((response) => {
        setData(response?.result || []);
        setCheckedList([]);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
      });
  };

  const handleSingleCheck = (record) => {
    setCheckedList((prev) =>
      prev.includes(record.clientId)
        ? prev.filter((id) => id !== record.clientId)
        : [...prev, record.clientId]
    );
  };

  // Soft delete (see PassVaultapi services/adminVaultClients.js/deleteClientsAdminService)
  // -- flips wrIsDeleted, blocks the client's login, keeps their encrypted vault data intact.
  const handleDelete = async () => {
    setIsLoading(true);
    await axiosInstance
      .post(`/vault/admin/clients/delete`, { clientId: checekedList })
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

  // Table's reFetchData/handleReload call this with its own internal table-state
  // object (pagination/sort), not filter values, so ignore any args and always read
  // the current filter state from the closure -- same pattern as History/index.js.
  const fetchData = async () => {
    fetchClients({ search, status, packageId, isSearch, dateRange });
  };

  const fetchPackages = async () => {
    await axiosInstance
      .post(`/admin/package/all`, {})
      .then((response) => {
        setPackages(response?.result || []);
      })
      .catch(() => {});
  };

  // Debounced so typing in Name/Email doesn't fire an API call per keystroke;
  // Status/Plan (dropdowns) call immediately since they change less often.
  const debouncedSearchRef = useRef(null);
  if (!debouncedSearchRef.current) {
    debouncedSearchRef.current = debounce(
      (value, currentStatus, currentPackageId, currentIsSearch, currentDateRange) => {
        fetchClients({
          search: value,
          status: currentStatus,
          packageId: currentPackageId,
          isSearch: currentIsSearch,
          dateRange: currentDateRange,
        });
      },
      400
    );
  }

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    debouncedSearchRef.current(value, status, packageId, isSearch, dateRange);
  };

  const handleStatusChange = (option) => {
    const newStatus = option?.value || "";
    setStatus(newStatus);
    fetchClients({ search, status: newStatus, packageId, isSearch, dateRange });
  };

  const handlePackageChange = (option) => {
    const newPackageId = option?.value || "";
    setPackageId(newPackageId);
    fetchClients({ search, status, packageId: newPackageId, isSearch, dateRange });
  };

  // Wired to Table's own Reset button (rendered after Search in the date-range
  // row) via renderCustomFilter/handleCustomReset -- see Table/index.js
  // handleTableReset, which defers to this instead of its built-in reset when
  // both props are supplied.
  const handleCustomReset = () => {
    setSearch("");
    setStatus("");
    setPackageId("");
    setIsSearch(false);
    const resetRange = defaultDateRange();
    setDateRange(resetRange);
    fetchClients({ search: "", status: "", packageId: "", isSearch: false, dateRange: resetRange });
  };

  const handleToggleStatus = async (record) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/vault/admin/clients/updateStatus`, {
        clientId: record.clientId,
        isActive: !record.isActive,
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

  const handleView = (id) => {
    navigate("/clientDetail", { state: { clientId: id } });
  };

  const handleTableSearchedDataChange = (data) => {
    setTableSearchedData(data);
  };

  const columns = [
    checkPermission(permissionObj, pageName, PERMISSION_DELETE) && {
      title: (
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            name="chk_child"
            value="option1"
            checked={data?.length > 0 && checekedList.length === data.length}
            onChange={() =>
              setCheckedList(checekedList.length === data.length ? [] : data.map((item) => item.clientId))
            }
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
            onChange={() => handleSingleCheck(record)}
          />
        </div>
      ),
      key: "select",
      style: { width: "2%" },
    },
    checkPermission(permissionObj, pageName, PERMISSION_VIEW) && {
      title: "View",
      key: "view",
      render: (text, record) => (
        <i
          className="bx bx-show"
          style={{ cursor: "pointer" }}
          onClick={() => handleView(record.clientId)}
        ></i>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sort: true,
      style: { width: "20%" },
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sort: true,
      style: { width: "25%" },
    },
    {
      title: "Plan",
      dataIndex: "packageName",
      key: "packageName",
      render: (text) => <span>{text || "-"}</span>,
      style: { width: "15%" },
    },
    {
      title: "Create Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => (
        <span>
          {text
            ? dateType?.value == 1
              ? convertDateUTCToLocalWithSec24(text, "index")
              : convertDateUtcFormatWithSec24(text, "index")
            : "-"}
        </span>
      ),
      style: { width: "15%" },
    },
    {
      title: "Status",
      key: "isActive",
      render: (text, record) => (
        <Tooltip title={record.isActive ? "Suspend client" : "Activate client"} color={"#e8e8ea"} overlayInnerStyle={{ color: "#000" }}>
          <Button
            color={record.isActive ? "primary" : "danger"}
            size="sm"
            className="btn"
            disabled={!checkPermission(permissionObj, pageName, PERMISSION_EDIT)}
            onClick={() => handleToggleStatus(record)}
          >
            {record.isActive ? "Active" : "Suspended"}
          </Button>
        </Tooltip>
      ),
      style: { width: "10%", textAlign: "center" },
    },
  ].filter(Boolean);

  const packageOptions = [
    { value: "", label: "Select Plan" },
    ...packages.map((pkg) => ({ value: pkg.id, label: pkg.name })),
  ];

  // Rendered inside Table's own toolbar row (same row as Banner's Add/Select
  // Active/Select Permanent) so Clients' filters follow the identical layout.
  const renderCustomFilter = () => (
    <>
      <div>
        <input
          className="form-control"
          type="text"
          style={{ width: 220 }}
          placeholder="Search name or email"
          value={search}
          onChange={handleSearchChange}
        />
      </div>
      <div>
        <Select
          styles={{ control: (provided) => ({ ...provided, width: 160 }) }}
          value={STATUS_OPTIONS.find((o) => o.value === status) || STATUS_OPTIONS[0]}
          placeholder="Select Status"
          onChange={handleStatusChange}
          options={STATUS_OPTIONS}
          classNamePrefix="filter-dropdown"
        />
      </div>
      <div>
        <Select
          styles={{ control: (provided) => ({ ...provided, width: 200 }) }}
          value={packageOptions.find((o) => o.value === packageId) || packageOptions[0]}
          placeholder="Select Plan"
          onChange={handlePackageChange}
          options={packageOptions}
          classNamePrefix="filter-dropdown"
        />
      </div>
    </>
  );

  const tableElement = {
    title: "Clients",
    reloadButton: true,
    resetButton: true,
    isDateRange: true,
    isDateTypeSelect: true,
  };

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW) && !isEmpty(permissionObj)) {
      navigate("/dashboard");
    }
    fetchData();
    fetchPackages();
  }, [permissionObj]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="Vault" breadcrumbItem="Clients" />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            reFetchData={fetchData}
            handleReload={fetchData}
            renderCustomFilter={renderCustomFilter}
            handleCustomReset={handleCustomReset}
            isAddPermission={false}
            isDeletePermission={checkPermission(permissionObj, pageName, PERMISSION_DELETE)}
            singleCheck={checekedList}
            deleteModelFunction={setDeleteModelVisable}
            setParentCurrentPage={setCurrentPage}
            setParentPageSize={setPageSize}
            setParentSearchedData={handleTableSearchedDataChange}
            dateType={dateType}
            setDateType={setDateType}
            isSearch={isSearch}
            setIsSearch={setIsSearch}
            dateRange={dateRange}
            setDateRange={setDateRange}
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
