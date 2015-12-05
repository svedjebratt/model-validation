function getValidations(obj, rules) {
    var rulesFn;
    if (typeof rules === 'function') {
        rulesFn = rules;
    } else if (typeof obj.rules === 'function') {
        rulesFn = obj.rules;
    } else {
        throw 'No rules defined for model';
    }

    var check = new Check(obj);

    rulesFn.call(obj, check.checkImpl);

    return check.getValidations();
}

function validate(obj, rules) {
    return createErrorsFromValidations(getValidations(obj, rules));
}

validate.asList = function(obj, rules) {
    return createErrorsAsListFromValidations(getValidations(obj, rules));
};

function Validators(model, field) {
    this.model = model;
    this.value = model[field];
    this._field = field;
    var _validity = [];

    this.getValidity = function() {
        return _validity;
    };

    this._setValidity = function(validation) {
        var existing = _validity.filter(function(v) {
            return v.name == validation.name;
        })[0];

        if (!existing) {
            _validity.push(validation);
        } else {
            existing.valid = validation.valid;
        }
    };

    this.setValid = function(name, valid, message) {
        this._setValidity({
            field: field,
            name: name,
            valid: valid,
            message: !valid ? message : null
        });
    };
}

validate.addValidator = function(name, validator) {

    Validators.prototype[name] = function() {
        this._setValidity({
            field: this._field,
            name: name,
            valid: validator.apply(this, arguments),
            message: null
        });
    }

};

function Check(form) {
    var validators = [];

    var checkImpl = function(field) {

        var validator = validators.filter(function(v) {
            return v.field == field;
        })[0];

        if (!validator) {
            validator = new Validators(form, field);
            validators.push(validator);
        }

        return validator;

    };

    function getValidations() {
        var validations = [];

        validators.forEach(function(validator) {
            validator.getValidity().forEach(function(validity) {
                validations.push(validity);
            });
        });

        return validations;
    }

    return {
        getValidations: getValidations,
        checkImpl: checkImpl
    };

}

function createErrorsFromValidations(validations) {
    var errors = {$valid: true, $messages: {}};

    validations.forEach(function(validation) {

        if (!errors[validation.field]) {
            errors[validation.field] = {$valid: true};
        }

        errors[validation.field][validation.name] = !validation.valid;
        errors[validation.field].$valid = errors[validation.field].$valid && !!validation.valid;

        if (!errors.$messages[validation.field]) {
            errors.$messages[validation.field] = {};
        }
        errors.$messages[validation.field][validation.name] = validation.message;

        errors.$valid = errors.$valid && !!validation.valid;

        errors[validation.field].$invalid = !errors[validation.field].$valid;

    });
    errors.$invalid = !errors.$valid;

    return errors;
}

function createErrorsAsListFromValidations(validations) {
    var errors = {};

    validations.forEach(function(validation) {

        if (!errors[validation.field]) {
            errors[validation.field] = [];
        }

        errors[validation.field].push({
            name: validation.name,
            valid: validation.valid,
            message: validation.message
        });
    });

    return errors;
}

// default validators

validate.addValidator('required', function() {
    return !!this.value;
});

validate.addValidator('email', function() {
    return !this.value || /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(this.value);
});

validate.addValidator('maxLength', function(max) {
    return !this.value || this.value.length <= max;
});

validate.addValidator('minLength', function(min) {
    return !this.value || this.value.length >= min;
});

validate.addValidator('max', function(max) {
    return !this.value || (!isNaN(this.value) && Number(this.value) <= max);
});

validate.addValidator('min', function(min) {
    return !this.value || (!isNaN(this.value) && Number(this.value) >= min);
});

module.exports = validate;
