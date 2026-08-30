import React, { useEffect, useMemo, useRef, useState } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { Button, Col, Container, Input, Row, Card, CardBody, Label } from "reactstrap";
import moment from "moment";
import { isEmpty } from "lodash";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "../../Features/axios";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import { TAB_VAULT_HISTORY, PERMISSION_VIEW, ERROR } from "../../components/Common/Const";

// Vault feature: staff-facing "History & audit log" screen (spec section 4).
// Filterable by client / action / date -- action + IP + entry reference only,
// same as the backend, which never returns vault content here.
const ACTIVITY_TYPE_OPTIONS = [
  { value: "", label: "All Actions" },
  { value: 101, label: "Client registered" },
  { value: 102, label: "Client logged in" },
  { value: 110, label: "Account created" },
  { value: 111, label: "Account updated" },
  { value: 112, label: "Account deleted" },
  { value: 120, label: "Group created" },
  { value: 121, label: "Group updated" },
  { value: 122, label: "Group deleted" },
  { value: 130, label: "Vault key recovered" },
  { value: 131, label: "Vault key rotated" },
];

const Index = () => {
  const pageName = TAB_VAULT_HISTORY;
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  document.title = "History & Audit Log";
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const finalizeRef = useRef(null);
  const globalPageSize = localStorage.getItem("pageSize");
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [emailFilter, setEmailFilter] = useState("");
  const [activityType, setActivityType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(globalPageSize || 10);

  const fetchData = async () => {
    setIsLoading(true);
    await axiosInstance
      .post(`/vault/admin/history/all`, {
        activityType: activityType || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      })
      .then((response) => {
        setData(response?.result || []);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
      });
  };

  const filteredData = useMemo(() => {
    if (!emailFilter) return data;
    return data.filter((row) => row.clientEmail?.toLowerCase().includes(emailFilter.toLowerCase()));
  }, [data, emailFilter]);

  const columns = [
    {
      title: "Date",
      dataIndex: "createdDate",
      key: "createdDate",
      render: (text) => <span>{text ? moment(text).format("DD MMM YYYY, HH:mm") : "-"}</span>,
      sort: true,
      style: { width: "18%" },
    },
    {
      title: "Client",
      dataIndex: "clientEmail",
      key: "clientEmail",
      render: (text) => <span>{text || "-"}</span>,
      sort: true,
      style: { width: "25%" },
    },
    {
      title: "Action",
      dataIndex: "activityLabel",
      key: "activityLabel",
      style: { width: "20%" },
    },
    {
      title: "Reference",
      dataIndex: "refId",
      key: "refId",
      render: (text) => <span>{text || "-"}</span>,
      style: { width: "20%" },
    },
    {
      title: "IP Address",
      dataIndex: "ipAddress",
      key: "ipAddress",
      render: (text) => <span>{text || "-"}</span>,
      style: { width: "17%" },
    },
  ];

  const tableElement = {
    title: "History & Audit Log",
    reloadButton: true,
  };

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW) && !isEmpty(permissionObj)) {
      navigate("/dashboard");
    }
    fetchData();
  }, [permissionObj]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="Vault" breadcrumbItem="History & Audit Log" />
          {isLoading && <SpinnerModel />}
          <Card className="mb-3">
            <CardBody>
              <Row>
                <Col md={3}>
                  <Label>Client email</Label>
                  <Input
                    type="text"
                    placeholder="Filter by client email"
                    value={emailFilter}
                    onChange={(e) => setEmailFilter(e.target.value)}
                  />
                </Col>
                <Col md={3}>
                  <Label>Action</Label>
                  <Input type="select" value={activityType} onChange={(e) => setActivityType(e.target.value)}>
                    {ACTIVITY_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </Input>
                </Col>
                <Col md={2}>
                  <Label>From</Label>
                  <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                </Col>
                <Col md={2}>
                  <Label>To</Label>
                  <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                </Col>
                <Col md={2} className="d-flex align-items-end">
                  <Button color="primary" className="w-100" onClick={fetchData}>
                    Apply Filters
                  </Button>
                </Col>
              </Row>
            </CardBody>
          </Card>
          <Table
            ref={finalizeRef}
            columns={columns}
            dataSource={filteredData}
            tableElement={tableElement}
            reFetchData={fetchData}
            handleReload={fetchData}
            isAddPermission={false}
            isDeletePermission={false}
            setParentCurrentPage={setCurrentPage}
            setParentPageSize={setPageSize}
            setParentSearchedData={() => {}}
          />
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
