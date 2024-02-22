
export class Validator {

  static minLength(value, length) {
    return value.length < length ? 1 : 0;
  }

  static maxLength(value, length) {
    return value.length > length ? 1 : 0;
  }

  static validChar(value) {
    return /^[0-9a-zA-Z_]+$/.test(value) ? 0 : 1;
  }

  static isNonEmpty(value) {
    return value === '' ? 1 : 0;
  }
};
