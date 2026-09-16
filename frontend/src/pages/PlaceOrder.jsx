import React, { useContext, useState } from 'react';
import Title from '../components/Title';
import CartTotal from '../components/CartTotal';
import { assets } from '../assets/assets';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const bdDistricts = {
  Dhaka: ["Dhaka", "Faridpur", "Gazipur", "Gopalganj", "Kishoreganj", "Madaripur", "Manikganj", "Munshiganj", "Narayanganj", "Narsingdi", "Rajbari", "Shariatpur", "Tangail"],
  Chattogram: ["Bandarban", "Brahmanbaria", "Chandpur", "Chattogram", "Cumilla", "Cox's Bazar", "Feni", "Khagrachari", "Lakshmipur", "Noakhali", "Rangamati"],
  Rajshahi: ["Bogura", "Joypurhat", "Naogaon", "Natore", "Chapainawabganj", "Pabna", "Rajshahi", "Sirajganj"],
  Khulna: ["Bagerhat", "Chuadanga", "Jashore", "Jhenaidah", "Khulna", "Kushtia", "Magura", "Meherpur", "Narail", "Satkhira"],
  Barishal: ["Barguna", "Barishal", "Bhola", "Jhalokati", "Patuakhali", "Pirojpur"],
  Sylhet: ["Habiganj", "Moulvibazar", "Sunamganj", "Sylhet"],
  Rangpur: ["Dinajpur", "Gaibandha", "Kurigram", "Lalmonirhat", "Nilphamari", "Panchagarh", "Rangpur", "Thakurgaon"],
  Mymensingh: ["Jamalpur", "Mymensingh", "Netrokona", "Sherpur"]
};

