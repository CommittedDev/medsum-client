import { compareDesc, differenceInDays, format, getYear, isAfter, isBefore, isEqual } from 'date-fns';
import { he } from 'date-fns/locale';
import { formatJewishDateInHebrew, toJewishDate } from 'jewish-date';

type IGreeting = 'good_morning' | 'good_afternoon' | 'good_evening';

export class DateUtils {
  static localString = 'en';

  static getGreeting(): IGreeting {
    const myDate = new Date();
    const hrs = myDate.getHours();

    let greet: IGreeting = 'good_morning';

    if (hrs < 12) greet = 'good_morning';
    else if (hrs >= 12 && hrs <= 17) greet = 'good_afternoon';
    else if (hrs >= 17 && hrs <= 24) greet = 'good_evening';

    return greet;
  }

  static formatDateAndTime(date: string | number | Date | undefined | null): string {
    return date ? format(date, 'dd.MM.yyyy HH:mm') : '';
  }

  static dateFormat: string = 'dd.MM.yyyy';

  static formatDate(date: string | number | Date | undefined | null, defaultValue?: string): string {
    if (!date) return defaultValue || '';
    if (date == 'Z_EMPTY') return defaultValue || '';
    if (date == '') return defaultValue || '';
    if (Object.prototype.toString.call(date) === '[object Date]' && isNaN(date as any)) {
      return defaultValue || '';
    }
    return format(date, 'dd.MM.yyyy');
  }
  static formatHebrewDate(date: string | number | Date | undefined): string {
    if (!date) return '';

    const currentDate = date ? new Date(date) : new Date();
    const formattedDate = format(currentDate, 'EEEE', {
      locale: he,
    });
    const jewishDate = toJewishDate(currentDate);
    const formattedDateJewish = formatJewishDateInHebrew(jewishDate);
    return formattedDate + ' ' + formattedDateJewish;
  }
  static formatMonthAndYear(date: string | number | Date): string {
    return format(date, 'MM.yyyy');
  }

  // Is the dateToCompare after or equal to today
  static isSameOrAfterToday(dateToCompare: string | number | Date): boolean {
    const today = new Date();
    // reset today hours
    today.setHours(0, 0, 0, 0);
    return isEqual(today, dateToCompare) || isAfter(dateToCompare, today);
  }

  static isSame(a: string | number | Date, b: string | number | Date): boolean {
    return isEqual(a, b);
  }

  static isAfter(a: string | number | Date, b: string | number | Date): boolean {
    return isAfter(a, b);
  }
  static isBefore(a: string | number | Date, b: string | number | Date): boolean {
    return isBefore(a, b);
  }
  static isEqualOrAfter(a: string | number | Date, b: string | number | Date): boolean {
    return isEqual(a, b) || isAfter(a, b);
  }
  static isEqualOrBefore(a: string | number | Date, b: string | number | Date): boolean {
    return isEqual(a, b) || isBefore(a, b);
  }

  static isBeforeNow(dateToCompare: string | number | Date): boolean {
    const now = new Date();
    return isBefore(dateToCompare, now);
  }

  // Is the dateToCompare before today
  static isAfterToday(dateToCompare: string | number | Date): boolean {
    const today = new Date();
    return isAfter(dateToCompare, today);
  }
  static isBeforeOrEqualToday(dateToCompare: string | number | Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return isEqual(dateToCompare, today) || isBefore(dateToCompare, today);
  }

  static isBeforeToday(dateToCompare: string | number | Date): boolean {
    const today = new Date();
    return isEqual(dateToCompare, today) || isBefore(dateToCompare, today);
  }

  static getDiffFromToday(dateToCompare: string | number | Date | undefined, defaultResult?: number): number {
    if (dateToCompare) {
      const today = new Date();
      return differenceInDays(dateToCompare!, today);
    }
    return defaultResult || 0;
  }

  static sortByDateDesc(a: string | number | Date | undefined, b: string | number | Date | undefined): number {
    if (a && b) {
      return compareDesc(a, b);
    }
    return 0;
  }

  static lastYear() {
    return getYear(new Date()) - 1;
  }

  static getAge(date: string | number | Date): number {
    const age = differenceInDays(new Date(), date) / 365;
    return Math.floor(age);
  }

  static dateFromFormatDate(dateString: string): Date | undefined {
    const isValid = dateString && typeof dateString == 'string' && dateString.length == 10 && dateString.includes('.');
    if (isValid) {
      const [day, month, year] = dateString.split('.').map(Number);
      const date = new Date(year, month - 1, day);
      const isValidDate = !isNaN(date.getTime());
      if (isValidDate) {
        return date;
      }
    }
    return undefined;
  }

  static fromStringToRange(date?: string): [Date, Date] | undefined {
    const isValid = date && typeof date == 'string' && date.includes(' - ');
    if (isValid) {
      try {
        const [from, to] = date.split(' - ');
        const fromDate = DateUtils.dateFromFormatDate(from);
        const toDate = DateUtils.dateFromFormatDate(to);
        if (fromDate && toDate) {
          return [fromDate, toDate];
        }
      } catch (error) {
        return undefined;
      }
    }
    return undefined;
  }

  static fromRangeToString(value: [Date, Date] | undefined | null): string | null {
    const isValid = value && value.length == 2 && typeof value[0] === 'object' && typeof value[1] === 'object';
    if (isValid) {
      return `${DateUtils.formatDate(value[0]!)} - ${DateUtils.formatDate(value[1]!)}`;
    }
    return null;
  }

  static getTimeThatPassInMinutes = (date: string | number | Date): number => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    return Math.floor(diff / 60000);
  };

  static getTodayPlus(days: number, hours: number, minutes: number, seconds: number) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    date.setHours(date.getHours() + hours);
    date.setMinutes(date.getMinutes() + minutes);
    date.setSeconds(date.getSeconds() + seconds);
    return date;
  }
}
