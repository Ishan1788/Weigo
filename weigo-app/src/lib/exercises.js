export const EXERCISE_LIBRARY = {
  Chest: ['Bench Press', 'Incline Bench Press', 'Decline Bench Press', 'Dumbbell Flyes', 'Push Up', 'Cable Crossover', 'Chest Dip'],
  Back: ['Deadlift', 'Pull Up', 'Chin Up', 'Bent Over Row', 'Lat Pulldown', 'Seated Cable Row', 'T-Bar Row', 'Single Arm Row'],
  Shoulders: ['Overhead Press', 'Lateral Raise', 'Front Raise', 'Face Pull', 'Arnold Press', 'Upright Row', 'Shrug'],
  Arms: ['Bicep Curl', 'Hammer Curl', 'Preacher Curl', 'Concentration Curl', 'Tricep Dip', 'Tricep Pushdown', 'Skull Crusher', 'Overhead Tricep Extension'],
  Legs: ['Squat', 'Front Squat', 'Leg Press', 'Romanian Deadlift', 'Leg Curl', 'Leg Extension', 'Calf Raise', 'Lunges', 'Bulgarian Split Squat', 'Hack Squat'],
  Core: ['Plank', 'Crunch', 'Sit Up', 'Russian Twist', 'Leg Raise', 'Ab Wheel', 'Cable Crunch', 'Hanging Knee Raise'],
  Cardio: ['Running', 'Cycling', 'Jump Rope', 'Rowing Machine', 'Stair Climber', 'Swimming', 'Elliptical'],
}

export const ALL_EXERCISES = Object.values(EXERCISE_LIBRARY).flat()
