import { calculateRecommendations, DEFAULT_THRESHOLDS } from '../recommend';
import { HourlyWeatherData } from '../openMeteo';

describe('recommend.ts', () => {
  const createMockHourlyData = (length: number = 12): HourlyWeatherData => {
    const now = new Date();
    const times = Array.from({ length }, (_, i) => {
      const time = new Date(now.getTime() + i * 60 * 60 * 1000);
      return time.toISOString();
    });

    return {
      time: times,
      temperature_2m: Array(length).fill(20),
      relative_humidity_2m: Array(length).fill(50),
      precipitation: Array(length).fill(0),
      precipitation_probability: Array(length).fill(0),
      uv_index: Array(length).fill(3),
      apparent_temperature: Array(length).fill(20),
      wind_speed_10m: Array(length).fill(3),
      weather_code: Array(length).fill(0),
    };
  };

  test('理想的な天気条件でおすすめ時間帯を返す', () => {
    const mockData = createMockHourlyData();
    const result = calculateRecommendations(mockData);

    expect(result.periods.length).toBeGreaterThan(0);
    expect(result.nextGoodTime).not.toBeNull();
    expect(result.allSlots.length).toBeGreaterThan(0);
  });

  test('降水確率が高い場合はスコアが低くなる', () => {
    const mockData = createMockHourlyData();
    mockData.precipitation_probability = Array(12).fill(80); // 高い降水確率

    const result = calculateRecommendations(mockData);

    // スコアがしきい値以下になるはず
    const avgScore =
      result.allSlots.reduce((sum, slot) => sum + slot.score, 0) / result.allSlots.length;
    expect(avgScore).toBeLessThan(7);
  });

  test('気温が範囲外の場合はスコアが低くなる', () => {
    const mockData = createMockHourlyData();
    mockData.apparent_temperature = Array(12).fill(35); // 暑すぎる

    const result = calculateRecommendations(mockData);

    const avgScore =
      result.allSlots.reduce((sum, slot) => sum + slot.score, 0) / result.allSlots.length;
    expect(avgScore).toBeLessThan(7);
  });

  test('UV指数が高い場合は警告が含まれる', () => {
    const mockData = createMockHourlyData();
    mockData.uv_index = Array(12).fill(8); // UV指数が高い

    const result = calculateRecommendations(mockData);

    const hasUvWarning = result.allSlots.some((slot) =>
      slot.warnings.includes('日差し強め')
    );
    expect(hasUvWarning).toBe(true);
  });

  test('風速が強い場合は警告が含まれる', () => {
    const mockData = createMockHourlyData();
    mockData.wind_speed_10m = Array(12).fill(10); // 風が強い

    const result = calculateRecommendations(mockData);

    const hasWindWarning = result.allSlots.some((slot) =>
      slot.warnings.includes('風強め')
    );
    expect(hasWindWarning).toBe(true);
  });

  test('カスタムしきい値を使用できる', () => {
    const mockData = createMockHourlyData();
    mockData.uv_index = Array(12).fill(5);

    const customThresholds = {
      ...DEFAULT_THRESHOLDS,
      uvMax: 4, // より厳しいUV制限
    };

    const result = calculateRecommendations(mockData, customThresholds);

    const hasUvWarning = result.allSlots.some((slot) =>
      slot.warnings.includes('日差し強め')
    );
    expect(hasUvWarning).toBe(true);
  });
});
