/**
 * invertObj - should swap object keys and values
 * @param {object} obj - the initial object
 * @returns {object | undefined} - returns new object or undefined if nothing did't pass
 */
export function invertObj(obj) {
  if (obj) {
    let arr = Object.entries(obj);
    arr.forEach((item) => {
      item.reverse();
    });
    obj = Object.fromEntries(arr);
  }
  return obj;
}

