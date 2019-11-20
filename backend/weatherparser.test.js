/**
 * @jest-environment node
 */
const { parseDate, parseSkyCondition, parseWeather, parseTAF, parseMETAR } = require('./weatherparser.js');

test('parseDate', () => {
    var date = parseDate('2019-11-19T17:35:00Z')
    expect(date.hour).toEqual(17)
    expect(date.minute).toEqual(35)
    expect(date.second).toEqual(0)
    expect(date.year).toEqual(2019)
    expect(date.month).toEqual(11)
    expect(date.day).toEqual(19)

    var date = parseDate('2019-11-19T15:25:00Z')
    expect(date.hour).toEqual(15)
    expect(date.minute).toEqual(25)
    expect(date.second).toEqual(0)
    expect(date.year).toEqual(2019)
    expect(date.month).toEqual(11)
    expect(date.day).toEqual(19)
})


test("parseSkyCondition", () => {
    let conditions = parseSkyCondition(
        [
            {
                $: {
                    sky_cover: "OVC",
                    cloud_base_ft_agl: "800"
                }
            }
        ]
    )
    expect(conditions.length).toEqual(1)
    expect(conditions[0].cover).toBe('OVC')
    expect(conditions[0].base).toEqual(800);
})

test('processWeather', () => {
    let weather = parseWeather(
        "BR VCSH"
    )

    expect(weather[0].raw).toBe('BR')
    expect(weather[0].text).toBe(' fog')
    expect(weather[1].raw).toBe('VCSH')

})


test('parseTAF', () => {
    let xmlJSON = {
        raw_text: "KBOS 191735Z 1918/2024 11004KT 3SM BR VCSH OVC008 FM192100 05004KT P6SM BKN010 FM192300 35004KT P6SM BKN020 FM200200 34005KT P6SM BKN035 FM200500 35007KT 6SM BR VCSH BKN008 FM201500 35011KT 3SM BR VCSH OVC008 FM202100 33010KT 4SM BR VCSH OVC015",
        station_id: "KBOS",
        issue_time: "2019-11-19T17:35:00Z",
        bulletin_time: "2019-11-19T17:35:00Z",
        valid_time_from: "2019-11-19T18:00:00Z",
        valid_time_to: "2019-11-21T00:00:00Z",
        latitude: "42.37",
        longitude: "-71.02",
        elevation_m: "6.0",
        forecast: [
            {
                fcst_time_from: "2019-11-19T18:00:00Z",
                fcst_time_to: "2019-11-19T21:00:00Z",
                wind_dir_degrees: "110",
                change_indicator: 'FM',
                wind_speed_kt: "4",
                visibility_statute_mi: "3.0",
                wx_string: "BR VCSH",
                sky_condition: [
                    {
                        $: {
                            sky_cover: "OVC",
                            cloud_base_ft_agl: "800"
                        }
                    }
                ]
            },
            {
                fcst_time_from: "2019-11-19T18:00:00Z",
                fcst_time_to: "2019-11-19T21:00:00Z",
                wind_dir_degrees: "110",
                change_indicator: 'FM',
                wind_speed_kt: "4",
                visibility_statute_mi: "3.0",
                wx_string: "BR VCSH",
                sky_condition:
                {
                    $: {
                        sky_cover: "OVC",
                        cloud_base_ft_agl: "800"
                    }
                }

            },
        ]
    }

    let stdJSON = parseTAF(xmlJSON);

    expect(stdJSON.raw).toBe("KBOS 191735Z 1918/2024 11004KT 3SM BR VCSH OVC008 FM192100 05004KT P6SM BKN010 FM192300 35004KT P6SM BKN020 FM200200 34005KT P6SM BKN035 FM200500 35007KT 6SM BR VCSH BKN008 FM201500 35011KT 3SM BR VCSH OVC008 FM202100 33010KT 4SM BR VCSH OVC015")
    expect(stdJSON.start.hour).toEqual(18);
    expect(stdJSON.released.hour).toEqual(17);
    expect(stdJSON.forecast[0].type).toBe('FM')
    expect(stdJSON.forecast[0].drct).toEqual(110)
    expect(stdJSON.forecast[0].sknt).toEqual(4)
    expect(stdJSON.forecast[0].vsby).toEqual(3.0)
    expect(stdJSON.forecast[0].clouds[0].cover).toBe("OVC")
    expect(stdJSON.forecast[0].clouds[0].base).toEqual(800)
    expect(stdJSON.forecast[0].weather[0].raw).toBe("BR")
    expect(stdJSON.forecast[0].weather[1].raw).toBe("VCSH")

    expect(stdJSON.forecast[1].clouds[0].cover).toBe("OVC")
    expect(stdJSON.forecast[1].clouds[0].base).toBe(800)



})


test('parseMETAR', () => {
    let xmlJson = {
        raw_text: "KBED 201551Z 36005KT 5SM -RA BKN008 OVC013 04/01 A2990 RMK AO2 RAB13 SLP139 P0000 T00390011",
        station_id: "KBED",
        observation_time: "2019-11-20T15:51:00Z",
        latitude: "42.47",
        longitude: "-71.3",
        temp_c: "3.9",
        dewpoint_c: "1.1",
        wind_dir_degrees: "360",
        wind_speed_kt: "5",
        visibility_statute_mi: "5.0",
        altim_in_hg: "29.899607",
        sea_level_pressure_mb: "1013.9",
        quality_control_flags: {
            auto_station: "TRUE"
        },
        wx_string: "-RA",
        sky_condition: [
            {
                $: {
                    sky_cover: "BKN",
                    cloud_base_ft_agl: "800"
                }
            },
            {
                $: {
                    sky_cover: "OVC",
                    cloud_base_ft_agl: "1300"
                }
            }
        ],
        flight_category: "IFR",
        precip_in: "0.005",
        metar_type: "METAR",
        elevation_m: "50.0"
    }

    let stdJSON = parseMETAR(xmlJson);

    expect(stdJSON.raw).toBe("KBED 201551Z 36005KT 5SM -RA BKN008 OVC013 04/01 A2990 RMK AO2 RAB13 SLP139 P0000 T00390011")
    expect(stdJSON.valid.hour).toEqual(15);
    expect(stdJSON.valid.day).toEqual(20);
    expect(stdJSON.alti).toEqual(29.899607)
    expect(stdJSON.mslp).toEqual(1013.9)
    expect(stdJSON.flightcat).toBe("IFR")
    expect(stdJSON.percip).toEqual(0.005)
    expect(stdJSON.airport).toBe('KBED')
    expect(stdJSON.tmpf).toEqual(3.9)
    expect(stdJSON.dwpf).toEqual(1.1)
    expect(stdJSON.drct).toEqual(360)
    expect(stdJSON.sknt).toEqual(5)
    expect(stdJSON.vsby).toEqual(5.0)
    expect(stdJSON.clouds[0].cover).toBe("BKN")
    expect(stdJSON.clouds[0].base).toEqual(800)
    expect(stdJSON.weather[0].raw).toBe("-RA")

})