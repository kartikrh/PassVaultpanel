import React,{useState, useEffect} from 'react'
import {Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import Flatpickr from "react-flatpickr";


const Index = ({changePasswordVisible, setChangPasswordModelVisible, setPassword, handleChangePassword}) => {
    const adminName = "";
    return (
    <Modal isOpen={changePasswordVisible} toggle={() => {setChangPasswordModelVisible(false)}} centered >
    <div className="tablelist-form">
        <ModalBody>
            <div className="d-flex flex-column justify-content-center p-4">
                <h4 className="form-label text-center text-lg">Reset Password of {adminName}</h4>
                <h6 className='text-center mt-4'>You wont be able to revert this!</h6>
                <input type="password" onChange={(e)=>{setPassword(e.target.value)}} className="form-control text-center" required />
            </div>
            <div className="hstack gap-2 justify-content-center">
                <button type="button" className="btn btn-light" onClick={() => {setChangPasswordModelVisible(false)}}>Close</button>
                <button type="submit" className="btn btn-primary" id="add-btn" onClick={handleChangePassword}>Change Password</button>
                {/* <button type="button" className="btn btn-success" id="edit-btn">Update</button> */}
            </div>
        </ModalBody>
    </div>
</Modal>
  )
}

export default Index