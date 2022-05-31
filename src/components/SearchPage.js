import axios from "axios";
import EventInfo from "./EventInfo";
import firebase from "../firebase";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDatabase, ref, onValue, set } from "firebase/database"

const SearchPage = () => {
    // current list's firebase key id
    const { listID } = useParams();

    // api states 
    const [userSearch, setUserSearch] = useState("")
    const [data, setData] = useState([]);
    const [paidArray, setPaidArray] = useState([]);

    // user's current list // this holds the name
    const [userListArray, setUserListArray] = useState([]);

    //creating state to store budget from firebase object
    const [listBudget, setListBudget] = useState(0)
    const [currentConcerts, setCurrentConcerts] = useState([])

    const [remainingBudget, setRemainingBudget] = useState(0)

    //create state to hold ticket prices from firebase object
    const [ticketTotal, setTicketTotal] = useState(0)

    //create a state to handle an error for bad api response
    const [apiError, setApiError] = useState("")


    const database = getDatabase(firebase);
    const dbRef = ref(database, `${listID}`);

    // get ticket prices from firebase and sum them up
    const budgetCheck = () => {

        const copyOfShowList = [...currentConcerts];
        let ticketPrice = 0;

        // getting the min price from each concert that's already in the list and calculating the sum
        copyOfShowList.forEach(ticket => {
            ticketPrice = ticketPrice + parseFloat(ticket.priceRanges[0].min);
        })
        return (
            ticketPrice
        )
    }

    //create logic for listBudget <= ticketTotal, boolean result
    const budgetDifference = (currentTicketPrice) => {

        const remaining = listBudget - ticketTotal - currentTicketPrice;
        setRemainingBudget(remaining);
    }

    const updatePrice = (currentTicketPrice) => {
        // setting up new ref to push ticketTotal to firebase
        const setRef = ref(database, `/${listID}/currentTotal`);

        const tempVariable = budgetCheck() + currentTicketPrice;
        // pushing new total to firebase
        set(setRef, tempVariable);
        setTicketTotal(tempVariable);

        budgetDifference(currentTicketPrice);
    }

    const apiCall = (event) => {
        event.preventDefault()

        axios({
            url: "https://app.ticketmaster.com/discovery/v2/events.json?",
            params: {
                apikey: "dAuzWaR4q5pH90ZcC6CpJPHDjH7Gjzz8",
                format: "json",
                size: 20,
                sort: 'date,asc',
                city: userSearch,
                segmentName: 'Music',
            }
        })
            .then((res) => {
                const apiData = res.data._embedded.events

                if (res.statusText === "OK") {
                    // take only the data we want from apiData
                    const destructuredApiData = []
                    apiData.map((object) => {
                        //for each object, deconstruct the following
                        const { id, name, dates, priceRanges, images, url } = object
                        const newObject = { id, name, dates, priceRanges, images, url }

                        return (
                            destructuredApiData.push(newObject)
                        )

                    })

                    setData(destructuredApiData)

                }
                else {
                    throw new Error(res.statusText)
                }
            })
            .catch(err => {
                setPaidArray([])
                setApiError("No events found", err);
            })

    }

    const handleUserSearch = (event) => {
        const searchQuery = event.target.value;
        setUserSearch(searchQuery);
    }

    const budgetCalculator = () => {
        // no shows in the list
        if (ticketTotal === 0) {
            setRemainingBudget(listBudget);
        }
        else {
            budgetDifference(0);
        }
    }

    useEffect(() => {
        //getting list name and budget object from firebase
        onValue(dbRef, (snapshot) => {
            setListBudget(snapshot.val().budget);
            setUserListArray(snapshot.val().name);
            setTicketTotal(snapshot.val().currentTotal);
            // snapshot.value.concert is an object so we're converting it into an array
            const tempConcertsArray = [];
            for (const concert in snapshot.val().concert) {
                tempConcertsArray.push(snapshot.val().concert[concert]);
            }
            // removing the first element from the array since it's an empty string
            tempConcertsArray.shift();

            setCurrentConcerts(tempConcertsArray);

        })
        setRemainingBudget(listBudget);
    }, [])

    useEffect(() => {
        budgetCalculator();
    }, [listBudget])


    useEffect(() => {
        // creating a copy so we dont mutate the original data
        const copyOfData = [...data];

        const primaryPaidArray = [];

        copyOfData.forEach(eachItem => {
            if (eachItem.priceRanges && eachItem.priceRanges[0].min > 0) {
                primaryPaidArray.push(eachItem);
            }

        })

        setPaidArray(primaryPaidArray);
    }, [data])


    return (
        <div>
            {
                paidArray.length === 0 ?
                    <div className="heightAdjuster">
                        <div className="searchPageListContainer">
                            {
                                userListArray ?
                                    <div className="listInfo searchPageList">
                                        <h4>{userListArray}</h4>
                                        <h4>budget: ${remainingBudget}</h4>
                                    </div> : null
                            }
                        </div>

                        <form onSubmit={apiCall} className='apiSearch'>
                            <input onChange={handleUserSearch} type="text" id="search" name="search" placeholder="Enter a City" />
                            <button disabled={!userSearch}>Search</button>
                        </form>
                        {paidArray.length === 0 ? <p>{apiError}</p> : <EventInfo eventArray={paidArray} listKey={listID} updatePrice={updatePrice} />}
                    </div>
                    :
                    <>
                        <div className="searchPageListContainer">
                            {
                                userListArray ?
                                    <div className="listInfo searchPageList">
                                        <h4>{userListArray}</h4>
                                        <h4>budget: ${remainingBudget}</h4>
                                    </div> : null
                            }
                        </div>

                        <form onSubmit={apiCall} className='apiSearch'>
                            <input onChange={handleUserSearch} type="text" id="search" name="search" placeholder="Enter a City" />
                            <button disabled={!userSearch}>Search</button>
                        </form>
                        {paidArray.length === 0 ? <p>{apiError}</p> : <EventInfo eventArray={paidArray} listKey={listID} updatePrice={updatePrice} />}

                    </>
            }
        </div>

    )

}

export default SearchPage;