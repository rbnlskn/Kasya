
import { getActiveCommitmentInstance } from './src/utils/commitment.ts';
import { INITIAL_COMMITMENTS, INITIAL_TRANSACTIONS } from './src/constants.ts';

console.log('Running debug script for getActiveCommitmentInstance...');

const commitment = INITIAL_COMMITMENTS[0];
const transactions = INITIAL_TRANSACTIONS;

if (commitment) {
  console.log('Testing with commitment:', commitment.name);
  const instance = getActiveCommitmentInstance(commitment, transactions);
  console.log('Result:', instance);
} else {
  console.log('No commitment found to test.');
}
