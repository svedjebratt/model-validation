import asObject from './asObject';
import Validators from './Validators';
import Check from './Check';

function getValidations(obj, rules) {
    let rulesFn;
    if (typeof rules === 'function') {
        rulesFn = rules;
    } else if (typeof obj.rules === 'function') {
        rulesFn = obj.rules;
    } else {
        throw 'No rules defined for model';
    }

    const check = new Check(obj);

    rulesFn.call(obj, check.checkImpl);

    return check.getValidations();
}

export default function validate(obj, rules) {
    const validations = getValidations(obj, rules);
    validations.asObject = function() {
        return asObject(validations);
    };

    return validations;
}

export function addValidator(name, validator) {

    Validators.prototype[name] = function() {
        this._setValidity({
            field: this._field,
            name: name,
            valid: validator.apply(this, arguments),
            message: null
        });
    }

}

// default validators

addValidator('required', function() {
    return !!this.value;
});

addValidator('email', function() {
    return !this.value || /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(this.value);
});

addValidator('maxLength', function(max) {
    return !this.value || this.value.length <= max;
});

addValidator('minLength', function(min) {
    return !this.value || this.value.length >= min;
});

addValidator('max', function(max) {
    return !this.value || (!isNaN(this.value) && Number(this.value) <= max);
});

addValidator('min', function(min) {
    return !this.value || (!isNaN(this.value) && Number(this.value) >= min);
});
