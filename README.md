# Weather Visualization using METARs and TAFs
By Alexander Wurts
## Slack
Join the [Slack](https://weathervisworkspace.slack.com) to see how you can contribute.

## Data Source
Data retrieved live from aviation weather services, parsed and displayed to the user.  

Click on the Runways for a fun animation. 
 
## Technology
React and D3 frontend powered by a nodejs backend. Hosted on a Google Cloud App Engine.

## Why?
I am a private pilot and wanted an easier way to check the weather for an airport from my phone or computer.  
This app visualizes the weather and allows anyone to search for an airport and see the most updated information. 


### API for accessing live Metar and TAF data:

#### /api/newestMETAR/{airport ident}
Example: /api/newestMETAR/KBOS
returns:
       
       {
            raw: "KBOS 041554Z 32019G25KT 10SM BKN032 BKN042 16/07 A2998 
                  RMK AO2 PK WND 32029/1516 SLP152 T01610067", string -> raw METAR
            drct: 320,      number -> wind direction true
            sknt: 19,       number -> wind speed in knots
            gust: 25,       number -> wind gust speed in knots
            alti: "2998",   string -> altimeter setting
            mslp: "152",    string -> sea level pressure, 3 characters need to add 4 based on value
            vsby: 10,       number -> visibility in statute miles
            tmpf: 16,       number -> temperature in celsius
            dwpf: 7,        number -> dew point in celsius
            valid: {
                day: 4,     number -> day of month
                hour: 15,   number -> hour in day
                minute: 54, number -> minute in hour
            },
            skyc1: "BKN",   string -> sky cover 1 abbreviation
            skyl1: 3200,    string -> sky cover 1 altitude AGL
            ...,
            skyc[n]: "BKN",   string -> sky cover n abbreviation
            skyl[n]: 4200,    string -> sky cover n altitude AGL
            weather: [
                {
                    text: "light rain", string -> weather decoded into english
                    raw: " -RA",        string -> weather codes
                },
                ... Can be multiple
            ]
        }


#### /api/newestTAFS/{airport ident}
Example: /api/newestTAFS/KSLN

        {
            released: {
                day: 4,              number -> day in month
                hour: 15,            number -> hour in day UTC
                minute: 40,          number -> minute in day UTC
                combined: "041540Z"  number -> raw UTC time
            },
            start: {
                day: 4,              number -> start day of month
                hour: 16             number -> start hour UTC
            },
            end: {
                day: 5,              number -> finish day of month
                hour: 12             number -> finsh hour UTC
            },
            raw: "KSLN 041540Z 0416/0512 12007KT 6SM -RA BKN007 OVC035 <br/>FM041800 11009KT 6SM -RA OVC012 <br/>FM050200 13013KT P6SM SCT015 OVC035", // string -> Raw TAF
            forecast: [
                {
                    raw: "KSLN 041540Z 0416/0512 12007KT 6SM -RA BKN007 OVC035 ",
                    type: "FM",                 string -> forecast block type. Fields specific to given type
                    start: {
                        day: 4,                 number -> day in month
                        hour: 16                number -> hour in day UTC
                    },
                    drct: 120,                  number -> wind direction true
                    sknt: 7,                    number -> wind speed kts     
                    gust: 0,                    number -> wind gust speed kts
                    vsby: 6,                    number -> visibility in statute miles
                    weather: [
                        {
                            text: "light rain", string -> decoded weather description
                            raw: "-RA"          stirng -> coded weather description
                        }
                    ],
                    skyc1: "BKN",   string -> sky cover 1 abbreviation
                    skyl1: 3200,    string -> sky cover 1 altitude AGL
                    ...,
                    skyc[n]: "BKN",   string -> sky cover n abbreviation
                    skyl[n]: 4200,    string -> sky cover n altitude AGL
                },
                {
                    
                }
                Will be multiple of different types,

            ]
        }

