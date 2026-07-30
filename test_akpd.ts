import { calculateAKPD } from './src/services/engine/ruleEngine.js';

// Simulated response from DB where JSON keys are strings (which they are)
const dbResponse = {
  "1": 1,
  "2": 1,
  "3": 0,
  "4": 1,
  "11": 1,
  "21": 1,
  "31": 1
};

const result = calculateAKPD(dbResponse as any);
console.log(result);
