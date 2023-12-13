import React, { Fragment } from 'react';
import { CgMouse } from 'react-icons/cg';
import "./Home.css";
import Product from './Product';


const product ={
    name: "Blue Tshirt ",
    images:[{url:"https:i.ibb.co/DRST11n/1.webp"}],
    price:"₹3000",
    _id:"rohit",
};

const Home = () => {
  return <Fragment>

<div className='banner'>
 <p>Welcome to Sainik Kirana Stores</p>
 <h1>FIND QUALITY PRODUCTS BELOW</h1>
 <a href='#container'>
  <button>
    Scroll <CgMouse/>
  </button>
 </a>
</div>
<h2 className='homeHeading'>Featured Products</h2>
<div className='container' id='container'>
    <Product product = {product}/>
</div>
  </Fragment>
}

export default Home