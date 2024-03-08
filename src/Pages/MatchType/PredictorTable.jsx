import React, { useState, forwardRef, useImperativeHandle } from "react";
import "./style.css";
import "jspdf-autotable";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Card, CardBody, Col, Row } from "reactstrap";
import axiosInstance from "../../Features/axios";
import { filterOrderChange } from "../../helpers/helper";
import { ReusableBreadcrumbs } from "../../components/Common/Reusables/Breadcrumbs";
const changeDisplayOrder = async (tabdisplayOrder, apiName) => {
  try {
    const response = await axiosInstance.post(
      `/admin/${apiName}/changeDisplayOrder`,
      tabdisplayOrder
    );
    return response?.result || [];
  } catch (error) {
    throw Error(error);
  }
};
const PredictorTable = forwardRef(
  (
    {
      columns,
      dataSource,
      tableElement,
      cloneModelFunction,
      deleteModelFunction,
      singleCheck,
      setImportExportModelVisable,
      eventTypes,
      reFetchData,
      handleReset,
      competitions,
      onAddNavigate,
      changeOrderApiName,
      isAddPermission,
      isDeletePermission,
      breadCrumbs,
      onBreadCrumbsClick,
      teams,
      setDateRange,
      dateRange,
    },
    ref
  ) => {
    document.title = `${tableElement?.title}`;
    const [data, setData] = useState(dataSource);
    const [tableActions, setTableActions] = useState({
      isActive: true,
    });

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
      return tableActions;
    };

    useImperativeHandle(ref, () => ({ getTableAction }));
    return (
      <Row>
        <Col lg={12}>
          <Card>
            <CardBody>
              <div id="customerList">
                {breadCrumbs && (
                  <ReusableBreadcrumbs
                    listToRender={breadCrumbs}
                    updateClickedId={onBreadCrumbsClick}
                  />
                )}
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
                                    </div>
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="list form-check-all">
                              {dataSource.map((record, index) => (
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
                                      className={`hover`}
                                    >
                                      {columns.map((column) => (
                                        <>
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
                                        </>
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
                      <tbody className="list form-check-all">
                        {dataSource.map((record, index) => (
                          <tr key={index} className={`hover`}>
                            {columns.map((column) => (
                              <td key={column.key} style={column.style}>
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
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    );
  }
);

export default PredictorTable;
