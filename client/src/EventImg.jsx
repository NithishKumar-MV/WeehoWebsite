export default function EventImg({place,index=0,className=null}) {
    if (!place || !place.photos?.length) {
        return null;
    }    
    if (!className) {
        className = 'object-cover';
    }
    return (
        <img className={className} src={'http://localhost:4000/uploads/'+place.photos[index]} alt=""/>
    );
}