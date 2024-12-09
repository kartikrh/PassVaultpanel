import React, { useEffect, useState } from "react";
import { Modal, ModalBody, ModalHeader } from "reactstrap";
import { convertDateUTCToLocal } from "../../Common/Reusables/reusableMethods";
import axiosInstance from "../../../Features/axios";
import { Button } from "reactstrap";
import { useDispatch } from "react-redux";
import { updateToastData } from "../../../Features/toasterSlice";
import { ERROR } from "../../Common/Const";
import SpinnerModel from "../../../components/Model/SpinnerModel";

const Index = ({
  marketTemplateModelVisible,
  setMarketTemplateModelVisible,
  handleMarketTemplate,
  marketTemplateRecord,
  setMarketTemplateTimeRecord,
}) => {
  const [assignedMarket, setAssignedMarket] = useState([]);
  const [unassignedMarket, setUnassignedMarket] = useState([]);
  const [dltTemplate, setDltTemplate] = useState([]);
  const [saveTemplates, setSaveTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();

  const fetchTemplateByComm = async (commentaryId) => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.post(
        "/admin/commentary/getTemplateByCom",
        {
          commentaryId: commentaryId,
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
    if (marketTemplateRecord?.commentaryId) {
      fetchTemplateByComm(marketTemplateRecord.commentaryId);
    }
  }, []);

  const handleAssign = (template) => {
    setUnassignedMarket((prevUnassigned) =>
      prevUnassigned.filter(
        (item) => item.marketTemplateId !== template.marketTemplateId
      )
    );
    const assignedTemplate = { ...template, id: 0 };
    setAssignedMarket((prevAssigned) => [...prevAssigned, assignedTemplate]);
    setSaveTemplates((prevSaveTemplates) => [
      ...prevSaveTemplates,
      {
        commentaryId: marketTemplateRecord?.commentaryId,
        marketTemplateId: template.marketTemplateId,
      },
    ]);
  };

  const handleDelete = (template) => {
    if (template.id === 0) {
      setUnassignedMarket((prevUnassigned) => [...prevUnassigned, template]);
      setAssignedMarket((prevAssigned) =>
        prevAssigned.filter(
          (item) => item.marketTemplateId !== template.marketTemplateId
        )
      );
      return;
    }

    setAssignedMarket((prevAssigned) =>
      prevAssigned.filter((item) => item.id !== template.id)
    );

    setDltTemplate((prevDltTemplate) => [...prevDltTemplate, template.id]);
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
      id: 0,
    }));
    setAssignedMarket((prevAssigned) => [...prevAssigned, ...updatedAssigned]);
    const newSaveTemplates = unassignedMarket.map((template) => ({
      commentaryId: marketTemplateRecord?.commentaryId,
      marketTemplateId: template.marketTemplateId,
    }));
    setSaveTemplates((prevSaveTemplates) => [
      ...prevSaveTemplates,
      ...newSaveTemplates,
    ]);
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

    const templatesToRevert = assignedMarket.filter(
      (template) => template.id === 0
    );

    // Revert templates with id 0 back to unassigned
    setUnassignedMarket((prevUnassigned) => [
      ...prevUnassigned,
      ...templatesToRevert,
    ]);

    setDltTemplate((prevDltTemplate) => [
      ...prevDltTemplate,
      ...assignedMarket
        .filter((template) => template.id !== 0)
        .map((template) => template.id),
    ]);
    setAssignedMarket([]);
  };

  return (
    <Modal
      isOpen={marketTemplateModelVisible}
      toggle={() => {
        setMarketTemplateModelVisible(false);
      }}
      size="lg"
      centered
    >
      <ModalHeader
        className="bg-light p-3"
        id="exampleModalLabel"
        toggle={() => {
          setMarketTemplateModelVisible(false);
        }}
      >
        {marketTemplateRecord?.eventName} (
        {convertDateUTCToLocal(marketTemplateRecord?.eventDate, "index")}) #
        {marketTemplateRecord?.eventRefId}
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
                  <h5>Unassign Templates</h5>
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
                <ul className="list-group market-template-list">
                  {unassignedMarket.length > 0 &&
                    unassignedMarket
                      .sort((a, b) => a?.marketTemplateId - b?.marketTemplateId)
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
                </ul>
              </div>

              <div className="col-6">
                <div className="d-flex align-items-center justify-content-between mx-3 my-2">
                  <h5>Assign Templates</h5>
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
                <ul className="list-group market-template-list">
                  {assignedMarket.length > 0 &&
                    assignedMarket
                      .sort((a, b) => a?.id - b?.id)
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
                </ul>
              </div>
            </div>
            <div className="hstack gap-2 justify-content-end mt-4">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => {
                  setMarketTemplateModelVisible(false);
                }}
              >
                Close
              </button>
              <button
                className="btn btn-success"
                id="add-btn"
                onClick={() => {
                  handleMarketTemplate(
                    marketTemplateRecord?.commentaryId,
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