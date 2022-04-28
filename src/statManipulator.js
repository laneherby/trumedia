//function to take in an array of stats and add them all up to each other since they're all counting stats and return a new object
const cumulateStats = (stats) => {
    const cumulativeStats = {
        "PA": 0,
        "AB": 0,
        "H": 0,
        "HR": 0,
        "BB": 0,
        "K": 0,
        "HBP": 0,
        "SF": 0,
        "TB": 0,
        "RBI": 0
    };
    
    stats.forEach(game => {
        for(const stat in cumulativeStats) {
            cumulativeStats[stat] += game[stat];
        }
    });
    
    const firstDate = new Date(stats[0].gameDate);
    const lastDate = new Date(stats[stats.length - 1].gameDate);
    
    cumulativeStats.startDate = `${firstDate.getMonth() + 1}/${firstDate.getDate()}`;
    cumulativeStats.endDate = `${lastDate.getMonth() + 1}/${lastDate.getDate()}`;
    cumulativeStats.dateRange = `${cumulativeStats.startDate}-${cumulativeStats.endDate}`;
    
    return cumulativeStats;
};

//take 7 game data and turn it into 14 game data
const combineWeeks = (startWeek, endWeek) => {
    const cumulativeStats = {
        "PA": 0,
        "AB": 0,
        "H": 0,
        "HR": 0,
        "BB": 0,
        "K": 0,
        "HBP": 0,
        "SF": 0,
        "TB": 0,
        "RBI": 0
    };

    for(const stat in cumulativeStats) {
        cumulativeStats[stat] = startWeek[stat] + endWeek[stat];
    }
    
    cumulativeStats.startDate = startWeek.startDate;
    cumulativeStats.endDate = endWeek.endDate;
    cumulativeStats.dateRange = `${cumulativeStats.startDate}-${cumulativeStats.endDate}`;

    return cumulativeStats;
};

//chunk the games into 7 game arrays
const getWeeklyData = (stats) => {
    const seasonWeeklyData = {
        "weeklyData": [],
        "biweeklyData": []
    };

    const weeklyGames = [];
    for(let i=0; i<stats.length; i+=7) {
        weeklyGames.push(stats.slice(i, i+7));
    }

    for(let j=0; j<weeklyGames.length; j++) {
        seasonWeeklyData.weeklyData.push(cumulateStats(weeklyGames[j]));

        if((j+1) % 2 === 0) {
            seasonWeeklyData.biweeklyData.push(
                combineWeeks(seasonWeeklyData.weeklyData[j-1], seasonWeeklyData.weeklyData[j])
            );
        }
        else if (j === (weeklyGames.length-1)) {            
            seasonWeeklyData.biweeklyData.push(seasonWeeklyData.weeklyData[j]);
            seasonWeeklyData.biweeklyData[seasonWeeklyData.biweeklyData.length-1].dateRange = `${seasonWeeklyData.weeklyData[j].startDate}-${seasonWeeklyData.weeklyData[j].endDate}`;
        }
    }

    return seasonWeeklyData;
};

//group stats by the month of the game
const groupByMonths = (stats) => {
    return stats.reduce((acc, cur) => {
      acc[new Date(cur["gameDate"]).getMonth()] = [...acc[new Date(cur["gameDate"]).getMonth()] || [], cur];
      return acc;
    }, {});
};

//cumulate games of the same month
const getMonthlyData = (stats) => {
    const monthlyArrays = groupByMonths(stats);
    const monthlyData = [];
    for(const month in monthlyArrays) {
        const monthCumulative = cumulateStats(monthlyArrays[month]);
        monthCumulative.month = new Date(monthCumulative.startDate + "/18").toLocaleString("default", { month: "short" });
        monthlyData.push(monthCumulative);
    }
    
    return monthlyData;
};

