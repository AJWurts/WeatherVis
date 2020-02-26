/**
 * @jest-environment node
 */
const AirportData = require('./airportdata');

test('dmsToDec', () => {
  expect(AirportData.dmsToDec('41-58-28.2790N')).toBeCloseTo(41.9744)
  expect(AirportData.dmsToDec('41-58-28.2790S')).toBeCloseTo(-41.9744)
  expect(AirportData.dmsToDec('087-54-23.7500W')).toBeCloseTo(-87.9065)
  expect(AirportData.dmsToDec('087-54-23.7500E')).toBeCloseTo(87.9065)
})


test('getCoordinates', () => {
  return AirportData.getCoordinates('KORD').then(data => {
    expect(data).toEqual(expect.objectContaining({
      lat: expect.any(Number),
      lon: expect.any(Number)
    }))
  });
})

test('resolveIdent', () => {
  expect(AirportData.resolveIdent('ORD')).toEqual('KORD');
  expect(AirportData.resolveIdent('KORD')).toEqual('KORD');
  expect(AirportData.resolveIdent('EGLL')).toEqual('EGLL');
  expect(AirportData.resolveIdent('7B2')).toEqual('K7B2');
})
