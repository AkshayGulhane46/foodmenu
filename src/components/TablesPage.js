import React, { useState } from 'react';
import { collection, addDoc } from "firebase/firestore";
import { db } from '../firebase';

const TablesPage = () => {
    const [tableNumber, setTableNumber] = useState("");

    const addTable = async () => {
        if (tableNumber.trim() !== "") {
            try {
                await addDoc(collection(db, "tables"), { tableNumber });
                alert("Table added successfully!");
                setTableNumber("");
            } catch (error) {
                console.error("Error adding table: ", error);
                alert("An error occurred while adding table. Please try again.");
            }
        } else {
            alert("Please enter a table number.");
        }
    }

    return (
        <div>
            <h1>Add Tables</h1>
            <div>
                <label>
                    Table Number:
                    <input type="text" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} />
                </label>
            </div>
            <button onClick={addTable}>Add Table</button>
        </div>
    );
}

export default TablesPage;
