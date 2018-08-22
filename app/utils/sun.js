/**
 * Sunrise/sunset script. By Matt Kane.
 *
 * Based loosely and indirectly on Kevin Boone's SunTimes Java implementation
 * of the US Naval Observatory's algorithm.
 *
 * Copyright © 2012 Triggertrap Ltd. All rights reserved.
 *
 * This library is free software you can redistribute it and/or modify it under the terms of the GNU Lesser General
 * Public License as published by the Free Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Lesser General Public License for more
 * details.
 * You should have received a copy of the GNU Lesser General Public License along with this library; if not, write to
 * the Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA,
 * or connect to: http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html
 */

/* eslint-disable */

let DEGREES_PER_HOUR = 360 / 24
const ZENITH = 90.8333

function getDayOfYear (date) {
  var onejan = new Date(date.getFullYear(), 0, 1)
  return Math.ceil((date - onejan) / 86400000)
}

function sinDeg (deg) {
  return Math.sin(deg * 2.0 * Math.PI / 360.0)
}

function acosDeg (x) {
  return Math.acos(x) * 360.0 / (2 * Math.PI)
}

function asinDeg (x) {
  return Math.asin(x) * 360.0 / (2 * Math.PI)
}

function tanDeg (deg) {
  return Math.tan(deg * 2.0 * Math.PI / 360.0)
}

function cosDeg (deg) {
  return Math.cos(deg * 2.0 * Math.PI / 360.0)
}

function mod (a, b) {
  var result = a % b
  if (result < 0) {
    result += b
  }
  return result
}

function getTimeOfEventInDays(date, longitude, sunrise) {
  const hoursFromMeridian = longitude / DEGREES_PER_HOUR
  const dayOfYear = getDayOfYear(date)
  let approxTimeOfEventInDays = dayOfYear + ((18.0 - hoursFromMeridian) / 24)

  if (sunrise) {
    approxTimeOfEventInDays = dayOfYear + ((6 - hoursFromMeridian) / 24)
  }

  return { 
    sunMeanAnomaly: (0.9856 * approxTimeOfEventInDays) - 3.289, 
    approxTimeOfEventInDays 
  }
}

function getLocalMeanTime(latitude, sunMeanAnomaly, approxTimeOfEventInDays, sunrise) {
  const sunTrueLongitude = mod(sunMeanAnomaly + (1.916 * sinDeg(sunMeanAnomaly)) + (0.020 * sinDeg(2 * sunMeanAnomaly)) + 282.634, 360)
  const ascension = 0.91764 * tanDeg(sunTrueLongitude)
  const rightAscension = mod(360 / (2 * Math.PI) * Math.atan(ascension), 360)
  const lQuadrant = Math.floor(sunTrueLongitude / 90) * 90
  const raQuadrant = Math.floor(rightAscension / 90) * 90
  const sinDec = 0.39782 * sinDeg(sunTrueLongitude)
  const cosDec = cosDeg(asinDeg(sinDec))
  const cosLocalHourAngle = ((cosDeg(ZENITH)) - (sinDec * (sinDeg(latitude)))) / (cosDec * (cosDeg(latitude)))
  let localHourAngle = acosDeg(cosLocalHourAngle)

  if (sunrise) {
    localHourAngle = 360 - localHourAngle
  }

  const rightAscensionLocal = (rightAscension + (lQuadrant - raQuadrant)) / DEGREES_PER_HOUR
  const localHour = localHourAngle / DEGREES_PER_HOUR
  return localHour + rightAscensionLocal - (0.06571 * approxTimeOfEventInDays) - 6.622
}

function sunriseSet (date, latitude, longitude, sunrise) {
  const {
    sunMeanAnomaly,
    approxTimeOfEventInDays
  } = getTimeOfEventInDays(date, longitude, sunrise)

  const localMeanTime = getLocalMeanTime(latitude, sunMeanAnomaly, approxTimeOfEventInDays, sunrise)

  return dateInTimezone(date, mod(localMeanTime - (longitude / DEGREES_PER_HOUR), 24))
}

function dateInTimezone(date, time){
  let midnight = new Date(0)
  midnight.setUTCFullYear(date.getUTCFullYear())
  midnight.setUTCMonth(date.getUTCMonth())
  midnight.setUTCDate(date.getUTCDate())

  return new Date(midnight.getTime() + (time * 60 * 60 * 1000))
}

function sunrise (date, latitude, longitude) {
  return sunriseSet(date, latitude, longitude, true)
}

function sunset (date, latitude, longitude) {
  return sunriseSet(date, latitude, longitude, false)
}

module.exports = {
  sunrise,
  sunset
}
