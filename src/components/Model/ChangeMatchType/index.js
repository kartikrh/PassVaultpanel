import React,{useState, useEffect} from 'react'
import {Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import Flatpickr from "react-flatpickr";
import axiosInstance from "../../../Features/axios";
import { updateToastData } from "../../../Features/toasterSlice";
import { useDispatch, useSelector } from "react-redux";
import ReactSelect from 'react-select';
import { ERROR } from "../../../components/Common/Const";

export const ChnageMatchTypeModel = ({changeModelVisible, setChangeModelVisible, selectedCommentary,setSelectedCommentary, handleChange, setMatchType, singleCheck}) => {
    const [matchTypeList, setMatchTypeList] = useState([])
    const [selectedCommentaryVals, setSelectedCommentaryVals] = useState({})
    const dispatch = useDispatch();
    useEffect(()=>{
setSelectedCommentaryVals(selectedCommentary)
    },[])
    const fetchData = async (latestValueFromTable) => {
        await axiosInstance
          .post(`/admin/commentary/getMatchTypeListByCommentary`, {
            "commentaryId": selectedCommentary?.commentaryId,
          })
          .then((response) => {
            const apiData = response?.result
            let apiDataIdList = [];
            apiData.forEach(ele => {
              apiDataIdList.push({label: ele?.matchType, value : ele?.matchTypeId})
            })
            setMatchTypeList(apiDataIdList)
          })
          .catch((error) => {
            dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
          });
      };
      useEffect(()=>{
        fetchData()
      },[])
    return (
    <Modal isOpen={changeModelVisible} toggle={() => {setChangeModelVisible(false)}} centered >
    <div className="tablelist-form">
        <ModalBody>
            <div className="d-flex flex-column justify-content-center p-4">
                <h4 className="form-label text-left text-lg modal-header-title">Change Match Type</h4>
                <div className="d-flex my-4">
                <div style={{marginRight:"20px"}}>
                    <span style={{marginRight:"10px", fontWeight:"700"}}>Event Name:</span>
                    <span >{selectedCommentaryVals?.eventName}</span>
                </div>
                <div>
                    <span style={{marginRight:"10px", fontWeight:"700"}}>RefId:</span>
                    <span>{selectedCommentaryVals?.eventRefId}</span>
                </div>
                </div>
                {/* <h6 className='text-left mt-4 modal-header-title'>Match Type</h6> */}
                <ReactSelect
                      classNamePrefix="filter-dropdown"
                      id="matchType"
                      name="matchType"
                      defaultValue={{label: selectedCommentary?.matchType, value: selectedCommentary?.eventRefId}}
                      options={matchTypeList}
                      onChange={(e) => {
                        setSelectedCommentary({
                        matchTypeId: e?.value,
                        commentaryId: selectedCommentary?.commentaryId,
                        })
                      }}
                      required={true}
                    />
            </div>
            <div className="hstack gap-2 justify-content-end">
                <button type="button" className="btn btn-light" onClick={() => {setChangeModelVisible(false)}}>Close</button>
                <button type="submit" className="btn btn-primary" onClick={()=>{handleChange()}}>Change Match Type</button>
            </div>
        </ModalBody>
    </div>
</Modal>
  )
}