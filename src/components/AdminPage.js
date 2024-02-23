import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, setDoc , serverTimestamp ,getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import '../styles/adminPage.css'; // Import CSS file

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
        <div className="admin-page">
            <h1>Admin Page</h1>
            <div className='add-dish-btn'><Link to='/addDish'><button>Add new dish</button></Link></div>   
       
            <div className="customer-grid">
                {customers.map(customer => (
                    <div key={customer.id} className="customer-box">
                        <div className='name-div'>Customer Name - {customer.customerName}</div>
                        <div className='total-value-div'>Total: {calculateTotalOrderValue(customer.cartItems)}</div>
                        <div className='table-number-div'>Table no.: {customer.tableNumber}</div>
                        <div className='remove-customer'>
                            <button onClick={() => removeCustomer(customer.id)}>Remove Customer</button>
                        </div>
                        <div className='order-details'>
                            <table className="order-table">
                                <thead>
                                    <tr>
                                        <th>Dish</th>
                                        <th>Qty</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customer.cartItems && customer.cartItems.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.DishName}</td>
                                            <td>{item.quantity}
                                            <>
                                            <div className='quantity-div'>
                                                <button onClick={() => updateQuantity(customer.id, index, item.quantity + 1)}>+</button>
                                                <button onClick={() => updateQuantity(customer.id, index, item.quantity - 1)}>-</button>
                                            </div>
                                            </>
                                              </td>
                                            <td>{item.status}</td>
                                            <td>
                                                {item.status === "Pending" && (
                                                    <>
                                                    <div className='status-buttons'>
                                                        <button onClick={() => changeStatus(customer.id, index, "Preparing")}>Start</button>
                                                        <button onClick={() => removeItem(customer.id, index)}>Remove</button>
                                                    </div>
                                                    </>
                                                    
                                                )}
                                                {item.status === "Preparing" && (
                                                    <>
                                                        <button onClick={() => changeStatus(customer.id, index, "Done")}>Done</button>
                                                        <br /> {/* New line */}
                                                    </>
                                                )}
                                                 </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminPage;