const PlaceOrder = () => {
  const navigate = useNavigate();
  const { backendUrl, token, cartItems, setCartItems, getCartAmount, delivery_fee, products } = useContext(ShopContext);
  const [method, setMethod] = useState('cod');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    division: '',
    district: '',
    upazila: '',
    detailedAddress: ''
  });

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    if (name === 'division') {
      setFormData((data) => ({ ...data, division: value, district: '' }));
    } else {
      setFormData((data) => ({ ...data, [name]: value }));
    }
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      let orderItems = [];

      Object.keys(cartItems).forEach((itemId) => {
        Object.keys(cartItems[itemId]).forEach((size) => {
          if (cartItems[itemId][size] > 0) {
            const itemInfo = structuredClone(products.find(product => product._id === itemId));
            if (itemInfo) {
              itemInfo.size = size;
              itemInfo.quantity = cartItems[itemId][size];
              orderItems.push(itemInfo);
            }
          }
        });
      });
      console.log(formData);
      
      let orderData = {
        address: formData,
        items: orderItems,
        amount: getCartAmount() + delivery_fee
      };

      switch (method) {
        case 'cod': {
          const response = await axios.post(`${backendUrl || ''}/api/order/place`, orderData, { headers: { token } });
          if (response.data.success) {
            setCartItems({});
            navigate('/orders');
          } else {
            toast.error(response.data.message);
          }
          break;
        }
        default:
          break;
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col sm:flex-row justify-between gap-8 pt-5 sm:pt-14 min-h-[80vh] border-t border-gray-100'>
      <div className='flex flex-col gap-4 w-full sm:max-w-[500px]'>
        <div className='text-xl sm:text-2xl my-2'>
          <Title text1={'DELIVERY'} text2={'INFORMATION'} />
        </div>
        
        <div className='grid grid-cols-2 gap-3'>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">First Name</label>
            <input required onChange={onChangeHandler} name='firstName' value={formData.firstName} className='w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:bg-white focus:ring-2 focus:ring-black/5 transition' type="text" placeholder='John' />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">Last Name</label>
            <input required onChange={onChangeHandler} name='lastName' value={formData.lastName} className='w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:bg-white focus:ring-2 focus:ring-black/5 transition' type="text" placeholder='Doe' />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">Email Address</label>
          <input required onChange={onChangeHandler} name='email' value={formData.email} className='w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:bg-white focus:ring-2 focus:ring-black/5 transition' type="email" placeholder='john.doe@example.com' />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">Phone Number</label>
          <input required onChange={onChangeHandler} name='phone' value={formData.phone} className='w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:bg-white focus:ring-2 focus:ring-black/5 transition' type="tel" placeholder='01700-000000' />
        </div>
        
        <div className='grid grid-cols-2 gap-3'>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">Division</label>
            <div className="relative">
              <select required onChange={onChangeHandler} name='division' value={formData.division} className='w-full appearance-none rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:border-black focus:bg-white focus:ring-2 focus:ring-black/5 transition cursor-pointer pr-8'>
                <option value="" disabled>Select Division</option>
                {Object.keys(bdDistricts).map(div => <option key={div} value={div}>{div}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">District</label>
            <div className="relative">
              <select required onChange={onChangeHandler} name='district' value={formData.district} className='w-full appearance-none rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:border-black focus:bg-white focus:ring-2 focus:ring-black/5 transition cursor-pointer pr-8 disabled:opacity-50' disabled={!formData.division}>
                <option value="" disabled>Select District</option>
                {formData.division && bdDistricts[formData.division].map(dist => <option key={dist} value={dist}>{dist}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">Upazila / Thana</label>
          <input required onChange={onChangeHandler} name='upazila' value={formData.upazila} className='w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:bg-white focus:ring-2 focus:ring-black/5 transition' type="text" placeholder='e.g., Gulshan, Dhanmondi, Sadar' />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">Detailed Address</label>
          <textarea required onChange={onChangeHandler} name='detailedAddress' value={formData.detailedAddress} className='w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:bg-white focus:ring-2 focus:ring-black/5 transition' rows="3" placeholder='House No, Road, Flat, Area landmark...'></textarea>
        </div>
      </div>

      <div className='mt-4 sm:mt-0 flex-1 max-w-[450px]'>
        <div className='min-w-80'>
          <CartTotal />
        </div>

        <div className='mt-10'>
          <Title text1={'PAYMENT'} text2={'METHOD'} />
          
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4'>
            <div 
              onClick={() => setMethod('cod')} 
              className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition select-none ${
                method === 'cod' 
                  ? 'border-black bg-neutral-900 text-white shadow-xs' 
                  : 'border-gray-200 bg-white hover:border-gray-400 text-gray-700'
              }`}
            >
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                method === 'cod' ? 'border-white bg-white' : 'border-gray-400'
              }`}>
                {method === 'cod' && <div className='w-2 h-2 rounded-full bg-black'></div>}
              </div>
              <span className='text-xs font-bold uppercase tracking-wider'>Cash on Delivery</span>
            </div>

            <div 
              onClick={() => setMethod('stripe')} 
              className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition select-none ${
                method === 'stripe' 
                  ? 'border-black bg-neutral-900 text-white shadow-xs' 
                  : 'border-gray-200 bg-white hover:border-gray-400 text-gray-700'
              }`}
            >
              <div className='flex items-center gap-2.5'>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  method === 'stripe' ? 'border-white bg-white' : 'border-gray-400'
                }`}>
                  {method === 'stripe' && <div className='w-2 h-2 rounded-full bg-black'></div>}
                </div>
                <img className={`h-4 ${method === 'stripe' ? 'brightness-200' : ''}`} src={assets.stripe_logo} alt="Stripe" />
              </div>
            </div>

            <div 
              onClick={() => setMethod('razorpay')} 
              className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition select-none ${
                method === 'razorpay' 
                  ? 'border-black bg-neutral-900 text-white shadow-xs' 
                  : 'border-gray-200 bg-white hover:border-gray-400 text-gray-700'
              }`}
            >
              <div className='flex items-center gap-2.5'>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  method === 'razorpay' ? 'border-white bg-white' : 'border-gray-400'
                }`}>
                  {method === 'razorpay' && <div className='w-2 h-2 rounded-full bg-black'></div>}
                </div>
                <img className={`h-4 ${method === 'razorpay' ? 'brightness-200' : ''}`} src={assets.razorpay_logo} alt="Razorpay" />
              </div>
            </div>
          </div>

          <div className='w-full mt-8'>
            <button 
              type='submit' 
              className='w-full bg-black text-white py-4 rounded-xl font-bold text-sm tracking-wider uppercase hover:bg-neutral-800 transition shadow-sm active:scale-98'
            >
              Confirm &amp; Place Order
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
