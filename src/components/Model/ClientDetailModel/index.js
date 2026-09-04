import React, { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Col,
  Modal,
  ModalBody,
  ModalHeader,
  Progress,
  Row,
  Table as RsTable,
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import axiosInstance from "../../../Features/axios";
import SpinnerModel from "../SpinnerModel";
import { checkPermission } from "../../Common/Reusables/reusableMethods";
import { updateToastData } from "../../../Features/toasterSlice";
import { TAB_VAULT_CLIENTS, PERMISSION_EDIT, SUCCESS, ERROR } from "../../Common/Const";

// Same content as Pages/Clients/ClientDetail.jsx (profile, plan, usage bar,
// devices, activity history), just shown as a popup from the Clients list's
// View button instead of a separate /clientDetail navigation -- ClientDetail.jsx
// itself is left in place/routable, this isn't meant to replace it.
const ClientDetailModel = ({ isOpen, toggle, clientId, onStatusChanged }) => {
  const pageName = TAB_VAULT_CLIENTS;
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  const dispatch = useDispatch();

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
        onStatusChanged?.();
        dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
      })
      .catch((error) => {
        setIsLoading(false);
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
      });
  };

  useEffect(() => {
    if (isOpen && clientId) {
      fetchData();
    } else if (!isOpen) {
      // Cleared on close so a stale client's data doesn't flash for a beat
      // when the modal is re-opened for a different row.
      setDetail(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, clientId]);

  const usagePercent = (used, limit) => {
    if (limit == null || limit === 0) return 0;
    return Math.min(100, Math.round((used / limit) * 100));
  };

  const client = detail?.client;
  const usage = detail?.usage;

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="xl" centered scrollable>
      <ModalHeader className="bg-light p-3" toggle={toggle}>
        Client Detail{client?.name ? ` -- ${client.name}` : ""}
      </ModalHeader>
      <ModalBody>
        {isLoading && <SpinnerModel />}

        {client && (
          <>
            <Row className="mb-3">
              <Col xs={12} className="text-end">
                <Button
                  color={client.isActive ? "danger" : "primary"}
                  disabled={!checkPermission(permissionObj, pageName, PERMISSION_EDIT)}
                  onClick={handleToggleStatus}
                >
                  {client.isActive ? "Suspend" : "Activate"}
                </Button>
              </Col>
            </Row>

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
      </ModalBody>
    </Modal>
  );
};

export default ClientDetailModel;
