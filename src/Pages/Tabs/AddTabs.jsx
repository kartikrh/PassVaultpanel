import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import FormBuilder from '../../components/Common/Reusables/FormBuilder';
import { TabFields } from '../../constants/FieldConst/TabFieldConst';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function AddTabs() {
    const finalizeRef = useRef(null);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [initialEditData, setInitialEditData] = useState(undefined);
    let navigate = useNavigate();
    const query = useQuery();
    const id = query.get('id');

    useEffect(() => {
        if (id) {
            fetchData(id);
        }
    }, [id]);

    const fetchData = async (id) => {
        try {
            const response = await fetch(`https://your-api-endpoint.com/data?id=${id}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setInitialEditData(data);
        } catch (error) {
            console.error('Error fetching data:', error);
            setSnackbarMessage('Error fetching data');
        }
    };

    const handleSaveClick = async () => {
        try {
            const postData = {
                // your data here
            };

            // Replace with your API endpoint
            const response = await fetch('https://your-api-endpoint.com/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            // Show snackbar on success
            setSnackbarMessage("Data saved successfully!");
        } catch (error) {
            console.error('Error saving data:', error);
            setSnackbarMessage("");
        }
    };

    const handleBackClick = () => {
        navigate("/tabs");
    };

    const handleCloseSnackbar = () => {
        setSnackbarMessage('');
    };

    return (
        <div>
            <h1>Tabs</h1>
            <button className="btn btn-danger" onClick={handleBackClick}>Back</button>
            <button className="btn btn-primary" onClick={handleSaveClick}>Save</button>
            <FormBuilder
                ref={finalizeRef}
                fields={TabFields}
                propsFormData={initialEditData}
            />

            {snackbarMessage && (
                <div className="alert alert-success" role="alert" style={{ position: 'fixed', bottom: '20px', right: '20px' }} onClick={handleCloseSnackbar}>
                    {snackbarMessage}
                </div>
            )}
        </div>
    );
}

export default AddTabs;
