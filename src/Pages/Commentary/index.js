import React, { useState, useEffect } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { mapCommentaryStatus } from './functions'
import { Button } from "reactstrap";
import { Container } from "reactstrap";
import { useNavigate } from "react-router-dom";
import TabModel from "../../components/Model/AddTabModel";
import DeleteTabModel from "../../components/Model/DeleteModel";
import SpinnerModel from "../../components/Model/SpinnerModel";
import axiosInstance from "../../Features/axios";
import Toaster from '../../components/Toaster'
import { isEqual } from "lodash";
import { PERMISSION_ADD, PERMISSION_DELETE, PERMISSION_EDIT, PERMISSION_VIEW, TAB_COMMENTARY } from "../../components/Common/Const";
import { useSelector } from "react-redux";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";

const Index = () => {
  const pageName = TAB_COMMENTARY
  const permissionObj = useSelector(state => state.auth?.tabPermissionList); document.title = "Commentary | ScoreCard - React Admin & Dashboard Template";
  const [data, setData] = useState([]);
  const [dataIndexList, setDataIndexList] = useState([]);
  const [checekedList, setCheckedList] = useState([]); const [isLoading, setIsLoading] = useState(false);
  const [addModelVisable, setAddModelVisable] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const [toast, setToast] = useState({
    message: "",
    color: "",
    header: "",
  });
  const [toastStatus, setToastStatus] = useState(false);
  const [eventTypes, setEventTypes] = useState([]);
  const navigate = useNavigate();

  const fetchData = async () => {
    await axiosInstance
      .post(`/admin/commentary/all`)
      .then((response) => {
        const apiData = response?.result
        let apiDataIdList = [];
        apiData.forEach(ele => {
          apiDataIdList.push(ele?.commentaryId)
        })
        setData(apiData);
        setDataIndexList(apiDataIdList)
        setCheckedList([])
        setIsLoading(false);
        setEventTypes(eventTypes);
      })
      .catch((error) => {
        setIsLoading(false);
      });
  };

  const handleSingleCheck = (e) => {
    let updateSingleCheck = []
    if (checekedList.includes(e.commentaryId)) {
      updateSingleCheck = checekedList.filter((item) => item !== e.commentaryId);
    } else {
      updateSingleCheck = [...checekedList, e.commentaryId];
    }
    setCheckedList(updateSingleCheck)
  };

  //permissions function
  const handlePermissions = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(
        `/admin/commentary/save`,
        {
          commentaryId: record.commentaryId,
          [pType]: cState ? false : true,
        }
      )
      .then((response) => {
        fetchData();
      })
      .catch((error) => {
        setIsLoading(false);
      });
  };

  const handleDelete = async (e) => {
    setIsLoading(true);
    const response = await axiosInstance
      .post(
        `/admin/commentary/delete`,
        {
          commentaryId: checekedList,
        }
      )
      .then((response) => {
        fetchData();
        setDeleteModelVisable(false);
        setToast({
          message: response?.result,
          color: "green",
          header: "Success",
        });
        setToastStatus(true);
      })
      .catch((error) => {
        setIsLoading(false);
        setToast({
          message: error.error.message,
          color: "red",
          header: "Warning",
        });
        setToastStatus(true);
      });
  };

  const handleEdit = (id) => {
    navigate("/addCommentary", { state: { userId: id } });
  };

  const handleBackClick = () => {
    navigate("/commentary");
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
            checked={data?.length > 0 && isEqual(checekedList?.sort(), dataIndexList?.sort())}
            onChange={() => {
              setCheckedList(isEqual(checekedList?.sort(), dataIndexList?.sort()) ? [] : dataIndexList
              )
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
            checked={checekedList.includes(record.commentaryId)}
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
    checkPermission(permissionObj, pageName, PERMISSION_EDIT)
    && {
      title: "Edit",
      key: "edit",
      render: (text, record) => <i className="bx bx-edit"
        onClick={() => {
          handleEdit(record.commentaryId);
        }}
      ></i>,
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Event Date",
      dataIndex: "eventDate",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>
          {new Intl.DateTimeFormat("en-US", {
            year: "2-digit",
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            hour12: true,
          }).format(new Date(text))}
        </span>
      ),
      key: "eventDate",
      sort: true,
      style: { width: "10%" },
    },

    {
      title: "Event Name",
      dataIndex: "eventName",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>{text}</span>
      ),
      key: "eventName",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Team",
      dataIndex: "team1Name",
      key: "team1Name",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Competitor",
      dataIndex: "team2Name",
      key: "team2Name",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Status",
      dataIndex: "commentaryStatus",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>{mapCommentaryStatus(text)}</span>
      ),
      key: "commentaryStatus",
      sort: true,
      style: { width: "40%" },
    },
    {
      title: "Commentary Details",
      key: "active",
      printType: "ignore",
      render: (text, record) => (
        <Button
          color={"primary"}
          size="sm"
          className="btn"
          onClick={() => {

          }}
        >
          <i className="bx bx-plus"></i>
        </Button>
      ),
      style: { width: "2%", textAlign: "center" },
    },
  ];

  //elements required
  const tableElement = {
    title: "Commentary",
    headerSelect: false,
    eventTypeSelect: false,
    switch: false,
  };

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard")
    }
    setIsLoading(true);
    fetchData();
  }, []);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Commentary" />
          {isLoading && <SpinnerModel />}
          {toastStatus && (
            <Toaster
              toast={toast}
              setToast={setToast}
              toastStatus={toastStatus}
              setToastStatus={setToastStatus}
            />
          )}
          <Table
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            addModelFunction={setAddModelVisable}
            deleteModelFunction={setDeleteModelVisable}
            eventTypes={eventTypes}
            singleCheck={checekedList}
            reFetchData={fetchData}
            onAddNavigate={"/addCommentary"}
            isAddPermission={checkPermission(permissionObj, pageName, PERMISSION_ADD)}
            isDeletePermission={checkPermission(permissionObj, pageName, PERMISSION_DELETE)}
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
