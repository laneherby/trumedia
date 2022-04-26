import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import useAxiosFetch from "./hooks/useAxiosFetch";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';
import { stats } from './data';
import { calcMasterStats, getWeeklyData } from './statManipulator';

const App = () => {    
    const [fetchURL, setFetchURL] = useState(null);
    const { data, tokenFetched } = useAxiosFetch(fetchURL);
    const [availablePlayers, setAvailablePlayers] = useState([]);

    useEffect(() => {
        //on first load I need to get all the players available from the API
        if(tokenFetched) setFetchURL("https://project.trumedianetworks.com/api/mlb/players");
    }, [tokenFetched]);

    useEffect(() => {
        if(fetchURL === "https://project.trumedianetworks.com/api/mlb/players") {
            setAvailablePlayers(data);
        }
    }, [data]);

    useEffect(() => {
        if(availablePlayers.length > 0) console.log(availablePlayers);
    }, [availablePlayers]);

    const [masterStats, setMasterStats] = useState("");

    useEffect(() => {
        setMasterStats(calcMasterStats(stats));
    }, []);

    useEffect(() => {
        console.log(masterStats)
    }, [masterStats]);

    return (
        <Box sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: '100vh'
        }}>
            <ResponsiveContainer width="80%" height="80%">
                <LineChart
                    width={500}
                    height={300}
                    data={masterStats.weeklyData}
                    margin={{
                        top: 25,
                        right: 25,
                        left: 25,
                        bottom: 25,
                    }}
                >
                    <CartesianGrid />
                    <XAxis dataKey="dateRange" dy={5} interval={0} angle={60} textAnchor="start" />
                    <YAxis allowDecimals={false} ticks={["","1","2","3","4","5","6","7","8","9","10","11","12"]} tickCount={13} />
                    <Tooltip />
                    <Line 
                        type="linear"
                        dataKey="H"
                        stroke="#82ca9d"
                        activeDot={{r:12}}
                        dot={{strokeWidth: 8}}
                    />
                </LineChart>
            </ResponsiveContainer>
        </Box>
    );
}

export default App;