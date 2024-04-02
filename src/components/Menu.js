    import React, { useState, useEffect } from 'react';
    import { Navigate, redirect, useLocation, useNavigate } from 'react-router-dom';
    import { collection, getDocs, updateDoc, doc , getDoc} from "firebase/firestore";
    import { db } from '../firebase';
    import { Link } from 'react-router-dom';
    import "../styles/menu.css"


    const Menu = ({ customerId }) => {
        // Inline style for order button 
        // saved in props 
        const [buttonStyle, setButtonStyle] = useState({
            display: 'inline-block',
            padding: '10px 20px',
            backgroundColor: '#D14D72',
            color: '#ffffff',
        });

        const [dishes, setDishes] = useState([]);
        const [dishCats, setDishCats] = useState([]);
        const [selectedCat, setSelectedCat] = useState('');
        const [customerName, setCustomerName] = useState('');
        const [customerID, setCustomerID] = useState(localStorage.getItem('customerID') || "");
        const [cartItems, setCartItems] = useState([]);
        const [searchQuery, setSearchQuery] = useState('');
        const [isSticky, setIsSticky] = useState(false);
        const [buttontext, setButtonText] = useState("Go to your Order ->")
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

        const handleSearchInputChange = (e) => {
            setSearchQuery(e.target.value);
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
        const showNotification = (name) => {
            // Update button text and style
            setButtonText(name + " is ordered >>");
            setButtonStyle(prevStyle => ({
                ...prevStyle,
                backgroundColor: '#ff5959', 
            }));
            
            setTimeout(() => {
                setButtonText("Go to your order ->");
                setButtonStyle(prevStyle => ({
                    ...prevStyle,
                    backgroundColor: '#D14D72', 
                }));
            }, 1500);
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
                    showNotification(dish.DishName);
                } else {
                    console.log('Customer document not found');
                }
            } catch (error) {
                console.error("Error adding item to cart:", error);
            }
        };
        
        const decrementQuantity = (dishId) => {
            const updatedDishes = dishes.map(dish => {
                if (dish.id === dishId && dish.quantity > 1) {
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

        useEffect(() => {
            // Function to handle scroll event
            const handleScroll = () => {
                const header = document.getElementById("myHeader");
                const sticky = header.offsetTop;
    
                if (window.scrollY > sticky) {
                    setIsSticky(true);
                } else {
                    setIsSticky(false);
                }
            };
    
            // Attach event listener for scroll event
            window.addEventListener('scroll', handleScroll);
    
            // Cleanup function to remove event listener
            return () => {
                window.removeEventListener('scroll', handleScroll);
            };
        }, []); // Empty dependency array ensures the effect is only run once

    
        return (
        <div className="menu-container">
              <div className='welcome-column'>
                <h1 className="menu-header">Restaurant Menu</h1>
                <h2 className="welcome-message">Welcome {customerName}</h2>
            </div>
             <div className="category-tabs-container">
                        <button
                            className={`category-tab ${selectedCat === "" ? 'active' : ''}`}
                            onClick={() => handleCatFilterChange({ target: { value: "" } })}
                        >
                            All
                        </button>

                        {dishCats.map((cat, index) => (
                            <button
                                key={index}
                                className={`category-tab ${selectedCat === cat ? 'active' : ''}`}
                                onClick={() => handleCatFilterChange({ target: { value: cat } })}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
          
            <div id= "myHeader" className={isSticky ? "sticky" : ""}>
                <div className="search-box-container">
                    <input
                        type="text"
                        placeholder="Search by dish name"
                        value={searchQuery}
                        onChange={handleSearchInputChange}
                        className="search-box"
                    />     
               </div> 
            </div>
         
                            
        <div className="dish-list-container">
        {selectedCat !== "" ? (
            <div>
                <h2>{selectedCat}</h2>
                <ul className="dish-list">
                    {dishes.
                    filter(dish => dish.DishCat === selectedCat).
                    filter(dish => dish.DishName.toLowerCase().includes(searchQuery.toLowerCase())).map((dish, index) => (
                        <li key={index} className={`dish-item ${dish.DishVeg ? 'veg-dish' : ''}`}>
                        <div className='dish-container'>
                                <div className='left-container'>
                                        <div className="dish-name">{dish.DishName}</div>
                                        <div className='dish-price'><span class="WebRupee">&#x20B9;</span> {dish.DishPrice}</div>
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
                                        <button className="add-to-cart-btn" onClick={() => addToCart(dish)}>Order +</button>
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
                        {dishes.filter(dish => dish.DishCat === cat).
                        filter(dish => dish.DishName.toLowerCase().includes(searchQuery.toLowerCase())).map((dish, index) => (
                           <li key={index} className={`dish-item ${dish.DishVeg ? 'veg-dish' : ''}`}>
                           <div className='dish-container'>
                               <div className='left-container'>
                                       <div className="dish-name">{dish.DishName}</div>
                                       <div className='dish-price'><span class="WebRupee">&#x20B9;</span> {dish.DishPrice}</div>
                                       <div className='dish-about'>{dish.DishAbout}</div>
                                         <div className='dish-veg'>{dish.DishVeg}</div>
                                       
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
                                       <button className="add-to-cart-btn" onClick={() => addToCart(dish)}>Order +</button>
                                   </div>
                               </div>
                           </div>
                       </li>
                        ))}
                    </ul>
                </div>
            ))
        )}
    </div>
    <div className="cart-button-container ">
     <Link to={`/cart?cartKey=${encodeURIComponent(customerID)}`} className="cart-button" style={buttonStyle}>  {buttontext} </Link></div>            
    </div>

        );
    };



    export default Menu;
