'use strict';

export const hexStringToByteArray = (hexStr) => {
  var result = [];
  
  if (Math.floor(hexStr.length % 2) === 0) {
    for (var i = 0; i < hexStr.length; i += 2) {
      var hex = hexStr.substr(i, 2);
      var number = parseInt(hex, 16);

      result.push(number);
    }
  }
  
  return result;
};

export const byteToInt = (arr, bool) => {
  var value = 0;

  for (var i = 0; i < arr.length; i++){
    value = (value << 8) + arr[i];
  }

  if (bool) {
    if ((value & 0x800000) > 0) {
      value -= 0x1000000;
    }
  }

  return value;
};

export const byteToAccl = (arr) => {
  var result = [0, 0, 0];

  result[0] = ((arr[0] & 0x3F) << 9) + (arr[1] << 1) + ((arr[2] & 0x80) >> 7);

  result[1] = ((arr[2] & 0x7F) << 8) + ((arr[3] & 0x7F) << 1) + ((arr[4] & 0x80) >> 7);

  result[2] = ((arr[4] & 0x7F) << 8) + arr[5];

  for (var i = 0; i < 3; i++) {
    result[i] <<= 1;

    if ((result[i] & 0x8000) > 0) {
      result[i] -= 0x10000;
    }
  }

  return result;
};
