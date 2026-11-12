import { requestClient } from '#/api/request';

/** Static demo environment (VITE_SYSTEM_SAMPLE=true) stores timezone in memory */
const USE_SAMPLE_DATA = import.meta.env.VITE_SYSTEM_SAMPLE === 'true';

const SAMPLE_TIMEZONE_OPTIONS = [
  { label: 'America/New_York (GMT-5)', value: 'America/New_York' },
  { label: 'Europe/London (GMT0)', value: 'Europe/London' },
  { label: 'Asia/Shanghai (GMT+8)', value: 'Asia/Shanghai' },
  { label: 'Asia/Tokyo (GMT+9)', value: 'Asia/Tokyo' },
  { label: 'Asia/Seoul (GMT+9)', value: 'Asia/Seoul' },
];

let sampleTimezone: null | string = null;

/**
 * Get the list of time zones supported by the system
 */
export async function getTimezoneOptionsApi() {
  if (USE_SAMPLE_DATA) {
    return SAMPLE_TIMEZONE_OPTIONS;
  }
  return await requestClient.get<
    {
      label: string;
      value: string;
    }[]
  >('/timezone/getTimezoneOptions');
}
/**
 * Get user time zone
 */
export async function getTimezoneApi(): Promise<null | string | undefined> {
  if (USE_SAMPLE_DATA) {
    return sampleTimezone;
  }
  return requestClient.get<null | string | undefined>('/timezone/getTimezone');
}
/**
 * Set user time zone
 * @param timezone time zone
 */
export async function setTimezoneApi(timezone: string): Promise<void> {
  if (USE_SAMPLE_DATA) {
    sampleTimezone = timezone;
    return;
  }
  return requestClient.post('/timezone/setTimezone', { timezone });
}
