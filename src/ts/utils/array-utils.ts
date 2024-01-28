/**
 * Shuffles an array of generics using the Fisher-Yates algorithm.
 * 
 * @param array the array to shuffle. 
 * @returns a copy of the array containing the same elements in a different order.
 */
export function shuffle<T>(array: T[]): T[] {
    let m = array.length;
    while (m) {
      const i = Math.floor(Math.random() * m--);
      [array[m], array[i]] = [array[i], array[m]];
    }
    return [...array];
}