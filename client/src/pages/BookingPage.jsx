import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AddressLink from "../AddressLink";
import EventGallery from "../EventGallery";


export default function BookingPage() {
    const { id } = useParams();
    const [booking, setBooking] = useState(null);

    useEffect(() => {
        if (id) {
            axios.get(`/bookings/${id}`).then(response => {
                setBooking(response.data);
            }).catch(error => {
                console.error('Error fetching booking:', error);
            });
        }
    }, [id]);

    if (!booking || !booking.place) {
        return null; // Return null or a loading indicator
    }

    return (
        <div className="my-8">
            <h1 className="text-5xl font-bold">{booking.place.title}</h1>
            <AddressLink className="my-2 block">{booking.place.address}</AddressLink>
            <div className="bg-gray-200 p-6 my-6 flex items-center justify-between">
                <div>
                    <h2 className="text-primary text-3xl font-bold mb-2">BOOKING EVENT RECEIPT!</h2>
                    <p className="text-md font-bold">Name: {booking.name}</p>
                    <p className="text-md font-bold">Number Of members: {booking.numberOfParticipants}</p>
                </div>
                <div className="bg-primary p-6 text-white">
                    <div className="flex items-center">
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-2"> 
                            Booked Successfully!!
                        </div>
                    </div>
                    <div className="flex text-3xl">₹{booking.price}</div>
                </div>
            </div>
            <EventGallery place={booking.place} />
        </div>
    );
}