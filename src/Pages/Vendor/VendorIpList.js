import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Card, CardBody, Col, Container, Row } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import DeleteTabModel from "../../components/Model/DeleteModel";
import axiosInstance from "../../Features/axios";
import { isEqual } from "lodash";
import {
  ERROR,
  PERMISSION_DELETE,
  PERMISSION_VIEW,
  SUCCESS,
  TAB_VENDOR,
} from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import FormBuilder from "../../components/Common/Reusables/FormBuilder";
import { VendorIpListFileds } from "../../constants/FieldConst/VendorIpListConst";

const VendorIpList = () => {
  const pageName = TAB_VENDOR;
  const finalizeRef = useRef(null);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  document.title = "Vendor Ip List";
  const [data, setData] = useState([]);
  const [dataIndexList, setDataIndexList] = useState([]);
  const [checekedList, setCheckedList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const location = useLocation();
  const [vendorId, setVendorId] = useState(location.state?.vendorId || "0");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const fetchData = async (id) => {
    setIsLoading(true);
    await axiosInstance
      .post("/admin/vendorIp/getByVendorId", {
        vendorId: id,
      })
      .then((response) => {
        const apiData = response?.result;
        let apiDataIdList = [];
        apiData.forEach((ele) => {
          apiDataIdList.push(ele?.vendorIpId);
        });
        setData(apiData);
        setDataIndexList(apiDataIdList);
        setCheckedList([]);
        setIsLoading(false);
      })
      .catch((error) => {
        dispatch(
          updateToastData({
            data: error?.message,
            title: error?.title,
            type: ERROR,
          })
        );
        setIsLoading(false);
      });
  };

  const handleSingleCheck = (e) => {
    let updateSingleCheck = [];
    if (checekedList.includes(e.vendorIpId)) {
      updateSingleCheck = checekedList.filter((item) => item !== e.vendorIpId);
    } else {
      updateSingleCheck = [...checekedList, e.vendorIpId];
    }
    setCheckedList(updateSingleCheck);
  };

  const handleDelete = async (e) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/vendorIp/delete`, {
        vendorIpId: checekedList,
      })
      .then((response) => {
        fetchData(vendorId);
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
  const handleReset = () => {
    fetchData(vendorId);
  };
  const handleBackClick = () => {
    navigate("/vendors");
  };
 
  const onGenerateClick = async () => {
    try {
      const payload = {
        vendorIpId: 0,
        vendorId: vendorId,
        ipAddress: "",
        isActive: true,
      };
      const dataToSave = finalizeRef.current.finalizeData();
      if (dataToSave) {
        setIsLoading(true);
        const finalData = {
          ...payload,
          ...dataToSave,
        };
        const response = await axiosInstance.post(
          "/admin/vendorIp/save",
          finalData
        );
        const vendorIpData = response?.result;
        setData([...data, vendorIpData]);
        fetchData(vendorId);
        finalizeRef.current.resetForm();
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching Vendor Ip List data:", error);
      setIsLoading(false);
      dispatch(
        updateToastData({
          data: error?.message,
          title: error?.title,
          type: ERROR,
        })
      );
    }
  };

  const handlePermissions = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/vendorIp/activeInactive`, {
        vendorIpId: record.vendorIpId,
        [pType]: cState ? false : true,
      })
      .then((response) => {
        fetchData(vendorId);
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
            checked={checekedList.includes(record.vendorIpId)}
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
      title: "Id",
      dataIndex: "vendorIpId",
      key: "vendorIpId",
      style: { width: "5%" },
    },
    {
      title: "Ip Address",
      dataIndex: "ipAddress",
      key: "ipAddress",
      style: { width: "5%" },
    },
    {
      title: "Is Active",
      key: "isActive",
      render: (text, record) => (
        <Button
          color={`${record.isActive ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          onClick={() => {
            handlePermissions("isActive", record, record.isActive);
          }}
        >
          <i className={`bx ${record.isActive ? "bx-check" : "bx-block"}`}></i>
        </Button>
      ),
      style: { width: "2%"},
    },
  ];
  //elements required
  const tableElement = {
    title: "Vendor Ip List",
    resetButton: true,
  };

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard");
    }
  }, []);

  useEffect(() => {
    if (vendorId !== "0") {
      fetchData(vendorId);
    }
  }, [setVendorId]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Vendor Ip List" />
          {isLoading && <SpinnerModel />}
          <Row>
            <Col
              className="mb-3"
              xs={12}
              md={{ span: 4, offset: 11 }}
              lg={{ span: 3, offset: 11 }}
            >
              <button className="btn btn-danger mx-1" onClick={handleBackClick}>
                Back
              </button>
            </Col>
          </Row>
          <Card>
            <CardBody>
              <FormBuilder
                ref={finalizeRef}
                fields={VendorIpListFileds}
                generateAlias={onGenerateClick}
              />
            </CardBody>
          </Card>
          <Table
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            deleteModelFunction={setDeleteModelVisable}
            reFetchData={fetchData}
            singleCheck={checekedList}
            handleReset={handleReset}
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
        </Container>
      </div>
    </React.Fragment>
  );
};

export default VendorIpList;
