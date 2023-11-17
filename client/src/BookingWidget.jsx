import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "./UserContext";

function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

const token = document.domain === 'localhost'

export default function BookingWidget({ place }) {
  const [numberOfParticipants, setNumberOfParticipants] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [redirect, setRedirect] = useState('');
  const { user } = useContext(UserContext);

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  let numberOfmembers = numberOfParticipants;

  async function bookThisEvent() {
    console.log('Booking initiated');
    if (!phone) {
      alert('Please provide your phone number');
      return;
    }
  
    if (!place || !place.price || !numberOfmembers) {
      console.error('Missing or invalid data for calculation.');
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
  
      const response = await axios.post('/bookings', {
        numberOfParticipants,
        name,
        phone,
        place: place._id,
        price: numberOfmembers * place.price,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      const bookingId = response.data._id;
  
      const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
  
      if (!res) {
        console.error('Razorpay SDK failed to load');
        return;
      }
  
      const data = response.data;
  
      const options = {
        key: token ? 'rzp_test_4AAfE1spa0SuuG' : 'rzp_test_4AAfE1spa0SuuG',
        currency: data.currency,
        amount: (data.price * 100).toString(), // Convert to paise
        order_id: data.id,
        name: place.title,
        image: place.photos,
        handler: function (response) {
          alert(response.razorpay_payment_id);
          alert(response.razorpay_order_id);
          alert(response.razorpay_signature);
  
          setRedirect(`/account/bookings/${bookingId}`);
        },
        prefill: {
          name: place.name,
          email: place.email,
          phone_number: place.phone,
        },
      };
  
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
  
    } catch (error) {
      console.error('Error booking event:', error);
    }
  }  

  if (redirect) {
    return <Navigate to={redirect} />
  }

    return (
        <div className="bg-white shadow p-4">
            <div className="font-bold text-2xl text-center">
                Cost: ₹{place.price} onwards
            </div>
            <div className="mt-4">
                <div className="my-4 py-3 px-4">
                    <label>Number of members:</label>
                    <input type="number"
                        value={numberOfParticipants}
                        onChange={ev => setNumberOfParticipants(ev.target.value)} />
                </div>
                {numberOfmembers > 0 && (
                    <div className="my-4 py-3 px-4">
                        <label>Your full name:</label>
                        <input type="text"
                            value={name}
                            onChange={ev => setName(ev.target.value)} />
                        <label>Your phone number:</label>
                        <input type="tel"
                            value={phone}
                            onChange={ev => setPhone(ev.target.value)} />
                    </div>
                )}
            </div>
            <button onClick={bookThisEvent} className="primary mt-4">
                Book this Event
                {numberOfmembers > 0 && (
                    <span> ₹{numberOfmembers * place.price}</span>
                )}
            </button>
        </div>
    );
}