//combine the monthly data to get the season data
const combineMonths = (monthlyData) => {
    const cumulativeStats = {
        "PA": 0,
        "AB": 0,
        "H": 0,
        "HR": 0,
        "BB": 0,
        "K": 0,
        "HBP": 0,
        "SF": 0,
        "TB": 0,
        "RBI": 0
    };

    monthlyData.forEach(month => {
        for(const stat in cumulativeStats) {
            cumulativeStats[stat] += month[stat];
        }
    });

    return cumulativeStats;
};

//get data separated into before and after the all star game
const getASBData = (stats) => {
    const asgDate = new Date("07/17/2018");

    const preASBArray = stats.filter((game) => { return new Date(game.gameDate) < asgDate; })
    const postASBArray = stats.filter((game) => { return new Date(game.gameDate) > asgDate; })

    const asbData = {
        preASBData: cumulateStats(preASBArray),
        postASBData: cumulateStats(postASBArray)
    };

    return asbData;
};

//get data separated from games that start before 4pm and after 4pm
const getGametimeData = (stats) => {
    const timeCutoff = 16;

    const dayGameArray = stats.filter((game) => { return new Date(game.gameDate).getHours() < timeCutoff; })
    const nightGameArray = stats.filter((game) => { return new Date(game.gameDate).getHours() >= timeCutoff; })

    const gametimeData = {
        dayGameData: cumulateStats(dayGameArray),
        nightGameData: cumulateStats(nightGameArray)
    };

    return gametimeData;
};

//master calc function that takes all counting numbers and returns more calculated stats
const calcAllStats = (statsObj) => {
    //I wanted to separate the functions so I could show exaclty how they're being calculated
    const getBA = (h, ab) => { return h/ab; }
    const getOBP = (h, bb, hbp, ab, sf) => { return ((h+bb+hbp)/(ab+bb+hbp+sf)); }
    const getSLG = (tb, ab) => { return tb/ab; }
    const getOPS = (obp, slg) => { return obp+slg; }
    const getISO = (slg, ba) => { return slg-ba; }
    const getBABIP = (h, hr, ab, k, sf) => { return ((h-hr)/(ab-k-hr+sf)); }
    const getKper = (k, pa) => { return k/pa; }
    const getBBper = (bb, pa) => { return bb/pa; }
    const getTTO = (k, bb, hr, pa) => { return (k+bb+hr)/pa; }

    statsObj.BA = getBA(statsObj.H, statsObj.AB);
    statsObj.OBP = getOBP(statsObj.H, statsObj.BB, statsObj.HBP, statsObj.AB, statsObj.SF);
    statsObj.SLG = getSLG(statsObj.TB, statsObj.AB);
    statsObj.OPS = getOPS(statsObj.OBP, statsObj.SLG);
    statsObj.ISO = getISO(statsObj.SLG, statsObj.BA);
    statsObj.BABIP = getBABIP(statsObj.H, statsObj.HR, statsObj.AB, statsObj.K, statsObj.SF);
    statsObj.Kper = getKper(statsObj.K, statsObj.PA);
    statsObj.BBper = getBBper(statsObj.BB, statsObj.PA);
    statsObj.TTO = getTTO(statsObj.K, statsObj.BB, statsObj.HR, statsObj.PA);

    return statsObj;
};

