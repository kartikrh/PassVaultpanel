import React, { useEffect, useState } from "react";
import { Modal, ModalBody, ModalHeader } from "reactstrap";
import axiosInstance from "../../../Features/axios";
import { Button } from "reactstrap";
import { useDispatch } from "react-redux";
import { updateToastData } from "../../../Features/toasterSlice";
import { ERROR, SUCCESS } from "../../Common/Const";
import SpinnerModel from "../SpinnerModel";

const Index = ({
  marketTemplateModelVisible,
  setMarketTemplateModelVisible,
  marketTemplateRecord,
  fetchData,
}) => {
  const [assignedMarket, setAssignedMarket] = useState([]);
  const [unassignedMarket, setUnassignedMarket] = useState([]);
  const [dltTemplate, setDltTemplate] = useState([]);
  const [saveTemplates, setSaveTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchUnassign, setSearchUnassign] = useState("");
  const [searchAssign, setSearchAssign] = useState("");

  const dispatch = useDispatch();

  const fetchTemplateByComm = async (competitionId) => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.post(
        "/admin/competition/getMatchTypeTempByComp",
        {
          competitionId: competitionId,
        }
      );
      setAssignedMarket(response?.result?.assignedTemplates);
      setUnassignedMarket(response?.result?.unassignedTemplates);
      setIsLoading(false);
    } catch (error) {
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

  useEffect(() => {
    if (marketTemplateRecord?.competitionId) {
      fetchTemplateByComm(marketTemplateRecord.competitionId);
    }
  }, []);

  const resetState = () => {
    setAssignedMarket([]);
    setUnassignedMarket([]);
    setDltTemplate([]);
    setSaveTemplates([]);
  };

  const handleMarketTemplate = async (competitionId, saveTemplates, dltTemplate) => {
    if (
      (competitionId && saveTemplates && saveTemplates?.length > 0) || 
      (dltTemplate && dltTemplate?.length > 0)
    ) {
      try {
        const response = await axiosInstance.post(
          "/admin/competition/saveCompTemplate",
          {
            competitionId: competitionId,
            saveTemplates: saveTemplates,
            dltTemplate: dltTemplate,
          }
        );
        setMarketTemplateModelVisible(false);
        resetState()
        fetchData();
        dispatch(
          updateToastData({
            data: response?.message,
            title: response?.title,
            type: SUCCESS,
          })
        );
      } catch (error) {
        setMarketTemplateModelVisible(false);
        resetState()
        dispatch(
          updateToastData({
            data: error?.message,
            title: error?.title,
            type: ERROR,
          })
        );
      }
    } else {
      dispatch(
        updateToastData({
          data: "No records assign for save or delete template.",
          title: "Commentary Template",
          type: ERROR,
        })
      );
      return;
    }
  };

  const handleAssign = (template) => {
    setUnassignedMarket((prevUnassigned) =>
      prevUnassigned.filter(
        (item) => item.marketTemplateId !== template.marketTemplateId
      )
    );
    const assignedTemplate = { ...template, id: template?.id ? template?.id : 0 };
    setAssignedMarket((prevAssigned) => [...prevAssigned, assignedTemplate]);

    if (!template?.id) {
      setSaveTemplates((prevSaveTemplates) => [
        ...prevSaveTemplates,
        {
          competitionId: marketTemplateRecord?.competitionId,
          marketTemplateId: template.marketTemplateId,
          id: template?.id ? template?.id : 0,
        },
      ]);
    } else {
      setDltTemplate((prevDltTemplate) =>
        prevDltTemplate.filter((id) => id !== template?.id)
      );
    }
  };

  const handleDelete = (template) => {
    if (template.id === 0) {
      setUnassignedMarket((prevUnassigned) => [...prevUnassigned, template]);
      setAssignedMarket((prevAssigned) =>
        prevAssigned.filter(
          (item) => item.marketTemplateId !== template.marketTemplateId
        )
      );
      setSaveTemplates((prevAssigned) =>
        prevAssigned.filter(
          (item) => item.marketTemplateId !== template.marketTemplateId
        )
      );
      return;
    } else {
      setUnassignedMarket((prevUnassigned) => [...prevUnassigned, template]);
      setAssignedMarket((prevAssigned) =>
        prevAssigned.filter((item) => item?.id !== template?.id)
      );
      setSaveTemplates((prevAssigned) =>
        prevAssigned.filter(
          (item) => item.id !== template?.id
        )
      );
      setDltTemplate((prevDltTemplate) => [...prevDltTemplate, template.id]);
    }
  };  
  const handleAssignAll = () => {
    if (unassignedMarket.length === 0) {
      dispatch(
        updateToastData({
          data: "No records for Unassign templates.",
          title: "Unassign Template Error",
          type: ERROR,
        })
      );
      return;
    }

    const updatedAssigned = unassignedMarket.map((template) => ({
      ...template,
      id: template?.id ? template?.id : 0,
    }));
    setAssignedMarket((prevAssigned) => [...prevAssigned, ...updatedAssigned]);
    const newSaveTemplates = unassignedMarket?.filter((i)=> !i?.id)?.map((template) => ({
      competitionId: marketTemplateRecord?.competitionId,
      marketTemplateId: template.marketTemplateId,
      id: template?.id ? template?.id : 0,
    }));
    setSaveTemplates((prevSaveTemplates) => [
      ...prevSaveTemplates,
      ...newSaveTemplates,
    ]);
    setDltTemplate([]);
    setUnassignedMarket([]);
  };

  const handleDeleteAll = () => {
    if (assignedMarket.length === 0) {
      dispatch(
        updateToastData({
          data: "No records for Assign templates.",
          title: "Assign Template Error",
          type: ERROR,
        })
      );
      return;
    }


    // Revert templates with id 0 back to unassigned
    setUnassignedMarket((prevUnassigned) => [
      ...prevUnassigned,
      ...assignedMarket,
    ]);

    setDltTemplate((prevDltTemplate) => [
      ...prevDltTemplate,
      ...assignedMarket
        .filter((template) => template.id !== 0)
        .map((template) => template.id),
    ]);
    setAssignedMarket([]);
    setSaveTemplates([]);
  };

  const filteredMarkets = unassignedMarket
    .filter((template) =>
      template.templateName.toLowerCase().includes(searchUnassign.toLowerCase())
    )
    .sort((a, b) => {
      if (a?.marketTypeCategoryId === b?.marketTypeCategoryId) {
        return a?.templateName.localeCompare(b?.templateName);
      }
      return a?.marketTypeCategoryId - b?.marketTypeCategoryId;
    });

  // Filter templates based on the search input
  const assignFilteredMarkets = assignedMarket
    .filter((template) =>
      template.templateName.toLowerCase().includes(searchAssign.toLowerCase())
    )
    .sort((a, b) => {
      if (a?.marketTypeCategoryId === b?.marketTypeCategoryId) {
        return a?.templateName.localeCompare(b?.templateName);
      }
      return a?.marketTypeCategoryId - b?.marketTypeCategoryId;
    });

  return (
    <Modal
      isOpen={marketTemplateModelVisible}
      toggle={() => {
        setMarketTemplateModelVisible(false);
        resetState();
      }}
      size="lg"
      centered
    >
      <ModalHeader
        className="bg-light p-3"
        id="exampleModalLabel"
        toggle={() => {
          setMarketTemplateModelVisible(false);
          resetState();
        }}
      >
        {marketTemplateRecord?.competition} ({marketTemplateRecord?.matchType}) #{marketTemplateRecord?.refId}
      </ModalHeader>
      <div className="tablelist-form">
        <ModalBody>
          <div
            className="d-flex flex-column justify-content-center"
            id="modal-id"
          >
            {isLoading && <SpinnerModel />}
            <div className="row">
              <div className="col-6">
                <div className="d-flex align-items-center justify-content-between mx-3 my-2">
                  <h5 className="modal-header-title">Unassign Templates</h5>
                  <Button
                    color={"primary"}
                    size="sm"
                    className="btn"
                    onClick={() => {
                      handleAssignAll();
                    }}
                  >
                    <i className="bx bx-plus"></i>
                  </Button>
                </div>
                <div className="py-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search Min. 2 characters"
                    value={searchUnassign}
                    onChange={(e) => setSearchUnassign(e.target.value)}
                  />
                </div>
                <ul className="list-group market-template-list">
                  {filteredMarkets.length > 0 ? (
                    filteredMarkets.map((template) => (
                      <li
                        key={template.marketTemplateId}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        {template.templateName}
                        <Button
                          color={"primary"}
                          size="sm"
                          className="btn"
                          onClick={() => {
                            handleAssign(template);
                          }}
                        >
                          <i className="bx bx-plus"></i>
                        </Button>
                      </li>
                    ))
                  ) : (
                    <li className="list-group-item text-center">No results found</li>
                  )}
                </ul>
                {/* <ul className="list-group market-template-list">
                  {unassignedMarket.length > 0 &&
                    unassignedMarket
                      .sort((a, b) => {
                        if (a?.marketTypeCategoryId == b?.marketTypeCategoryId) {
                          return a?.templateName.localeCompare(b?.templateName);
                        }
                        return a?.marketTypeCategoryId - b?.marketTypeCategoryId;
                      })
                      .map((template) => (
                        <li
                          key={template.marketTemplateId}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          {template.templateName}
                          <Button
                            color={"primary"}
                            size="sm"
                            className="btn"
                            onClick={() => {
                              handleAssign(template);
                            }}
                          >
                            <i className="bx bx-plus"></i>
                          </Button>
                        </li>
                      ))}
                </ul> */}
              </div>

              <div className="col-6">
                <div className="d-flex align-items-center justify-content-between mx-3 my-2">
                  <h5 className="modal-header-title">Assign Templates</h5>
                  <Button
                    color={"danger"}
                    size="sm"
                    className="btn"
                    onClick={() => {
                      handleDeleteAll();
                    }}
                  >
                    <i className="bx bx-minus"></i>
                  </Button>
                </div>
                <div className="py-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search Min. 2 characters"
                    value={searchAssign}
                    onChange={(e) => setSearchAssign(e.target.value)}
                  />
                </div>
                <ul className="list-group market-template-list">
                  {assignFilteredMarkets.length > 0 ? (
                    assignFilteredMarkets.map((template) => (
                      <li
                        key={template.id}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        {template.templateName}
                        <Button
                          color={"danger"}
                          size="sm"
                          className="btn"
                          onClick={() => {
                            handleDelete(template);
                          }}
                        >
                          <i className="bx bx-minus"></i>
                        </Button>
                      </li>
                    ))
                  ) : (
                    <li className="list-group-item text-center">No results found</li>
                  )}
                </ul>
                {/* <ul className="list-group market-template-list">
                  {assignedMarket.length > 0 &&
                    assignedMarket
                      .sort((a, b) => {
                        if (a?.marketTypeCategoryId === b?.marketTypeCategoryId) {
                          return a?.templateName.localeCompare(b?.templateName);
                        }
                        return a?.marketTypeCategoryId - b?.marketTypeCategoryId;
                      })
                      .map((template) => (
                        <li
                          key={template.id}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          {template.templateName}
                          <Button
                            color={"danger"}
                            size="sm"
                            className="btn"
                            onClick={() => {
                              handleDelete(template);
                            }}
                          >
                            <i className="bx bx-minus"></i>
                          </Button>
                        </li>
                      ))}
                </ul> */}
              </div>
            </div>
            <div className="hstack gap-2 justify-content-end mt-4">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => {
                  setMarketTemplateModelVisible(false);
                  resetState();
                }}
              >
                Close
              </button>
              <button
                className="btn btn-success"
                id="add-btn"
                onClick={() => {
                  handleMarketTemplate(
                    marketTemplateRecord?.competitionId,
                    saveTemplates,
                    dltTemplate
                  );
                }}
              >
                Save
              </button>
            </div>
          </div>
        </ModalBody>
      </div>
    </Modal>
  );
};

export default Index;