import * as moment from 'moment-timezone';
import 'moment-timezone/builds/moment-timezone-with-data'; 

export const majorTimezones: string[] = [
    'UTC',                    // Coordinated Universal Time
    'America/New_York',       // Eastern Time (US & Canada)
    'America/Chicago',        // Central Time (US & Canada)
    'America/Denver',         // Mountain Time (US & Canada)
    'America/Los_Angeles',    // Pacific Time (US & Canada)
    'America/Anchorage',      // Alaska Time
    'America/Honolulu',       // Hawaii Time
    'America/Sao_Paulo',      // Brazil Time
    'America/Bogota',         // Colombia Time
    'America/Buenos_Aires',   // Argentina Time
    'Europe/London',          // United Kingdom Time
    'Europe/Berlin',          // Germany Time (represents Central European Time)
    'Europe/Moscow',          // Moscow Time (Russia)
    'Europe/Athens',          // Greece Time
    'Europe/Istanbul',        // Turkey Time
    'Africa/Cairo',           // Egypt Time
    'Africa/Johannesburg',    // South Africa Time
    'Africa/Lagos',           // Nigeria Time
    'Asia/Shanghai',          // China Standard Time
    'Asia/Tokyo',             // Japan Time
    'Asia/Kolkata',           // India Time
    'Asia/Dubai',             // United Arab Emirates Time
    'Asia/Bangkok',           // Thailand Time
    'Asia/Jakarta',           // Jakarta Time (Indonesia)
    'Australia/Sydney',       // Eastern Australia Time
    'Australia/Perth',        // Western Australia Time
    'Pacific/Auckland',       // New Zealand Time
    'Pacific/Fiji',           // Fiji Time
    'Europe/Stockholm',       // Sweden Time (represents Scandinavian Time)
];

export function convertToUTC(localTime: Date, timezone: string): Date {
    return moment(localTime).tz(timezone).utc().toDate();
}

export function convertToLocalTime(utcTime: Date, timezone: string): Date {
    return moment.utc(utcTime).tz(timezone).toDate();
}
// Get the filtered primary time zone
export function getFilteredMajorTimezones(): string[] {
    const allTimezones = moment.tz.names();
    return allTimezones.filter(timezone => majorTimezones.includes(timezone));
}