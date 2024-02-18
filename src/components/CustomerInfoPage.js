import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Assuming you have a firebase configuration file

const CustomerInfoPage = () => {
    const [customerName, setCustomerName] = useState("");
    const [tableNumber, setTableNumber] = useState("");
    const [customerID, setCustomerID] = useState("");
    const [cartItems, setCartItems] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        // Check if there's existing customer data in local storage and prefill the form fields
        const savedCustomerName = localStorage.getItem('customerName');
        const savedTableNumber = localStorage.getItem('tableNumber');
        const savedCustomerID = localStorage.getItem('customerID');

        if (savedCustomerName && savedTableNumber && savedCustomerID) {
            setCustomerName(savedCustomerName);
            setTableNumber(savedTableNumber);
            setCustomerID(savedCustomerID);
        }
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
                localStorage.setItem('tableNumber', tableNumber);
                localStorage.setItem('customerID', docRef.id);

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
        <div>
            <h1>Customer Information</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>
                        Customer Name:
                        <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                    </label>
                </div>
                <div>
                    <label>
                        Table Number:
                        <input type="number" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} />
                    </label>
                </div>
                <button type="submit">Submit</button>
            </form>
        </div>
    );
}

export default CustomerInfoPage;
