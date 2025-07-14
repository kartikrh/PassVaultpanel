import React, { useState, useEffect } from "react";
import { Input, Modal, ModalBody } from "reactstrap";
import axiosInstance from "../../../Features/axios";
import Select from "react-select";

export const ChangeCompititionModel = ({
  compititonModelVisible,
  setCompititonModelVisible,
  selectedCompititon,
  setSelectedCompititon,
  handleChange,
  singleCheck,
  setSelectedTableElements,
  selectedTableElements
}) => {
    const [competitionList, setCompetitionList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [eventTypes, setEventTypes] = useState([]);
    const [eventTypeId, setEventTypeId] = useState(null);
    const [EventTypeActive, setEventTypeActive] = useState(true);

    useEffect(() => {
        if (selectedCompititon) {
            setSelectedTableElements({
            eventType: selectedCompititon.eventTypeId
                ? {
                    value: selectedCompititon.eventTypeId,
                    label: selectedCompititon.eventType,
                }
                : null,
            competition: selectedCompititon.competitionId
                ? {
                    value: selectedCompititon.competitionId,
                    label: selectedCompititon.competition,
                }
                : null,
            });

            // Also sync eventTypeId state to trigger competition list fetch
            setEventTypeId(selectedCompititon.eventTypeId || null);
        }
    }, [selectedCompititon]);


    useEffect(() => {
        if (eventTypes && eventTypeId) {
            const selectedEventType = eventTypes.find(
                (item) => item.eventTypeId === eventTypeId
            );

            if (selectedEventType) {
                setSelectedTableElements((prev) => ({
                    ...prev,
                    eventType: {
                        value: selectedEventType.eventTypeId,
                        label: selectedEventType.eventType,
                    },
                }));
            }
        }
    }, [eventTypes, eventTypeId]);

    useEffect(() => {
        fetchEventTypeData()
    }, [])

    useEffect(() => {
        if(eventTypeId || selectedCompititon.eventType){
            fetchCompetitionList(eventTypeId || selectedCompititon.eventTypeId);
        }
    }, [eventTypeId, selectedCompititon.eventType])

    const fetchEventTypeData = async () => {
        setIsLoading(true)
        await axiosInstance
        .post(`/admin/eventMarket/eventTypeList`, {
            isActive: EventTypeActive,
        })
        .then((response) => {
            setEventTypes(response.result);
            setIsLoading(false);
        })
        .catch((error) => {});
    };
    const fetchCompetitionList = async (eventTypeId) => {
        setIsLoading(true)
        await axiosInstance
            .post(`/admin/eventMarket/competitionListByEventTypeId`, {
            eventTypeId: eventTypeId,
        })
        .then((response) => {
        setCompetitionList(response.result);
        setIsLoading(false);
        })
        .catch((error) => {});
    };

  return (
    <Modal
      isOpen={compititonModelVisible}
      toggle={() => {
        setCompititonModelVisible(false);
      }}
      centered
    >
      <div className="tablelist-form">
        <ModalBody>
          <div className="d-flex flex-column justify-content-center p-4">
            <h4 className="form-label text-left text-lg modal-header-title">Change Competition</h4>
            <div className="d-flex my-4">
              <div style={{ marginRight: "20px" }}>
                <span style={{ marginRight: "10px", fontWeight: "700" }}>
                  Event Name:
                </span>
                <span>{selectedCompititon?.eventName}</span>
              </div>
              <div>
                <span style={{ marginRight: "10px", fontWeight: "700" }}>
                  RefId:
                </span>
                <span>{selectedCompititon?.eventRefId}</span>
              </div>
            </div>
            <div style={{ flex: '1 1 50%' }}>
                <label className="form-label">Event Type:</label>
                <Select
                    styles={{ control: (base) => ({ ...base }) }}
                    value={selectedTableElements?.eventType ? selectedTableElements?.eventType : selectedCompititon.eventType}
                    // isDisabled = {eventMarketId || storedData}
                    // isDisabled = {location?.state?.eventType?.value || location?.state?.eventTypeName || isEdit}
                    placeholder="Event Type"
                    onChange={(e) => {
                    setSelectedTableElements({
                        eventType: e,
                        competition: null,
                    });
                    setEventTypeId(e?.value);
                    }}
                    options={[
                    { label: "Select Event Type", value: null },
                    ...eventTypes.map((item) => ({
                        label: item?.eventType,
                        value: item?.eventTypeId,
                    })),
                    ]}
                    classNamePrefix="filter-dropdown"
                />
            </div>

            {/* Competition */}
            <div style={{ flex: '1 1 50%' }}>
                <label className="form-label">Competition:</label>
                <Select
                    styles={{ control: (base) => ({ ...base}) }}
                    value={selectedTableElements?.competition ? selectedTableElements?.competition : selectedCompititon.competition}
                    // isDisabled = {eventMarketId || storedData}
                    // isDisabled = {location?.state?.competition || location?.state?.competitionName || isEdit}
                    placeholder="Competition List"
                    onChange={(e) => {
                    setSelectedTableElements((prev) => ({
                        ...prev,
                        competition: e,
                        eventName: null,
                    }));
                    }}
                    options={competitionList.map((item) => {
                        return {
                        label: item?.competition,
                        value: item?.competitionId,
                        }
                    })}
                    classNamePrefix="filter-dropdown"
                />
            </div>
          </div>
          <div className="hstack gap-2 justify-content-end">
            <button
              type="button"
              className="btn btn-light"
              onClick={() => {
                setCompititonModelVisible(false);
              }}
            >
              Close
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              onClick={() => {
                handleChange();
              }}
            >
              Change Competition
            </button>
          </div>
        </ModalBody>
      </div>
    </Modal>
  );
};
