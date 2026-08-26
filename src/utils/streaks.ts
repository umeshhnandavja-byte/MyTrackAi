import { parseISO, differenceInDays, startOfDay, subDays, format } from 'date-fns';
import type { Task } from '../store';

export function getDatesWithActivity(tasks: Task[]): string[] {
  // Get all unique dates where a streak task was completed
  const dates = new Set<string>();
  tasks.forEach(t => {
    if (t.completed && t.type === 'streak') {
      dates.add(t.date);
    }
  });
  return Array.from(dates).sort();
}

export function calculateStreaks(datesStr: string[]) {
  if (datesStr.length === 0) return { current: 0, longest: 0 };

  const dates = datesStr.map(d => startOfDay(parseISO(d)));
  const today = startOfDay(new Date());
  
  let currentStreak = 0;
  let longestStreak = 0;
  
  let tempStreak = 1;

  for (let i = 0; i < dates.length; i++) {
    if (i > 0) {
      const diff = differenceInDays(dates[i], dates[i - 1]);
      if (diff === 1) {
        tempStreak++;
      } else if (diff > 1) {
        tempStreak = 1;
      }
    }
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
  }

  // Calculate current streak
  // If the last activity was today or yesterday, we count backwards
  const lastActivityDate = dates[dates.length - 1];
  const daysSinceLastActivity = differenceInDays(today, lastActivityDate);

  if (daysSinceLastActivity === 0 || daysSinceLastActivity === 1) {
    let currentTemp = 1;
    for (let i = dates.length - 1; i > 0; i--) {
      if (differenceInDays(dates[i], dates[i - 1]) === 1) {
        currentTemp++;
      } else {
        break;
      }
    }
    currentStreak = currentTemp;
  } else {
    currentStreak = 0;
  }

  return { current: currentStreak, longest: longestStreak };
}

export function generateCalendarData(tasks: Task[]) {
  const dateCounts = new Map<string, number>();
  tasks.forEach(t => {
    if (t.completed && t.type === 'streak') {
      dateCounts.set(t.date, (dateCounts.get(t.date) || 0) + 1);
    }
  });

  const today = startOfDay(new Date());
  const calendarData = [];
  
  for (let i = 365; i >= 0; i--) {
    const d = subDays(today, i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const count = dateCounts.get(dateStr) || 0;
    
    let level = 0;
    if (count === 1) level = 1;
    else if (count === 2) level = 2;
    else if (count === 3) level = 3;
    else if (count >= 4) level = 4;

    calendarData.push({
      date: dateStr,
      count,
      level,
    });
  }
  
  return calendarData;
}
