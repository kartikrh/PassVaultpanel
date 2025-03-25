import React, {
    useState,
    useEffect,
    forwardRef,
    useRef,
    useImperativeHandle,
} from "react";
import "./style.css";
import { useNavigate } from "react-router-dom";
import { CSVLink } from "react-csv";
import Pagination from "../../Pagination";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Button, Card, CardBody, CardHeader, Col, Row } from "reactstrap";
import axiosInstance from "../../../Features/axios";
import { Tooltip } from "antd";
import { getStatusColor, getStatusFontColor } from "../../../Pages/Commentary/CommentartConst";
import { isEmpty } from "lodash";
import { filterOrderChange } from "../../../helpers/helper";

const changeDisplayOrder = async (tabdisplayOrder, apiName) => {
    try {
        const response = await axiosInstance.post(
            `/admin/${apiName}/changeDisplayOrder`,
            tabdisplayOrder // Send the updated order data to the API
        );
        return response?.result || [];
    } catch (error) {
        throw Error(error);
    }
};

const Index = forwardRef(
    (
        {
            columns,
            dataSource,
            tableElement,
            singleCheck,
            serverCurrentPage,
            serverPageSize,
            serverTotal,
            setServerCurrentPage,
            setServerPageSize,
            changeOrderApiName,
            isPagination = true,
            setStickHeader,
            customHeaderContent // New prop for rendering custom content above the table
        },
        ref
    ) => {
        document.title = `${tableElement?.title}`;
        const [data, setData] = useState(dataSource);
        const [total, setTotal] = useState(dataSource.length);
        const [pageSize, setPageSize] = useState(localStorage.getItem("pageSize") || 10);
        const [currentPage, setCurrentPage] = useState(0);
        const [filteredData, setFilteredData] = useState([]);
        const [searchTerm, setSearchTerm] = useState("");
        const [sortOrder, setSortOrder] = useState({
            sortOrder: "",
            key: "",
        });
        const [expandedRows, setExpandedRows] = useState({});
        const navigate = useNavigate();

        useEffect(() => {
            setData(filteredData);
        }, [filteredData]);

        useEffect(() => {
            if (data.length == 0 && filteredData.length == 0) {
                if (serverCurrentPage) {
                    setServerCurrentPage(0)
                }
                setCurrentPage(0)
            }
        }, [data, filteredData])

        const toggleRow = (index) => {
            setExpandedRows((prev) => ({
                ...prev,
                [index]: !prev[index],
            }));
        };

        const handleSearchFilter = () => {
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

                if (searchTerm) {
                    setFilteredData(updatedData);
                    setTotal(updatedData.length);
                } else {
                    setTotal(dataSource.length);
                    setFilteredData(dataSource);
                }
            } else if (tableElement.title === "Auto Events") {
                const updatedData = dataSource.filter((val) => {
                    const marketIDFlag = val.marketID ? true : false; // Set the flag if `marketID` exists
                    if (marketIDFlag) {
                        const found = Object.values(val).some((value) => {
                            if (typeof value === "string" || value instanceof String) {
                                return value.toLowerCase().includes(searchTerm.toLowerCase());
                            }
                            return false;
                        });
                        return found === true;

                    }
                    else {
                        const first = Object.values(val);
                        const firstObject = first[0];
                        const found = Object.values(firstObject).some((value) => {
                            if (typeof value === "string" || value instanceof String) {
                                return value.toLowerCase().includes(searchTerm.toLowerCase());
                            }
                            return false;
                        });
                        return found === true;
                    }
                });
                if (searchTerm === "") {
                    setTotal(dataSource.length);
                    const sliced = dataSource.slice(
                        currentPage * pageSize,
                        currentPage * pageSize + pageSize
                    );
                    setFilteredData(sliced);
                } else {
                    setFilteredData(updatedData);
                    setTotal(updatedData.length);
                }
            } else {
                const updatedData = dataSource.filter((val) => {
                    const found = Object.values(val).some((value) => {
                        if (typeof value === "string" || value instanceof String) {
                            return value.toLowerCase().includes(searchTerm.toLowerCase());
                        }
                        return false;
                    });
                    return found === true;
                });
                if (searchTerm.length <= 2) {
                    setTotal(dataSource.length);
                    const sliced = dataSource.slice(
                        (currentPage == 1 ? currentPage - 1 : currentPage == 0 ? currentPage : currentPage - 1) * pageSize,
                        (currentPage == 0 ? 0 : Number((currentPage - 1) * pageSize)) + Number(pageSize)
                    );
                    setFilteredData(sliced);
                } else {
                    setFilteredData(updatedData);
                    setTotal(updatedData.length);
                }
            }
        };

        const generateSimplifiedData = () => {
            let pdfCols = ["No."];
            let colsDataKey = [];
            columns?.forEach((item) => {
                if (
                    item.key !== "select" &&
                    item.key !== "edit" &&
                    item.printType !== "ignore"
                ) {
                    pdfCols.push(item.title);
                    colsDataKey.push(item.key);
                }
            });
            const headers = [pdfCols];
            let colsData = dataSource.map((dataItem) =>
                colsDataKey.map((key) => dataItem[key])
            );
            colsData = colsData.map((value, index) => [index + 1, ...value]);
            const csvData = colsData.map((value, i) => {
                let data = {};
                value.forEach((v, i) => {
                    data = {
                        ...data,
                        [pdfCols[i]]: v,
                    };
                });
                return data;
            });
            return { headers, colsData, csvData };
        };

        const generatePDF = () => {
            const { headers, colsData } = generateSimplifiedData();

            const pdf = new jsPDF({
                orientation: "portrait", // or 'landscape'
                unit: "mm",
                format: "ledger", // or [width, height]
                fontSize: 3, // Set the font size
            });

            let content = {
                startY: 50,
                head: headers,
                body: colsData,
            };

            pdf.autoTable(content);
            pdf.save(tableElement.title + ".pdf");
        };

        const downloadExcel = () => {
            // Create a worksheet
            const ws = XLSX.utils.json_to_sheet(generateSimplifiedData().csvData);

            // Create a workbook
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Sheet 1");

            // Download the workbook
            XLSX.writeFile(wb, `${tableElement.title}.xlsx`);
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
                const valueA = a[propName];
                const valueB = b[propName];

                // Handle null or undefined values
                if (valueA == null || valueB == null) {
                    return valueA == null ? 1 : -1; // Treat null/undefined as "greater" for descending order
                }

                // If both are strings, use localeCompare
                if (typeof valueA === 'string' && typeof valueB === 'string') {
                    return order === 'ascending'
                        ? valueA.localeCompare(valueB)
                        : valueB.localeCompare(valueA);
                }

                // For numbers or other types, use subtraction for sorting
                if (typeof valueA === 'number' && typeof valueB === 'number') {
                    return order === 'ascending' ? valueA - valueB : valueB - valueA;
                }

                // Convert other types to strings and compare
                const stringValueA = String(valueA);
                const stringValueB = String(valueB);
                return order === 'ascending'
                    ? stringValueA.localeCompare(stringValueB)
                    : stringValueB.localeCompare(stringValueA);
            });

            setData(sortedData);
        };

        const sortByPropertyB = (order, propName) => {
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
                if (
                    propName == "eventTypeId" ||
                    propName == "competitionId" ||
                    propName == "commentaryId"
                ) {
                    const first = Object.values(a);
                    const second = Object.values(b);
                    const firstObject = first[0]?.id;
                    const secondObject = second[0]?.id;
                    const valueA =
                        typeof firstObject === "string"
                            ? Number(firstObject)
                            : Number(firstObject);
                    const valueB =
                        typeof secondObject === "string"
                            ? Number(secondObject)
                            : Number(secondObject);
                    if (order === "ascending") {
                        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
                    } else {
                        return valueB < valueA ? -1 : valueB > valueA ? 1 : 0;
                    }
                } else if (propName == "date") {
                    const first = Object.values(a);
                    const second = Object.values(b);
                    const firstObject = first[0]?.openDate;
                    const secondObject = second[0]?.openDate;
                    const valueA =
                        typeof firstObject === "string" ? firstObject : firstObject;
                    const valueB =
                        typeof secondObject === "string" ? secondObject : secondObject;
                    if (order === "ascending") {
                        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
                    } else {
                        return valueB < valueA ? -1 : valueB > valueA ? 1 : 0;
                    }
                } else {
                    const valueA =
                        typeof a[propName]?.name === "string"
                            ? a[propName]?.name
                            : a[propName]?.name;
                    const valueB =
                        typeof b[propName]?.name === "string"
                            ? b[propName]?.name
                            : b[propName]?.name;
                    if (order === "ascending") {
                        return valueA.localeCompare(valueB);
                    } else {
                        return valueB.localeCompare(valueA);
                    }
                }
            });

            setData(sortedData);
        };

        const fetchData = () => {
            if (tableElement?.isServerPagination) {
                const possibleNoOfPages = Math.ceil(dataSource?.length / serverPageSize);
                let sliced;
                if (serverCurrentPage < possibleNoOfPages) {
                    sliced = dataSource.slice(
                        (serverCurrentPage == 1 ? serverCurrentPage - 1 : serverCurrentPage == 0 ? serverCurrentPage : serverCurrentPage - 1) * serverPageSize,
                        (serverCurrentPage == 0 ? 0 : Number((serverCurrentPage - 1) * serverPageSize)) + Number(serverPageSize)
                    );
                } else {
                    const pageToJump = possibleNoOfPages - 1;
                    sliced = dataSource.slice(
                        pageToJump * serverPageSize,
                        Number(pageToJump * serverPageSize) + Number(serverPageSize)
                    );
                }
                setData(sliced);
            } else if (isPagination) {
                const possibleNoOfPages = Math.ceil(dataSource?.length / pageSize);
                let sliced;
                if (currentPage < possibleNoOfPages) {
                    sliced = dataSource.slice(
                        (currentPage == 1 ? currentPage - 1 : currentPage == 0 ? currentPage : currentPage - 1) * pageSize,
                        (currentPage == 0 ? 0 : Number((currentPage - 1) * pageSize)) + Number(pageSize)
                    );
                } else {
                    const pageToJump = possibleNoOfPages - 1;
                    sliced = dataSource.slice(
                        pageToJump * pageSize,
                        Number(pageToJump * pageSize) + Number(pageSize)
                    );
                }
                setData(sliced);
            }
            else {
                setData(dataSource);
            }
            setTotal(dataSource.length);
        };

        const handleDragEnd = (result) => {
            if (!result.destination) {
                return;
            }

            const newData = [...data];
            const [movedRow] = newData.splice(result.source.index, 1);
            newData.splice(result.destination.index, 0, movedRow);
            setData(newData);
            const tabOrders = filterOrderChange(newData, changeOrderApiName) || "";
            changeDisplayOrder(tabOrders, changeOrderApiName || "");
        };

        const getTableAction = () => {
            return {};
        };

        useEffect(() => {
            if (!data || data.length === 0) return;

            const idSet = new Set(singleCheck); // Convert array to Set for faster lookup

            setData(prevData =>
                prevData.map((item) => {
                    // Find the first non-null ID in the given list
                    const itemId = item.id || item.commentaryId || item.competitionId || item.playerId || item.teamId ||
                        item.paneltyId || item.eventTypeId || item.matchTypeId || item.marketTemplateId ||
                        item.displayStatusId || item.newsId || item.bannerId || item.photoLibraryId
                        || item.eventMarketId || item.errId || item.notificationId ||
                        item.vendorId || item.templateId || item.clientId || item.blockId ||
                        item.configId || item.clientSocketId || item.apiId || item.apiEndPointId;

                    return {
                        ...item,
                        isIncluded: idSet.has(itemId) // Check in Set instead of array for efficiency
                    };
                })
            );
        }, [singleCheck]);

        useEffect(() => {
            if (searchTerm.length >= 2 || searchTerm.length === 0) {
                handleSearchFilter();
            }
        }, [searchTerm, dataSource]);

        useEffect(() => {
            fetchData();
        }, [dataSource]);

        useImperativeHandle(ref, () => ({ getTableAction }));

        return (
            <Row>
                <Col lg={12}>
                    <Card className='card'>
                        <CardHeader className="p-0 p-md-2">
                            {/* Custom header content from parent component */}
                            {customHeaderContent}

                            {/* Search and export controls - kept intact */}
                            <Row className="g-2 d-flex align-items-center">
                                <Col className="col-sm-auto">
                                    {tableElement?.isServerPagination && (
                                        <span>
                                            Showing {Number(serverCurrentPage) !== 0 ?
                                                (Number(serverCurrentPage) - 1) * serverPageSize + 1 : 1} -{" "}
                                            {Number(serverCurrentPage) !== 0 ?
                                                (Number(serverCurrentPage) - 1) * serverPageSize + data.length : data.length} of{" "}
                                            {serverTotal}{" "}
                                            entries
                                        </span>
                                    )}
                                    {isPagination && !tableElement?.isServerPagination && (
                                        <span>
                                            Showing {Number(currentPage) !== 0 ?
                                                (Number(currentPage) - 1) * pageSize + 1 : 1} -{" "}
                                            {Number(currentPage) !== 0 ?
                                                (Number(currentPage) - 1) * pageSize + data.length : data.length} of{" "}
                                            {dataSource?.length}{" "}
                                            entries
                                        </span>
                                    )}
                                </Col>
                                <Col className="col-sm">
                                    <div className="d-flex justify-content-sm-end align-items-end flex-sm-row flex-column">
                                        {tableElement.title !== "Import Events" && (
                                            <div className="me-1 d-flex">
                                                <CSVLink
                                                    data={generateSimplifiedData().csvData}
                                                    filename={tableElement.title + ".csv"}
                                                >
                                                    <Tooltip title="save as csv" color={"#e8e8ea"} overlayInnerStyle={{ color: '#000' }}>
                                                        <Button size="small" className="btn border">
                                                            <i className="fas fa-file-csv"></i>
                                                        </Button>
                                                    </Tooltip>
                                                </CSVLink>
                                                <Tooltip title="save as excel" color={"#e8e8ea"} overlayInnerStyle={{ color: '#000' }}>
                                                    <Button
                                                        size="large"
                                                        className="btn border mx-1"
                                                        onClick={downloadExcel}
                                                    >
                                                        <i className="fas fa-file-excel"></i>
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip title="save as pdf" color={"#e8e8ea"} overlayInnerStyle={{ color: '#000' }}>
                                                    <Button onClick={generatePDF} className="btn border">
                                                        <i className="bx bxs-file-pdf"></i>
                                                    </Button>
                                                </Tooltip>
                                            </div>
                                        )}
                                        <div className="">
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Search Min. 2 characters"
                                                value={searchTerm}
                                                onChange={(e) => {
                                                    setSearchTerm(e.target.value);
                                                }}
                                            />
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </CardHeader>

                        <CardBody>
                            <div id="customerList">
                                <div
                                    className="table-responsive table-responsive2 table-card mt-3 mb-1"
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
                                                                        <div className="d-flex flex-row justify-content-between" style={{ visibility: column?.key === "select" && "hidden" }}>
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
                                                                                            fontSize: "14px",
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
                                                                                            marginTop: "-8px",
                                                                                            fontSize: "14px",
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
                                                            {data.map((record, index) => (
                                                                <Draggable
                                                                    key={index}
                                                                    draggableId={`row-${index}`}
                                                                    index={index}
                                                                >
                                                                    {(provided) => (
                                                                        <tr
                                                                            ref={provided.innerRef}
                                                                            {...provided.draggableProps}
                                                                            {...provided.dragHandleProps}
                                                                            className={`hover ${record.isIncluded && 'selected'}`}
                                                                        >
                                                                            {columns.map((column) => (
                                                                                <td
                                                                                    key={column.key}
                                                                                    style={column.style}
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
                                            className="table align-middle table-nowrap"
                                            id="customerTable"
                                        >
                                            <thead className={`table-light ${setStickHeader !== false ? "sticky-header" : ""}`}>
                                                <tr>
                                                    {columns.map((column) => (
                                                        <th key={column.key} style={{ ...column.style, zIndex: column?.sticky && 100, left: column?.sticky && 0 }} className={column.className}>
                                                            <div className="d-flex flex-row justify-content-between" style={{ visibility: column?.key === "select" && "hidden" }}>
                                                                <span>{column.title}</span>
                                                                {column.sort ? (
                                                                    <span className="d-flex flex-column align-items-center">
                                                                        <i
                                                                            className={"bx bx-caret-up " + column.className}
                                                                            onClick={() => {
                                                                                tableElement.title == "Import Events"
                                                                                    ? sortByPropertyB(
                                                                                        "ascending",
                                                                                        column.key
                                                                                    )
                                                                                    : sortByProperty(
                                                                                        "ascending",
                                                                                        column.key
                                                                                    );
                                                                            }}
                                                                            style={{
                                                                                color: `${sortOrder.key === column.key &&
                                                                                    sortOrder.sortOrder === "ascending"
                                                                                    ? "gray"
                                                                                    : "lightGray"
                                                                                    }`,
                                                                                fontSize: "14px",
                                                                                marginTop: "2px",
                                                                                cursor: "pointer",
                                                                            }}
                                                                        ></i>
                                                                        <i
                                                                            className={"bx bx-caret-down " + column.className}
                                                                            onClick={() => {
                                                                                tableElement.title == "Import Events"
                                                                                    ? sortByPropertyB(
                                                                                        "descending",
                                                                                        column.key
                                                                                    )
                                                                                    : sortByProperty(
                                                                                        "descending",
                                                                                        column.key
                                                                                    );
                                                                            }}
                                                                            style={{
                                                                                color: `${sortOrder.key === column.key &&
                                                                                    sortOrder.sortOrder === "descending"
                                                                                    ? "gray"
                                                                                    : "lightGray"
                                                                                    }`,
                                                                                marginTop: "-8px",
                                                                                fontSize: "14px",
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
                                                {data.map((record, index) => (
                                                    <React.Fragment key={index}>
                                                        <tr
                                                            onClick={() => toggleRow(index)}
                                                            className={`${tableElement.title === "Event Markets" ? "hover1" : "hover"} ${record.isIncluded ? "selected" : ""}`}
                                                            style={{
                                                                backgroundColor: tableElement.title === "Event Markets" && getStatusColor(+record?.status),
                                                                color: tableElement.title === "Event Markets" && getStatusFontColor(+record?.status),
                                                                cursor: tableElement.title === "Market Data Logs" && "pointer"
                                                            }}
                                                        >
                                                            {columns.map((column) => (
                                                                <td
                                                                    key={column.key}
                                                                    style={{
                                                                        color: tableElement.title === "Event Markets" && getStatusFontColor(+record?.status),
                                                                        ...column.style
                                                                    }}
                                                                    className={column?.sticky && "sticky-column"}
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
                                                        {expandedRows[index] && record.nestedTable && (
                                                            <tr>
                                                                <td
                                                                    colSpan={columns.length}
                                                                    className="p-0"
                                                                >
                                                                    {record.nestedTable}
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </React.Fragment>
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
                                                No Result
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                {!isEmpty(data) ? (
                                    <Row>
                                        <Col>{tableElement?.compToRender}</Col>
                                        <Col className="d-flex justify-content-end">
                                            {tableElement?.isServerPagination ? (
                                                <Pagination
                                                    total={serverTotal}
                                                    pageSize={serverPageSize}
                                                    currentPage={serverCurrentPage}
                                                    fetchData={fetchData}
                                                    setCurrentPage={setServerCurrentPage}
                                                    setPageSize={setServerPageSize}
                                                    isServerSide={true}
                                                />) : isPagination ? (
                                                    <Pagination
                                                        total={total}
                                                        pageSize={pageSize}
                                                        currentPage={currentPage}
                                                        fetchData={fetchData}
                                                        setCurrentPage={setCurrentPage}
                                                        setPageSize={setPageSize}
                                                        isServerSide={false}
                                                    />) : null}
                                        </Col>
                                    </Row>
                                ) : (
                                    <div className="d-flex justify-content-center no-data-available" >
                                        <span style={{ color: "lightgray" }}>
                                            No Data Available
                                        </span>
                                    </div>
                                )}
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        );
    }
);

export default Index;