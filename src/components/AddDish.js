import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, serverTimestamp,deleteDoc,doc } from "firebase/firestore";
import { db, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "../styles/AddDish.css"

const AddDish = () => {
    const [dishName, setDishName] = useState("");
    const [dishPrepTime, setDishPrepTime] = useState("");
    const [dishAbout, setDishAbout] = useState("");
    const [dishPrice, setDishPrice] = useState(0);
    const [dishCatList, setDishCatList] = useState([]); // State for the dropdown list of dish categories
    const [newDishCat, setNewDishCat] = useState(""); // State for the newly added dish category
    const [dishVeg, setDishVeg] = useState(false);
    const [dishImage, setDishImage] = useState(null);
    const [dishes, setDishes] = useState([]);
    const [dishCat, setDishCat] = useState("");
    const [isUploading, setIsUploading] = useState(false); // State for tracking image upload status



    useEffect(() => {
        fetchDishCategories(); // Fetch dish categories when component mounts
    }, []);

    const fetchDishCategories = async () => {
        const snapshot = await getDocs(collection(db, "dishCategories"));
        const data = snapshot.docs.map(doc => doc.data().name);
        setDishCatList(data);
    }

    const addDishCategory = async () => {
        if (newDishCat) {
            // Add the new dish category to Firestore
            await addDoc(collection(db, "dishCategories"), { name: newDishCat });
            // Update the dish category list
            setDishCatList([...dishCatList, newDishCat]);
            // Clear the new dish category input field
            setNewDishCat("");
        }
    }


    const addDish = async (e) => {
        e.preventDefault();  

        try {
            let imageURL = ""; // Initialize imageURL variable
            if (dishImage) {
                const storageRef = ref(storage, `dish_images/${dishImage.name}`);    
                 setIsUploading(true); // Start uploading indicator
                
                // Upload the image to Firebase Storage
                await uploadBytes(storageRef, dishImage);

                // Get the download URL of the uploaded image
                imageURL = await getDownloadURL(storageRef);
                setIsUploading(false);
            }

            // Add the dish data to Firestore with the image URL
            const docRef = await addDoc(collection(db, "dishes"), {
                DishID: generateDishID(),
                DishName: dishName,
                DishPrepTime: dishPrepTime,
                DishAbout: dishAbout,
                DishPrice: dishPrice,
                DishVeg: dishVeg,
                DishImage: imageURL,
                DishCat: dishCat, // Use the selected dish category
                CreatedAt: serverTimestamp(),
            });

            console.log("Document written with ID: ", docRef.id);
            // Fetch data immediately after adding a new dish
            await fetchDishes();
        } catch (e) {
            console.error("Error adding document: ", e);
            setIsUploading(false); // Stop uploading indicator if an error occurs
        }
    }

    const fetchDishes = async () => {
        const snapshot = await getDocs(collection(db, "dishes"));
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDishes(data);
    }

    const removeDish = async (dishId) => {
        try {
            // Delete the dish document from Firestore
            await deleteDoc(doc(db, 'dishes', dishId));
            // Fetch updated list of dishes
            await fetchDishes();
        } catch (error) {
            console.error('Error removing dish:', error);
        }
    };
   
    useEffect(() => {
        fetchDishes();
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setDishImage(file);
    }

    const generateRandomString = (length) => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    const generateDishID = () => {
        const idLength = 10; // Adjust the length of the ID as per your requirement
        return generateRandomString(idLength);
    }

    return (
        <div>
            {isUploading && <div className="loading-indicator">Uploading...</div>}
            <div className="form-container">
            <h1>Add Dish</h1>
            <form onSubmit={addDish}>
                <label>
                    Dish Name:
                    <input
                        type="text"
                        value={dishName}
                        onChange={(e) => setDishName(e.target.value)}
                    />
                </label>
                <br />
                <label>
                    Preparation Time:
                    <input
                        type="text"
                        value={dishPrepTime}
                        onChange={(e) => setDishPrepTime(e.target.value)}
                    />
                </label>
                <br />
                <label>
                    About Dish:
                    <input
                        type="text"
                        value={dishAbout}
                        onChange={(e) => setDishAbout(e.target.value)}
                    />
                </label>
                <br />
                <label>
                    Dish Price:
                    <input
                        type="number" // Change input type to "number"
                        value={dishPrice}
                        onChange={(e) => setDishPrice(parseInt(e.target.value, 10))} // Parse input value as an integer
                    />
                </label>

                <label>
                        Dish Category:
                        <select
                            value={dishCat}
                            onChange={(e) => setDishCat(e.target.value)}
                        >
                            <option value="">Select Category</option>
                            {dishCatList.map((cat, index) => (
                                <option key={index} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </label>
                    <br />
                    <label>
                        Add New Category:
                        <input
                            type="text"
                            value={newDishCat}
                            onChange={(e) => setNewDishCat(e.target.value)}
                        />
                        <button type="button" onClick={addDishCategory}>Add</button>
                    </label>
                <br />
                <label>
                    Veg:
                    <input
                        type="checkbox"
                        checked={dishVeg}
                        onChange={(e) => setDishVeg(e.target.checked)}
                    />
                </label>
                <br />
                <label>
                    Dish Image:
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                </label>
                <br />
                <button type="submit">Add Dish</button>
            </form>
            </div>

            <h2>Dishes</h2>
            <table>
                <thead>
                    <tr>
                        <th>Dish Name</th>
                        <th>Time</th>
                        <th>About Dish</th>
                        <th>Dish Price</th>
                        <th>Veg</th>
                        <th>Dish Image</th>
                        <th>Actions</th> {/* New column for actions */}
                    </tr>
                </thead>
                <tbody>
                    {dishes.map((dish, i) => (
                        <tr key={i}>
                            <td>{dish.DishName}</td>
                            <td>{dish.DishPrepTime}</td>
                            <td>{dish.DishAbout}</td>
                            <td>{dish.DishPrice}</td>
                            <td>{dish.DishVeg ? 'Yes' : 'No'}</td>
                            <td>
                                {dish.DishImage && (
                                    <img src={dish.DishImage} alt="Dish" style={{ width: '100px', height: '100px' }} />
                                )}
                            </td>
                            <td>
                                {/* Link or button to remove the dish */}
                                <button onClick={() => removeDish(dish.id)}>Remove Dish</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default AddDish;
