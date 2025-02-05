import React, { useEffect, useState } from "react";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Table,
} from "reactstrap";
import axiosInstance from "../../../Features/axios.js";
import SpinnerModel from "../../../components/Model/SpinnerModel/index.js";

export const PenaltyControls = ({ toggle, isOpen, selectedPenalty }) => {
  const [data, setData] = useState([]);
  const [penaltyList, setPenaltyList] = useState(null);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState("");

  useEffect(() => {
    fetchData();
  }, [isOpen]);

  const handelSearch = (value = "") => {
    setSearch(value);
    const newPaneltyList = data?.filter((penalty) =>
      penalty?.label?.toLowerCase().includes(value.toLowerCase())
    );
    setPenaltyList(newPaneltyList);
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const inputElement = document.getElementById("penaltyRun");
        if (inputElement) inputElement.focus();
      }, 150);
    }
  }, [isOpen]);

  const fetchData = async () => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/paneltyRun/all`, {})
      .then((response) => {
        const apiData = response?.result;
        let apiDataIdList = [];
        apiData?.map((penaltyRun) => {
          if (penaltyRun.isActive)
            apiDataIdList.push({
              label: penaltyRun.desc,
              value: penaltyRun.run,
              id: penaltyRun.paneltyId,
            });
        });
        setData(apiDataIdList);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
      });
  };

  return (
    <div className="col">
      {/* <div backdrop="static" className="commentary-modal" zIndex={1000} isOpen={isOpen} toggle={toggle} scrollable> */}
      <div>Select Penalty Run :</div>
      <div>
        {/* {isLoading && <SpinnerModel />} */}
        <Table responsive>
          <thead>
            <Input
              id="penaltyRun"
              className="runs-input mb-3"
              type="text"
              placeholder="Penalty Run Name"
              value={search}
              onChange={(e) => handelSearch(e.target.value)}
            />
          </thead>
          <tbody>
            {(penaltyList || data)?.map((penalty) => (
              <tr key={penalty.id}>
                <td
                  role="button"
                  onClick={() => selectedPenalty(penalty.value)}
                >
                  <b>Penalty: </b>
                  {penalty.label} &nbsp;&nbsp;&nbsp;
                  <b>Runs: </b>
                  {penalty.value}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      {/* <div>
                <Button color="light" className="decision-Button text-right mx-2" onClick={() => toggle()}>Close</Button>
            </div> */}
      <div className="col d-flex justify-content-center gap-4 px-3 my-4">
        <div className="col-6" onClick={toggle}>
          <button className="score-control-conformation-close-btn">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
