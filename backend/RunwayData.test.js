/**
 * @jest-environment node
 */
const runwayData = require('./RunwayData')

test('getRunways', () => {
  return runwayData.getRunways('KORD').then(data => {
    // ORD has 9 runways
    expect(data.length).toBe(9)

    // Check that the runway data contains the fields we need
    expect(data[0]).toEqual(expect.objectContaining({
      name: expect.any(String),
      length: expect.any(Number),
      width: expect.any(Number),
    }))
  });
})
