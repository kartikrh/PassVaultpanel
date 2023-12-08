import React, { useState, useEffect } from "react";
import "./style.css";
import { Link } from "react-router-dom";
import { CSVLink } from "react-csv";
import html2pdf from "html2pdf.js";

import {
  Container,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
} from "reactstrap";
import Switch from "react-switch";
const Index = ({
  columns,
  dataSource,
  subDataSourse,
  tableElement,
  addModelFunction,
  deleteModelFunction,
}) => {
  document.title = `${tableElement?.title} | ScoreCard - React Admin & Dashboard Template`;
  const [data, setData] = useState(dataSource);
  // search filter
  const [searchTerm, setSearchTerm] = useState("");
  //sorting
  const [sortOrder, setSortOrder] = useState({
    sortOrder: "",
    key: "",
  });

  // handle Switch
  const [switch3, setswitch3] = useState(true);
  const tableRef = React.useRef(null);

  const [subArray, setSubArray] = useState([
    {
      Tabs: data,
    },
  ]);
  const Offsymbol = () => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          fontSize: 12,
          color: "#fff",
          // paddingRight: 2,
        }}
      >
        {" "}
        inActive
      </div>
    );
  };

  const OnSymbol = () => {
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

  const handleDropDownFilter = (e) => {
    if (e == "") {
      setData(dataSource);
    } else {
      const updatedData = dataSource.filter((val) => {
        return val.displayType == e;
      });
      setData(updatedData);
    }
  };

  const handleSearchFilter = () => {
    console.log(searchTerm);
    if (searchTerm.length === 1) {
      setData(dataSource);
    } else if (searchTerm.length > 1) {
      const updatedData = data.filter((val) => {
        const found = Object.values(val).some((value) => {
          if (typeof value === "string" || value instanceof String) {
            return value.toLowerCase().includes(searchTerm.toLowerCase());
          }
          return false;
        });
        return found === true;
      });
      setData(updatedData);
    }
  };

  const moveBack = (key) => {
    console.log("this is what inside sub array -->>>>", subArray);
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
    console.log("this is previous array : ",subArray)
    console.log("this is comming::", record.children)
    setSubArray([...subArray, { [record.displayName]: record.children }]);
  };
  const downloadPDF = async () => {
    // Assuming 'tableRef' is a reference to your table element
    const content = tableRef.current;
    console.log("this is the content", content);
    // Configure PDF options
    const pdfOptions = {
      margin: 10,
      filename: "data.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    try {
      // Generate PDF using html2pdf
      const pdfBlob = await html2pdf()
        .from(content)
        .set(pdfOptions)
        .outputPdf();

      // Create a Blob from the Uint8Array
      const blob = new Blob([pdfBlob], { type: "application/pdf" });
      console.log(blob);
      // Create a download link and trigger the download
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "data.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
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

  const fetchData = () => {
    setData(dataSource);
  };

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
                      addModelFunction(true);
                    }}
                    id="create-btn"
                  >
                    <i className="ri-add-line align-bottom me-1"></i> Add
                  </Button>
                  <Button
                    color="soft-danger"
                    onClick={() => {
                      deleteModelFunction(true);
                    }}
                  >
                    <i className="ri-delete-bin-2-line"></i>
                  </Button>
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
                        <option value={1}>Admin</option>
                        <option value={2}>Agent</option>
                        <option value={3}>vendor</option>
                      </select>
                    </div>
                  ) : null}
                  {tableElement?.switch ? (
                    <div className="d-flex align-items-center">
                      <Switch
                        width={70}
                        uncheckedIcon={<Offsymbol />}
                        checkedIcon={<OnSymbol />}
                        className="pe-0"
                        onColor="#02a499"
                        onChange={() => {
                          setswitch3(!switch3);
                        }}
                        checked={switch3}
                      />
                    </div>
                  ) : null}
                </div>
              </Col>
              <Col className="d-flex justify-content-end">
                {subArray.map((val, index) => {
                  const arrayKey = Object.keys(val).find((key) =>
                    Array.isArray(val[key])
                  );
                  return (
                    <div className="d-flex flex-row align-items-center cursor-pointer">
                      <span
                        className="cursor-pointer"
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
                    Showing {data.length} of {data.length} entries
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
                      <Button size="large" className="btn border mx-1">
                        <i className="fas fa-file-excel"></i>
                      </Button>
                      <Button onClick={downloadPDF} className="btn border">
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
                          handleSearchFilter();
                        }}
                      />
                      {/* <i className="ri-search-line search-icon"></i> */}
                    </div>
                  </div>
                </Col>
              </Row>

              <div className="table-responsive table-card mt-3 mb-1">
                <table
                  ref={tableRef}
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
                                    color: `${
                                      sortOrder.key === column.key &&
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
                                    color: `${
                                      sortOrder.key === column.key &&
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
                              ? column.render(record[column.dataIndex], record)
                              : record[column.dataIndex]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                <div className="pagination-wrap hstack gap-2">
                  <Link className="page-item pagination-prev disabled" to="#">
                    Previous
                  </Link>
                  <ul className="pagination listjs-pagination mb-0"></ul>
                  <Link className="page-item pagination-next" to="#">
                    Next
                  </Link>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default Index;
