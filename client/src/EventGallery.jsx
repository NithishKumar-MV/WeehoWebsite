import { useState } from "react";

export default function EventGallery({place}) {
    const [seeMoreEvents,setSeeMoreEvents] = useState(false);
    if (seeMoreEvents) {
        return (
            <div className="absolute inset-0 bg-black text-white min-h-screen">
                <div className="bg-black p-8 grid gap-2">
                    <div>
                        <h2 className="text-3xl font-bold mr-48">Poster of {place.title}</h2>
                        <button onClick={() => setSeeMoreEvents(false)} className="fixed right-12 top-8 flex gap-2 py-2 px-4 rounded-2xl bg-white text-black">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                    {place?.photos?.length > 0 && place.photos.map(photo => (
                        <div key={photo}>
                            <img className="w-80 h-auto mx-auto" src={'http://localhost:4000/uploads/'+photo} alt="" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
          <div className="grid grid-cols-[1fr]">
            <div>
              {place.photos?.[0] && (
                <div>
                  <img onClick={() => setSeeMoreEvents(true)} className="cursor-pointer w-90 h-90 mx-auto" src={'http://localhost:4000/uploads'+place.photos[0]} alt="" />
                </div>
              )}
            </div>
          </div>
        </div>
    );
}
