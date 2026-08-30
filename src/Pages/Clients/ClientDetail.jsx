import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Badge,
  Button,
  Card,
  CardBody,
  Col,
  Container,
  Progress,
  Row,
  Table as RsTable,
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import { isEmpty } from "lodash";
import axiosInstance from "../../Features/axios";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import {
  TAB_VAULT_CLIENTS,
  PERMISSION_EDIT,
  PERMISSION_VIEW,
  SUCCESS,
  ERROR,
} from "../../components/Common/Const";

// Vault feature: Clients detail view (spec section 4) -- profile, plan, usage bar,
// devices, and activity history. No password/vault content anywhere.
const ClientDetail = () => {
  const pageName = TAB_VAULT_CLIENTS;
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const clientId = location.state?.clientId;

  const [isLoading, setIsLoading] = useState(false);
  const [detail, setDetail] = useState(null);

  const fetchData = async () => {
    if (!clientId) return;
    setIsLoading(true);
    await axiosInstance
      .post("/vault/admin/clients/byId", { clientId })
      .then((response) => {
        setDetail(response?.result);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
      });
  };

  const handleToggleStatus = async () => {
    setIsLoading(true);
    await axiosInstance
      .post("/vault/admin/clients/updateStatus", {
        clientId,
        isActive: !detail?.client?.isActive,
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

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW) && !isEmpty(permissionObj)) {
      navigate("/dashboard");
    }
    if (!clientId) {
      navigate("/clients");
      return;
    }
    fetchData();
  }, [permissionObj]);

  const usagePercent = (used, limit) => {
    if (limit == null || limit === 0) return 0;
    return Math.min(100, Math.round((used / limit) * 100));
  };

  const client = detail?.client;
  const usage = detail?.usage;

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Row>
            <Col xs={12} md={8} lg={9}>
              <h3 className="modal-header-title">Client Detail</h3>
            </Col>
          </Row>
          {isLoading && <SpinnerModel />}
          <Card>
            <CardBody>
              <Row className="mb-3">
                <Col xs={12} md={{ span: 4, offset: 8 }} lg={{ span: 3, offset: 9 }} className="text-end">
                  <button className="btn btn-danger mx-1" onClick={() => navigate("/clients")}>
                    Back
                  </button>
                  {client && (
                    <Button
                      color={client.isActive ? "danger" : "primary"}
                      disabled={!checkPermission(permissionObj, pageName, PERMISSION_EDIT)}
                      onClick={handleToggleStatus}
                    >
                      {client.isActive ? "Suspend" : "Activate"}
                    </Button>
                  )}
                </Col>
              </Row>

              {client && (
                <>
                  <Row className="mb-4">
                    <Col md={6}>
                      <h5>Profile</h5>
                      <p className="mb-1"><strong>Name:</strong> {client.name || "-"}</p>
                      <p className="mb-1"><strong>Email:</strong> {client.email}</p>
                      <p className="mb-1">
                        <strong>Status:</strong>{" "}
                        <Badge color={client.isActive ? "success" : "danger"}>
                          {client.isActive ? "Active" : "Suspended"}
                        </Badge>{" "}
                        {client.isEmailVerified && <Badge color="info">Email Verified</Badge>}
                      </p>
                      <p className="mb-1"><strong>Joined:</strong> {moment(client.createdAt).format("DD MMM YYYY, HH:mm")}</p>
                    </Col>
                    <Col md={6}>
                      <h5>Plan</h5>
                      <p className="mb-1"><strong>Package:</strong> {client.packageName || "-"}</p>

                      <div className="mb-3">
                        <div className="d-flex justify-content-between">
                          <span>Accounts</span>
                          <span>
                            {usage?.accounts?.used ?? 0} / {usage?.accounts?.limit ?? "Unlimited"}
                          </span>
                        </div>
                        <Progress value={usagePercent(usage?.accounts?.used, usage?.accounts?.limit)} />
                      </div>

                      <div className="mb-3">
                        <div className="d-flex justify-content-between">
                          <span>Groups</span>
                          <span>
                            {usage?.groups?.used ?? 0} / {usage?.groups?.limit ?? "Unlimited"}
                          </span>
                        </div>
                        <Progress value={usagePercent(usage?.groups?.used, usage?.groups?.limit)} />
                      </div>
                    </Col>
                  </Row>

                  <Row className="mb-4">
                    <Col md={12}>
                      <h5>Devices</h5>
                      {detail?.devices?.length ? (
                        <RsTable responsive size="sm">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Biometric</th>
                              <th>Last Synced Revision</th>
                              <th>Registered</th>
                            </tr>
                          </thead>
                          <tbody>
                            {detail.devices.map((d) => (
                              <tr key={d.deviceId}>
                                <td>{d.name || "-"}</td>
                                <td>{d.biometricEnrolled ? "Yes" : "No"}</td>
                                <td>{d.lastSyncedDriveRevision || "-"}</td>
                                <td>{moment(d.createdDate).format("DD MMM YYYY")}</td>
                              </tr>
                            ))}
                          </tbody>
                        </RsTable>
                      ) : (
                        <p className="text-muted">No devices registered yet.</p>
                      )}
                    </Col>
                  </Row>

                  <Row>
                    <Col md={12}>
                      <h5>Recent Activity</h5>
                      {detail?.recentActivity?.length ? (
                        <RsTable responsive size="sm">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Action</th>
                              <th>Reference</th>
                              <th>IP</th>
                            </tr>
                          </thead>
                          <tbody>
                            {detail.recentActivity.map((a) => (
                              <tr key={a.activityLogId}>
                                <td>{moment(a.createdDate).format("DD MMM YYYY, HH:mm")}</td>
                                <td>{a.activityLabel}</td>
                                <td>{a.refId || "-"}</td>
                                <td>{a.ipAddress || "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </RsTable>
                      ) : (
                        <p className="text-muted">No activity recorded yet.</p>
                      )}
                    </Col>
                  </Row>
                </>
              )}
            </CardBody>
          </Card>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default ClientDetail;