//function to get the games where a player had the most hits and homeruns in one game, and get the longest hit and on base streaks
const getSeasonHighs = (stats) => {
    const hitsHigh = {
        H: 0,
        gameDate: ""
    };
    const hrHigh = {
        HR: 0,
        gameDate: ""
    };
    const hitStreak = {
        games: 0,
        startDate: "",
        endDate: ""
    }
    const onBaseStreak = {
        games: 0,
        startDate: "",
        endDate: ""
    }
    const currHitStreak = {
        games: 0,
        startDate: "",
        endDate: ""
    }
    const currOnBaseStreak = {
        games: 0,
        startDate: "",
        endDate: ""
    }

    stats.forEach(game => {
        if(game.H > 0) {
            if(game.H > hitsHigh.H) {
                hitsHigh.H = game.H;
                hitsHigh.gameDate = game.gameDate;
            }

            if(currHitStreak.games === 0) {
                currHitStreak.startDate = game.gameDate;
            }
            currHitStreak.endDate = game.gameDate;
            currHitStreak.games = currHitStreak.games + 1;

            if(currOnBaseStreak.games === 0) {
                currOnBaseStreak.startDate = game.gameDate;
            }            
            currOnBaseStreak.endDate = game.gameDate;
            currOnBaseStreak.games = currOnBaseStreak.games + 1;
        }
        else if(game.H === 0 && (game.BB > 0 || game.HBP > 0)) {
            if(currHitStreak.games > hitStreak.games) {
                hitStreak.games = currHitStreak.games;
                hitStreak.startDate = currHitStreak.startDate;
                hitStreak.endDate = currHitStreak.endDate;
            }

            currHitStreak.games = 0;
            currHitStreak.startDate = "";
            currHitStreak.endDate = "";
        }
        else if(game.BB > 0 || game.HBP > 0) {
            if(currOnBaseStreak.games === 0) {
                currOnBaseStreak.startDate = game.gameDate;
            }            
            currOnBaseStreak.endDate = game.gameDate;
            currOnBaseStreak.games = currOnBaseStreak.games + 1;
        }
        else {
            if(currHitStreak.games > hitStreak.games) {
                hitStreak.games = currHitStreak.games;
                hitStreak.startDate = currHitStreak.startDate;
                hitStreak.endDate = currHitStreak.endDate;
            }

            currHitStreak.games = 0;
            currHitStreak.startDate = "";
            currHitStreak.endDate = "";

            if(currOnBaseStreak.games > hitStreak.games) {
                onBaseStreak.games = currOnBaseStreak.games;
                onBaseStreak.startDate = currOnBaseStreak.startDate;
                onBaseStreak.endDate = currOnBaseStreak.endDate;
            }

            currOnBaseStreak.games = 0;
            currOnBaseStreak.startDate = "";
            currOnBaseStreak.endDate = "";
        }

        if(game.HR > 0) {
            if(game.HR > hrHigh.HR) {
                hrHigh.HR = game.HR;
                hrHigh.gameDate = game.gameDate;
            }
        }
    });

    return { hitsHigh, hrHigh, hitStreak, onBaseStreak };
};

const setLabel = (statsObj, label) => {
    statsObj.label = label;
};

//runs all functions to get all data needed and calculated for the chart and tables
export const calcMasterStats = (stats) => {
    const playerData = {
        "playerId": stats[0].playerId,
        "fullName": stats[0].fullName,
        "playerImage": stats[0].playerImage,
        "team": stats[0].team,
        "teamImage": stats[0].teamImage
    };

    const { weeklyData, biweeklyData } = getWeeklyData(stats);
    const monthlyData = getMonthlyData(stats);
    const { preASBData, postASBData } = getASBData(stats);
    const seasonData = combineMonths(monthlyData);
    const { dayGameData, nightGameData } = getGametimeData(stats);
    
    playerData.weeklyData = weeklyData.map(statsObj => calcAllStats(statsObj));
    playerData.biweeklyData = biweeklyData.map(statsObj => calcAllStats(statsObj));
    playerData.monthlyData = monthlyData.map(statsObj => calcAllStats(statsObj));
    playerData.preASBData = calcAllStats(preASBData);
    setLabel(playerData.preASBData, "Pre ASG");
    playerData.postASBData = calcAllStats(postASBData);
    setLabel(playerData.postASBData, "Post ASG");
    playerData.dayGameData = calcAllStats(dayGameData);
    setLabel(playerData.dayGameData, "Day Games");
    playerData.nightGameData = calcAllStats(nightGameData);
    setLabel(playerData.nightGameData, "Night Games");
    playerData.seasonData = calcAllStats(seasonData);
    setLabel(playerData.seasonData, "Season");
    playerData.seasonHighs = getSeasonHighs(stats);

    return playerData;
}