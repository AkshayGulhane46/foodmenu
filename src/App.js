import React from 'react'
import AddDish from './components/AddDish'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  HashRouter
} from "react-router-dom";
import Menu from './components/Menu';
import Cart from './components/Cart';
import { useState } from 'react';
import TablesPage from './components/TablesPage';
import CustomerInfoPage from './components/CustomerInfoPage';
import AdminPage from './components/AdminPage';



const App = () => {
  const [cart, setCart] = useState([]); // Define cart state

  return (
    <>
    <HashRouter>
      <switch>
 
      <div className='main'>
      <Routes>
        
        <Route path='/adddish' Component={AddDish}></Route>
        <Route path='/tables' Component={TablesPage}></Route>


        <Route path="/menu" element={<Menu/>} /> {/* Pass setCart function to Menu component */}
        <Route path="/cart" element={<Cart cart={cart} />} /> {/* Pass cart data to Cart component */}


        <Route path="/customerinfo" element={<CustomerInfoPage/>} /> {/* Pass cart data to Cart component */}

        <Route path="/admin" element={<AdminPage/>} /> {/* Pass cart data to Cart component */}


      </Routes>
      </div>
      </switch>
    </HashRouter> 
    </>
  )
}

export default App