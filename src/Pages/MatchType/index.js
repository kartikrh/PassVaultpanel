import React, { useState, useEffect } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { Container } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { useNavigate } from "react-router-dom";
import CloneModel from "../../components/Model/CloneMatchType";
import DeleteTabModel from "../../components/Model/DeleteModel";
import axiosInstance from "../../Features/axios";
import Toaster from "../../components/Toaster";
import { isEqual } from "lodash";

const Index = () => {
  document.title = "Match Type | ScoreCard - React Admin & Dashboard Template";
  const [data, setData] = useState([]);
  const [dataIndexList, setDataIndexList] = useState([]);
  const [checekedList, setCheckedList] = useState([]); const [isLoading, setIsLoading] = useState(false);
  const [cloneModelVisible, setCloneModelVisible] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const [toast, setToast] = useState({
    message: "",
    color: "",
    header: "",
  });
  const [toastStatus, setToastStatus] = useState(false);
  const [cloneName, setCloneName] = useState("");
  const navigate = useNavigate();

  const fetchData = async () => {
    await axiosInstance
      .post(`/admin/matchType/all`)
      .then((response) => {
        const apiData = response?.result
        let apiDataIdList = [];
        apiData.forEach(ele => {
          apiDataIdList.push(ele?.matchTypeId)
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

  const handleSingleCheck = (e) => {
    let updateSingleCheck = []
    if (checekedList.includes(e.matchTypeId)) {
      updateSingleCheck = checekedList.filter((item) => item !== e.matchTypeId);
    } else {
      updateSingleCheck = [...checekedList, e.matchTypeId];
    }
    setCheckedList(updateSingleCheck)
  };

  const handleClone = async () => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/matchType/clone`, {
        matchTypeId: checekedList?.[0],
        matchType: cloneName,
      })
      .then((response) => {
        fetchData();
        setToast({
          message: response?.message,
          color: "green",
          header: response?.title || "Success",
        });
        setToastStatus(true);
        setCloneModelVisible(false);
      })
      .catch((error) => {
        setToast({
          message: error?.message,
          color: "red",
          header: error?.title || "Warning",
        });
        setToastStatus(true);
      });
  };

  const handleDelete = async (e) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/matchType/delete`, {
        matchTypeId: checekedList,
      })
      .then((response) => {
        fetchData();
        setToast({
          message: response?.message,
          color: "green",
          header: response?.title || "Success",
        });
        setToastStatus(true);
        setDeleteModelVisable(false);
      })
      .catch((error) => {
        setIsLoading(false);
        setToast({
          message: error?.message,
          color: "red",
          header: error?.title || "Warning",
        });
        setToastStatus(true);
      });
  };
  const handleEdit = (id) => {
    navigate("/addMatchType", { state: { userId: id } });
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
            checked={checekedList.includes(record.matchTypeId)}
            onChange={() => {
              handleSingleCheck(record);
            }}
          />
        </div>
      ),
      key: "select",
      style: { width: "2%" },
    },
    {
      title: "Edit",
      key: "edit",
      render: (text, record) => <i className="bx bx-edit"
        onClick={() => {
          handleEdit(record.matchTypeId);
        }}
      ></i>,
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Match Type",
      dataIndex: "matchType",
      key: "matchType",
      style: { width: "96%" },
      sort: true,
    },
  ];

  //elements required
  const tableElement = {
    title: "Match Type",
    headerSelect: false,
    switch: false,
    clone: true,
  };

  useEffect(() => {
    setIsLoading(true);
    fetchData();
  }, []);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Match Type" />
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
            reFetchData={fetchData}
            cloneModelFunction={setCloneModelVisible}
            deleteModelFunction={setDeleteModelVisable}
            singleCheck={checekedList}
            onAddNavigate={"/addMatchType"}
          />
          <DeleteTabModel
            deleteModelVisable={deleteModelVisable}
            setDeleteModelVisable={setDeleteModelVisable}
            handleDelete={handleDelete}
            singleCheck={checekedList}
          />
          <CloneModel
            cloneModelVisible={cloneModelVisible}
            setCloneModelVisible={setCloneModelVisible}
            handleClone={handleClone}
            setCloneName={setCloneName}
            singleCheck={checekedList}
          />
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
