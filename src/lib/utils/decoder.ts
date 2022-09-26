export enum QueryResultTypes {
  POS_INTEGER = 0,
  POS_FLOAT = 1,
  NEG_INTEGER = 2,
  NEG_FLOAT = 3,
  STRING = 4,
  BOOLEAN = 5,
  FUTURE_USE_2 = 6,
  FUTURE_USE_3 = 7,
}

function decodeHexString(str: string): string {
  // We split `str` into 4-chars-long (adjacent) substrings:
  const hexValues = str.match(/.{1,4}/g) ?? [];

  /**
   * We convert each substring into the corresponding hex value;
   * those values are then interpreted as UTF-16 chars, which are
   * concatenated one after the other to build the output string:
   */
  let result = '';
  for (const val of hexValues) {
    result += String.fromCharCode(parseInt(val, 16));
  }
  return result;
}

export function decodeQueryResult(result: string): {
  value: number | string;
  type: QueryResultTypes;
} {
  // If it starts with 0x, we remove it:
  if (result.startsWith('0x')) {
    result = result.substring(2);
  }

  // Parse padding:
  const padding = result[0] === '1' ? 1 : 2;

  // Parse and validate result type:
  const type = parseInt(result[padding], 16);
  if (isNaN(type)) {
    throw new Error(
      `Result type encoding is not a valid hex string (${result[padding]}).`
    );
  }

  // Parse and validate result value:
  const dataEncoded = result.substring(padding + 1);
  const validHexRegex = /^[0-9A-Fa-f]+$/g;
  if (!validHexRegex.test(dataEncoded)) {
    throw new Error(
      `Result value encoding is not a valid hex string (${dataEncoded}).`
    );
  }

  let value: number | string;
  switch (type) {
    case QueryResultTypes.NEG_FLOAT:
    case QueryResultTypes.POS_FLOAT:
      {
        const sizePrecision = parseInt(dataEncoded[0], 16);
        const precision = parseInt(
          dataEncoded.substring(1, 1 + sizePrecision),
          16
        );
        const valueInt = parseInt(
          dataEncoded.substring(1 + sizePrecision, dataEncoded.length),
          16
        );
        const absValue = valueInt / 10 ** precision;
        value = type === QueryResultTypes.NEG_FLOAT ? -absValue : absValue;
      }
      break;
    case QueryResultTypes.NEG_INTEGER:
    case QueryResultTypes.POS_INTEGER:
      {
        const absValue = parseInt(dataEncoded, 16);
        value = type === QueryResultTypes.NEG_INTEGER ? -absValue : absValue;
      }
      break;
    case QueryResultTypes.STRING:
      {
        value = decodeHexString(dataEncoded);
      }
      break;
    default: {
      throw new Error(`Unknown query result type: ${type}.`);
    }
  }

  return { value, type };
}
