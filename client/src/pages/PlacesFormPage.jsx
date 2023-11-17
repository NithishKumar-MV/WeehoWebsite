import PhotosUploader from "../PhotosUploader.jsx";
import {useEffect, useState} from "react";
import axios from "axios";
import AccountNav from "../AccountNav";
import {Navigate, useParams} from "react-router-dom";

export default function PlacesFormPage() {
    const {id} = useParams();
    const [title,setTitle] = useState('');
    const [address,setAddress] = useState('');
    const [addedPhotos,setAddedPhotos] = useState([]);
    const [description,setDescription] = useState('');
    const [extraInfo,setExtraInfo] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [maxParticipants,setMaxParticipants] = useState(1);
    const [price,setPrice] = useState(100);
    const [redirect,setRedirect] = useState(false);
    useEffect(() => {
        if (!id) {
            return;
        }
        axios.get('/places/'+id).then(response => {
            const {data} = response;
            setTitle(data.title);
            setAddress(data.address);
            setAddedPhotos(data.photos);
            setDescription(data.description);
            setExtraInfo(data.extraInfo);
            setDate(data.date);
            setTime(data.time);
            setMaxParticipants(data.maxParticipants);
            setPrice(data.price);
        });
    }, [id]);
    function inputHeader(text) {
        return (
            <h2 className="text-2xl mt-4">{text}</h2>
        );
    }
    function inputDescription(text) {
        return (
            <p className="text-gray-500 text-sm">{text}</p>
        );
    }
    function preInput(header,description){
        return (
            <>
              {inputHeader(header)}
              {inputDescription(description)}    
            </>
        );
    }

    async function savePlace(ev) {
        ev.preventDefault();
        const placeData = {
            title, address, addedPhotos, 
            description, extraInfo, 
            date, time, maxParticipants, price,
        };
        if (id) {
            // update
            await axios.put('/places', {
                id, ...placeData
            });
            setRedirect(true);
        }
        else {
            // new place
            await axios.post('/places', placeData);
            setRedirect(true);
        }
    }

    if (redirect) {
        return <Navigate to={'/account/places'} />
    }

    return (
        <div>
            <AccountNav />
            <h2 className="text-3xl mt-4 text-center font-bold">CREATE AN EVENT FORM</h2><br />
            <form onSubmit={savePlace}>
                {preInput('Event Title', 'Title for the event')}
                <input type="text" value={title ||""} onChange={ev => setTitle(ev.target.value)} placeholder="title, for example: My lovely apt"/>
                {preInput('Venue', 'Venue of the event')}
                <input type="text" value={address ||""} onChange={ev => setAddress(ev.target.value)} placeholder="address"/>
                {preInput('Photos','Poster of the event')}
                <PhotosUploader addedPhotos={addedPhotos ||""} onChange={setAddedPhotos} />
                {preInput('Description','description of the event')}
                <textarea value={description ||""} onChange={ev => setDescription(ev.target.value)} />
                {preInput('Extra info','Extra info about this event, etc')}
                <textarea value={extraInfo ||""} onChange={ev => setExtraInfo(ev.target.value)}/>
                {preInput('Event Date','select the date of the event')}
                <input 
                    type="date" 
                    value={date || ""} 
                    onChange={ev => setDate(ev.target.value)} 
                />
                {preInput('Event Timing','select the timing for this event')}
                <input 
                    type="time" 
                    value={time || ""} 
                    onChange={ev => setTime(ev.target.value)} 
                />
                {preInput('Max number of members','maximum number of members allowed')}
                <input 
                    type="number" 
                    value={maxParticipants || ""} 
                    onChange={ev => setMaxParticipants(ev.target.value)}
                />
                {preInput('Price','price for the event per head')}
                <input 
                    type="number" 
                    value={price || ""} 
                    onChange={ev => setPrice(ev.target.value)}
                />
                <button className="primary my-4">Save</button>
            </form>
        </div>
    );
}