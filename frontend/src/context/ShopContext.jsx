import { createContext, useEffect, useState } from "react"; 
import axios from 'axios';
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import { products as localProducts } from '../assets/assets';
import { resolveBackendUrl } from '../utils/backendUrl';

export const ShopContext = createContext(); 

const ShopContextProvider = (props) => { 
    const currency = '৳'; 
    const backendUrl = resolveBackendUrl();
    const [deliveryFee, setDeliveryFee] = useState(() => {
        const saved = localStorage.getItem('zafran_delivery_fee');
        return saved ? Number(saved) : 60;
    });
    const [deliveryFeeDhaka, setDeliveryFeeDhaka] = useState(60);
    const [deliveryFeeOutside, setDeliveryFeeOutside] = useState(120);
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState(() => {
        try {
            const saved = localStorage.getItem('zafran_cart');
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            return {};
        }
    });
    const [products, setProducts] = useState([]);
    const [token, setToken] = useState(() => localStorage.getItem('token') || '');
    const [userData, setUserData] = useState(null);
    const [selectedChatUser, setSelectedChatUser] = useState(null);
    const navigate = useNavigate();

    const fetchUserProfile = async (authToken) => {
        const activeToken = authToken || token;
        if (!activeToken) {
            setUserData(null);
            return;
        }
        try {
            const res = await axios.get(`${backendUrl || ''}/api/user/profile`, { headers: { token: activeToken } });
            if (res.data.success && res.data.user) {
                setUserData(res.data.user);
            } else if (!res.data.success && (res.data.message?.toLowerCase().includes('login again') || res.data.message?.toLowerCase().includes('removed'))) {
                setToken('');
                localStorage.removeItem('token');
                setUserData(null);
                toast.error("Session expired or account removed. Please login again.");
                navigate('/login');
            }
        } catch (err) {
            console.log('Error fetching user profile:', err.message);
        }
    };

    const fetchDeliverySettings = async () => {
        try {
            const response = await axios.get(`${backendUrl || ''}/api/order/settings`);
            if (response.data.success && response.data.settings) {
                const { deliveryFee, deliveryFeeDhaka, deliveryFeeOutside } = response.data.settings;
                if (deliveryFee !== undefined) {
                    setDeliveryFee(deliveryFee);
                    localStorage.setItem('zafran_delivery_fee', String(deliveryFee));
                }
                if (deliveryFeeDhaka !== undefined) setDeliveryFeeDhaka(deliveryFeeDhaka);
                if (deliveryFeeOutside !== undefined) setDeliveryFeeOutside(deliveryFeeOutside);
            }
        } catch (err) {
            console.log('Using local delivery settings');
        }
    };

    const addToCart = async (itemId, size = 'Standard', color = '') => {
        const variantKey = color ? (size && size !== 'Standard' ? `${size} • ${color}` : color) : (size || 'Standard');
        let cartData = structuredClone(cartItems);
        if(cartData[itemId]){
            if(cartData[itemId][variantKey]){
                cartData[itemId][variantKey] += 1;
            }
            else{
                cartData[itemId][variantKey] = 1;
            }
        }
        else{
            cartData[itemId] = {};
            cartData[itemId][variantKey] = 1;
        }
        setCartItems(cartData);
        localStorage.setItem('zafran_cart', JSON.stringify(cartData));
        toast.success('Added to Cart!');
        if(token){
            try{
                await axios.post(`${backendUrl || ''}/api/cart/add`, {itemId, size: variantKey}, {headers:{token}})
            }
            catch(error){
                console.log(error);
                toast.error(error.response?.data?.message || error.message)
            }
        }
    }
       
    const getCartCount = () => {
        let totalCount = 0;
        for(const items in cartItems){
            for(const item in cartItems[items]){
                try{
                    if(cartItems[items][item] > 0){
                        totalCount += cartItems[items][item]
                    }
                }
                catch(error){
                
                }
            }   
        }
        return totalCount;
    }
    const updateQuantity = async (itemId, size, quantity) => {
        let cartData = structuredClone(cartItems);
        cartData[itemId][size] = quantity;
        setCartItems(cartData);
        localStorage.setItem('zafran_cart', JSON.stringify(cartData));
        if(token){
            try{
                await axios.post(`${backendUrl || ''}/api/cart/update`, {itemId, size, quantity}, {headers: {token}})
            }
            catch(error){
                console.log(error);
                toast.error(error.response?.data?.message || error.message)
            }
        }
    }
    const getCartAmount = () => {
        let totalAmount = 0;
        for(const items in cartItems){
            let itemInfo = products.find((product)=> product._id === items);
            if (!itemInfo) continue;
            for(const item in cartItems[items]){
                try{
                    if(cartItems[items][item] > 0){
                        totalAmount += itemInfo.price * cartItems[items][item];
                    }
                }
                catch (error){

                }
            }
        }
        return totalAmount;
    }

    const getProductsData = async () => {
        try {
            const response = await axios.get(`${backendUrl || ''}/api/product/list`);
            if (response.data.success && Array.isArray(response.data.products)) {
                const serverList = response.data.products.map(p => {
                    const rawImgs = Array.isArray(p.images) && p.images.length > 0 
                        ? p.images 
                        : (Array.isArray(p.image) && p.image.length > 0 
                            ? p.image 
                            : [p.image || p.images || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"]);
                    return {
                        ...p,
                        image: rawImgs,
                        images: rawImgs,
                        colors: Array.isArray(p.colors) ? p.colors : [],
                        salesCount: Number(p.salesCount) || 0
                    };
                });
                setProducts(serverList);
            } else {
                setProducts([]);
            }
        }
        catch (error){
            console.log('Error loading products catalog:', error.message);
            setProducts([]);
        }
    }

    const clearCart = () => {
        setCartItems({});
        localStorage.removeItem('zafran_cart');
    };

    const getUserCart = async (authToken) => {
        const activeToken = authToken || token;
        if (!activeToken) return;
        try{
            const response = await axios.post(`${backendUrl || ''}/api/cart/get`, {}, {headers: {token: activeToken}})
            if(response.data.success && response.data.cartData){
                const serverCart = response.data.cartData || {};
                let localCart = {};
                try {
                    const saved = localStorage.getItem('zafran_cart');
                    localCart = saved ? JSON.parse(saved) : {};
                } catch (e) {}

                // Merge local unauthenticated cart with server cart
                let merged = { ...serverCart };
                let needSync = false;
                for (const itemId in localCart) {
                    if (!merged[itemId]) merged[itemId] = {};
                    for (const variant in localCart[itemId]) {
                        const localQty = localCart[itemId][variant];
                        if (localQty > 0) {
                            if (!merged[itemId][variant] || merged[itemId][variant] < localQty) {
                                merged[itemId][variant] = localQty;
                                needSync = true;
                            }
                        }
                    }
                }

                setCartItems(merged);
                localStorage.setItem('zafran_cart', JSON.stringify(merged));

                if (needSync) {
                    for (const itemId in merged) {
                        for (const variant in merged[itemId]) {
                            const qty = merged[itemId][variant];
                            if (qty > 0) {
                                axios.post(`${backendUrl || ''}/api/cart/update`, { itemId, size: variant, quantity: qty }, { headers: { token: activeToken } }).catch(() => {});
                            }
                        }
                    }
                }
            }
        }
        catch (error){
            console.log(error)
        }
    }
    useEffect(()=>{
        getProductsData();
        fetchDeliverySettings();
        if (token) {
            fetchUserProfile(token);
        } else {
            setUserData(null);
        }
    }, [token]);

    useEffect(()=>{
        if(!token && localStorage.getItem('token')){
            const stored = localStorage.getItem('token');
            setToken(stored);
            getUserCart(stored);
            fetchUserProfile(stored);
        }
    }, [token])

    const value = { 
        products, currency, delivery_fee: deliveryFee,
        deliveryFee, setDeliveryFee, deliveryFeeDhaka, deliveryFeeOutside, fetchDeliverySettings,
        search, setSearch, showSearch, setShowSearch,
        cartItems, setCartItems, clearCart, addToCart, 
        getCartCount, updateQuantity, getCartAmount,
        navigate, backendUrl, token, setToken, getUserCart,
        userData, setUserData, fetchUserProfile,
        selectedChatUser, setSelectedChatUser,
        setProducts
    } 
    return ( 
        <ShopContext.Provider value={value}> 
            {props.children}
        </ShopContext.Provider> 
    ) 
} 
export default ShopContextProvider;