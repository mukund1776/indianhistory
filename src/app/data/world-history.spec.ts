import { worldHistoryEvents } from './world-history';

describe('World History Data', () => {
  it('should have a collection of major global events', () => {
    expect(worldHistoryEvents.length).toBeGreaterThanOrEqual(10);
  });

  it('should ensure each event has date, title, and summary', () => {
    for (const event of worldHistoryEvents) {
      expect(typeof event.date).toBe('string');
      expect(event.date.trim().length).toBeGreaterThan(0);

      expect(typeof event.title).toBe('string');
      expect(event.title.trim().length).toBeGreaterThan(0);

      expect(typeof event.summary).toBe('string');
      expect(event.summary.trim().length).toBeGreaterThan(0);
    }
  });

  it('should start from ancient times and progress toward modern eras', () => {
    expect(worldHistoryEvents[0].title).toBe('The beginnings of agriculture');
    const lastEvent = worldHistoryEvents[worldHistoryEvents.length - 1];
    expect(lastEvent.date).toContain('20th century');
  });
});
