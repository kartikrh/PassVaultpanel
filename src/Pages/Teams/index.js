import React, { useState, useEffect } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { Avatar } from "antd";
import { Container } from "reactstrap";
import { useNavigate } from "react-router-dom";
import SpinnerModel from "../../components/Model/SpinnerModel";
import TabModel from "../../components/Model/AddTabModel";
import DeleteTabModel from "../../components/Model/DeleteModel";
import axiosInstance from "../../Features/axios";
import { isEqual } from "lodash";
import { ERROR, PERMISSION_ADD, PERMISSION_DELETE, PERMISSION_EDIT, PERMISSION_VIEW, SUCCESS, TAB_TEAMS } from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";

const Index = () => {
  const pageName = TAB_TEAMS
  const permissionObj = useSelector(state => state.auth?.tabPermissionList);
  document.title = "Teams | ScoreCard - React Admin & Dashboard Template";
  const [data, setData] = useState([]);
  const [dataIndexList, setDataIndexList] = useState([]);
  const [checekedList, setCheckedList] = useState([]); const [isLoading, setIsLoading] = useState(false);
  const [addModelVisable, setAddModelVisable] = useState(false);
  const [isActive, setIsActive] = useState(true)
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const [eventTypes, setEventTypes] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // fetch data
  const fetchData = async (value) => {
    setIsActive(value)
    setIsLoading(true)
    await axiosInstance
      .post(`/admin/team/all`,{
        ...value
      })
      .then((response) => {
        const apiData = response?.result
        let apiDataIdList = [];
        apiData.forEach(ele => {
          apiDataIdList.push(ele?.teamId)
        })
        setData(apiData);
        setDataIndexList(apiDataIdList)
        setCheckedList([])
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
      });
  };

  const fetchEventTypeData = async () => {
    await axiosInstance
      .post(`/admin/eventType/all`, {})
      .then((response) => {
        setEventTypes(response.result);
        setIsLoading(false);
      })
      .catch((error) => { });
  };
  const handleSingleCheck = (e) => {
    let updateSingleCheck = []
    if (checekedList.includes(e.teamId)) {
      updateSingleCheck = checekedList.filter((item) => item !== e.teamId);
    } else {
      updateSingleCheck = [...checekedList, e.teamId];
    }
    setCheckedList(updateSingleCheck)
  };

  const handleDelete = async (e) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/team/delete`, {
        teamId: checekedList,
      })
      .then((response) => {
        fetchData(isActive);
        setDeleteModelVisable(false);
        dispatch(updateToastData({ data: response?.result, title: response?.title, type: SUCCESS }));
        setCheckedList([])
      })
      .catch((error) => {
        setIsLoading(false);
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
      });
  };

  const handleEdit = (id) => {
    navigate("/addTeams", { state: { userId: id } });
  };
  const handleReset = () => {
    fetchData()
    fetchEventTypeData()
  }
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
            checked={checekedList.includes(record.teamId)}
            onChange={() => {
              handleSingleCheck(record);
            }}
          />
        </div>
      ),
      key: "select",
      style: { width: "2%" },
    },
    checkPermission(permissionObj, pageName, PERMISSION_EDIT)
    && {
      title: "Edit",
      key: "edit",
      render: (text, record) => <i className="bx bx-edit"
        onClick={() => {
          handleEdit(record.teamId);
        }}
      ></i>,
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Image",
      dataIndex: "image",
      printType: "ignore",
      render: (text, record) => (
        <div className="flex-shrink-0">
          {text ? (
            <div>
              <img
                className="avatar-xs rounded-circle"
                alt=""
                src={process.env.REACT_APP_BASE_URL + text}
              />
            </div>
          ) : (
            <Avatar src="#" alt="ET">
              Image
            </Avatar>
          )}
        </div>
      ),
      key: "image",
      style: { width: "5%" },
    },
    {
      title: "Jersey Image",
      dataIndex: "jersey",
      printType: "ignore",
      render: (text, record) => (
        <div className="flex-shrink-0">
          {text ? (
            <div>
              <img
                className="avatar-xs rounded-circle"
                alt=""
                src={process.env.REACT_APP_BASE_URL + text}
              />
            </div>
          ) : (
            <Avatar src="#" alt="ET">
              Image
            </Avatar>
          )}
        </div>
      ),
      key: "jersey",
      style: { width: "15%", textAlign: "left" },
    },
    {
      title: "Team Name",
      dataIndex: "teamName",
      key: "teamName",
      style: { width: "40%" },
      sort: true,
    },
    {
      title: "Short Name",
      dataIndex: "teamShortName",
      key: "teamShortName",
      style: { width: "10%" },
    },
    {
      title: "Country",
      dataIndex: "country",
      key: "country",
      style: { width: "10%" },
    },
  ];

  //elements required
  const tableElement = {
    title: "Teams",
    headerSelect: false,
    switch: false,
    eventTypeSelect: true,
    resetButton: true,
  };

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard")
    }
    setIsLoading(true);
    fetchData();
    fetchEventTypeData()
  }, []);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Teams" />
          {isLoading && <SpinnerModel />}
          <Table
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            addModelFunction={setAddModelVisable}
            deleteModelFunction={setDeleteModelVisable}
            singleCheck={checekedList}
            handleReset={handleReset}
            eventTypes={eventTypes}
            onAddNavigate={"/addTeams"}
            reFetchData={fetchData}
            isAddPermission={checkPermission(permissionObj, pageName, PERMISSION_ADD)}
            isDeletePermission={checkPermission(permissionObj, pageName, PERMISSION_DELETE)}
          />
          <DeleteTabModel
            deleteModelVisable={deleteModelVisable}
            setDeleteModelVisable={setDeleteModelVisable}
            handleDelete={handleDelete}
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
