"use client";

import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';

const Timer = ({ startTime, endTime, pauseTime ,IsPaused, restarTime}) => {


    const [currentTime, setCurrentTime] = useState(new Date());
    
    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);

    const calculateTimeDifference = (start, end) => {
        const diff = end - start;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds} Hrs`;
    };

    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : currentTime;

    var runningTime
    if (IsPaused==='Y') {
         runningTime = pauseTime;
    }
    else if (restarTime && IsPaused==='N')
    {
        // console.log('estoy en restart')
        runningTime=calculateTimeDifference(restarTime,end)
        
    }
    else {
         runningTime = calculateTimeDifference(start, end);
    }
    return (
        <Card style={{'marginTop':0}} title="TIME IN PO" subTitle={startTime === null ? '' : runningTime} className="p-card p-mt-3">


        </Card>
    );
};

export default Timer;
