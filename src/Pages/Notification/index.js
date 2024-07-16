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
import { isEqual } from "lodash";
import {
  ERROR,
  PERMISSION_ADD,
  PERMISSION_DELETE,
  PERMISSION_EDIT,
  PERMISSION_VIEW,
  SUCCESS,
  TAB_NOTIFICATION,
} from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";

const Index = () => {
  const pageName = TAB_NOTIFICATION;
  const finalizeRef = useRef(null);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  document.title = "Notification";
  const [data, setData] = useState([]);
  const [dataIndexList, setDataIndexList] = useState([]);
  const [checekedList, setCheckedList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addModelVisable, setAddModelVisable] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchData = async (latestValueFromTable) => {
    setIsLoading(true);
    const tableActions = finalizeRef.current.getTableAction();
    await axiosInstance
      .post(`/admin/notification/all`, {
        ...(latestValueFromTable || tableActions),
      })
      .then((response) => {
        const notificationData = response?.result;
        let notificationDataIdList = [];
        notificationData.forEach((ele) => {
          notificationDataIdList.push(ele?.notificationId);
        });
        setData(notificationData);
        setDataIndexList(notificationDataIdList);
        setCheckedList([]);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
      });
  };

  const handleSingleCheck = (e) => {
    let updateSingleCheck = [];
    if (checekedList.includes(e.notificationId)) {
      updateSingleCheck = checekedList.filter(
        (item) => item !== e.notificationId
      );
    } else {
      updateSingleCheck = [...checekedList, e.notificationId];
    }
    setCheckedList(updateSingleCheck);
  };

  const handleEdit = (notificationId) => {
    navigate("/addNotification", { state: { notificationId } });
  };

  const handleSendNotification = async (record) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/notification/sendNotification`, {
        notificationId: record.notificationId,
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

  const getSendType = (status) => {
    switch (status) {
      case 1:
        return "All";
      case 2:
        return "onlyLoggedInUser";
      case 3:
        return "pushNotification";
      default:
        return "Unknown";
    }
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
            checked={
              data?.length > 0 &&
              isEqual(checekedList?.sort(), dataIndexList?.sort())
            }
            onChange={() => {
              setCheckedList(
                isEqual(checekedList?.sort(), dataIndexList?.sort())
                  ? []
                  : dataIndexList
              );
            }}
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
            checked={checekedList.includes(record.notificationId)}
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
            handleEdit(record.notificationId);
          }}
        ></i>
      ),
      style: { width: "2%" },
    },
    {
      title: "Send Type",
      dataIndex: "sendType",
      render: (text, record) => <span>{getSendType(record?.sendType)}</span>,
      key: "sendType",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      sort: true,
      style: { width: "20%" },
    },
    {
      title: "Message",
      dataIndex: "description",
      key: "description",
      sort: true,
      style: { width: "60%" },
    },
    {
      title: "Send",
      key: "send",
      render: (text, record) => (
        <Button
          color="primary"
          size="sm"
          className="btn"
          onClick={() => {
            handleSendNotification(record);
          }}
        >
          S
        </Button>
      ),
      style: { width: "6%", textAlign: "center" },
    },
  ];
  //elements required
  const tableElement = {
    title: "Notification",
    headerSelect: false,
    isActive: false,
    clone: false,
  };

  //delete row
  const handleDelete = async (e) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/notification/delete`, {
        notificationId: checekedList,
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
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard");
    }
    fetchData();
  }, []);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Notification" />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            deleteModelFunction={setDeleteModelVisable}
            singleCheck={checekedList}
            reFetchData={fetchData}
            onAddNavigate={"/addNotification"}
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
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
