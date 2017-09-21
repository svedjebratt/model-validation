export interface Validation {
    field: string,
    name: string,
    valid: boolean,
    message?: string
}

export interface Checker {
    (field: string): Validator
    setValid(name: string, valid: boolean, message?: string): void
}

interface CheckSelf {
    value: any,
    model: any
}

export interface Validator extends CheckSelf {
    [key: string]: (...arg: any[]) => void
}

declare function validate(obj: any, rules: (check: Checker) => void): Array<Validation>;

export function asObject(): void;

export default validate;

export interface Array<Validation> {
    asObject(): any
}

export function addValidator(name: string, validator: (this: CheckSelf, ...arg: any[]) => boolean): void