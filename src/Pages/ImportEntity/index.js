import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { Tooltip } from "antd";
import Table from "../../components/Common/Table";
import { Container } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import TabModel from "../../components/Model/AddTabModel";
import DeleteTabModel from "../../components/Model/DeleteModel";
import axiosInstance from "../../Features/axios";
import { useNavigate } from "react-router-dom";
import _, { isEmpty } from "lodash";

import {
  ERROR,
  PERMISSION_ADD,
  PERMISSION_DELETE,
  PERMISSION_EDIT,
  PERMISSION_VIEW,
  SUCCESS,
  TAB_IMPORT_ENTITYIMPORT,
  tempDataForSeason,
  tempDataForYear,
} from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import { loadInit } from "../../config";

const Index = () => {
  const pageName = TAB_IMPORT_ENTITYIMPORT;
  document.title = "Import EntityImport";

  const finalizeRef = useRef(null);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // State variables
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const [addModelVisable, setAddModelVisable] = useState(false);
  const [checekedList, setCheckedList] = useState([]);
  const loadInitData = useSelector((state) => state.loadInit.loadInitData);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Set higher limit to get more seasons
  const [total, setTotal] = useState(0);

  let entitySportUrl =
    loadInitData.find((item) => item.key === loadInit.ENTITYSPORTURL)?.value ||
    "https://es.deployed.live";
  // Fetch seasons data
  const fetchData = async (page = 1, limit = 10) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post(
        `${entitySportUrl}/admin/list/seasons`,
        {
          page: page,
          limit: limit,
        }
      );

      const apiData = response?.result?.data || [];
      const totalCount = response?.result?.total || "0";
      console.log("here", apiData);
      console.log("total", totalCount)
      // Sort data by year in descending order, sid refers to season id
      const sortedData = apiData.sort((a, b) => b.sid - a.sid);
      setData(sortedData);
      setTotal(totalCount);
      setCurrentPage(page);
      setPageSize(limit);
      setIsLoading(false);
    } catch (error) {
      // temporary static data
      // const apiData = tempDataForYear?.result?.response.items || [];
      // console.log("Here in catch", apiData);
      // // Sort data by year in descending order, sid refers to season id
      // const sortedData = apiData.sort((a, b) => b.sid - a.sid);
      // setData(sortedData);

      console.error("Error fetching seasons:", error);
      dispatch(
        updateToastData({
          type: ERROR,
          message: "Failed to fetch seasons data",
        })
      );
      setIsLoading(false);
    }
  };

  // Handle year click to navigate to competition list
  const handleClick = (id, name) => {
    localStorage.setItem("importEntitySeasonId", String(id));
    localStorage.setItem("year", String(name));

    navigate("/seasonList", {
      state: {
        importEntitySeasonId: id,
        year: name,
      },
    });
  };

  // Table columns configuration
  const columns = [
    {
      title: "Year",
      dataIndex: "sid",
      key: "sid",
      width: "100%",
      render: (text, record) => (
        <Tooltip
          title={`View competitions for ${text}`}
          color={"#e8e8ea"}
          overlayInnerStyle={{ color: "#000" }}
        >
          <span
            className="cursor-pointer"
            onClick={() => handleClick(record.sid, record?.name)}
            style={{
              cursor: "pointer",
              color: "#1890ff",
              textDecoration: "underline",
            }}
          >
            {text}
          </span>
        </Tooltip>
      ),
    },
  ];

  // Table element configuration
  const tableElement = {
    title: "Import EntityImport",
    headerSelect: false,
    isActive: false,
    dragDrop: false,
    subTable: false,
    isServerPagination: true,
  };

  // Initial data fetch and permission check
  useEffect(() => {
    if (
      !checkPermission(permissionObj, pageName, PERMISSION_VIEW) &&
      !isEmpty(permissionObj)
    ) {
      navigate("/dashboard");
      return;
    }
    setData([]);
    fetchData(currentPage, pageSize);
  }, [permissionObj]);

  const handleReload = () => {
    fetchData(currentPage, pageSize);
  };

  // Handle page change
  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
    fetchData(page, size);
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Import EntityImport" />

          {isLoading && <SpinnerModel />}

          <Table
            ref={finalizeRef}
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            deleteModelFunction={setDeleteModelVisable}
            singleCheck={checekedList}
            reFetchData={fetchData}
            handleReload={handleReload}
            serverCurrentPage={currentPage}
            serverPageSize={pageSize}
            serverTotal={total}
            setServerCurrentPage={(page) => handlePageChange(page, pageSize)}
            setServerPageSize={(size) => handlePageChange(1, size)}
            // isDeletePermission={checkPermission(
            //   permissionObj,
            //   pageName,
            //   PERMISSION_DELETE
            // )}
          />

          <DeleteTabModel
            deleteModelVisable={deleteModelVisable}
            setDeleteModelVisable={setDeleteModelVisable}
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
