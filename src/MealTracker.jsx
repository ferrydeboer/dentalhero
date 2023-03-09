import React, { useState, useEffect } from "react";
import { MobileTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from "dayjs";
import Duration from 'dayjs/plugin/duration';
import "bootstrap/dist/css/bootstrap.min.css";
import './App.css';
dayjs.extend(Duration);

function MealTracker() {
    // Set the initial time for the countdown
    const [countdownTime, setCountdownTime] = useState(7200); // 2 hours in seconds

    // Set the initial meal info values
    // const [lastMealTime, setLastMealTime] = useState("");
    const [currentMealTime, setCurrentMealTime] = useState(dayjs());
    const [notes, setNotes] = useState("");

    // Set the initial meal info list
    const [mealInfoList, setMealInfoList] = useState([]);

    // Update the countdown time every second
    useEffect(() => {
        const interval = setInterval(() => {
            setCountdownTime((prevTime) => prevTime - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Get the countdown time in hours, minutes, and seconds
    const hours = Math.floor(countdownTime / 3600);
    const minutes = Math.floor((countdownTime % 3600) / 60);
    const seconds = countdownTime % 60;

    // Get the color for the border based on the time remaining
    let borderColor;
    if (countdownTime > 5400) {
        borderColor = "red";
    } else if (countdownTime > 3600) {
        borderColor = "yellow";
    } else {
        borderColor = "green";
    }

    // Handle the submit button click
    const handleSubmit = (event) => {
        event.preventDefault();

        // Create an object with the meal info
        let lastMeal = mealInfoList.at(-1);
        let toLate = false;
        let lastMealTime = null;
        if(lastMeal){
            lastMealTime = lastMeal.currentMealTime;
            let diff = currentMealTime.diff(lastMealTime);
            let mealDiff = dayjs.duration(diff);
            let hours = mealDiff.hours();
            toLate = hours < 2;
        }

        //const toLate = (lastMealTime) ? false : mealDiff < 2;
        const mealInfo = {
            lastMealTime: lastMealTime,
            currentMealTime: currentMealTime,
            notes: notes,
            toLate: toLate
        };

        // Add the meal info object to the list
        setMealInfoList((prevList) => [...prevList, mealInfo]);

        // Clear the meal info fields
        setCurrentMealTime(dayjs());
        setNotes("");

        const timerMax = dayjs.duration({ minutes: 120 });
        const timeSpent = dayjs.duration(dayjs().diff(currentMealTime));
        const timeLeft = timerMax.subtract(timeSpent);

        setCountdownTime(Math.floor(timeLeft.asSeconds()));
    };

    return (
        <div className="container">
            <div className="row justify-content-center">
                <div className="col-12 col-sm-8 col-md-6">
                    <span>Safe time until next consumption:</span>
                    <h3>
                        <div className="countdown" style={{borderColor: borderColor}}>
                          <span className="countdown-time" style={{color: countdownTime < 1800 ? "green" : "red"}}>
                            {hours.toString().padStart(2, "0")}:
                            {minutes.toString().padStart(2, "0")}:
                            {seconds.toString().padStart(2, "0")}
                          </span>
                        </div>
                    </h3>
                    <form className="meal-info" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="current-meal-time">Last Consumption End Time:</label>
                            <div className="explanation">Everything except water, black tea and black coffee.</div>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <MobileTimePicker
                                    id="current-meal-time"
                                    name="current-meal-time"
                                    className="form-control"
                                    value={currentMealTime}
                                    onChange={(newValue) => setCurrentMealTime(newValue)}
                                    defaultValue={dayjs()} />
                            </LocalizationProvider>
                        </div>
                        <br/>
                        <div className="form-group">
                            <label htmlFor="notes">Consumption:</label>
                            <textarea
                                id="notes"
                                name="notes"
                                className="form-control"
                                value={notes}
                                onChange={(event) => setNotes(event.target.value)}
                            />
                        </div>
                        <br/>
                        <button type="submit" className="btn btn-primary">
                            Log Mealtime
                        </button>
                    </form>
                    <ul className="list-group mt-3">
                        {mealInfoList.map((mealInfo, index) => (
                            <li className="list-group-item" key={index} style={{color: mealInfo.toLate ? "red" : "green"}}>
                                <div>{mealInfo.notes !== "" ? mealInfo.notes : "?"} @ {mealInfo.currentMealTime.format('HH:mm') }</div>
                                {/*<div>Consumption: {mealInfo.notes}</div>*/}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default MealTracker;
