import React, { useState, useEffect } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { Container } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { useNavigate } from "react-router-dom";
import TabModel from "../../components/Model/AddTabModel";
import CloneModel from "../../components/Model/CloneMatchType";
import DeleteTabModel from "../../components/Model/DeleteModel";
import axiosInstance from "../../Features/axios";
import Toaster from "../../components/Toaster";

const Index = () => {
  document.title = "Match Type | ScoreCard - React Admin & Dashboard Template";
  const [data, setData] = useState([]);
  //handleSpinner
  const [isLoading, setIsLoading] = useState(false);
  // model state
  const [cloneModelVisible, setCloneModelVisible] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  //toaster
  const [toast, setToast] = useState({
    message: "",
    color: "",
    header: "",
  });
  const [toastStatus, setToastStatus] = useState(false);
  // checkbox state
  const [checkedAll, setCheckedAll] = useState(false);
  const [singleCheck, setSingleCheck] = useState([]);

  // cloneName
  const [cloneName, setCloneName] = useState("");

  const navigate = useNavigate();

  // fetch data
  const fetchData = async () => {
    await axiosInstance
      .post(`/admin/matchType/all`)
      .then((response) => {
        setData(response?.result);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
      });
  };

  //checkbox function
  const handleCheckedAll = (e) => {
    if (e === "all") {
      if (checkedAll) {
        setCheckedAll(false);
        setSingleCheck([]);
      } else {
        setCheckedAll(true);
      }
    } else {
      if (singleCheck.includes(e.matchTypeId)) {
        setSingleCheck(singleCheck.filter((item) => item !== e.matchTypeId));
      } else {
        setSingleCheck([...singleCheck, e.matchTypeId]);
      }
    }
  };

  const handleClone = async () => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/matchType/clone`, {
        matchTypeId: singleCheck[0],
        matchType: cloneName,
      })
      .then((response) => {
        fetchData();
        setToast({
          message: `${response.title} cloned successfully`,
          color: "green",
          header: "Success",
        });
        setToastStatus(true);
        setCloneModelVisible(false);
      })
      .catch((error) => {
        setToast({
          message: error.error.message,
          color: "red",
          header: "Warning",
        });
        setToastStatus(true);
      });
  };

  const handleDelete = async (e) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/matchType/delete`, {
        matchTypeId: singleCheck,
      })
      .then((response) => {
        fetchData();
        setToast({
          message: `${response.title} deleted successfully`,
          color: "green",
          header: "Success",
        });
        setToastStatus(true);
        setDeleteModelVisable(false);
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
            onChange={() => {
              handleCheckedAll("all");
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
            checked={checkedAll || singleCheck.includes(record.matchTypeId)}
            onChange={() => {
              handleCheckedAll(record);
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
            cloneModelFunction={setCloneModelVisible}
            deleteModelFunction={setDeleteModelVisable}
            singleCheck={singleCheck}
            onAddNavigate={"/addMatchType"}
          />
          <DeleteTabModel
            deleteModelVisable={deleteModelVisable}
            setDeleteModelVisable={setDeleteModelVisable}
            handleDelete={handleDelete}
            singleCheck={singleCheck}
          />
          <CloneModel
            cloneModelVisible={cloneModelVisible}
            setCloneModelVisible={setCloneModelVisible}
            handleClone={handleClone}
            setCloneName={setCloneName}
            singleCheck={singleCheck}
          />
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
