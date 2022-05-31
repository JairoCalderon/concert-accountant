import React from 'react'
import firebase from '../firebase'
import { getDatabase, ref, push } from 'firebase/database'

const EventInfo = ({ eventArray, listKey, updatePrice }) => {

    const database = getDatabase(firebase);
    const dbRef = ref(database, `/${listKey}/concert`);

    const addEvent = (eventItem) => {
        push(dbRef, eventItem);
    }

    return (
        <div className='searchResultsContainer'>
            {
                Object.keys(eventArray).length === 0 ? "this is empty" :

                    eventArray.map(singleEvent => {
                        return (
                            <div key={singleEvent.id} className='searchCard'>
                                <h3>{singleEvent.name}</h3>
                                <div className="imgContainer">
                                    <img src={singleEvent.images[0].url} alt={`a poster for ${singleEvent.name}`} />
                                </div>
                                <p>{singleEvent.dates.start.localDate} at {singleEvent.dates.start.localTime}</p>

                                <p>${singleEvent.priceRanges[0].min}</p>

                                <a href={singleEvent.url} target="_blank" rel="noopener noreferrer">Get Tickets</a>

                                <button onClick={() => { addEvent(singleEvent); updatePrice(singleEvent.priceRanges[0].min); alert("Added to your list!"); }}>Add this show</button>
                            </div>
                        )
                    })
            }
        </div>
    )
}

export default EventInfo