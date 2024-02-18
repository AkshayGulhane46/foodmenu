import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc , getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const AdminPage = () => {
    const [customers, setCustomers] = useState([]);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const calculateTotalOrderValue = (cartItems) => {
        let totalValue = 0;
        cartItems.forEach(item => {
            totalValue += item.DishPrice * item.quantity; // Multiply price by quantity
        });
        return totalValue.toFixed(2); // Convert to 2 decimal places
    };

    const fetchCustomers = async () => {
        try {
            const customersCollection = collection(db, 'customers');
            const snapshot = await getDocs(customersCollection);
            const customerData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCustomers(customerData);
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };

    const removeCustomer = async (customerId) => {
        try {
            await deleteDoc(doc(db, 'customers', customerId));
            fetchCustomers(); // Refresh the customer list
        } catch (error) {
            console.error('Error removing customer:', error);
        }
    };

    const changeStatus = async (customerId, itemIndex, newStatus) => {
        try {
            const customerDocRef = doc(db, 'customers', customerId);
            const customerDocSnapshot = await getDoc(customerDocRef);
            if (customerDocSnapshot.exists()) {
                const customerData = customerDocSnapshot.data();
                const updatedCartItems = [...customerData.cartItems];
                updatedCartItems[itemIndex].status = newStatus;
                await updateDoc(customerDocRef, { cartItems: updatedCartItems });
                fetchCustomers(); // Refresh the customer list
            }
        } catch (error) {
            console.error('Error changing status:', error);
        }
    };

    const removeItem = async (customerId, itemIndex) => {
        try {
            const customerDocRef = doc(db, 'customers', customerId);
            const customerDocSnapshot = await getDoc(customerDocRef);
            if (customerDocSnapshot.exists()) {
                const customerData = customerDocSnapshot.data();
                const updatedCartItems = [...customerData.cartItems];
                updatedCartItems.splice(itemIndex, 1); // Remove item at specified index
                await updateDoc(customerDocRef, { cartItems: updatedCartItems });
                fetchCustomers(); // Refresh the customer list
            }
        } catch (error) {
            console.error('Error removing item:', error);
        }
    };

    const updateQuantity = async (customerId, itemIndex, newQuantity) => {
        try {
            const customerDocRef = doc(db, 'customers', customerId);
            const customerDocSnapshot = await getDoc(customerDocRef);
            if (customerDocSnapshot.exists()) {
                const customerData = customerDocSnapshot.data();
                const updatedCartItems = [...customerData.cartItems];
                updatedCartItems[itemIndex].quantity = newQuantity;
                await updateDoc(customerDocRef, { cartItems: updatedCartItems });
                fetchCustomers(); // Refresh the customer list
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
        }
    };

    return (
        <div>
            <h1>Admin Page</h1>
            <ul>
                {customers.map(customer => (
                    <li key={customer.id}>
                        <h2>{customer.customerName}</h2>
                        <p>Total Order Value: {calculateTotalOrderValue(customer.cartItems)}</p>
                        <button onClick={() => removeCustomer(customer.id)}>Remove Customer</button> {/* Add Remove Customer button */}
                        <ul>
                            {customer.cartItems && customer.cartItems.map((item, index) => (
                                <li key={index}>
                                    <p>{item.DishName}</p>
                                    <p>Quantity: {item.quantity}</p>
                                    <p>Status: {item.status}</p>
                                    {item.status === "Pending" && (
                                        <>
                                            <button onClick={() => changeStatus(customer.id, index, "Preparing")}>Start Preparing</button>
                                            <button onClick={() => removeItem(customer.id, index)}>Remove</button>
                                        </>
                                    )}
                                    {item.status === "Preparing" && (
                                        <button onClick={() => changeStatus(customer.id, index, "Done")}>Mark as Done</button>
                                    )}
                                    <button onClick={() => updateQuantity(customer.id, index, item.quantity + 1)}>+</button>
                                    <button onClick={() => updateQuantity(customer.id, index, item.quantity - 1)}>-</button>
                                </li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AdminPage;
