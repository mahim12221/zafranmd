import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import axios from 'axios';
import { toast } from 'react-toastify';

const Orders = () => {
  const {backendUrl, token, currency} = useContext(ShopContext);

  const [orderData, setOrderData] = useState([]);
  const [trackingId, setTrackingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const orderStatuses = ["Order Placed", "Packing", "Shipped", "Out for delivery", "Delivered"];

  const loadOrderData = async () => {
    try{
      if(!token){
        return null
      }
      const response = await axios.post(`${backendUrl || ''}/api/order/userOrders`, {}, {headers: {token}})
      if(response.data.success){
        let allOrderItems = []
        response.data.orders.map((order)=>{
          order.items.map((item)=>{
            item['status'] = order.status
            item['cancelReason'] = order.cancelReason
            item['payment'] = order.payment
            item['paymentMethod'] = order.paymentMethod
            item['date'] = order.date
            item['orderId'] = order._id
            allOrderItems.push(item)
          })
        })
        setOrderData(allOrderItems.reverse())
      }
    }
    catch(error){
      console.error(error);
    }
  }

  const trackOrder = async (index) => {
    if (trackingId === index) {
      setTrackingId(null);
      return;
    }
    setTrackingId(index);
    await loadOrderData();
    toast.success("Tracking information updated");
  };

  const handleCancelOrder = async (orderId) => {
    if (!orderId) return;
    const confirmCancel = window.confirm("Are you sure you want to cancel this order?");
    if (!confirmCancel) return;

    try {
      setCancellingId(orderId);
      const response = await axios.post(`${backendUrl || ''}/api/order/cancel`, { orderId, reason: 'Cancelled by customer' }, { headers: {token} });
      if (response.data.success) {
        toast.success("Order cancelled successfully");
        await loadOrderData();
      } else {
        toast.error(response.data.message || "Failed to cancel order");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error cancelling order");
    } finally {
      setCancellingId(null);
    }
  };

  useEffect(()=>{
    loadOrderData()
  }, [token])

  return (
    <div className='border-t pt-16'>
      <div className='text-2xl'>
        <Title text1 = {'MY'} text2 = {'ORDERS'}/>
      </div>
      <div>
        {orderData.length === 0 ? (
          <p className='py-8 text-gray-500'>No orders placed yet.</p>
        ) : (
          orderData.map((item, index)=>{
            const isCancelled = item.status === 'Cancelled' || item.status?.startsWith('Cancelled');
            const isDelivered = item.status === 'Delivered';
            const canCancel = !isCancelled && !isDelivered;

            return (
              <div key={index} className='py-4 border-b text-gray-700 flex flex-col gap-4'>
                <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
                  <div className='flex items-start gap-6 text-sm'>
                    <img className='w-16 sm:w-20 object-cover rounded-md border' src={(item.images && item.images[0]) || (item.image && item.image[0]) || '/placeholder.png'} alt="" />
                    <div>
                      <p className='sm:text-base font-medium'>{item.name}</p>
                      <div className='flex items-center gap-3 mt-1 text-base text-gray-700'>
                        <p>{currency}{item.price}</p>
                        <p>Quantity: {item.quantity}</p>
                      </div>
                      <p className='mt-1'>Date: <span className='text-gray-400'>{new Date(item.date).toDateString()}</span></p>
                      <p className='mt-1'>Payment: <span className='text-gray-400'>{item.paymentMethod}</span></p>
                      {isCancelled && item.cancelReason && (
                        <p className='mt-1 text-xs text-rose-600 font-medium'>
                          Note: {item.cancelReason}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className='md:w-1/2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
                    <div className='flex items-center gap-2'>
                      <p className={`w-2.5 h-2.5 rounded-full ${isCancelled ? 'bg-rose-500' : isDelivered ? 'bg-emerald-500' : 'bg-green-500'}`}></p>
                      <span className={`text-sm md:text-base font-medium ${isCancelled ? 'text-rose-600' : 'text-gray-800'}`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {canCancel && (
                        <button
                          onClick={() => handleCancelOrder(item.orderId)}
                          disabled={cancellingId === item.orderId}
                          className="border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer disabled:opacity-50"
                        >
                          {cancellingId === item.orderId ? 'Cancelling...' : '🚫 Cancel Order'}
                        </button>
                      )}

                      {!isCancelled && (
                        <button onClick={() => trackOrder(index)} className='border px-3 py-1.5 text-xs font-medium rounded-md hover:bg-gray-50 transition cursor-pointer'>
                          {trackingId === index ? 'Hide Tracking' : 'Track Order'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tracking Progress Bar */}
                {trackingId === index && !isCancelled && (
                  <div className="w-full mt-2 bg-gray-50 p-4 rounded-md border border-gray-100 transition-all">
                    <div className="flex justify-between mb-2">
                      {orderStatuses.map((status, i) => {
                        const currentIndex = orderStatuses.indexOf(item.status) !== -1 ? orderStatuses.indexOf(item.status) : 0;
                        return (
                          <div key={i} className={`text-[10px] sm:text-xs font-medium text-center flex-1 ${i <= currentIndex ? 'text-black' : 'text-gray-400'}`}>
                            <span className="hidden sm:inline">{status}</span>
                            <span className="sm:hidden">{status.split(' ')[0]}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                          className="absolute top-0 left-0 h-full bg-green-500 transition-all duration-1000 ease-out" 
                          style={{ width: `${(Math.max(0, orderStatuses.indexOf(item.status)) / (orderStatuses.length - 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  )
}

export default Orders;
