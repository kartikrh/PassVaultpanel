import React,{useState, useEffect} from 'react'
import {Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import Flatpickr from "react-flatpickr";
import axiosInstance from '../../../Features/axios';
import { updateToastData } from '../../../Features/toasterSlice';
import { ERROR } from '../../Common/Const';
import { Select } from 'antd';


const ENTITY_OPTIONS = [
  { label: "Select Entity", value: "0" },
  { label: "ODI (One Day International)", value: 1 },
  { label: "TEST", value: 2 },
  { label: "T20I(Twenty20 International)", value: 3 },
  { label: "List A(Limited Over Domestic Match)", value: 4 },
  { label: "First Class", value: 5 },
  { label: "T20 Domestic", value: 6 },
  { label: "Women ODI", value: 7 },
  { label: "Women T20", value: 8 },
  { label: "Youth ODI", value: 9 },
  { label: "Youth T20", value: 10 },
  { label: "Other", value: 11 },
  { label: "Other List A", value: 12 },
  { label: "Other 1st Class", value: 13 },
  { label: "Other T20", value: 14 },
  { label: "Youth Test", value: 15 },
  { label: "Women Test", value: 16 },
  { label: "T10", value: 17 },
  { label: "T100", value: 18 },
  { label: "Women T100", value: 19 },
  { label: "TB-10", value: 20 },
];

export const MatchTypeClone = ({ cloneModelVisible, setCloneModelVisible, handleClone, setCloneName, setEntityType, singleCheck }) => {
  return (
    <Modal isOpen={cloneModelVisible} toggle={() => setCloneModelVisible(false)} centered>
      <div className="tablelist-form">
        <ModalBody>
          {singleCheck.length === 1 ? (
            <div className="d-flex flex-column justify-content-center p-4">
              <h4 className="form-label text-left text-lg modal-header-title">Clone New Match Type</h4>

              <h6 className='text-left mt-4 modal-header-title'>Match Type Name</h6>
              <input
                type="text"
                onChange={(e) => setCloneName(e.target.value)}
                className="form-control"
                required
              />

              <h6 className='text-left mt-4 modal-header-title'>Select Entity Type</h6>
              <select className="form-control" onChange={(e) => setEntityType(e.target.value)} defaultValue="0">
                {ENTITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          ) : singleCheck.length > 1 ? (
            <h4 className="text-danger text-center p-4">Select Only One Match Type</h4>
          ) : (
            <h4 className="text-danger text-center p-4">Select One MatchType To Clone</h4>
          )}

          <div className="hstack gap-2 justify-content-end">
            <button type="button" className="btn btn-light" onClick={() => {setCloneModelVisible(false)
              setEntityType(undefined)
            }}>Close</button>
            {singleCheck.length === 1 && (
              <button type="submit" className="btn btn-warning" onClick={handleClone}>Clone Match Type</button>
            )}
          </div>
        </ModalBody>
      </div>
    </Modal>
  );
};

export const CommentaryClone = ({cloneModelVisible, cloneValues, setCloneModelVisible, handleClone, setCloneValues, singleCheck}) => {
    const handleCloneValues = (e) =>{
        const {name, value} = e.target;
        setCloneValues((preValue)=>{
            return {
                ...preValue,
                [name]:value
            }
        })
    }
    const handleCloseModal = () => {
      setCloneModelVisible(false);
      setCloneValues({});
    }
    return (
    <Modal backdrop="static" isOpen={cloneModelVisible} toggle={() => {setCloneModelVisible(false)}} centered >
    <div className="tablelist-form">
        <ModalBody>
          <div className="d-flex flex-column justify-content-center p-4">
                <h4 className="form-label text-left text-lg modal-header-title">Clone New Commentary</h4>
                <h6 className='text-left mt-4 modal-header-title'>Event Name</h6>
                <input type="text" onChange={handleCloneValues} value={cloneValues?.eventName} name="eventName" className="form-control" required />
                <h6 className='text-left mt-4 modal-header-title'>Ref Id</h6>
                <input type="text" onChange={handleCloneValues} value={cloneValues?.eventRefId} name="eventRefId" className="form-control" required />
            </div>
            <div className="hstack gap-2 justify-content-end">
                <button type="button" className="btn btn-light" onClick={handleCloseModal}>Close</button>
                {singleCheck.length===1?
                <button type="submit" className="btn btn-warning" id="add-btn" onClick={()=>{handleClone()}}>Clone Commentary</button>
                :null}
            </div>
        </ModalBody>
    </div>
</Modal>
  )
}

export const MarketTemplateClone = ({cloneModelVisible, cloneValues, setCloneModelVisible, handleClone, setCloneValues, singleCheck}) => {
    const [matchType, setMatchType] = useState([]);
    const handleCloneValues = (event) =>{
        const value = event
        setCloneValues((preValue)=>{
            return {
                ...preValue,
                matchTypeID:value
            }
        })
    }
   const handleTemplateName = (event) =>{
        const { name, value } = event.target;
        setCloneValues((preValue)=>{
            return {
                ...preValue,
                [name]:value
            }
        })
    }
    const fetchData = async () => {
        await axiosInstance
          .post("admin/matchType/all", {})
          .then((response) => {
            setMatchType(
              response.result?.map((item) => {
                return { label: item.matchType, value: item.matchTypeId };
              })
            )
          })
          .catch((error) => {
            dispatchEvent(
              updateToastData({
                data: error?.message,
                title: error?.title,
                type: ERROR,
              })
            );
          });
    };
    useEffect(()=>{
    fetchData();
    },[])
    const defaultOption = matchType.find((item)=> item.value === cloneValues?.matchTypeID);
    return (
    <Modal isOpen={cloneModelVisible} toggle={() => {setCloneModelVisible(false)}} centered >
    <div className="tablelist-form">
        <ModalBody>
          <div className="d-flex flex-column justify-content-center p-4">
              <h4 className="form-label text-left text-lg modal-header-title">Clone New Market Template</h4>
              <h6 className='text-left mt-4 modal-header-title'>Template Name</h6>
              <input type="text" onChange={handleTemplateName} value={cloneValues?.templateName} name="templateName" className="form-control" required />
              <h6 className='text-left mt-4 modal-header-title'>Match Type</h6>
              <Select
              classNamePrefix="select2-selection"
              placeholder="Match Type"
              defaultValue={{
                label: defaultOption?.label,
                value: defaultOption?.value,
              }}
              id="matchTypeId"
              name="matchTypeId"
              options={matchType}
              onChange={handleCloneValues}
              required={true}
            />
            </div>
            <div className="hstack gap-2 justify-content-end">
                <button type="button" className="btn btn-light" onClick={() => {setCloneModelVisible(false)}}>Close</button>
                {singleCheck.length===1?
                <button type="submit" className="btn btn-warning" id="add-btn" onClick={()=>{handleClone()}}>Clone Market Template</button>
                :null}
            </div>
        </ModalBody>
    </div>
</Modal>
  )
}

export const MarketTemplateMultiClone = ({cloneModelVisible, cloneValues, setCloneModelVisible, handleClone, setCloneValues, singleCheck}) => {
  const [matchType, setMatchType] = useState([]);
  const handleCloneValues = (index, event) => {
    const { name, value } = event;
    const updatedCloneValues = cloneValues.map((item, i) => {
      if (i === index) {
        return { ...item, [name]: value };
      }
      return item;
    });
    setCloneValues(updatedCloneValues);
  };
  const fetchData = async () => {
      await axiosInstance
        .post("admin/matchType/all", {})
        .then((response) => {
          setMatchType(
            response.result?.map((item) => {
              return { label: item.matchType, value: item.matchTypeId };
            })
          )
        })
        .catch((error) => {
          dispatchEvent(
            updateToastData({
              data: error?.message,
              title: error?.title,
              type: ERROR,
            })
          );
        });
  };
  useEffect(()=>{
  fetchData();
  },[])
  return (
  <Modal 
    isOpen={cloneModelVisible} 
    toggle={() => {
      setCloneModelVisible(false)
    }}
  centered >
  <div className="tablelist-form">
      <ModalBody>
        <div className="d-flex flex-column justify-content-center p-4">
            <h4 className="form-label text-left text-lg modal-header-title">Multi Clone Market Template</h4>
            {cloneValues && cloneValues?.length > 0 ?
             <table className='my-3'>
              <thead>
                <tr>
                  <th className='tournament-team-name'>Template Name</th>
                  <th className='tournament-team-name'>Match Type</th>
                </tr>
              </thead>
              <tbody>
              {cloneValues.map((cloneValue, index) => (
                <tr key={index}>
                  <td>{cloneValue.templateName}</td>
                  <td>
                    <Select
                      classNamePrefix="select2-selection"
                      placeholder="Match Type"
                      defaultValue={matchType.find(
                        (item) => item.value === cloneValue.matchTypeID
                      )}
                      id={`matchTypeId-${index}`}
                      name="matchTypeID"
                      options={matchType}
                      onChange={(selectedOption) =>
                        handleCloneValues(index, {
                          name: "matchTypeID",
                          value: selectedOption,
                        })
                      }
                      className='my-1 multi-dropdown-width'
                      required={true}
                    />
                  </td>
                </tr>
                ))}
              </tbody>
            </table> : null}
            {/* {cloneValues &&
              cloneValues.length > 0 &&
              cloneValues.map((cloneValue, index) => (
                <div key={index} className="clone-item my-3">
                  <div className="d-flex align-items-center">
                    <span className="tournament-team-name">Template Name:</span>
                    <span>{cloneValue.templateName}</span>
                  </div>
                  <div className="d-flex align-items-center my-2">
                    <span className="tournament-team-name">Match Type:</span>
                    <Select
                      classNamePrefix="select2-selection"
                      placeholder="Match Type"
                      defaultValue={matchType.find(
                        (item) => item.value === cloneValue.matchTypeID
                      )}
                      id={`matchTypeId-${index}`}
                      name="matchTypeID"
                      options={matchType}
                      onChange={(selectedOption) =>
                        handleCloneValues(index, {
                          name: "matchTypeID",
                          value: selectedOption,
                        })
                      }
                      required={true}
                    />
                  </div>
                </div>
              ))} */}
          </div>
          <div className="hstack gap-2 justify-content-end">
              <button 
                type="button" 
                className="btn btn-light" 
                onClick={() => {
                  setCloneModelVisible(false)
                }}
              >Close</button>
              {singleCheck?.length > 0?
              <button type="submit" className="btn btn-success" id="add-btn" onClick={()=>{handleClone()}}>Save</button>
              :null}
          </div>
      </ModalBody>
  </div>
</Modal>
)
}