export type KeyTypes = string;
export type ValueTypes = string | number | boolean | object;
type miliseconds = number;
export interface KeystorageObject {
    key: KeyTypes;
    value: ValueTypes;
    created_at: Date;
    expires_at: Date;
    time_to_live: miliseconds;
}
interface KeystorageInterface {
    SET(key: KeyTypes, value: ValueTypes, expires_in: miliseconds): KeystorageObject | null;
    GET(key: KeyTypes): KeystorageObject | null;
    DEL(key: KeyTypes): boolean;
    EXISTS(key: KeyTypes): boolean;
    TTL(key: KeyTypes): miliseconds | null;
    GET_ALL(): KeystorageObject[] | null;
}
declare class Keystorage implements KeystorageInterface {
    private map;
    constructor();
    SET(key: KeyTypes, value: ValueTypes, expires_in: miliseconds): KeystorageObject | null;
    GET(key: KeyTypes): KeystorageObject | null;
    DEL(key: KeyTypes): boolean;
    EXISTS(key: KeyTypes): boolean;
    TTL(key: KeyTypes): miliseconds;
    GET_ALL(): KeystorageObject[] | null;
}
declare const k_storage: Keystorage;
export { k_storage };
//# sourceMappingURL=keystorage.d.ts.map