// placespage.jsx
import { Link } from "react-router-dom";
import AccountNav from "../AccountNav";
import { useEffect, useState } from "react";
import axios from "axios";
import EventImg from "../EventImg";

export default function PlacesPage() {
    const [places, setPlaces] = useState([]);

    const handleDeletePlace = async (id) => {
        const confirmed = window.confirm('Are you sure you want to delete this event?');
        if (confirmed) {
            try {
                await axios.delete(`/places/${id}`);
                const updatedPlaces = places.filter(place => place._id !== id);
                setPlaces(updatedPlaces);
            } catch (error) {
                console.error('Error deleting place:', error);
            }
        }
    };

    useEffect(() => {
        axios.get('/user-places').then(({ data }) => {
            setPlaces(data);
        });
    }, []);

    return (
        <div>
            <AccountNav />
            <div className="text-center">
                <Link className="inline-flex gap-1 bg-primary text-white py-2 px-6 rounded-full" to={'/account/places/new'}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add new events
                </Link>
            </div>
            <div className="mt-4">
                {places.length > 0 && places.map(place => (
                    <div key={place._id} className="relative cursor-pointer bg-gray-100 p-4 rounded-2xl mb-4">
                        <button onClick={() => handleDeletePlace(place._id)} className="absolute top-2 right-2 flex gap-2 py-2 px-4 rounded-2xl bg-white text-black">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5 .058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48 .058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 101.5 .058l.345-9z" clipRule="evenodd" />
                            </svg>
                            Delete
                        </button>
                        <Link to={`/account/places/${place._id}`}>
                            <div className="flex mb-4">
                                <div className="flex w-28 h-28 bg-gray-100 grow shrink-0">
                                    <EventImg place={place} />
                                </div>
                                <div className="grow-1 shrink">
                                    <h2 className="text-xl">{place.title}</h2>
                                    <p className="text-sm mt-2">{place.description}</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
