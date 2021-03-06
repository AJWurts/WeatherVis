# Weather Visualization using METARs and TAFs
By Alexander Wurts

## If you like this project please consider sponsoring me, so I can add more cool features. 
[Sponsor Link](https://github.com/sponsors/AJWurts) - It's only a few bucks a month.

## Flock aka Slack but better
Join the [Flock](weathervis.flock.com), a group chat platform, to see how you can contribute.

## Data Source
Data retrieved live from aviation weather services, parsed and displayed to the user.  

Click on the Runways for a fun animation. 
 
## Technology
React and D3 frontend powered by a nodejs backend. Hosted on a Google Cloud App Engine.

## Why?
I am a private pilot and wanted an easier way to check the weather for an airport from my phone or computer.  
This app visualizes the weather and allows anyone to search for an airport and see the most updated information. 


## API for accessing live Metar and TAF data:

### Retrieve Most Recent METAR: /api/newestMETAR/:ident
#### Input:
* ident: 
    * Airport identifier code
    * Example: KBED, KBOS, KLAX, LAX, MIA, 7B2, 6B6
#### Return: 
* Singular METAR Object  
#### Example: /api/newestMETAR/KBOS
       {
            raw: "KBOS 041554Z 32019G25KT 10SM BKN032 BKN042 16/07 A2998 
                  RMK AO2 PK WND 32029/1516 SLP152 T01610067", string -> raw METAR
            airport: "KBOS", String -> Airport ident
            drct: 320,      number -> wind direction true
            sknt: 19,       number -> wind speed in knots
            gust: 25,       number -> wind gust speed in knots
            alti: 29.988122,   float -> altimeter  in inHg
            mslp: 1013.at,    float -> sea level pressure in millibars
            vsby: 10,       number -> visibility in statute miles
            tmpf: 16,       float -> temperature in celsius
            dwpf: 7,        float -> dew point in celsius
            flightcat: "VFR", string -> Flight Category can be VFR, IFR, MVFR, LIFR
            percip: null,   number -> amount of percipitation in inches
            valid: {
                year: 2019, number -> year
                month: 10,  number -> month where january is 0
                day: 4,     number -> day of month
                hour: 15,   number -> hour in day
                minute: 54, number -> minute in hour
            },
            clouds: [
                {
                    cover: 'BKN', string -> cloud cover
                    base: 1000,   number -> cloud base in ft agl
                },
                ... -> Multiple layers
            ],
            weather: [
                {
                    text: "light rain", string -> weather decoded into english
                    raw: " -RA",        string -> weather codes
                },
                ... Can be multiple
            ]
        }

#### METARS from the past N hours: /api/recentMETARs/:ident?hours=[number 0-48]
#### Input:
* ident: 
    * Airport identifier code
    * Example: KBED, KBOS, KLAX, LAX, MIA, 7B2, 6B6
* hours (optional):
    * Past number of hours to retrieve METARS for. values 0-48 are vaid
    * Default: 5
    * Example: 5, 10, 20, 30, 40
#### Return
* Multiple METAR objects sorted by valid date. See example METAR in /api/newestMETAR/ 

            {
                metars: [ List of METAR Objects ],  
                runways: [ 
                {
                    name: "04L/22R",                String -> Runway Name
                    name_remark: null,              String -> name remarks
                    length: 7864,                   number -> Runway length in ft
                    length_remark: null,            String -> length remarks
                    width: 150,                     number -> Runway width in ft
                    width_remark: null,             String -> width remarks
                    surface_type_condition: "ASPH-E",               String -> runway type
                    surface_type_condition_remark: null,            String -> condition remarks
                    surface_treatment: "GRVD",                      String -> Surface Treatment
                    surface_treatment_remark: null,                 String -> treatment remarks
                    pavement_classification_number: "90 /F/C/W/T",  String -> classification number
                    pavement_classification_number_remark: null,    String -> classification remarks
                    edge_light_intensity: "HIGH",                   String -> Lighting type
                    edge_light_intensity_remark: null,              String -> light remarks
                    direction: 40                                   number -> direction of one rwy direction. +180 for second
                },
                ... Multiple
                ]
            }


### Most recent METAR for airport: /api/newestTAFS/{airport ident}
#### Input:
* Airport Ident: 
    * Airport identifier code
    * Example: KBED, KBOS, KLAX, LAX, MIA, 7B2, 6B6
#### Return: 
  * Single TAF Object    

#### Example: /api/newestTAFS/KSLN
          {
            released: {
                year: 2019,          number -> year
                month: 11,           number -> month where january is 0
                day: 4,              number -> day in month
                hour: 15,            number -> hour in day UTC
                minute: 40,          number -> minute in day UTC
                second: 0,           number -> second. almost always 0
            },
            start: {
                year: 2019,          number -> year
                month: 11,           number -> month where january is 0
                day: 4,              number -> day in month
                hour: 15,            number -> hour in day UTC
                minute: 40,          number -> minute in day UTC
                second: 0,           number -> second. almost always 0
            },
            end: {
                year: 2019,          number -> year
                month: 11,           number -> month where january is 0
                day: 4,              number -> day in month
                hour: 15,            number -> hour in day UTC
                minute: 40,          number -> minute in day UTC
                second: 0,           number -> second. almost always 0
            },
            airport: "KSLN",         string -> Airport Indentifier
            raw: "KSLN 041540Z 0416/0512 12007KT 6SM -RA BKN007 OVC035 <br/>FM041800 11009KT 6SM -RA OVC012 <br/>FM050200 13013KT P6SM SCT015 OVC035", // string -> Raw TAF
            forecast: [
                {
                    type: "FM",                 string -> forecast block type. Fields specific to given type
                    start: {
                        year: 2019,          number -> year
                        month: 11,           number -> month where january is 0
                        day: 4,              number -> day in month
                        hour: 15,            number -> hour in day UTC
                        minute: 40,          number -> minute in day UTC
                        second: 0,           number -> second. almost always 0
                    },
                    end: {
                        year: 2019,          number -> year
                        month: 11,           number -> month where january is 0
                        day: 4,              number -> day in month
                        hour: 15,            number -> hour in day UTC
                        minute: 40,          number -> minute in day UTC
                        second: 0,           number -> second. almost always 0
                    },
                    
                    drct: 120,                  number -> wind direction true
                    sknt: 7,                    number -> wind speed kts     
                    gust: 0,                    number -> wind gust speed kts
                    vsby: 6,                    float -> visibility in statute miles
                    weather: [
                        {
                            text: "light rain", string -> decoded weather description
                            raw: "-RA"          stirng -> coded weather description
                        }
                    ],
                    clouds: [
                        {
                            cover: 'BKN', string -> cloud cover
                            base: 1000,   number -> cloud base in ft agl
                        },
                        ... -> Multiple layers
                    ],
            },
                ... Includes multiple forecast items

            ]
        }


### One TAF for all airports within radius of airport ident: /api/nearestTAFS/:ident/:radius
#### Input:
* ident: 
    * Airport identifier code
    * Example: KBED, KBOS, KLAX, LAX, MIA, 7B2, 6B6
* radius: 
    * Radius in nautical miles (NM) around given airport lat lon
    * Ex: 10, 20, 30, 40, 100  
      
#### Example: /api/nearestTAFS/KSLN/20
* input
    *  ident: KSLN
    *  radius: 20
* Return
    * Multiple TAF objects in an array. See single TAF example in /api/newestTAFS/
