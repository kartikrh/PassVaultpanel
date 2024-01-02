import React, { useState, useEffect } from "react";
import "./style.css";
import { useNavigate } from "react-router-dom";
import { CSVLink } from "react-csv";
// import Pdf from "react-to-pdf";
import Pagination from "../../Pagination";
import jsPDF from "jspdf";
import "jspdf-autotable";
// import html2pdf from "html2pdf.js";
import * as XLSX from "xlsx";
import { filterOrderChange } from "../../../helpers/helper";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Toaster from "../../Toaster/index";
import { Button, Card, CardBody, CardHeader, Col, Row } from "reactstrap";
import Switch from "react-switch";
import axiosInstance from "../../../Features/axios";

const changeDisplayOrder = async (tabdisplayOrder, apiName) => {
  try {
    const response = await axiosInstance.post(
      `/admin/${apiName}/changeDisplayOrder`,
      tabdisplayOrder, // Send the updated order data to the API
    );
    return response?.result || [];
  } catch (error) {
    throw Error(error);
  }
}

const Index = ({
  columns,
  dataSource,
  tableElement,
  cloneModelFunction,
  setIsActive,
  deleteModelFunction,
  singleCheck,
  displayTypes,
  eventTypes,
  reFetchData,
  reFetchEventTypeData,
  handleReset,
  reFetchCompetitionData,
  competitions,
  onAddNavigate,
  changeOrderApiName = "",
  jumpToChild = undefined,
  resetJumpToChild
}) => {
  document.title = `${tableElement?.title} | ScoreCard - React Admin & Dashboard Template`;
  const [data, setData] = useState(dataSource);
  const [currentParentId, setCurrentParentId] = useState(dataSource);
  const [subData, setSubData] = useState([]);
  const [total, setTotal] = useState(dataSource.length);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [toast, setToast] = useState({
    message: "Select at least one (only One) row",
    color: "red",
    header: "Error",
  });
  const [filteredData, setFilteredData] = useState([]);
  const [toastStatus, setToastStatus] = useState(false);
  // search filter
  const [searchTerm, setSearchTerm] = useState("");
  //sorting
  const [sortOrder, setSortOrder] = useState({
    sortOrder: "",
    key: "",
  });
  // handle statusSwitch
  const [statusSwitch, setStatusSwitch] = useState(true);
  // handle data inside data
  const navigate = useNavigate();
  const [subArray, setSubArray] = useState([
    {
      [tableElement?.title]: data,
    },
  ]);

  useEffect(() => {
    if (jumpToChild) {
      HandleSubTable(jumpToChild)
    }
  })

  useEffect(() => {
    if (jumpToChild) {
      resetJumpToChild()
    }
  }, [data])

  useEffect(() => {
    setData(filteredData);
  }, [filteredData]);

  const OffsymbolStatus = () => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          fontSize: 10,
          color: "#fff",
          // paddingRight: 2,
        }}
      >
        {" "}
        inActive
      </div>
    );
  };
  const OnSymbolStatus = () => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          fontSize: 12,
          color: "#fff",
          // paddingRight: 4,
        }}
      >
        {" "}
        active
      </div>
    );
  };
  const handleStatusSwitch = () => {
    if (statusSwitch) {
      setIsActive(false)
      setStatusSwitch(false);
    } else {
      setStatusSwitch(true);
      setIsActive(true)
    }
  };
  const handleDropDownFilter = (e) => {
    if (e == "") {
      setData(dataSource);
      setSubArray([
        {
          Tabs: data,
        },
      ]);
    } else {
      const updatedData = dataSource.filter((val) => {
        return val.displayType == e;
      });
      setData(updatedData);
    }
  };
  const handleDropDown = (key,id) => {
    console.log(`this is dropdown ${key} and id ${id}`)
    if(key==="eventTypeId"){
      reFetchData({[key]:id})
      reFetchCompetitionData(id)
    }else if(key==="competitionId"){
      reFetchData({[key]:id})
    }
  };
  const handleSearchFilter = () => {
    console.log(tableElement.title)
    if (tableElement.title === "Tabs") {
      const updatedData = data.filter((val) => {
        const found = Object.values(val).some((value) => {
          if (typeof value === "string" || value instanceof String) {
            return value.toLowerCase().includes(searchTerm.toLowerCase());
          }
          return false;
        });
        return found === true;
      });
      if (searchTerm === "") {
        setTotal(dataSource.length);
        setFilteredData(subData);
        // setData(subData);
      } else {
        console.log(updatedData)
        setFilteredData(updatedData);
        setTotal(updatedData.length);
      }
    } else {
      console.log(searchTerm)
      const updatedData = dataSource.filter((val) => {
        const found = Object.values(val).some((value) => {
          if (typeof value === "string" || value instanceof String) {
            return value.toLowerCase().includes(searchTerm.toLowerCase());
          }
          return false;
        });
        return found === true;
      });
      console.log(updatedData)
      if (searchTerm === "") {
        setTotal(dataSource.length);
        const sliced = dataSource.slice(
          currentPage * pageSize,
          currentPage * pageSize + pageSize
        );
        setFilteredData(sliced);
      } else {
        console.log(updatedData)
        setFilteredData(updatedData);
        setTotal(updatedData.length);
      }
    }
  };
  const moveBack = (key) => {
    if (key == "Tabs") {
      setData(dataSource);
      setSubArray([
        {
          Tabs: dataSource,
        },
      ]);
      // const updatedData = subArray.filter((val)=>{
      //   return !subArray.includes(key)
      // })
    }
  };
  const HandleSubTable = (record) => {
    setData(record.children);
    const isKeyPresent = subArray.some((obj) =>
      obj.hasOwnProperty(record.displayName));
    if (!isKeyPresent) {
      setCurrentParentId(record?.tabId)
      setSubArray([...subArray, { [record.displayName]: record.children }]);
    }
  };
  const generatePDF = () => {
    let pdfCols = [];
    let colsDataKey = [];

    columns?.forEach((item) => {
      if (item.key !== "select" && item.key !== "edit" && item.key !== "image" && item.key !== "jersey" && item.key !== "tabName") {
        pdfCols.push(item.title);
        colsDataKey.push(item.key)
      }
    })

    const colsData = dataSource.map((dataItem) => colsDataKey.map((key) => dataItem[key]));

    const pdf = new jsPDF({
      orientation: "portrait", // or 'landscape'
      unit: "mm",
      format: "ledger", // or [width, height]
      fontSize: 3, // Set the font size
    });

    const headers = [pdfCols];

    let content = {
      startY: 50,
      head: headers,
      body: colsData
    };

    pdf.autoTable(content);
    pdf.save(tableElement.title + ".pdf");
  };

  const downloadExcel = () => {
    // Get the table element by its ID (adjust the ID accordingly)
    const table = document.getElementById("myTable");

    // Create a worksheet
    const ws = XLSX.utils.table_to_sheet(table);

    // Create a workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet 1");

    // Download the workbook
    XLSX.writeFile(wb, `download.xlsx`);
  };
  const sortByProperty = (order, propName) => {
    if (order !== "ascending" && order !== "descending") {
      throw new Error(
        "Invalid sorting order. Use 'ascending' or 'descending'."
      );
    }
    setSortOrder({
      sortOrder: order,
      key: propName,
    });

    const sortedData = data.slice().sort((a, b) => {
      const valueA =
        typeof a[propName] === "string"
          ? a[propName].toLowerCase()
          : a[propName];
      const valueB =
        typeof b[propName] === "string"
          ? b[propName].toLowerCase()
          : b[propName];
      if (order === "ascending") {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      } else {
        return valueB < valueA ? -1 : valueB > valueA ? 1 : 0;
      }
    });
    setData(sortedData);
  };
  // getting data for the table coming from the page && checking default status
  const fetchData = () => {
    if (tableElement?.isActive) {
      const switchData = dataSource.filter((val) => {
        return val.isActive === statusSwitch;
      });
      const sliced = switchData.slice(
        currentPage * pageSize,
        currentPage * pageSize + pageSize
      );
      setTotal(switchData.length);
      setData(switchData);
      setData(sliced);
    } else {
      const sliced = dataSource.slice(
        currentPage * pageSize,
        currentPage * pageSize + pageSize
      );
      setTotal(dataSource.length);
      setData(sliced);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const newData = [...data];
    const [movedRow] = newData.splice(result.source.index, 1);
    newData.splice(result.destination.index, 0, movedRow);
    setData(newData);
    const tabOrders = filterOrderChange(newData, changeOrderApiName);
    changeDisplayOrder(tabOrders, changeOrderApiName);
  };

  const handleTableReset = () =>{

  }

  useEffect(() => {
    handleSearchFilter();
  }, [searchTerm]);

  useEffect(() => {
    fetchData();
  }, [dataSource]);

  // import { Link } from "react-router-dom";
  return (
    <Row>
      <Col lg={12}>
        <Card>
          <CardHeader>
            <Row className="g-2">
              <Col className="col-sm-auto">
                <div className="d-flex gap-2">
                  <Button
                    color="success"
                    className="add-btn"
                    onClick={() => {
                      if (currentParentId)
                        navigate(onAddNavigate, { state: { selectedTabId: currentParentId } })
                      else navigate(onAddNavigate)
                    }}
                    id="create-btn"
                  >
                    <i className="ri-add-line align-bottom me-1"></i> Add
                  </Button>
                  {tableElement?.clone ? (
                    <Button
                      color="warning"
                      className="btn"
                      onClick={() => {
                        singleCheck.length === 1 ?
                          cloneModelFunction(true) : setToastStatus(true)
                      }}
                      id="create-btn"
                    >
                      <i className="ri-add-line align-bottom me-1"></i> Clone
                    </Button>
                  ) : null}
                  <Button
                    color="soft-danger"
                    onClick={() => {
                      singleCheck.length > 0
                        ? deleteModelFunction(true)
                        : setToastStatus(true);
                    }}
                  >
                    <i className="ri-delete-bin-2-line"></i>
                  </Button>
                  {toastStatus ? (
                    <Toaster
                      toast={toast}
                      setToast={setToast}
                      toastStatus={toastStatus}
                      setToastStatus={setToastStatus}
                    />
                  ) : null}
                  {tableElement?.headerSelect ? (
                    <div className="">
                      <select
                        className="form-select"
                        id="inlineFormSelectPref"
                        onChange={(e) => {
                          handleDropDownFilter(e.target.value);
                        }}
                      >
                        <option value="">Select Display Type</option>
                        {displayTypes.map((val, index) => {
                          return (
                            <option value={val}>
                              {val === 1
                                ? "Admin"
                                : val === 2
                                  ? "Agent"
                                  : "Vendor"}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  ) : null}
                  {tableElement?.eventTypeSelect ? (
                    <div className="">
                      <select
                        className="form-select"
                        id="inlineFormSelectPref"
                        onChange={(e) => {
                          handleDropDown("eventTypeId", e.target.value);
                        }}
                      >
                        <option value="">Select Event Type</option>
                        {eventTypes?.map((val) => {
                          return <option value={val?.eventTypeId}>{val?.eventType}</option>;
                        })}
                      </select>
                    </div>
                  ) : null}
                  {tableElement?.competitionsSelect ? (
                    <div className="">
                      <select
                        className="form-select"
                        id="inlineFormSelectPref"
                        onChange={(e) => {
                          handleDropDown("competitionId", e.target.value);
                        }}
                      >
                        <option value="">Select Competition</option>
                        {competitions?.map((val) => {
                          return <option value={val.competitionId}>{val.competition}</option>;
                        })}
                      </select>
                    </div>
                  ) : null}
                  {tableElement?.isActive ? (
                    <div className="d-flex align-items-center">
                      <Switch
                        width={70}
                        uncheckedIcon={<OffsymbolStatus />}
                        checkedIcon={<OnSymbolStatus />}
                        className="pe-0"
                        onColor="#02a499"
                        onChange={() => {
                          handleStatusSwitch();
                        }}
                        checked={statusSwitch}
                      />
                    </div>
                  ) : null}
                  {
                    tableElement?.resetButton?(<div>
                      <button
                      className="btn btn-primary"
                      onClick={() => {
                        handleReset();
                        handleTableReset()
                      }}
                      id="create-btn"
                    >
                      Reset
                      {/* <i className="ri-add-line align-bottom me-1"></i> Reset */}
                    </button>
                    </div>):null
                  }
                </div>
              </Col>
              <Col className="d-flex justify-content-end">
                {tableElement.subTable &&
                  subArray.map((val, index) => {
                    const arrayKey = Object.keys(val).find((key) =>
                      Array.isArray(val[key])
                    );
                    return (
                      <div className="d-flex flex-row align-items-center">
                        <span
                          className="cursor-pointer"
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            moveBack(arrayKey);
                          }}
                        >
                          {arrayKey}
                        </span>
                        {index !== subArray.length - 1 ? (
                          <i className="bx bxs-chevron-right ms-3 me-3" />
                        ) : null}
                      </div>
                    );
                  })}
              </Col>
            </Row>
          </CardHeader>

          <CardBody>
            <div id="customerList">
              <Row className="g-2 d-flex align-items-center">
                <Col className="col-sm-auto">
                  <span>
                    Showing {data.length} of{" "}
                    {tableElement.title === "Tabs"
                      ? data?.length
                      : dataSource?.length}{" "}
                    entries
                  </span>
                  <div className="d-flex align-items-center justify-content-end"></div>
                </Col>
                <Col className="col-sm">
                  <div className="d-flex justify-content-sm-end align-items-end flex-sm-row flex-column">
                    <div className="me-1 d-flex">
                      <CSVLink data={data} filename="table_data.csv">
                        <Button size="small" className="btn border">
                          <i className="fas fa-file-csv"></i>
                        </Button>
                      </CSVLink>
                      <Button
                        size="large"
                        className="btn border mx-1"
                        onClick={downloadExcel}
                      >
                        <i className="fas fa-file-excel"></i>
                      </Button>
                      <Button onClick={generatePDF} className="btn border">
                        <i className="bx bxs-file-pdf"></i>
                      </Button>
                    </div>
                    <div className="">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search Min. 2 characters"
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                        }}
                      />
                      {/* <i className="ri-search-line search-icon"></i> */}
                    </div>
                  </div>
                </Col>
              </Row>

              <div
                className="table-responsive table-card mt-3 mb-1"
                id="myTable"
              >
                {tableElement?.dragDrop ? (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="droppable" direction="vertical">
                      {(provided) => (
                        <table
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="table align-middle table-nowrap"
                          id="customerTable"
                        >
                          <thead className="table-light">
                            <tr>
                              {columns.map((column) => (
                                <th key={column.key} style={column.style}>
                                  <div className="d-flex">
                                    <span>{column.title}</span>
                                    {column.sort ? (
                                      <span className="d-flex flex-column align-items-center">
                                        <i
                                          className="bx bx-caret-up"
                                          onClick={() => {
                                            sortByProperty(
                                              "ascending",
                                              column.key
                                            );
                                          }}
                                          style={{
                                            color: `${sortOrder.key === column.key &&
                                              sortOrder.sortOrder ===
                                              "ascending"
                                              ? "gray"
                                              : "lightGray"
                                              }`,
                                            fontSize: "12px",
                                            marginTop: "2px",
                                            cursor: "pointer",
                                          }}
                                        ></i>
                                        <i
                                          className="bx bx-caret-down"
                                          onClick={() => {
                                            sortByProperty(
                                              "descending",
                                              column.key
                                            );
                                          }}
                                          style={{
                                            color: `${sortOrder.key === column.key &&
                                              sortOrder.sortOrder ===
                                              "descending"
                                              ? "gray"
                                              : "lightGray"
                                              }`,
                                            marginTop: "-5px",
                                            fontSize: "12px",
                                            cursor: "pointer",
                                          }}
                                        ></i>
                                      </span>
                                    ) : null}
                                  </div>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="list form-check-all">
                            {data
                              // .sort(
                              //   (a, b) =>
                              //     (a.displayOrder || 0) - (b.displayOrder || 0)
                              // )
                              .map((record, index) => (
                                <Draggable
                                  key={record.tabId}
                                  draggableId={`row-${index}`}
                                  index={index}
                                >
                                  {(provided) => (
                                    <tr
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`hover`}
                                    >
                                      {columns.map((column) => (
                                        <td
                                          key={column.key}
                                          style={column.style}
                                          onClick={() => {
                                            record?.childrenCount > 0 &&
                                              column?.key === "tabName"
                                              ? HandleSubTable(record)
                                              : setData(data);
                                            record?.childrenCount > 0 &&
                                              setSubData(record?.children);
                                          }}
                                        >
                                          {column.render
                                            ? column.render(
                                              record[column.dataIndex],
                                              record
                                            )
                                            : record[column.dataIndex]}
                                        </td>
                                      ))}
                                    </tr>
                                  )}
                                </Draggable>
                              ))}

                            {provided.placeholder}
                          </tbody>
                        </table>
                      )}
                    </Droppable>
                  </DragDropContext>
                ) : (
                  <table
                    // border={2}
                    className="table align-middle table-nowrap"
                    id="customerTable"
                  >
                    <thead className="table-light">
                      <tr>
                        {columns.map((column) => (
                          <th key={column.key} style={column.style}>
                            <div className="d-flex">
                              <span>{column.title}</span>
                              {column.sort ? (
                                <span className="d-flex flex-column align-items-center">
                                  <i
                                    className="bx bx-caret-up"
                                    onClick={() => {
                                      sortByProperty("ascending", column.key);
                                    }}
                                    style={{
                                      color: `${sortOrder.key === column.key &&
                                        sortOrder.sortOrder === "ascending"
                                        ? "gray"
                                        : "lightGray"
                                        }`,
                                      fontSize: "12px",
                                      marginTop: "2px",
                                      cursor: "pointer",
                                    }}
                                  ></i>
                                  <i
                                    className="bx bx-caret-down"
                                    onClick={() => {
                                      sortByProperty("descending", column.key);
                                    }}
                                    style={{
                                      color: `${sortOrder.key === column.key &&
                                        sortOrder.sortOrder === "descending"
                                        ? "gray"
                                        : "lightGray"
                                        }`,
                                      marginTop: "-5px",
                                      fontSize: "12px",
                                      cursor: "pointer",
                                    }}
                                  ></i>
                                </span>
                              ) : null}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="list form-check-all">
                      {data.map((record) => (
                        <tr key={record.tabId} className={`hover`}>
                          {columns.map((column) => (
                            <td
                              key={column.key}
                              style={column.style}
                              onClick={() => {
                                record?.childrenCount > 0 &&
                                  column?.key == "tabName"
                                  ? HandleSubTable(record)
                                  : setData(data);
                              }}
                            >
                              {column.render
                                ? column.render(
                                  record[column.dataIndex],
                                  record
                                )
                                : record[column.dataIndex]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                <div className="noresult" style={{ display: "none" }}>
                  <div className="text-center">
                    <lord-icon
                      src="https://cdn.lordicon.com/msoeawqm.json"
                      trigger="loop"
                      colors="primary:#121331,secondary:#08a88a"
                      style={{ width: "75px", height: "75px" }}
                    ></lord-icon>
                    <h5 className="mt-2">Sorry! No Result Found</h5>
                    <p className="text-muted mb-0">
                      We've searched more than 150+ Orders We did not find any
                      orders for you search.
                    </p>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-end">
                <Pagination
                  total={total}
                  pageSize={pageSize}
                  currentPage={currentPage}
                  fetchData={fetchData}
                  setCurrentPage={setCurrentPage}
                  setPageSize={setPageSize}
                />
              </div>
            </div>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default Index;
