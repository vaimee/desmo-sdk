import IEncoder from './IEncoder';
import Types from './Types';

const REQUEST_ID_SIZE = '20';
const REQUEST_ID_LENGTH = 64;
//new Uint32Array(8)

const hexEncode = function (str: string): string {
  var hex, i;

  var result = '';
  for (i = 0; i < str.length; i++) {
    hex = str.charCodeAt(i).toString(16);
    result += ('000' + hex).slice(-4);
  }

  return result;
};

const hexDecode = function (str: string): string {
  var j;
  var hexes = str.match(/.{1,4}/g) || [];
  var back = '';
  for (j = 0; j < hexes.length; j++) {
    back += String.fromCharCode(parseInt(hexes[j], 16));
  }

  return back;
};

export default class EncoderLightManual implements IEncoder {
  sources: Array<{ sourceIndex: number; reward: number }>;
  encodedScores: string;
  requestID?: string;

  constructor() {
    this.sources = new Array<{ sourceIndex: number; reward: number }>();
    this.encodedScores = '';
  }

  computePadding(ecoded: string): string {
    const needpadding = ecoded.length % 2;
    if (needpadding === 1) {
      return '1' + ecoded;
    } else {
      return '00' + ecoded;
    }
  }

  setRequestId(requestId: string): void {
    this.requestID = REQUEST_ID_SIZE + requestId;
  }

  setSources(sources: Map<number, number>): void {
    /*
            Max 16 TDDs,
            sources score are represented without encoding or compression
            1 hex char for TDDs count, [0-F], 
            followed by the score list [0-3]
        */
    for (let key of sources.keys()) {
      var score = sources.get(key);
      if (score === null || score === undefined) {
        score = 0;
      }
      this.sources.push({ sourceIndex: key, reward: score });
    }
    if (this.sources.length > 16) {
      this.sources = this.sources.splice(0, 16);
    }
    this.encodedScores = '0' + this.sources.length.toString(16);
    this.sources
      .sort((a, b) => {
        return a.sourceIndex - b.sourceIndex;
      })
      .map((a) => {
        this.encodedScores += '0' + a.reward;
      });
  }

  encodeNumber(numberValue: number, precision = 0): string {
    if (this.requestID === undefined) {
      throw new Error(
        'Wallet unavailable. Please sign in before trying again.',
      );
    }
    var type = Types.POS_FLOAT;
    var numberHex = '';
    if (precision === 0) {
      var sanitizzeNumberValue = numberValue;
      if (sanitizzeNumberValue < 0) {
        sanitizzeNumberValue = sanitizzeNumberValue * -1;
        type = Types.NEG_INTEGER;
      } else {
        type = Types.POS_INTEGER;
      }
      numberHex = sanitizzeNumberValue.toString(16);
    } else {
      var sanitizzeNumberValue = numberValue;
      if (sanitizzeNumberValue < 0) {
        sanitizzeNumberValue = sanitizzeNumberValue * -1;
        type = Types.NEG_FLOAT;
      } else {
        type = Types.POS_FLOAT;
      }
      const precisionHex = precision.toString(16);
      const sizePrecisionHex = precisionHex.length.toString(16);
      if (sizePrecisionHex.length > 1) {
        throw new Error('The precision is to big for: ' + precision + '!');
      }
      // console.log("sanitizzeNumberValue.toString(16)",sanitizzeNumberValue.toString(16));
      numberHex =
        sizePrecisionHex + precisionHex + sanitizzeNumberValue.toString(16);
    }
    var typeHex = type.toString(16);
    //console.log("this.computePadding(typeHex+numberHex)",this.computePadding(typeHex+numberHex));
    return (
      this.requestID +
      this.encodedScores +
      this.computePadding(typeHex + numberHex)
    );
  }

  encodeString(stringValue: string): string {
    if (this.requestID === undefined) {
      throw new Error(
        'Wallet unavailable. Please sign in before trying again.',
      );
    }
    var type = Types.STRING;
    var typeHex = type.toString(16);
    // console.log("dataEncoded: ", hexEncode(stringValue)); //ok
    console.log(
      'typeHex+hexEncode(stringValue)',
      typeHex + hexEncode(stringValue),
    );
    console.log(
      'this.computePadding(typeHex+hexEncode(stringValue)',
      this.computePadding(typeHex + hexEncode(stringValue)),
    );
    return (
      this.requestID +
      this.encodedScores +
      this.computePadding(typeHex + hexEncode(stringValue))
    );
  }

  decode(callbackData: string): any {
    // Split callbackData and take the the result, the last part.
    var dataDecoded = callbackData.split(',');
    var result = dataDecoded[dataDecoded.length - 1];
    // if start with 0, remove it.
    if (result.startsWith('0x')) {
      result = result.substring(2);
    }
    //padding
    var padding = 0;
    if (result[padding] === '1') {
      padding += 1;
    } else {
      padding += 2;
    }

    const type = parseInt(result[padding], 16);
    const dataEncoded = result.substring(padding + 1);
    var value: any;
    if (type === Types.NEG_FLOAT || type === Types.POS_FLOAT) {
      const sizePrecision = parseInt(dataEncoded[0], 16);
      const precision = parseInt(
        dataEncoded.substring(1, 1 + sizePrecision),
        16,
      );
      const valueInt = parseInt(
        dataEncoded.substring(1 + sizePrecision, dataEncoded.length),
        16,
      );
      value = valueInt / 10 ** precision;
      if (type === Types.NEG_FLOAT) {
        value = value * -1;
      }
    } else if (type === Types.NEG_INTEGER || type === Types.POS_INTEGER) {
      value = parseInt(dataEncoded, 16);
      if (type === Types.NEG_INTEGER) {
        value = value * -1;
      }
      console.log('INTEGER decoded: ' + value);
    } else if (type === Types.STRING) {
      value = hexDecode(dataEncoded);
    } else {
      throw new Error('Not implemented Type found for: ' + type);
    }

    return value;
  }
}
