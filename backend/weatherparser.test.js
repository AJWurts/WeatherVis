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
        ]
    }

    let stdJSON = parseTAF(xmlJSON);

    expect(stdJSON.raw).toBe("KBOS 191735Z 1918/2024 11004KT 3SM BR VCSH OVC008 FM192100 05004KT P6SM BKN010 FM192300 35004KT P6SM BKN020 FM200200 34005KT P6SM BKN035 FM200500 35007KT 6SM BR VCSH BKN008 FM201500 35011KT 3SM BR VCSH OVC008 FM202100 33010KT 4SM BR VCSH OVC015")
    expect(stdJSON.start.hour).toBe(18);
    expect(stdJSON.released.hour).toBe(17);
    expect(stdJSON.forecast[0].type).toBe('FM')
    expect(stdJSON.forecast[0].drct).toBe(110)
    expect(stdJSON.forecast[0].sknt).toBe(4)
    expect(stdJSON.forecast[0].vsby).toBe(3.0)
    expect(stdJSON.forecast[0].clouds[0].cover).toBe("OVC")
    expect(stdJSON.forecast[0].clouds[0].base).toBe(800)
    expect(stdJSON.forecast[0].weather[0].raw).toBe("BR")
    expect(stdJSON.forecast[0].weather[1].raw).toBe("VCSH")


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
    expect(conditions.length).toBe(1)
    expect(conditions[0].cover).toBe('OVC')
    expect(conditions[0].base).toBe(800);
})

test('processWeather', () => {
    let weather = parseWeather(
        "BR VCSH"
    )

    expect(weather[0].raw).toBe('BR')
    expect(weather[0].text).toBe(' fog')
    expect(weather[1].raw).toBe('VCSH')

    weather = parseWeather(null)
})
