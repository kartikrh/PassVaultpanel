import React, { useEffect, useRef, useState } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { Button, Col, Container, Input, Row, Card, CardBody, Label, Modal, ModalBody, ModalHeader } from "reactstrap";
import moment from "moment";
import { isEmpty } from "lodash";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "../../Features/axios";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import { TAB_VAULT_PLAN_UPGRADE, PERMISSION_VIEW, PERMISSION_EDIT, SUCCESS, ERROR } from "../../components/Common/Const";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

// Staff-facing review queue for client-submitted plan upgrade requests (QR/
// bank transfer + a unique reference code) -- mirrors Pages/History's shape
// (own filter Card, no add/delete/checkbox affordances) since it's the
// closest existing vault-admin screen to this one.
const Index = () => {
  const pageName = TAB_VAULT_PLAN_UPGRADE;
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  document.title = "Plan Upgrade Requests";
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const finalizeRef = useRef(null);
  const globalPageSize = localStorage.getItem("pageSize");
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("PENDING");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(globalPageSize || 10);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    await axiosInstance
      .post(`/vault/admin/planUpgrade/all`, {
        status: status || undefined,
        limit: 200,
      })
      .then((response) => {
        setData(response?.result?.rows || []);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
      });
  };

  const canReview = checkPermission(permissionObj, pageName, PERMISSION_EDIT);

  const handleApprove = async (record) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/vault/admin/planUpgrade/approve`, { id: record.id })
      .then((response) => {
        fetchData();
        dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
      })
      .catch((error) => {
        setIsLoading(false);
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
      });
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setIsLoading(true);
    await axiosInstance
      .post(`/vault/admin/planUpgrade/reject`, { id: rejectTarget.id, reason: rejectReason.trim() })
      .then((response) => {
        fetchData();
        setRejectTarget(null);
        setRejectReason("");
        dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
      })
      .catch((error) => {
        setIsLoading(false);
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
      });
  };

  const statusBadgeColor = { PENDING: "warning", APPROVED: "success", REJECTED: "danger" };

  const columns = [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => <span>{text ? moment(text).format("DD MMM YYYY, HH:mm") : "-"}</span>,
      sort: true,
      style: { width: "13%" },
    },
    {
      title: "Client",
      key: "client",
      render: (text, record) => (
        <span>
          {record.clientName || "-"}
          <br />
          <small>{record.clientEmail}</small>
        </span>
      ),
      style: { width: "18%" },
    },
    {
      title: "Current → Requested Plan",
      key: "plan",
      render: (text, record) => (
        <span>
          {record.currentPackageName || "-"} → <strong>{record.requestedPackageName}</strong>
        </span>
      ),
      style: { width: "18%" },
    },
    {
      title: "Payment Method",
      dataIndex: "paymentMethodLabel",
      key: "paymentMethodLabel",
      render: (text) => <span>{text || "-"}</span>,
      style: { width: "13%" },
    },
    {
      title: "Transfer Code",
      dataIndex: "transferCode",
      key: "transferCode",
      style: { width: "13%" },
    },
    {
      title: "Status",
      key: "status",
      render: (text, record) => (
        <span className={`badge bg-${statusBadgeColor[record.status] || "secondary"}`}>{record.status}</span>
      ),
      style: { width: "8%", textAlign: "center" },
    },
    {
      title: "Reviewed By",
      key: "reviewedByName",
      render: (text, record) =>
        record.reviewedByName ? (
          <span>
            {record.reviewedByName}
            <br />
            <small>{record.reviewedAt ? moment(record.reviewedAt).format("DD MMM YYYY, HH:mm") : ""}</small>
            {record.status === "REJECTED" && record.rejectionReason && (
              <>
                <br />
                <small className="text-danger">{record.rejectionReason}</small>
              </>
            )}
          </span>
        ) : (
          "-"
        ),
      style: { width: "12%" },
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) =>
        record.status === "PENDING" && canReview ? (
          <div className="d-flex gap-1">
            <Button color="success" size="sm" onClick={() => handleApprove(record)}>
              Approve
            </Button>
            <Button
              color="danger"
              size="sm"
              onClick={() => {
                setRejectTarget(record);
                setRejectReason("");
              }}
            >
              Reject
            </Button>
          </div>
        ) : (
          "-"
        ),
      style: { width: "5%" },
    },
  ];

  const tableElement = {
    title: "Plan Upgrade Requests",
    reloadButton: true,
  };

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW) && !isEmpty(permissionObj)) {
      navigate("/dashboard");
    }
    fetchData();
  }, [permissionObj, status]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="Vault" breadcrumbItem="Plan Upgrade Requests" />
          {isLoading && <SpinnerModel />}
          <Card className="mb-3">
            <CardBody>
              <Row>
                <Col md={3}>
                  <Label>Status</Label>
                  <Input type="select" value={status} onChange={(e) => setStatus(e.target.value)}>
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </Input>
                </Col>
              </Row>
            </CardBody>
          </Card>
          <Table
            ref={finalizeRef}
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            reFetchData={fetchData}
            handleReload={fetchData}
            isAddPermission={false}
            isDeletePermission={false}
            setParentCurrentPage={setCurrentPage}
            setParentPageSize={setPageSize}
            setParentSearchedData={() => {}}
          />
          <Modal isOpen={!!rejectTarget} toggle={() => setRejectTarget(null)} centered>
            <ModalHeader className="bg-light p-3" toggle={() => setRejectTarget(null)}>
              Reject plan upgrade request
            </ModalHeader>
            <ModalBody>
              <Label>Reason</Label>
              <Input
                type="textarea"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Why is this request being rejected?"
                rows={3}
              />
              <div className="hstack gap-2 justify-content-center mt-3">
                <button type="button" className="btn btn-light" onClick={() => setRejectTarget(null)}>
                  Cancel
                </button>
                <button className="btn btn-danger" disabled={!rejectReason.trim()} onClick={handleReject}>
                  Reject
                </button>
              </div>
            </ModalBody>
          </Modal>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
