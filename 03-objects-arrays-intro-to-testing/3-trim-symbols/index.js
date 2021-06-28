/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (size === 0 || string === '') {
    return '';
  }
  let target = string[0];
  let counter = 0;
  let charPos = 0;
  while (true) {
    if (string[charPos].includes(target, 0)) {
      counter++;
      if (counter > size) {
        string = string.slice(0, charPos) + string.slice(charPos + 1);
        charPos--;
      }
    } else {
      counter = 1;
      target = string[charPos];
    }
    charPos++;
    if (charPos === string.length) break;
  }
  return string;
}
