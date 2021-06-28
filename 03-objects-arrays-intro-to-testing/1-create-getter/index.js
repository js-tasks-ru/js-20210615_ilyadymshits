/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  let arrPath = path.split('.');
  return (obj) => {
    arrPath.forEach((item) => {
      if (!obj) return;
      obj = obj[item];
    });
    return obj;
  };
}
