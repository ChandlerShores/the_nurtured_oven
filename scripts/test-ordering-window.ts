import { isWeeklyOrderingWindowOpen } from "../lib/menu/schedule"

function label(open: boolean) {
  return open ? "OPEN" : "CLOSED"
}

console.log("--- Real calendar dates (America/New_York) ---")
console.log("Thursday:", label(isWeeklyOrderingWindowOpen(new Date("2026-05-28T17:00:00.000Z"))))
console.log("Friday ~10am ET:", label(isWeeklyOrderingWindowOpen(new Date("2026-05-29T14:00:00.000Z"))))
console.log("Wed noon ET:", label(isWeeklyOrderingWindowOpen(new Date("2026-05-27T16:00:00.000Z"))))
console.log("Wed 12:10pm ET:", label(isWeeklyOrderingWindowOpen(new Date("2026-05-27T16:10:00.000Z"))))

const env = process.env as Record<string, string | undefined>
env.NODE_ENV = "development"
env.ORDERING_TEST_WEEKDAY = "4"
console.log("\n--- Dev override ORDERING_TEST_WEEKDAY=4 (Thursday) ---")
console.log("Simulated Thursday:", label(isWeeklyOrderingWindowOpen()))
