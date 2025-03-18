import React, { useState } from "react";
import {
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
} from "reactstrap";
import axiosInstance from "../../Features/axios";
import { useDispatch } from "react-redux";
import { updateToastData } from "../../Features/toasterSlice";
import { ERROR, SUCCESS } from "../../components/Common/Const";

const ResultSelectedModel = ({
  resultModelVisable,
  setResultModelVisable,
  fetchData,
  singleCheck,
}) => {
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();

  const handleSetResult = async (e) => {
    await axiosInstance
      .post(`/admin/eventMarket/sessionIsResult`, {
        password: password,
        eventMarketId: singleCheck,
        isResult: true,
      })
      .then((response) => {
        fetchData();
        setResultModelVisable(false);
        setPassword("");
        dispatch(
          updateToastData({
            data: response?.message,
            title: response?.title,
            type: SUCCESS,
          })
        );
      })
      .catch((error) => {
        dispatch(
          updateToastData({
            data: error?.message,
            title: error?.title,
            type: ERROR,
          })
        );
      });
  };

  return (
    <Modal
      isOpen={resultModelVisable}
      toggle={() => {
        setResultModelVisable(false);
        setPassword("");
      }}
      centered
    >
      <ModalHeader
        className="bg-light p-3"
        id="exampleModalLabel"
        toggle={() => {
          setResultModelVisable(false);
          setPassword("");
        }}
      >
        Set Selected Session Result
      </ModalHeader>
      <div className="tablelist-form">
        <ModalBody>
          <div className="d-flex align-items-center">
            <Label for="pass">Enter Password</Label>
            <Input
              type="password"
              id="pass"
              placeholder="Enter your password"
              value={password}
              style={{ width: "300px", marginLeft: "8px" }}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="d-flex flex-column align-items-center" id="modal-id">
            <span className="mt-4 mb-4">
              Are you sure you want to set result for selected session ?
            </span>
            <div className="hstack gap-2 justify-content-center">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => {
                  setResultModelVisable(false);
                  setPassword("");
                }}
              >
                cancel
              </button>
              <button
                className="btn btn-success"
                id="add-btn"
                onClick={() => {
                  handleSetResult();
                }}
              >
                Ok
              </button>
            </div>
          </div>
        </ModalBody>
      </div>
    </Modal>
  );
};

export default ResultSelectedModel;