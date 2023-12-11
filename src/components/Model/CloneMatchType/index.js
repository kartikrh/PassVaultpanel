import React,{useState, useEffect} from 'react'
import {Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import Flatpickr from "react-flatpickr";


const Index = ({cloneModelVisible, setCloneModelVisible, handleClone, setCloneName}) => {
    
    return (
    <Modal isOpen={cloneModelVisible} toggle={() => {setCloneModelVisible(false)}} centered >
    <div className="tablelist-form">
        <ModalBody>
            <div className="d-flex flex-column justify-content-center p-4">
                <h4 className="form-label text-center text-lg">Cloning the Selected Match Type</h4>
                <h6 className='text-center mt-4'>Please Enter the Clone Name</h6>
                <input type="text" onChange={(e)=>{setCloneName(e.target.value)}} className="form-control text-center" required />
            </div>
            <div className="hstack gap-2 justify-content-center">
                <button type="button" className="btn btn-light" onClick={() => {setCloneModelVisible(false)}}>Close</button>
                <button type="submit" className="btn btn-warning" id="add-btn" onClick={()=>{handleClone()}}>Clone Match Type</button>
                {/* <button type="button" className="btn btn-success" id="edit-btn">Update</button> */}
            </div>
        </ModalBody>
    </div>
</Modal>
  )
}

export default Index