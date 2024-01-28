import { TroikaError } from "../errors/TroikaError";

/**
 * Returns the value provided by the getter function or throws a {TroikaError} if that value is null or undefined.
 * 
 * @param getter a function that provides a generic value, that could be null or undefined.
 * @param msg the message to show if the value is null or undefined.
 * @returns the value, if it is not null or undefined.
 * @throws {TroikaError} if the value returned by the getter is null or undefined.
 */
export function valueOrError<T>(getter: () => (T | undefined | null), msg: string): T {
    const value = getter();
    if(!value) {
        throw new TroikaError(msg);
    }
    return value!
}