import React, { useState, useEffect } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { Container, Table, Card, CardBody, CardHeader, Button } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import axiosInstance from "../../Features/axios";
import { useNavigate } from "react-router-dom";
import {
  TAB_MARKET_TYPE,
  PERMISSION_VIEW,
  MODULE_MARKET_TYPES,
  SUCCESS,
  ERROR,
} from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import LoadDataModal from "../../components/Model/LoadDataModal";
import { isEmpty } from "lodash";

const Index = () => {
  const pageName = TAB_MARKET_TYPE;
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  document.title = TAB_MARKET_TYPE;
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadDataModelVisable, setLoadDataModelVisable] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post(
        `/admin/marketTemplate/allMarketTypesAndCategory`
      );
      const apiData = response?.result || [];
      setData(apiData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadData = async (password) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/loadPanelData`, {module: [MODULE_MARKET_TYPES], password})
      .then((response) => {
        fetchData();
        setLoadDataModelVisable(false);
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
    if (!isEmpty(permissionObj) && !checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard");
    }
    fetchData();
  }, []);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Market Type List" />
          {isLoading && <SpinnerModel />}
          {(data && data.length > 0) &&
          <Card>
            <CardHeader className="px-0 pt-0">
              <Button
                color="warning"
                onClick={() => {
                  setLoadDataModelVisable(true);
                }}
                className="d-flex align-items-center gap-1"
              >
                <i className="ri-refresh-line"></i>
                Load Data
              </Button>
            </CardHeader>
            <CardBody className="p-1 event-snap">
              <Table
                className="table"
                responsive
                // striped
                // hover
                bordered
                style={{ border: "1px black" }}
              >
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Market Type</th>
                  </tr>
                </thead>
                <tbody>
                  {data
                    .sort((a, b) => a.displayOrder - b.displayOrder)
                    .map((record) => (
                      <tr key={record.marketTypeId}>
                        <td>{record.marketTypeId}</td>
                        <td>
                          {/* <Card> */}
                            {/* <CardBody> */}
                              <div className="py-2 text-dark modal-header-title">
                                {record.marketTypeName}
                              </div>
                              {record.marketTypeCategories &&
                              record.marketTypeCategories.length > 0 ? (
                                <Table
                                  className="table"
                                  responsive
                                  // striped
                                  // hover
                                  bordered
                                  style={{ border: "1px black" }}
                                >
                                  <thead>
                                    <tr>
                                      <th>ID</th>
                                      <th>Category</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {record.marketTypeCategories
                                      .sort(
                                        (a, b) =>
                                          a.displayOrder -
                                          b.displayOrder
                                      )
                                      .map((category) => (
                                        <tr key={category.marketTypeCategoryId}>
                                          <td style={{ width: "10%" }}>
                                            {category.marketTypeCategoryId}
                                          </td>
                                          <td>{category.categoryName}</td>
                                        </tr>
                                      ))}
                                  </tbody>
                                </Table>
                              ) : (
                                <div>No categories available.</div>
                              )}
                            {/* </CardBody> */}
                          {/* </Card> */}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            </CardBody>
          </Card>}
          {loadDataModelVisable && 
            <LoadDataModal
              loadDataModelVisable={loadDataModelVisable}
              setLoadDataModelVisable={setLoadDataModelVisable}
              handleLoadData={handleLoadData}
              moduleName={"Market Type"} 
            />}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;