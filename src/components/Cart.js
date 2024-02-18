import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';

const CartPage = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalOrderValue, setTotalOrderValue] = useState(0); // Initialize total order value
    const { search } = useLocation();
    const searchParams = new URLSearchParams(search);
    const cartKey = searchParams.get('cartKey');

    useEffect(() => {
        const fetchCartItems = async () => {
            try {
                if (cartKey) {
                    const customerDocRef = doc(db, 'customers', cartKey);
                    const customerDocSnapshot = await getDoc(customerDocRef);
                    if (customerDocSnapshot.exists()) {
                        const customerData = customerDocSnapshot.data();
                        console.log('Customer data:', customerData); // Log customer data
                        setCartItems(customerData.cartItems || []);

                        // Calculate total order value
                        const totalValue = customerData.cartItems.reduce((accumulator, currentItem) => {
                            const itemTotal = parseInt(currentItem.DishPrice) * currentItem.quantity; // Multiply price by quantity
                            return accumulator + itemTotal;
                        }, 0);
                        setTotalOrderValue(totalValue.toFixed(2)); // Convert the total value to 2 decimal places and set it
                   
                    } else {
                        console.log('Customer document not found');
                    }
                }
            } catch (error) {
                console.error('Error fetching cart items:', error);
            } finally {
                setLoading(false); // Set loading to false after fetching data
            }
        };
    
        fetchCartItems();
    }, [cartKey]);

    
    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Cart Page</h1>
            <h2>Total Order Value: {totalOrderValue}</h2>
            <ul>
                {cartItems.map((item, index) => (
                    <li key={index}>
                        <p>{item.DishName}</p> {/* Adjust this to match your item structure */}
                        <p>Price per item: {item.DishPrice}</p> {/* Adjust this to match your item structure */}
                        <p>Quantity: {item.quantity}</p> {/* Display quantity */}
                        <p>Status: {item.status}</p>
                    </li>
                ))}
            </ul>
            <Link to="/menu">Go back to Menu</Link> {/* Link to the menu page */}
        </div>
    );
};

export default CartPage;
