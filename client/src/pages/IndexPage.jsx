import axios from "axios";
import { useEffect, useState } from "react";
import {Link} from "react-router-dom";

export default function IndexPage() {
    const [places,setPlaces] = useState([]);
    useEffect(() => {
        axios.get('/places').then(response => {
            setPlaces(response.data);
        });
    }, [])
    return (
        <div className="mt-8 grid gap-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {places.length > 0 && places.map(place => (
                <Link to={'/place/'+place._id}>
                    <div className="bg-gray-500 flex">
                        {place.photos?.[0] && (
                            <img className="object-cover aspect-square" src={'http://localhost:4000/uploads/'+place.photos?.[0]} alt=""/>
                        )}
                    </div>
                    <h2 className="truncate font-bold">{place.title}</h2>
                    <h3 className="text-sm">{place.address}</h3>
                    <div className="mt-1">
                        <span className="font-bold">₹{place.price} onwards</span>
                    </div>
                </Link>
            ))}
        </div>
    );
}