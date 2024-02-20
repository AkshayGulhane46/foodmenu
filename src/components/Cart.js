import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import '../styles/cartPage.css'; // Import CSS file

const CartPage = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalOrderValue, setTotalOrderValue] = useState(0);
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
                        setCartItems(customerData.cartItems || []);

                        // Calculate total order value
                        const totalValue = customerData.cartItems.reduce((accumulator, currentItem) => {
                            const itemTotal = parseInt(currentItem.DishPrice) * currentItem.quantity;
                            return accumulator + itemTotal;
                        }, 0);
                        setTotalOrderValue(totalValue.toFixed(2));
                    } else {
                        console.log('Customer document not found');
                    }
                }
            } catch (error) {
                console.error('Error fetching cart items:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCartItems();
    }, [cartKey]);

    const handlePayment = () => {
        // Logic to complete payment
        alert(`Total Order Value: ${totalOrderValue}. Payment completed successfully!`);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="cart-page">
            <h1>Cart Page</h1>
            <table>
                <thead>
                    <tr>
                        <th>Dish</th>
                        <th>Price</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {cartItems.map((item, index) => (
                        <tr key={index}>
                            <td>{item.quantity} x {item.DishName}</td>
                            <td>{item.DishPrice}</td>
                            <td>{item.status}</td>
                        </tr>
                    ))}
                    <tr>
                        <td colSpan="2">Total Order Value:</td>
                        <td>{totalOrderValue}</td>
                    </tr>
                </tbody>
            </table>
            <button className="pay-button">
                <a href={`upi://pay?pa=${'7387870057@ybl'}&am=${totalOrderValue}&cu=INR`}>Pay by UPI</a>
            </button>

            <Link to="/menu" className="back-to-menu-btn">Go back to Menu</Link>
        </div>
    );
};

export default CartPage;
