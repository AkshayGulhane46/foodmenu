import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import '../styles/CustomerInfoPage.css';


const CustomerInfoPage = () => {
    const [customerName, setCustomerName] = useState("");
    const [tableNumber, setTableNumber] = useState("");
    const [customerID, setCustomerID] = useState("");
    const [cartItems, setCartItems] = useState([]);

    // Get the location object using useLocation
    const location = useLocation();

    // Extract tableNumber from the URL search params
    const searchParams = new URLSearchParams(location.search);
    const tableNumberFromURL = searchParams.get('tableNumber');

    const navigate = useNavigate();

    useEffect(() => {
        // Set the tableNumber state with the value from URL when component mounts
        if (tableNumberFromURL) {
            setTableNumber(tableNumberFromURL);
        }

        // Check if there's existing customer data in local storage and prefill the form fields
        const savedCustomerName = localStorage.getItem('customerName');
        const savedCustomerID = localStorage.getItem('customerID');

        if (savedCustomerName && savedCustomerID) {
            setCustomerName(savedCustomerName);
            setCustomerID(savedCustomerID);
        }
    }, [tableNumberFromURL]);

    useEffect(() => {
        // Clear existing customer data from local storage when the component mounts
        localStorage.removeItem('customerName');
        localStorage.removeItem('customerID');
        localStorage.removeItem('cartItems');
        localStorage.removeItem('tableNumber');
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (customerName && tableNumber) {
            try {
                // Add customer data to the "customers" collection in Firestore
                const docRef = await addDoc(collection(db, "customers"), {
                    customerName,
                    tableNumber,
                    customerID,
                    cartItems: [] // Initialize cartItems as an empty array
                });
                console.log("Customer added with ID: ", docRef.id);

                // Save customer data in local storage
                localStorage.setItem('customerName', customerName);
                localStorage.setItem('customerID', docRef.id);
                localStorage.setItem('tableNumber', tableNumber);

                // Navigate to the menu page with customer name preserved in the URL as a query parameter
                navigate(`/menu?customerName=${encodeURIComponent(customerName)}&tableNumber=${encodeURIComponent(tableNumber)}`);
            } catch (error) {
                console.error("Error adding customer: ", error);
            }
        } else {
            alert("Please enter your name and select a table number.");
        }
    }

    return (
        <div className="customer-info-page">
            <h1 className="page-title">Welcome to our Hotel</h1>
            <form className="info-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  

                        <input className="form-input" type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} 
                        placeholder='Enter your name'
                        />
        
                </div>
                <button className="submit-button" type="submit">Let's order your food</button>
            </form>
        </div>
    );
}

export default CustomerInfoPage;
