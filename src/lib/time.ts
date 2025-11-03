import { format, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

const TIMEZONE = 'Asia/Tokyo';

export const formatJST = (date: Date | string, formatStr: string = 'yyyy-MM-dd HH:mm'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const zonedDate = toZonedTime(dateObj, TIMEZONE);
  return format(zonedDate, formatStr);
};

export const getJSTHour = (date: Date | string): number => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const zonedDate = toZonedTime(dateObj, TIMEZONE);
  return zonedDate.getHours();
};

export const getJSTMinutes = (date: Date | string): number => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const zonedDate = toZonedTime(dateObj, TIMEZONE);
  return zonedDate.getMinutes();
};

export const getCurrentJSTTime = (): Date => {
  return toZonedTime(new Date(), TIMEZONE);
};

export const diffMinutes = (from: Date | string, to: Date | string): number => {
  const fromDate = typeof from === 'string' ? parseISO(from) : from;
  const toDate = typeof to === 'string' ? parseISO(to) : to;
  return Math.floor((toDate.getTime() - fromDate.getTime()) / (1000 * 60));
};
