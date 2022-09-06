import { QueryResultTypes } from './../lib/utils/decoder';
import 'mocha';
import { expect } from 'chai';
import { decodeQueryResult } from '@/utils/decoder';

describe('Decoder Tests', function () {
  it('should decode a positive integer number', () => {
    const encodedValue = '0x00025110f013';

    const { value, type } = decodeQueryResult(encodedValue);
    expect(value).to.be.a('number');
    expect(value).to.be.equal(9949999123);
    expect(type).to.be.equal(QueryResultTypes.POS_INTEGER);
  });

  it('should decode a negative integer number', () => {
    const encodedValue = '0x12d431';

    const { value, type } = decodeQueryResult(encodedValue);
    expect(value).to.be.a('number');
    expect(value).to.be.equal(-54321);
    expect(type).to.be.equal(QueryResultTypes.NEG_INTEGER);
  });

  it('should decode a positive floating-point number', () => {
    const encodedValue = '0x11153039';

    const { value, type } = decodeQueryResult(encodedValue);
    expect(value).to.be.a('number');
    expect(value).to.be.equal(0.12345);
    expect(type).to.be.equal(QueryResultTypes.POS_FLOAT);
  });

  it('should decode a negative floating-point number', () => {
    const encodedValue = '0x131556fb0c';

    const { value, type } = decodeQueryResult(encodedValue);
    expect(value).to.be.a('number');
    expect(value).to.be.equal(-57.00364);
    expect(type).to.be.equal(QueryResultTypes.NEG_FLOAT);
  });

  it('should decode a string', () => {
    const encodedValue =
      '0x14004c006f00720065006d00200069007000730075006d00200064006f006c006f0072002000730069007400200061006d00650074';

    const { value, type } = decodeQueryResult(encodedValue);
    expect(value).to.be.a('string');
    expect(value).to.be.equal('Lorem ipsum dolor sit amet');
    expect(type).to.be.equal(QueryResultTypes.STRING);
  });

  it('should fail if type is unknown', () => {
    const unknownType = 15;
    const encodedValue = `0x1${unknownType.toString(16)}00000000`;

    expect(decodeQueryResult.bind(null, encodedValue)).to.throw(
      `Unknown query result type: ${unknownType}.`,
    );
  });

  it('should fail if type encoding is not a valid hex string', () => {
    const invalidTypeEncoding = 'X';
    const encodedValue = `0x1${invalidTypeEncoding}000000`;

    expect(decodeQueryResult.bind(null, encodedValue)).to.throw(
      `Result type encoding is not a valid hex string (${invalidTypeEncoding}).`,
    );
  });

  it('should fail if value encoding is not a valid hex string', () => {
    const invalidValueEncoding = 'a5L.7/+21R';
    const encodedValue = `0x11${invalidValueEncoding}`;

    expect(decodeQueryResult.bind(null, encodedValue)).to.throw(
      `Result value encoding is not a valid hex string (${invalidValueEncoding}).`,
    );
  });
});
