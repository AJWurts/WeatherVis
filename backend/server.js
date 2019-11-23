const express = require('express')
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const app = express()
const parsers = require('./jsoncoverter.js')
const runwayData = require('./RunwayData.js')
const airportData = require('./airportdata');
const addsClient = require('./addsclient');

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());


// App routing to get newestMetar for given airport ident
app.get('/api/newestMetar/:ident', (req, res, next) => {
    let airportLetters = airportData.resolveIdent(req.params.ident);

    addsClient.newestMetar(airportLetters)
        .then(metar => {
            if (metar) {
                metar = parsers.parseMETAR(metar);
                runwayData.addRwysToMETAR(metar, airportLetters)
                    .then(rwyMetar => {
                        res.json(rwyMetar);
                    });
            } else {
                res.status(404).send();
            }
        }).catch(error => {
            console.error(error);
        });
});


app.get('/api/recentMETARs/:ident', (req, res, next) => {
    let airportLetters = airportData.resolveIdent(req.params.ident);
    let hours = req.query.hours || 5;

    addsClient.recentMetar(airportLetters, hours)
        .then(metar => {
            if (metar) {
                metar = parsers.parseMultipleMETAR(metar)
                runwayData.addRwysToMETAR({ metars: metar }, airportLetters)
                    .then(rwyMetar => {
                        res.json(rwyMetar);
                    });
            } else {
                res.status(404).send();
            }
        }).catch(error => {
            console.error(error);
        });
});

// Handle get TAF for ident
app.get('/api/newestTAFS/:ident', (req, res, next) => {
    let airportLetters = airportData.resolveIdent(req.params.ident);

    addsClient.stationTaf(airportLetters)
        .then(tafs => {
            tafs = parsers.parseMultipleTAF(tafs);
            res.json(tafs)
        }).catch(error => {
            res.sendStatus(404);
        })
});


// Return TAFs within a radius of the airport
app.get('/api/nearestTAFS/:ident/:radius(\\d+)?', (req, res, next) => {
    let airportLetters = airportData.resolveIdent(req.params.ident);

    airportData.getCoordinates(airportLetters)
        .then(coord => {
            addsClient.nearbyTafs(coord.lat, coord.lon, req.params.radius)
                .then(tafs => {
                    tafs = parsers.parseMultipleTAF(tafs);
                    res.json(tafs)
                });
        }).catch(error => {
            res.sendStatus(404);
        })
});

app.get('/api/nearestMETARs/:ident/:radius(\\d+)?', (req, res, next) => {
    let airportLetters = airportData.resolveIdent(req.params.ident);

    airportData.getCoordinates(airportLetters)
        .then(coord => {
            // console.log(coord);
            return addsClient.nearbyMetars(coord.lat, coord.lon, req.params.radius)
                .then(metars => {
                    metars = parsers.parseMultipleMETAR(metars);
                    res.json(metars)
                });
        }).catch(error => {
            res.sendStatus(404);
        })
});

app.get('/api/nearestAirports/:ident/:radius(\\d+)?', (req, res, next) => {
    let airportLetters = airportData.resolveIdent(req.params.ident);

    airportData.getCoordinates(airportLetters)
        .then(coord => {
            return addsClient.nearbyStations(coord.lat, coord.lon, req.params.radius)
                .then(stations => {

                    stations = parsers.parseMultipleStations(stations);
                    // stations = stations.map((x) => x.airport)
                    res.json(stations)
                })
        }).catch(error => {
            res.sendStatus(404);
        })
});

app.get('/api/:anything', (req, res, next) => {
    res.sendStatus(404);
})

app.use(express.static(path.join(__dirname, 'client/build')));

app.get('*', (req, res, next) => {
    res.sendFile(path.join(__dirname + '/client/build/index.html'));
})

PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Weather Vis listening on ${PORT}!`);
});