/**
 * Calculate the probability of at least one collision in random ID assignment
 * @param users - Number of users (visitors)
 * @param ids - Number of possible IDs
 * @returns Probability of at least one collision (from 0 to 1)
 */
export function calculateCollisionProbability(
  users: number,
  ids: number,
): number {
  // Use exact calculation for smaller values
  if (users <= 100 && users <= ids) {
    let probabilityOfNoCollision = 1.0;

    for (let i = 0; i < users; i++) {
      probabilityOfNoCollision *= (ids - i) / ids;
    }

    return 1 - probabilityOfNoCollision;
  } // Use approximation for larger values to avoid numerical issues
  else {
    return 1 - Math.exp(-users * (users - 1) / (2 * ids));
  }
}
