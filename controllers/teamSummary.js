const express = require('express');
const e = require("express");
const fetchDataFromApi = require('../abiosApi');
const gameData = require("../gameData");
const router = express.Router();

router.get('/teamSummary/:game/:name', async (req, res) => {
    try {
        const gameId = gameData.validateGameId(req.params.game, res);
        if (!gameId) return;

        //Takım bilgilerini al
        const teamUrl = `/teams${gameId}&filter=name=${req.params.name}`;
        var teamData = await fetchDataFromApi(teamUrl, req);
        await new Promise(resolve => setTimeout(resolve, 50));
        teamData = teamData[0];

        //Aktif kadro bilgilerini al
        const rosterUrl = `/rosters/${teamData["standing_roster"]["roster"]["id"]}`;
        const rosterData = await fetchDataFromApi(rosterUrl, req);
        await new Promise(resolve => setTimeout(resolve, 50));

        //Oyuncu ID'lerini al
        const idList = [];

        for (const rosterItem of rosterData['line_up']['players']) {
            idList.push(rosterItem.id);
        }

        const idString = idList.join(',');

        //Oyuncu bilgilerini al
        const playersUrl = `/players?filter=id<={${idString}}`;
        const playersData = await fetchDataFromApi(playersUrl, req);
        await new Promise(resolve => setTimeout(resolve, 50));

        //Yaklaşan seri bilgisini al
        const upcomingSeriesUrl = `/teams/${teamData['id']}/series?filter=start!=null,end=null,deleted_at=null&order=start-asc`;
        var upcomingSeriesData = await fetchDataFromApi(upcomingSeriesUrl, req);
        await new Promise(resolve => setTimeout(resolve, 50));

        upcomingSeriesData = upcomingSeriesData.filter(element => element['participants'].length === 2);
        
        if(upcomingSeriesData > 0){
            //Yaklaşan serideki roster ID'lerini al
            var upMatchesIdList = [];
            var upTournamentIdList = [];
            
            for (i=0; i<upcomingSeriesData.length; i++) {
                upMatchesIdList.push(upcomingSeriesData[i]['participants'][0]['roster']['id']);
                upMatchesIdList.push(upcomingSeriesData[i]['participants'][1]['roster']['id']);
                upTournamentIdList.push(upcomingSeriesData[i]['tournament']['id']);
            }

            const upMatchesIdListString = upMatchesIdList.join(',');
            const upTournamentIdListString = upTournamentIdList.join(',');

            //Yaklaşan serideki turnuvaların verisini al
            const upMatchesTourInfoUrl = `/tournaments?filter=id<={${upTournamentIdListString}}`;
            const upMatchesTourInfoData = await fetchDataFromApi(upMatchesTourInfoUrl, req);
            await new Promise(resolve => setTimeout(resolve, 50));
            
            var upmatchesTour = {};
            for(i=0; i<upMatchesTourInfoData.length; i++){
                upmatchesTour[`${upMatchesTourInfoData[i]['id']}`] = {"tournament_title":upMatchesTourInfoData[i]['title']}
            }
            
            //Yaklaşan serideki rosterların verisini al
            const upMatchesRostersInfoUrl = `/rosters?filter=id<={${upMatchesIdListString}}`;
            const upMatchesRostersInfoData = await fetchDataFromApi(upMatchesRostersInfoUrl, req);
            await new Promise(resolve => setTimeout(resolve, 50));

            upMatchesRostersInfoData.sort((a, b) => a.team.id - b.team.id);

            //Yaklaşan serideki takım ID'lerini al
            const upMatchesTeamIdList = [];
            const upMatchesRosterIdList = [];

            for(i=0; i<upMatchesRostersInfoData.length; i++){
                upMatchesTeamIdList.push(upMatchesRostersInfoData[i]['team']['id']);
                upMatchesRosterIdList.push(upMatchesRostersInfoData[i]['id']);
            }

            const uniqueUpMatchesRosterIdList = [...new Set(upMatchesRosterIdList)];
            const upMatchesTeamIdListString = upMatchesTeamIdList.join(',');

            const upMatchesTeamsInfoUrl = `/teams?filter=id<={${upMatchesTeamIdListString}}`;
            const upMatchesTeamsInfoData = await fetchDataFromApi(upMatchesTeamsInfoUrl, req);
            await new Promise(resolve => setTimeout(resolve, 50));

            var upMatchesTeams = {};

            for(i=0; i<uniqueUpMatchesRosterIdList.length; i++){
                upMatchesTeams[`${uniqueUpMatchesRosterIdList[i]}`] = {"name":upMatchesTeamsInfoData[i]['name'], "logo": upMatchesTeamsInfoData[i]['images'][0]['url']};
            }

            for(i=0; i<upcomingSeriesData.length; i++){
                upcomingSeriesData[i]['participants'][0]['name'] = upMatchesTeams[upcomingSeriesData[i]['participants'][0]['roster']['id']].name;
                upcomingSeriesData[i]['participants'][0]['logo'] = upMatchesTeams[upcomingSeriesData[i]['participants'][0]['roster']['id']].logo;

                upcomingSeriesData[i]['participants'][1]['name'] = upMatchesTeams[upcomingSeriesData[i]['participants'][1]['roster']['id']].name;
                upcomingSeriesData[i]['participants'][1]['logo'] = upMatchesTeams[upcomingSeriesData[i]['participants'][1]['roster']['id']].logo;

                upcomingSeriesData[i]['tournament']['name'] = upmatchesTour[upcomingSeriesData[i]['tournament']['id']].tournament_title;
            }

        }
       
        //Son 5 seri bilgisini al
        const endedSeriesUrl = `/teams/${teamData['id']}/series?filter=lifecycle=over&order=start-desc&take=5`;
        var endedSeriesData = await fetchDataFromApi(endedSeriesUrl, req);
        await new Promise(resolve => setTimeout(resolve, 50));
        //Son 5 serideki roster ID'lerini al
        const lastMatchesIdList = [];
        const lastTournamentIdList = [];

        for (i=0; i<5; i++) {
            lastMatchesIdList.push(endedSeriesData[i]['participants'][0]['roster']['id']);
            lastMatchesIdList.push(endedSeriesData[i]['participants'][1]['roster']['id']);
            lastTournamentIdList.push(endedSeriesData[i]['tournament']['id']);
        }

        const lastMatchesIdListString = lastMatchesIdList.join(',');
        const lastTournamentIdListString = lastTournamentIdList.join(',');

        //Son 5 serideki turnuvaların verisini al
        const lastMatchesTourInfoUrl = `/tournaments?filter=id<={${lastTournamentIdListString}}`;
        const lastMatchesTourInfoData = await fetchDataFromApi(lastMatchesTourInfoUrl, req);
        await new Promise(resolve => setTimeout(resolve, 50));

        var lastMatchesTour = {};
        for(i=0; i<lastMatchesTourInfoData.length; i++){
            lastMatchesTour[`${lastMatchesTourInfoData[i]['id']}`] = {"tournament_title":lastMatchesTourInfoData[i]['title']}
        }

        //Son 5 serideki roster bilgisini al
        const lastMatchesRostersInfoUrl = `/rosters?filter=id<={${lastMatchesIdListString}}`;
        const lastMatchesRostersInfoData = await fetchDataFromApi(lastMatchesRostersInfoUrl, req);
        await new Promise(resolve => setTimeout(resolve, 50));

        lastMatchesRostersInfoData.sort((a, b) => a.team.id - b.team.id);

        //Son 5 serideki takım ID'lerini al
        const lastMatchesTeamIdList = [];
        const lastMatchesRosterIdList = [];

        for(i=0; i<lastMatchesRostersInfoData.length; i++){
            lastMatchesTeamIdList.push(lastMatchesRostersInfoData[i]['team']['id']);
            lastMatchesRosterIdList.push(lastMatchesRostersInfoData[i]['id']);
        }
        const uniqueLastMatchesRosterIdList = [...new Set(lastMatchesRosterIdList)];
        const lastMatchesTeamIdListString = lastMatchesTeamIdList.join(',');

        const lastMatchesTeamsInfoUrl = `/teams?filter=id<={${lastMatchesTeamIdListString}}`;
        const lastMatchesTeamsInfoData = await fetchDataFromApi(lastMatchesTeamsInfoUrl, req);
        await new Promise(resolve => setTimeout(resolve, 50));

        var lastMatchesTeams = {};

        for(i=0; i<uniqueLastMatchesRosterIdList.length; i++){
            lastMatchesTeams[`${uniqueLastMatchesRosterIdList[i]}`] = {"name":lastMatchesTeamsInfoData[i]['name'], "logo": lastMatchesTeamsInfoData[i]['images'][0]['url']};
        }

        for(i=0; i<5; i++){
            try{
                oldParticipants = endedSeriesData[i]['participants'];
                if(endedSeriesData[i]['best_of'] == 1){
                    const bo1matchUrl = `/matches/${endedSeriesData[i]['matches'][0]['id']}`;
                    const bo1matchData = await fetchDataFromApi(bo1matchUrl, req);
                    await new Promise(resolve => setTimeout(resolve, 50));
                    endedSeriesData[i]['participants'] = bo1matchData['participants'];
                }
    
                endedSeriesData[i]['participants'][0]['name'] = lastMatchesTeams[oldParticipants[0]['roster']['id']].name;
                endedSeriesData[i]['participants'][0]['logo'] = lastMatchesTeams[oldParticipants[0]['roster']['id']].logo;
                
                endedSeriesData[i]['participants'][1]['name'] = lastMatchesTeams[oldParticipants[1]['roster']['id']].name;
                endedSeriesData[i]['participants'][1]['logo'] = lastMatchesTeams[oldParticipants[1]['roster']['id']].logo;
    
                endedSeriesData[i]['tournament']['name'] = lastMatchesTour[endedSeriesData[i]['tournament']['id']].tournament_title;
    
                if(endedSeriesData[i]['participants'][0]['name'] !== teamData['name']){
                    var temp = endedSeriesData[i]['participants'][0];
                    endedSeriesData[i]['participants'][0] = endedSeriesData[i]['participants'][1];
                    endedSeriesData[i]['participants'][1] = temp;
                }
    
                if(endedSeriesData[i]['participants'][0]['winner'])
                    endedSeriesData[i]['isWin'] = "Win";
                else
                    endedSeriesData[i]['isWin'] = "Lost";

            }
            catch(error){
                console.log(error);
            }

        }
        //Takım winrate bilgilerini al
        const teamAggregateUrl = `/teams/aggregates?&filter=team.id=${teamData['id']}`;
        const teamAggregateData = await fetchDataFromApi(teamAggregateUrl, req);
        await new Promise(resolve => setTimeout(resolve, 50));

        //Tarihi son maçtan geçmiş 3 ay'a ayarla
        var past3month = new Date(endedSeriesData[0]['end']);
        past3month.setMonth(past3month.getMonth() - 3);

        //En iyi oyuncuyu bul
        var bestPlayerData={};
        var bestRating = 0;
        for(i = 0; i<idList.length; i++){
            var playerServerUrl = `/players/${idList[i]}/postgame/server/summary?from=${past3month.toISOString()}`;
            var playerServerData = await fetchDataFromApi(playerServerUrl, req);
            await new Promise(resolve => setTimeout(resolve, 50));

            var playerDead = playerServerData['dataset_summary']['deaths'];
            var playerRounds = playerServerData['dataset_summary']['rounds']['total'];
    
            var kast = ((playerRounds - playerDead) * 100) / playerRounds + 40;
            var kpr = playerServerData['statistics']['kills']['per_round'][0]['value'];
            var dpr = playerServerData['statistics']['deaths']['per_round'][0]['value'];
            var adr = playerServerData['statistics']['damage']['given']['per_round'][0]['value'];
            var aspr = playerServerData['statistics']['assists']['per_round'][0]['value'];
            var impact = (2.13 * kpr) + (0.42 * aspr) - 0.41 + aspr;
    
            var rating = (0.0073 * (kast)) + (0.3591 * kpr) + (-0.5329 * dpr) + (0.2372 * impact) + (0.0032 * adr) + 0.158;

            if(rating>bestRating){
                bestPlayerData = {
                    "first_name":playersData[i]['first_name'], 
                    "nick_name":playersData[i]['nick_name'], 
                    "last_name":playersData[i]['last_name'],
                    "kpr":kpr.toFixed(2),
                    "dpr":dpr.toFixed(2),
                    "adr":adr.toFixed(2),
                    "aspr":aspr.toFixed(2),
                    "rating":rating.toFixed(2),
                    "kast":kast.toFixed(2)
                }
                bestRating = rating;
            }
        }

        //Map ID'lerini al
        var mapIDList = [];
        var mapWinrates = {};

        for (const mapItem of teamAggregateData[0]['winrate']['match']['per_map']) {
            mapIDList.push(mapItem['map'].id);
            mapWinrates[mapItem['map']['id']] = {"winrate":mapItem['rate'], "match_count":mapItem['history']};

        }

        const mapIDString = mapIDList.join(',');

        //Map bilgilerini al
        const mapsUrl = `/maps?filter=id<={${mapIDString}}`;
        const mapsData = await fetchDataFromApi(mapsUrl, req);

        //Takım'ın map objesini oluştur
        var teamMaps = [];

        for(i=0; i<mapsData.length; i++){
            for(j=0; j<mapIDList.length; j++){
                if(mapsData[i]['id'] == mapIDList[j]){
                    teamMaps.push({"name" : mapsData[i]['name'],"winrate" : mapWinrates[mapsData[i]['id']].winrate.toFixed(2)*100, "match_count": mapWinrates[mapsData[i]['id']].match_count});
                }
            }
        }
        teamMaps.sort((a, b) => b.match_count - a.match_count);

        /* Response Json'u oluştur */
        if(teamData['region']['country'] == null){
            var teamInfos = {
                "name":teamData['name'], 
                "logo":teamData['images'][0]['url'], 
                "region":teamData['region']['name'], 
                "country":teamData['region']['name'],
                "soical":teamData['social_media_accounts'],
                "roster":playersData,
                "best_player":bestPlayerData,
                "map_ratings": {"count":teamMaps.length, "maps":teamMaps},
                "last_matches":{"count":endedSeriesData.length, "matches":endedSeriesData},
                "coming_matches":{"count":upcomingSeriesData.length, "matches":upcomingSeriesData}
            };
        }
        else{
            var teamInfos = {
                "name":teamData['name'], 
                "logo":teamData['images'][0]['url'], 
                "region":teamData['region']['name'], 
                "country":teamData['region']['country']['name'],
                "soical":teamData['social_media_accounts'],
                "roster":playersData,
                "best_player":bestPlayerData,
                "map_ratings": {"count":teamMaps.length, "maps":teamMaps},
                "last_matches":{"count":endedSeriesData.length, "matches":endedSeriesData},
                "coming_matches":{"count":upcomingSeriesData.length, "matches":upcomingSeriesData}
            };
        }

       res.json(teamInfos);
    } catch (error) {
        res.status(500).json({ error });
    }
});

module.exports = router;