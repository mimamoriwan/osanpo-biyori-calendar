import { formatJST, getJSTHour, diffMinutes } from '../time';

describe('time.ts', () => {
  test('formatJST は日時を正しくフォーマットする', () => {
    const date = new Date('2025-01-15T10:30:00Z');
    const formatted = formatJST(date, 'yyyy-MM-dd HH:mm');

    // JSTはUTC+9なので19:30になる
    expect(formatted).toMatch(/2025-01-15 \d{2}:\d{2}/);
  });

  test('getJSTHour はJSTの時間を返す', () => {
    const date = new Date('2025-01-15T15:00:00Z'); // UTC 15:00 = JST 00:00 (翌日)
    const hour = getJSTHour(date);

    expect(hour).toBeGreaterThanOrEqual(0);
    expect(hour).toBeLessThan(24);
  });

  test('diffMinutes は時間差を分単位で返す', () => {
    const date1 = new Date('2025-01-15T10:00:00Z');
    const date2 = new Date('2025-01-15T11:30:00Z');

    const diff = diffMinutes(date1, date2);
    expect(diff).toBe(90); // 1時間30分 = 90分
  });

  test('diffMinutes は負の値も扱える', () => {
    const date1 = new Date('2025-01-15T11:30:00Z');
    const date2 = new Date('2025-01-15T10:00:00Z');

    const diff = diffMinutes(date1, date2);
    expect(diff).toBe(-90);
  });
});
