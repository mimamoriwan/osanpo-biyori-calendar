import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Tokyo');

export function parseJst(iso: string) {
  return dayjs.tz(`${iso}+09:00`);
}

export function formatToJstLabel(iso: string) {
  return parseJst(iso).format('MM月DD日 HH:mm');
}

export function formatToHourJst(iso: string) {
  return parseJst(iso).format('HH:mm');
}

export function formatRangeToJst(start: string, end: string) {
  const startDay = parseJst(start);
  const endDay = parseJst(end).add(1, 'hour');
  const sameDay = startDay.isSame(endDay, 'day');
  if (sameDay) {
    return `${startDay.format('MM/DD HH:mm')}〜${endDay.format('HH:mm')}`;
  }
  return `${startDay.format('MM/DD HH:mm')}〜${endDay.format('MM/DD HH:mm')}`;
}

export function minutesUntil(iso: string, now: dayjs.Dayjs = dayjs.tz()) {
  const target = parseJst(iso);
  const diff = target.diff(now, 'minute');
  return diff > 0 ? diff : 0;
}
