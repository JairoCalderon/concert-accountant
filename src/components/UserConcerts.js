import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import firebase from "../firebase";
import { getDatabase, ref, remove } from "firebase/database";


// getting props from userLists.js
const UserConcerts = ({ listName, listBudget, listId, listConcerts }) => {

    const displayConcertsArray = [];
    const concertKeys = []
    // pushing each concert into the array to display the concerts
    for (const concert in listConcerts) {
        displayConcertsArray.push(listConcerts[concert]);
        concertKeys.push(concert)

    }
    // removing the first element in the array since it's an emepty string
    displayConcertsArray.shift();
    concertKeys.shift()

    // sortting the array with the highest price to lowest

    const removingConcerts = ((listId, concert) => {

        const database = getDatabase(firebase);
        const removeRef = ref(database, `/${listId}/concert/${concert}`);

        remove(removeRef)
    })

    const removeList = () => {
        const database = getDatabase(firebase);
        const removeListRef = ref(database, `/${listId}`)
        remove(removeListRef);
    }

    return (
        <div className="userListContainer">
            <button onClick={() => { removeList() }} className="removeList">X</button>
            <div className="listInfo">
                <h3>{listName}</h3>
                <h3>${listBudget}</h3>
            </div>
            <ul>
                {
                    displayConcertsArray.map((concertShow, index) => {
                        return (
                            <li className="concertContainer" key={index}>
                                <div className="mainContentContainer">
                                    <div className="imgContainer">
                                        <img src={`${concertShow.images[0].url}`} alt={concertShow.name} />
                                    </div>
                                    <div className="subListInfo">
                                        <p>{concertShow.name}</p>
                                        <p>${concertShow.priceRanges[0].min}</p>
                                        <p>{concertShow.dates.start.localDate}</p>
                                        <p>{concertShow.dates.start.localTime}</p>
                                    </div>
                                </div>
                                <button onClick={() => { removingConcerts(listId, concertKeys[index]) }}>Remove</button>
                            </li>
                        )
                    })
                }

            </ul>
            <Link to={`/lists/${listId}`} className="addConcertButton">
                <FontAwesomeIcon icon={faPlus} />
            </Link>
        </div>
    )
}

export default UserConcerts