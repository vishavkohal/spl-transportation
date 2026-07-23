export const AFTER_HOURS_SURCHARGE = 30;
export const AFTER_HOURS_START = '21:00';
export const AFTER_HOURS_END = '05:00';
export const AFTER_HOURS_SURCHARGE_NOTICE =
  `After-hours surcharge of $${AFTER_HOURS_SURCHARGE} applies for pickups between 9:00 PM and 5:00 AM`;

export function isAfterHours(pickupTime: string | undefined): boolean {
  if (!pickupTime || typeof pickupTime !== 'string') return false;

  const time = pickupTime.trim();
  if (!/^\d{2}:\d{2}$/.test(time)) return false;

  const [hours, minutes] = time.split(':').map(Number);
  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return false;
  }

  return time >= AFTER_HOURS_START || time <= AFTER_HOURS_END;
}
