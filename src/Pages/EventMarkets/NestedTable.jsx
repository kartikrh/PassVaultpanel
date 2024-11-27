import React from "react";
import { Card, CardBody } from "reactstrap";

const NestedTable = ({ data }) => {
  const nestedColumns = [
    {
      title: "Runner",
      dataIndex: "runner",
      key: "runner",
      style: { width: "10%" },
    },
    {
      title: "Lay Price",
      dataIndex: "layPrice",
      key: "layPrice",
      style: { width: "5%", textAlign: "center" },
    },
    {
      title: "Lay Size",
      dataIndex: "laySize",
      key: "laySize",
      style: { width: "5%", textAlign: "center" },
    },
    {
      title: "Back Price",
      dataIndex: "backPrice",
      key: "backPrice",
      style: { width: "5%", textAlign: "center" },
    },
    {
      title: "Back Size",
      dataIndex: "backSize",
      key: "backSize",
      style: { width: "5%", textAlign: "center" },
    },
    {
      title: "Line",
      dataIndex: "line",
      key: "line",
      style: { width: "5%", textAlign: "center" },
    },
    {
      title: "Over Rate",
      dataIndex: "overRate",
      key: "overRate",
      style: { width: "5%", textAlign: "center" },
    },
    {
      title: "Under Rate",
      dataIndex: "underRate",
      key: "underRate",
      style: { width: "5%", textAlign: "center" },
    },
  ];

  return (
    <Card>
      <CardBody>
        <div
          className="table-responsive table-responsive2 table-card"
          id="myTableNested"
        >
          <table className="table align-middle table-nowrap">
            <thead className="table-light">
              <tr>
                {nestedColumns.map((column) => (
                  <th key={column.key} style={column.style}>
                    {column.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="list form-check-all">
              {data && data.length > 0 ? (
                data.map((item, index) => (
                  <tr key={index}>
                    {nestedColumns.map((column) => (
                      <td key={column.key} style={column.style}>
                        {item[column.dataIndex]}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={nestedColumns.length}>No data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
};

export default NestedTable;
