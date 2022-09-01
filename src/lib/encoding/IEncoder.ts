export default interface IEncoder {

    encodeNumber(numberValue: number, precision: number): string;

    encodeString(stringValue: String): string;

    decode(callbackData: string): any;

    setSources(sources:Map<number,number>):void;
}