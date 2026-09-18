import React, { useState } from 'react'
import { assets } from '../assets/assets';
import axios from 'axios';
import { backendUrl } from '../App'
import { toast } from 'react-toastify';

const Add = ({token}) => {
  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("0");
  const [category, setCategory] = useState("Gadgets")
  const [subCategory, setSubCategoy] = useState("Fidget Toys")
  const [bestseller, setBestseller] = useState(false)
  const [sizes, setSizes] = useState(["Standard"])

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();

      formData.append("name", name)
      formData.append("description", description)
      formData.append("price", price)
      formData.append("discount", discount)
      formData.append("category", category)
      formData.append("subCategory", subCategory)
      formData.append("bestseller", bestseller)
      formData.append("sizes", JSON.stringify(sizes))

      image1 && formData.append("image1", image1)
      image2 && formData.append("image2", image2)
      image3 && formData.append("image3", image3)
      image4 && formData.append("image4", image4)

      const response = await axios.post((backendUrl || '') + "/api/product/add", formData, {headers: {token}})
      if(response.data.success){
        toast.success(response.data.message)
        setName('')
        setDescription('')
        setImage1(false)
        setImage2(false)
        setImage3(false)
        setImage4(false)
        setPrice('')
        setDiscount('0')
      }
      else{
        toast.error(response.data.message)
      }
    }
    catch (error){
      console.log(error);
      toast.error(error.message)
    }
  }
  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-3' action="">
      <div className='grid grid-flow-row-dense grid-cols-2 grid-rows-2 gap-8'>
          <label htmlFor="image1" className='col-span-1'>
            <img className='w-20' src={!image1 ? assets.upload_area : URL.createObjectURL(image1)} alt="" />
            <input onChange={(e)=> setImage1(e.target.files[0])} type="file" id='image1' />
          </label>
          <label htmlFor="image2" className='col-span-1'>
            <img className='w-20' src={!image2 ? assets.upload_area : URL.createObjectURL(image2)} alt="" />
            <input onChange={(e)=> setImage2(e.target.files[0])} type="file" id='image2' />
          </label>
          <label htmlFor="image3">
            <img className='w-20' src={!image3 ? assets.upload_area : URL.createObjectURL(image3)} alt="" />
            <input onChange={(e)=> setImage3(e.target.files[0])} type="file" id='image3' />
          </label>
          <label htmlFor="image4">
            <img className='w-20' src={!image4 ? assets.upload_area : URL.createObjectURL(image4)} alt="" />
            <input onChange={(e)=> setImage4(e.target.files[0])} type="file" id='image4' />
          </label>
        </div>

    <div className='w-full'>
      <p className='mb-2'>Product name</p>
      <input onChange={(e)=> setName(e.target.value)} value={name} className='w-full max-w-[500px] px-3 py-2 ' type="text" placeholder='Type here' required/>
    </div>
    <div className='w-full'>
      <p className='mb-2'>Product description</p>
      <textarea onChange={(e)=> setDescription(e.target.value)} value={description} className='w-full max-w-[500px] px-3 py-2 ' type="text" placeholder='Write description here' required/>
    </div>
    <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>

      <div>
        <p className='mb-2'>Product category</p>
        <select onChange={(e)=> setCategory(e.target.value)} value={category} className='w-full px-3 py-2'>
          <option value="Gadgets">Gadgets</option>
          <option value="Fidget &amp; EDC">Fidget &amp; EDC</option>
          <option value="Electronics">Electronics</option>
          <option value="Smart Gear">Smart Gear</option>
          <option value="Accessories">Accessories</option>
        </select>
      </div>

      <div>
        <p className='mb-2'>Sub category</p>
        <select onChange={(e)=> setSubCategoy(e.target.value)} value={subCategory} className='w-full px-3 py-2'>
          <option value="Fidget Toys">Fidget Toys</option>
          <option value="EDC Gear">EDC Gear</option>
          <option value="Audio">Audio</option>
          <option value="Wearables">Wearables</option>
          <option value="Desk Gadgets">Desk Gadgets</option>
          <option value="Gaming">Gaming</option>
          <option value="Power &amp; Charging">Power &amp; Charging</option>
          <option value="Smart Devices">Smart Devices</option>
          <option value="Accessories">Accessories</option>
          <option value="Others">Others</option>
        </select>
      </div>

      <div>
        <p className='mb-2'>Product price</p>
        <input onChange={(e)=> setPrice(e.target.value)} value={price} className='w-full px-3 py-2 sm:w-[120px]' type="number" placeholder="25" />
      </div>
      <div>
        <p className='mb-2'>Discount (%)</p>
        <input onChange={(e)=> setDiscount(e.target.value)} value={discount} className='w-full px-3 py-2 sm:w-[120px]' type="number" placeholder="0" min="0" max="100" />
      </div>
    </div>

    <div>
      <div>
        <p className='mb-2'>Product Editions / Variants</p>
        <div className='flex flex-wrap gap-3'>
          {["Standard", "Pro Edition", "Deluxe Pack", "Titanium Edition"].map((ver) => (
            <div 
              key={ver}
              onClick={()=>setSizes(prev => prev.includes(ver) ? prev.filter(item => item !== ver) : [...prev, ver])}
            >
              <p className={`${sizes.includes(ver) ? "bg-black text-white" : "bg-slate-200 text-gray-800"} px-3 py-1 cursor-pointer rounded-lg text-xs font-semibold`}>
                {ver}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
    <div className='flex gap-2 mt-2'>
        <input onChange={() => setBestseller(prev => !prev)} checked={bestseller} type="checkbox" id='bestseller'/>
        <label className='cursor-pointer' htmlFor="bestseller">Add to bestseller</label>
      </div>
    <button className='w-28 py-3 mt-4 bg-black text-white'>ADD</button>
    </form>
  )
}

export default Add;
