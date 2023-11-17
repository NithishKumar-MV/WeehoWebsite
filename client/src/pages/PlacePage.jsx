import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import BookingWidget from "../BookingWidget";
import EventGallery from "../EventGallery";
import AddressLink from "../AddressLink";

export default function PlacePage() {
    const {id} = useParams();
    const [place,setPlace] = useState(null);

    useEffect(() => {
        if (!id) {
            return;
        }
        axios.get(`/places/${id}`).then(response => {
            setPlace(response.data);
        });
    }, [id]);

    if (!place) return '';

    return (
        <div className="mt-4 bg-gray-100 -mx-8 px-8 pt-8">
            <h1 className="text-5xl font-bold">{place.title}</h1>
            <AddressLink>{place.address}</AddressLink>
            <EventGallery place={place} />
            <div className="mt-8 mb-8 grid gap-8 grid-cols-1 md:grid-cols-[2fr_1fr]">
                <div>
                    <div className="my-4">
                        <h2 className="font-semibold text-2xl">Description of this event</h2>
                        {place.description}
                    </div><br />
                    <h1 className="font-semibold text-xl">Event Date : {place.date}</h1>
                    <h1 className="font-semibold text-xl">Event Time : {place.time}</h1>
                    <h1 className="font-semibold text-xl">Max number of members: {place.maxParticipants}</h1>
                </div>
                <div>
                    <BookingWidget place={place} />
                </div>
            </div>
            <div className="bg-white -mx-8 px-8 py-8 border-t">
                <div>
                    <h2 className="font-semibold text-2xl">Extra info</h2>
                </div>
                <div className="mb-4 mt-2 text-sm text-gray-700 leading-5">{place.extraInfo}</div>
            </div>
        </div>
    );
}