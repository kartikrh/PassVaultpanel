import React, { useEffect, useState } from "react";
import { Modal, ModalBody } from "reactstrap";
import axiosInstance from "../../../Features/axios";
import { updateToastData } from "../../../Features/toasterSlice";
import { ERROR, SUCCESS } from "../../../components/Common/Const";
import { useDispatch } from "react-redux";
import * as XLSX from "xlsx";
import axios from "axios";
export const ImportExportModel = ({
  importExportModelVisable,
  setImportExportModelVisable,
  dataSource,
  columns,
  dataToPick,
}) => {
  const [fileData, setFileData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const dispatch = useDispatch();
  const [report, setReport] = useState({
    totalNo: 0,
    successNo: 0,
    failedNo: 0,
  });
  const [failed, setFailed] = useState([]);
  const [updatedStatus, setUpdateStatus] = useState(false);
  const generateDifferentData = () => {
    let pdfCols = [];
    let colsDataKey = [];
    dataToPick?.forEach((item) => {
      pdfCols.push(item.item);
      colsDataKey.push(item.item);
    });

    const headers = [];
    let colsData = dataSource.map((dataItem) =>
      colsDataKey.map((key) => dataItem[key])
    );

    colsData = colsData.map((value, index) => [...value]);
    const csvData = colsData.map((value, i) => {
      let data = {};
      value.forEach((v, i) => {
        data = {
          ...data,
          [pdfCols[i]]: v,
        };
      });
      data = {
        ...data,
        isUpdate: 0,
      };

      return data;
    });
    return { headers, colsData, csvData };
  };
  const handleDownloadExcel = () => {
    // Create a worksheet

    const ws = XLSX.utils.json_to_sheet(generateDifferentData().csvData);

    // Create a workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet 1");

    // Download the workbook
    XLSX.writeFile(wb, `players.xlsx`);
  };
  const ImportFile = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const binaryString = event.target.result;
      const workbook = XLSX.read(binaryString, { type: "binary" });

      // Assuming the first sheet is the relevant sheet
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

      // Convert sheet to array of objects
      const sheetData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

      // Assuming the first row of the sheet contains headers
      const fileHeaders = sheetData[0];
      setHeaders(fileHeaders);

      // Remove headers from data
      sheetData.shift();
      setFileData(sheetData);
    };

    reader.readAsBinaryString(file);
  };
  const handleInputChange = (value, index, subIndex) => {
    setFileData((preValue) => {
      const updatedData = [...preValue]; // Create a shallow copy of the original array
      updatedData[index][subIndex] = value;
      updatedData[index][updatedData[index].length - 1] = 1;
      return updatedData; // Return the updated array
    });
  };
  function createObjects(keys, values) {
    const obj = {};
    keys.forEach((key, index) => {
      obj[key.item] = values[index];
    });
    return obj;
  }
  const saveData = async () => {
    const arrayOfObjects = fileData.map((values) =>
      createObjects(dataToPick, values)
    );
    const data = arrayOfObjects.filter((value) => value.isUpdate == 1);
    if (data.length > 0) {
      await axiosInstance
        .post("/admin/player/updatePlayerStats", data)
        .then((response) => {
          setUpdateStatus(true);
          dispatch(
            updateToastData({
              data: response?.message,
              title: response?.title,
              type: SUCCESS,
            })
          );
          setReport({
            totalNo: data.length || 0,
            successNo: data.length - response.result.length || 0,
            failedNo: response.result.length || 0,
          });
          setFailed(response.result);
        })
        .catch((error) => {
          dispatch(
            updateToastData({
              data: error?.message,
              title: error?.title,
              type: ERROR,
            })
          );
          setUpdateStatus(true);
        });
    } else {
      dispatch(
        updateToastData({
          data: "Note :Pls Set IsUpdate by 1 in Player Excel Sheet which Player you want to Update!",
          title: "Players not found for Update",
          type: ERROR,
        })
      );
    }
  };
  useEffect(() => {
    console.log(dataSource);
  }, []);
  return (
    <Modal
      size="xl"
      scrollable={true}
      isOpen={importExportModelVisable}
      toggle={() => {
        setImportExportModelVisable(false);
      }}
    >
      <div className="modal-header">
        <h5 className="modal-title mt-0" id="myExtraLargeModalLabel">
          Players Import and Export
        </h5>
        <button
          onClick={() => {
            setImportExportModelVisable(false);
          }}
          type="button"
          className="close"
          data-dismiss="modal"
          aria-label="Close"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div className="modal-body">
        <div className="mb-4">
          <label
            type="button"
            className="btn btn-danger "
            onClick={handleDownloadExcel}
          >
            Export
            <span>
              <a
                className="bx bx-export"
                style={{ color: "white", fontSize: "20px", marginLeft: "10px" }}
              ></a>
            </span>
          </label>
          {(" ", " ")}
          <label type="button" className="btn btn-primary " form="import">
            Import
            <span>
              <a
                className="bx bx-import"
                style={{ color: "white", fontSize: "20px", marginLeft: "10px" }}
              ></a>
            </span>
            <input
              type="file"
              id="import"
              accept=".xls, .xlsx"
              hidden
              onChange={ImportFile}
            />
          </label>
        </div>
        {updatedStatus && (
          <div
            className="d-flex justify-content-end"
            style={{ padding: "10px" }}
          >
            <div className="" style={{ marginRight: "10px" }}>
              <label type="button" className="btn btn-primary me-1">
                Total: <span className="badge ms-1">{report?.totalNo}</span>
              </label>
            </div>
            <div className="" style={{ marginRight: "10px" }}>
              <label type="button" className="btn btn-primary me-1">
                Updated: <span className="badge ms-1">{report?.successNo}</span>
              </label>
            </div>
            <div className="" style={{ marginRight: "10px" }}>
              <label type="button" className="btn btn-danger me-1">
                Failed: <span className="badge ms-1">{report?.failedNo}</span>
              </label>
            </div>
          </div>
        )}
        <table className="table align-middle table-nowrap" id="customerTable">
          <thead className="table-light">
            <tr>
              {columns.map((column) => (
                <th key={column.key} style={column.style}>
                  <div className="d-flex">
                    <span>{column.title}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {fileData.length > 0 && (
            <tbody className="list form-check-all">
              {fileData.map((val, rowIndex) => (
                <tr key={rowIndex} className={`hover`}>
                  {val.map((cellData, cellIndex) =>
                    cellIndex == 0 ? (
                      <td key={cellIndex}>
                        {columns[cellIndex]?.type === "text" ? (
                          <input
                            className="form-control"
                            disabled
                            style={
                              failed?.some((obj) => obj?.playerId == val[0])
                                ? {
                                    background: "#f2657d",
                                    border: "none",
                                    color: "white",
                                  }
                                : { border: "none", background: "transparent" }
                            }
                            type="text"
                            value={cellData}
                            onChange={(e) => {
                              handleInputChange(
                                e.target.value,
                                rowIndex,
                                cellIndex
                              );
                            }}
                          />
                        ) : columns[cellIndex]?.type === "input" ? (
                          <input
                            className="form-control"
                            type="text"
                            value={cellData}
                            onChange={(e) => {
                              handleInputChange(
                                e.target.value,
                                rowIndex,
                                cellIndex
                              );
                            }}
                          />
                        ) : null}
                      </td>
                    ) : (
                      <td key={cellIndex}>
                        {columns[cellIndex]?.type === "text" ? (
                          <input
                            className="form-control"
                            disabled
                            style={{
                              border: "none",
                              background: "transparent",
                            }}
                            type="text"
                            value={cellData}
                            onChange={(e) => {
                              handleInputChange(
                                e.target.value,
                                rowIndex,
                                cellIndex
                              );
                            }}
                          />
                        ) : columns[cellIndex]?.type === "input" ? (
                          <input
                            className="form-control"
                            type="text"
                            value={cellData}
                            onChange={(e) => {
                              handleInputChange(
                                e.target.value,
                                rowIndex,
                                cellIndex
                              );
                            }}
                          />
                        ) : null}
                      </td>
                    )
                  )}
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>
      <div className="modal-footer">
        <button
          type="button"
          onClick={() => {
            setImportExportModelVisable(false);
          }}
          className="btn btn-secondary "
          data-dismiss="modal"
        >
          Close
        </button>
        <button type="button" className="btn btn-primary " onClick={saveData}>
          Save changes
        </button>
      </div>
    </Modal>
  );
};
