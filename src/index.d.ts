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

declare class ValidationResult extends Array<Validation> {
    asObject(): any
}

declare function validate(obj: any, rules: (check: Checker) => void): ValidationResult;

export function asObject(): void;

export default validate;

export function addValidator(name: string, validator: (this: CheckSelf, ...arg: any[]) => boolean): void