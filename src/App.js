import React, { useState, useEffect } from "react";
import { Box, Container, FormControl, Grid, InputLabel, MenuItem, Select, CircularProgress, Divider } from "@mui/material";
import useAxiosFetch from "./hooks/useAxiosFetch";
import './App.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';
import { stats } from './data';
import { calcMasterStats } from './statManipulator';

const App = () => {    
    const [fetchURL, setFetchURL] = useState(null);
    const { data, tokenFetched } = useAxiosFetch(fetchURL);
    const [selectLabel, setSelectLabel] = useState(<CircularProgress size={20} />);
    const [selectActive, setSelectActive] = useState(false);
    const [availablePlayers, setAvailablePlayers] = useState([]);
    const [selectedPlayer, setSelectedPlayer] = useState("");
    const [playerInfoMarkup, setPlayerInfoMarkup] = useState(<h3>No Player Selected</h3>);
    const [playerStats, setPlayerStats] = useState({});

    useEffect(() => {
        //on first load I need to get all the players available from the API
        if(tokenFetched) setFetchURL("https://project.trumedianetworks.com/api/mlb/players");
    }, [tokenFetched]);

    useEffect(() => {
        if(fetchURL === "https://project.trumedianetworks.com/api/mlb/players") {
            setAvailablePlayers(data);
        }
        else if(fetchURL === ("https://project.trumedianetworks.com/api/mlb/player/" + selectedPlayer.playerId)) {
            const selectedStats = calcMasterStats(data);
            let allStats = {...playerStats};
            allStats[selectedPlayer.playerId] = selectedStats;
            setPlayerStats(allStats);
        }
    }, [data]);

    useEffect(() => {
        if(availablePlayers.length > 0) {
            setSelectActive(true);
            setSelectLabel("Select a Player");
        }
    }, [availablePlayers]);
    
    useEffect(() => {
        if(playerStats) console.log(playerStats);
    }, [playerStats])

    useEffect(() => {
        console.log(fetchURL);
    }, [fetchURL])

    useEffect(() => {
        if(selectedPlayer) {
            setPlayerInfoMarkup(
                <Box className="playerInfoContainer">
                    <img src={selectedPlayer.playerImage} className="playerHeadshot" />
                    <Box className="playerInfoText">
                        <Box className="playerInfoName">{selectedPlayer.fullName}</Box>
                        <Box className="playerInfoSeason">2018 Season</Box>
                        <Box><img src={selectedPlayer.teamImage} className="teamLogoImage" /></Box>
                    </Box>
                </Box>
            );

            if(!playerStats[selectedPlayer.playerId]) {
                setFetchURL("https://project.trumedianetworks.com/api/mlb/player/" + selectedPlayer.playerId);
            }
        }
    }, [selectedPlayer])

    const onSelectedPlayerChange = (event) => {
        setSelectedPlayer(event.target.value);
    };

    return (
        <Container className="container">
            <Box className="playerDisplay">
                <Box className="playerInfo">
                    {playerInfoMarkup}
                </Box>
                <Box className="playerSelect">
                    <FormControl sx={{minWidth: 250}} variant="standard">
                        <InputLabel id="playerSelectLabel">{selectLabel}</InputLabel>
                        <Select
                            labelId="playerSelectLabel"
                            id="playerSelect"
                            value={selectedPlayer}
                            onChange={onSelectedPlayerChange}
                            disabled={!selectActive}
                        >
                            {availablePlayers.map(player => <MenuItem key={player.playerId} value={player}>{player.fullName}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Box>
            </Box>
            <Divider className="divider" />
            <Box className="tabularData">
                yello
            </Box>
        </Container>
    );
}

export default App;