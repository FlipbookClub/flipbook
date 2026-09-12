import { cronJobs } from "convex/server";

import { internal } from "./_generated/api";

const crons = cronJobs();

// P5-T2. Hourly, because "19:00" means a different UTC moment for every
// timezone: the job wakes each hour and the audience query keeps only the
// users for whom it is currently their chosen local hour.
//
// The action is inert unless READING_REMINDERS_ENABLED is "true" on the
// deployment, so merging this does not start pushing to anyone. Turn it on
// deliberately with:
//   npx convex env set READING_REMINDERS_ENABLED true --prod
crons.hourly(
  "reading reminders",
  { minuteUTC: 0 },
  internal.notifications.sendReadingReminders,
  {},
);

export default crons;
