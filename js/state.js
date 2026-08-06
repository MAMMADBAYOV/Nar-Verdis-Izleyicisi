/* ============ Global State ============ */

// Habits
const state = {
  date: todayKey(),
  log: emptyLog()
};

// Profile
let profile = null;
let selectedGender = null;
let selectedGoal = null;

// Workout
let workoutState = {};

// Food
let foodState = {};

// UI
window._currentStreak = 0;
window._sessionCount = 0;