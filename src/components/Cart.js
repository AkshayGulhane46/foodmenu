import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore'; // Import onSnapshot and updateDoc
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
                    const unsubscribe = onSnapshot(customerDocRef, (doc) => {
                        if (doc.exists()) {
                            const customerData = doc.data();
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
                        setLoading(false);
                    });

                    // Cleanup function
                    return () => unsubscribe();
                }
            } catch (error) {
                console.error('Error fetching cart items:', error);
                setLoading(false);
            }
        };
        fetchCartItems();
    }, [cartKey]);

    const handlePayment = () => {
        // Logic to complete payment
        alert(`Total Order Value: ${totalOrderValue}. Payment completed successfully!`);
    };

    const handleCancel = async (itemIndex) => {
        try {
            const customerDocRef = doc(db, 'customers', cartKey);
            const customerDocSnapshot = await getDoc(customerDocRef);
            if (customerDocSnapshot.exists()) {
                const customerData = customerDocSnapshot.data();
                const updatedCartItems = [...customerData.cartItems];
                updatedCartItems.splice(itemIndex, 1); // Remove item at specified index
                await updateDoc(customerDocRef, { cartItems: updatedCartItems });
                setCartItems(updatedCartItems); // Update local state
            }
        } catch (error) {
            console.error('Error removing item:', error);
        }
    };

    if (loading) {
        return <div className="loading-spinner"></div>; // Add loading spinner or animation
    }

    return (
        <div className="cart-page">
            {cartItems.length === 0?<h2>Your cart is empty</h2>:<>
            <h1>Your Cart</h1>
            <div className="cart-items">
               
                {cartItems.length > 0 && cartItems.map((item, index) => (
                    <div className="cart-item" key={index}>
                        <div className="item-details">
                            <div className="item-name">{item.quantity} X {item.DishName}</div>
                           <div className="item-total">  <span class="WebRupee">&#x20B9;</span>  {item.DishPrice * item.quantity}</div>
                        </div>
                        <div 
                        className="item-status">{item.status}</div>
                        {item.status === "Pending" && (
                            <button className="cancel-button" onClick={() => handleCancel(index)}>Cancel</button>
                        )}

                    </div>
                ))
           
                }
            </div>
            <p style={{fontStyle:'italic',color:'#d14d72'}}>*Customer cannot cancel an item if its preparing</p>
            <div className="total-order-value">Total Order Value: {totalOrderValue}</div>
            </>}
            {/* Bottom container for buttons */}
            <div className="bottom-buttons">
                <Link to="/menu" className="back-to-menu-btn">Go Back to menu</Link>
                <button className="pay-button" onClick={handlePayment}>
                    Pay Total: {totalOrderValue}
                </button>
            </div>
           
        </div>
            
    );
    
};


export default CartPage;
