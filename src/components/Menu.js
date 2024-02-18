import React, { useState, useEffect } from 'react';
import { Navigate, redirect, useLocation, useNavigate } from 'react-router-dom';
import { collection, getDocs, updateDoc, doc , getDoc} from "firebase/firestore";
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import "../styles/menu.css"

const Menu = ({ customerId }) => {
    const [dishes, setDishes] = useState([]);
    const [dishCats, setDishCats] = useState([]);
    const [selectedCat, setSelectedCat] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [customerID, setCustomerID] = useState(localStorage.getItem('customerID') || "");
    const [cartItems, setCartItems] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCustomerInfo();
        fetchDishes();
        fetchDishCats();
    }, []);

    const fetchCustomerInfo = async () => {
        try {
            const customerDocRef = doc(db, "customers", customerID);
            const customerDocSnapshot = await getDoc(customerDocRef);
            
            if (customerDocSnapshot.exists()) {
                const customerData = customerDocSnapshot.data();
                setCustomerName(customerData.customerName);
            } else {
      
                navigate("/customerinfo");
            }
        } catch (error) {
            console.error("Error fetching customer info:", error);
        }
    };

    const fetchDishes = async () => {
        try {
            const snapshot = await getDocs(collection(db, "dishes"));
            const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, quantity: 1 }));
            setDishes(data);
        } catch (error) {
            console.error("Error fetching dishes:", error);
        }
    };

    const fetchDishCats = async () => {
        try {
            const snapshot = await getDocs(collection(db, "dishCategories"));
            const data = snapshot.docs.map(doc => doc.data().name);
            setDishCats(data);
        } catch (error) {
            console.error("Error fetching dish categories:", error);
        }
    };

    const handleCatFilterChange = (e) => {
        const value = e.target.value;
        setSelectedCat(value);
    };



    const addToCart = async (dish) => {
        try {
            const customerDocRef = doc(db, "customers", customerID);

            const customerDocSnapshot = await getDoc(customerDocRef);
            
            if (customerDocSnapshot.exists()) {
                const customerData = customerDocSnapshot.data();
                const existingCartItems = customerData.cartItems || [];
                
                // Add the dish to the existing cartItems with a default status
                const updatedCartItems = [...existingCartItems, { ...dish, status: "Pending" }];
                
                // Update the cart items in Firestore
                await updateDoc(customerDocRef, { cartItems: updatedCartItems });
    
                // Update cart items in local storage
                setCartItems(updatedCartItems);
            } else {
                console.log('Customer document not found');
            }
        } catch (error) {
            console.error("Error adding item to cart:", error);
        }
    };
    
    const decrementQuantity = (dishId) => {
        const updatedDishes = dishes.map(dish => {
            if (dish.id === dishId && dish.quantity > 0) {
                dish.quantity--;
            }
            return dish;
        });
        setDishes(updatedDishes);
    };

    const incrementQuantity = (dishId) => {
        const updatedDishes = dishes.map(dish => {
            if (dish.id === dishId) {
                dish.quantity++;
            }
            return dish;
        });
        setDishes(updatedDishes);
    };

  
    return (
        <div className="menu-container">
            <h1 className="menu-header">Menu</h1>
            <h1 className="welcome-message">Welcome {customerName}</h1>
            <select value={selectedCat} onChange={handleCatFilterChange} className="category-select">
                <option value="">All Categories</option>
                {dishCats.map((cat, index) => (
                    <option key={index} value={cat}>{cat}</option>
                ))}
            </select>
            <div className="dish-list-container">
    {selectedCat !== "" ? (
        <div>
            <h2>{selectedCat}</h2>
            <ul className="dish-list">
                {dishes.filter(dish => dish.DishCat === selectedCat).map((dish, index) => (
                    <li key={index} className="dish-item">
                        <div className='dish-container'>
                            <div className='left-container'>
                                    <div className="dish-name">{dish.DishName}</div>
                                    <div className='dish-price'>   <span class="WebRupee">&#x20B9;</span> {dish.DishPrice}</div>
                                  
                                    <div className='dish-about'>{dish.DishAbout}</div>
                                 
                            </div>
                            <div className='right-container'>
                                    <div className='image-container'>
                                    {dish.DishImage && (
                                        <img src={dish.DishImage} alt="Dish" className="dish-image" />
                                    )}
                                    </div>

                                   

                            </div>

                            <div className='bottom-container'>

                            <div className="quantity-controls">
                                    <div className="quantity-btns">
                                            <button className="quantity-btn" onClick={() => decrementQuantity(dish.id)}>-</button>
                                            <span className="quantity">{dish.quantity}</span>
                                            <button className="quantity-btn" onClick={() => incrementQuantity(dish.id)}>+</button>
                                    </div>
                                </div>

                            <div className='add-to-cart'>
                                    <button className="add-to-cart-btn" onClick={() => addToCart(dish)}>Add to Cart</button>
                                    </div>

                            </div>
                            
                            
                         
                           
                            
                            
                            

                        </div>
                    </li>
                ))}
            </ul>
        </div>
    ) : (
        dishCats.map((cat, index) => (
            <div key={index}>
                <h2>{cat}</h2>
                <ul className="dish-list">
                    {dishes.filter(dish => dish.DishCat === cat).map((dish, index) => (
                        <li key={index} className="dish-item">
                            <div className="dish-details">{dish.DishName} - {dish.DishPrice}</div>
                            {dish.DishImage && (
                                <img src={dish.DishImage} alt="Dish" className="dish-image" />
                            )}
                            <div className="quantity-controls">
                                <button className="add-to-cart-btn" onClick={() => addToCart(dish)}>Add to Cart</button>
                                <div className="quantity-btns">
                                    <button className="quantity-btn" onClick={() => decrementQuantity(dish.id)}>-</button>
                                    <span className="quantity">{dish.quantity}</span>
                                    <button className="quantity-btn" onClick={() => incrementQuantity(dish.id)}>+</button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        ))
    )}
</div>

            <Link to={`/cart?cartKey=${encodeURIComponent(customerID)}`} className="cart-link">Go to Cart</Link>
        </div>
    );
};

export default Menu;
