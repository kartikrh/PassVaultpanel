import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearToastData } from '../../Features/toasterSlice';
import { Toast, ToastBody, ToastHeader } from 'reactstrap';
import { SUCCESS } from './Const';

const CommonToast = () => {
    const dispatch = useDispatch();
    const toastData = useSelector((state) => state?.toastData);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (toastData.data) {
            setVisible(true);

            // Automatically hide the toast after a certain duration (e.g., 3000 milliseconds)
            const timeoutId = setTimeout(() => {
                dispatch(clearToastData());
                setVisible(false);
            }, 3000);

            // Clean up the timeout on component unmount or when toast is closed
            return () => clearTimeout(timeoutId);
        }
    }, [toastData, dispatch]);

    const handleToastClose = () => {
        dispatch(clearToastData());
        setVisible(false);
    };

    if (!visible || !toastData.data) {
        return null;
    }

    return (
        <div className="position-fixed top-0 end-0 p-3 " style={{ zIndex: "1005" }}>
            <Toast
                style={{ border: `solid ${toastData.type === SUCCESS ? "Green" : "Red"} 2px` }}
                isOpen={toastData.isVisible} >
                <ToastHeader toggle={() => {
                    handleToastClose()
                }}>
                    {toastData.title || (toastData.type === SUCCESS ? "Success" : "Error")}
                </ToastHeader>
                <ToastBody color="danger">
                    <>{toastData.data}</>
                </ToastBody>
            </Toast>
        </div>
    );
};

export default CommonToast;
