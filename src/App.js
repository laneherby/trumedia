import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box"
import Chip from "@mui/material/Chip"
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import useAxiosFetch from "./hooks/useAxiosFetch";
import './App.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from 'recharts';
import calcMasterStats from './statManipulator';

const columnHeaders = [
    "", "G", "PA", "AB", "H", "HR",
    "TB", "BB", "K", "HBP", "SF", "BA",
    "OBP", "SLG", "OPS", "ISO", "BABIP",
    "K%", "BB%", "TTO%"
];

const App = () => {    
    const [fetchURL, setFetchURL] = useState(null);
    const { data, tokenFetched } = useAxiosFetch(fetchURL);
    const [selectLabel, setSelectLabel] = useState(<CircularProgress size={20} />);
    const [selectActive, setSelectActive] = useState(false);
    const [availablePlayers, setAvailablePlayers] = useState([]);
    const [selectedPlayer, setSelectedPlayer] = useState("");
    const [playerInfoMarkup, setPlayerInfoMarkup] = useState(<h3>No Player Selected</h3>);
    const [playerStats, setPlayerStats] = useState({});
    const [tabularRows, setTabularRows] = useState([]);
    const [chipVariants, setChipVariants] = useState({
        weekly: "filled", biweekly: "outlined", monthly: "outlined"
    });
    const [chartIntervalData, setChartIntervalData] = useState(null);
    const [chartStat, setChartStat] = useState("OPS");
    const [xDataKey, setXDataKey] = useState("dateRange");

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
        if(selectedPlayer) {
            setPlayerInfoMarkup(
                <Box className="playerInfoContainer">
                    <img src={selectedPlayer.playerImage} alt={selectedPlayer.fullName} className="playerHeadshot" />
                    <Box className="playerInfoText">
                        <Box className="playerInfoName">{selectedPlayer.fullName}</Box>
                        <Box className="playerInfoSeason">2018 Season</Box>
                        <Box><img src={selectedPlayer.teamImage} alt="Team Logo" className="teamLogoImage" /></Box>
                    </Box>
                </Box>
            );

            if(!playerStats[selectedPlayer.playerId]) {
                setFetchURL("https://project.trumedianetworks.com/api/mlb/player/" + selectedPlayer.playerId);
            }
            else {
                setTabularRows(formatTableRows());
                setChartIntervalData(playerStats[selectedPlayer.playerId].weeklyData);
                setChipVariants({
                    weekly: "filled", biweekly: "outlined", monthly: "outlined"
                });
                setXDataKey("dateRange");
            }
        }
    }, [selectedPlayer])

    useEffect(() => {
        if(Object.keys(playerStats).length > 0) {
            const tabRows = formatTableRows();
            setTabularRows(tabRows);
            setChartIntervalData(playerStats[selectedPlayer.playerId].weeklyData);
            setChipVariants({
                weekly: "filled", biweekly: "outlined", monthly: "outlined"
            });
            setXDataKey("dateRange");
        }
    }, [playerStats]);

    const formatTableRows = () => {
        const selectedPlayerStats = playerStats[selectedPlayer.playerId];
        const tabRows = [
            selectedPlayerStats.preASBData,
            selectedPlayerStats.postASBData,
            selectedPlayerStats.dayGameData,
            selectedPlayerStats.nightGameData,
            selectedPlayerStats.seasonData
        ];

        return tabRows;
    };

    const getThreeDecimalPlaces = (stat) => {
        return Number.parseFloat(stat).toFixed(3);
    };

    const formatPercentageStats = (stat) => {
        return Number.parseFloat(stat*100).toFixed(1) + "%";
    };

    const onSelectedPlayerChange = (event) => {
        setSelectedPlayer(event.target.value);
    };

    const changeChartIntervals = (event) => {
        if(event.target.innerText === "7 Games" && chipVariants.weekly === "outlined") {
            setChipVariants({
                weekly: "filled", biweekly: "outlined", monthly: "outlined"
            });
            setChartIntervalData(playerStats[selectedPlayer.playerId].weeklyData)
            setXDataKey("dateRange");
        }
        else if(event.target.innerText === "14 Games" && chipVariants.biweekly === "outlined") {
            setChipVariants({
                weekly: "outlined", biweekly: "filled", monthly: "outlined"
            });
            setChartIntervalData(playerStats[selectedPlayer.playerId].biweeklyData)
            setXDataKey("dateRange");
        }
        else if(event.target.innerText === "Monthly" && chipVariants.monthly === "outlined") {
            setChipVariants({
                weekly: "outlined", biweekly: "outlined", monthly: "filled"
            });
            setChartIntervalData(playerStats[selectedPlayer.playerId].monthlyData);
            setXDataKey("month");
        }
    };

    const onChartStatChange = (event) => {
        setChartStat(event.target.value);
    };

    const yAxisFormatter = (tickitem) => {
        if(["Kper", "BBper", "TTO"].includes(chartStat)) {
            return parseInt(formatPercentageStats(tickitem)) + "%";
        }
        else {
            return getThreeDecimalPlaces(tickitem);
        }
    };
    
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            let value;
            let statLabel = chartStat;
            if(["Kper", "BBper", "TTO"].includes(chartStat)) {
                statLabel = chartStat.replace("per", "") + "%";
                value = formatPercentageStats(payload[0].value);
            }
            else {
                value = getThreeDecimalPlaces(payload[0].value);
            }
            return (
                <Box className="customTooltip">
                    <p>{`${statLabel} : ${value}`}</p>
                    <p>{`Games During: ${label}`}</p>
                </Box>
            );
        }

        return null;
    }

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
            {
                Object.keys(playerStats).length > 0 &&
                <Box>
                    <Box className="tabularData">
                        <TableContainer component={Paper}>
                            <Table sx={{minWidth: "100%"}} size="small">
                                <TableHead>
                                    <TableRow>
                                        {columnHeaders.map(c => {
                                            if(c === "") {
                                                return <TableCell key={"label-th"}></TableCell>
                                            }
                                            else {
                                                return <TableCell key={c + "-th"} align="right">{c}</TableCell>
                                            }
                                        })}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {tabularRows.map(row => {
                                        return (
                                            <TableRow hover key={row.label}>
                                                <TableCell key={row.label + "-label"} component="th" scope="row" className="rowLabel">
                                                    {row.label}
                                                </TableCell>
                                                <TableCell align="right" key={row.label + "-G"}>{row.G}</TableCell>
                                                <TableCell align="right" key={row.label + "-PA"}>{row.PA}</TableCell>
                                                <TableCell align="right" key={row.label + "-AB"}>{row.AB}</TableCell>
                                                <TableCell align="right" key={row.label + "-H"}>{row.H}</TableCell>
                                                <TableCell align="right" key={row.label + "-HR"}>{row.HR}</TableCell>
                                                <TableCell align="right" key={row.label + "-TB"}>{row.TB}</TableCell>
                                                <TableCell align="right" key={row.label + "-BB"}>{row.BB}</TableCell>
                                                <TableCell align="right" key={row.label + "-K"}>{row.K}</TableCell>
                                                <TableCell align="right" key={row.label + "-HBP"}>{row.HBP}</TableCell>
                                                <TableCell align="right" key={row.label + "-SF"}>{row.SF}</TableCell>
                                                <TableCell align="right" key={row.label + "-BA"}>{getThreeDecimalPlaces(row.BA)}</TableCell>
                                                <TableCell align="right" key={row.label + "-OBP"}>{getThreeDecimalPlaces(row.OBP)}</TableCell>
                                                <TableCell align="right" key={row.label + "-SLG"}>{getThreeDecimalPlaces(row.SLG)}</TableCell>
                                                <TableCell align="right" key={row.label + "-OPS"}>{getThreeDecimalPlaces(row.OPS)}</TableCell>
                                                <TableCell align="right" key={row.label + "-ISO"}>{getThreeDecimalPlaces(row.ISO)}</TableCell>
                                                <TableCell align="right" key={row.label + "-BABIP"}>{getThreeDecimalPlaces(row.BABIP)}</TableCell>
                                                <TableCell align="right" key={row.label + "-Kper"}>{formatPercentageStats(row.Kper)}</TableCell>
                                                <TableCell align="right" key={row.label + "-BBper"}>{formatPercentageStats(row.BBper)}</TableCell>
                                                <TableCell align="right" key={row.label + "-TTO"}>{formatPercentageStats(row.TTO)}</TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                    <Divider className="divider" />
                    <Box className="chartFilters">
                        <Box className="chartSelect">
                            <FormControl sx={{minWidth: 250}} variant="standard">
                                <InputLabel id="statSelectLabel">Select a Stat</InputLabel>
                                <Select
                                    labelId="statSelectLabel"
                                    id="statSelect"
                                    value={chartStat}
                                    onChange={onChartStatChange}
                                >
                                    <MenuItem key="BA" value="BA">BA</MenuItem>
                                    <MenuItem key="OBP" value="OBP">OBP</MenuItem>
                                    <MenuItem key="SLG" value="SLG">SLG</MenuItem>
                                    <MenuItem key="OPS" value="OPS">OPS</MenuItem>
                                    <MenuItem key="ISO" value="ISO">ISO</MenuItem>
                                    <MenuItem key="BABIP" value="BABIP">BABIP</MenuItem>
                                    <MenuItem key="Kper" value="Kper">K%</MenuItem>
                                    <MenuItem key="BBper" value="BBper">BB%</MenuItem>
                                    <MenuItem key="TTO" value="TTO">TTO%</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                        <Box className="chartChipIntervals">
                            <Chip color="secondary" label="7 Games" onClick={changeChartIntervals} variant={chipVariants.weekly} />
                            <Chip color="secondary" label="14 Games" onClick={changeChartIntervals} variant={chipVariants.biweekly} />
                            <Chip color="secondary" label="Monthly" onClick={changeChartIntervals} variant={chipVariants.monthly} />
                        </Box>
                    </Box>
                    <Box sx={{width: "100%", height: "500px"}}>                        
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={chartIntervalData}
                                margin={{
                                    top: 25,
                                    right: 35,
                                    left: 0,
                                    bottom: 50,
                                }}
                            >
                                <CartesianGrid />
                                <XAxis 
                                    dataKey={xDataKey}
                                    dy={5}
                                    interval={0}
                                    angle={60}
                                    textAnchor="start"
                                />
                                <YAxis tickFormatter={yAxisFormatter} />
                                <Tooltip content={<CustomTooltip />} />
                                <Line 
                                    type="linear"
                                    dataKey={chartStat}
                                    stroke="#297C90"
                                    activeDot={{r:12}}
                                    dot={{strokeWidth: 8}}
                                    strokeWidth={3}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Box>
                </Box>
            }
        </Container>
    );
}

export default App;