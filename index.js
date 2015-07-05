function validate(obj) {
    if (typeof obj.rules === 'function') {
        var check = new Check(obj);

        obj.rules(check.checkImpl);

        return check.getErrors();
    }

    throw 'No rules defined for model';
}

function Validators(model, value) {
    this.model = model;
    this.value = value;
    this._validity = [];

    this.getValidity = function() {
      return this._validity;
    }

    this._setValidity = function(validation) {
        var existing = this._validity.filter(function(v) { return v.name == validation.name; })[0];

        if (!existing) {
            this._validity.push(validation);
        } else {
            existing.valid = validation.valid;
        }
    };

    this.reject = function(name) {
        this._setValidity({
            name: name,
            valid: false
        });
    };
}

validate.addValidator = function(name, validator) {

    Validators.prototype[name] = function() {
        this._setValidity({
            name: name,
            valid: validator.apply(this, arguments)
        });
    }

};

function Check(form) {
    var validators = [];

    var checkImpl = function(field) {

        var validator = validators.filter(function(v) { return v.field == field; })[0];

        if (!validator) {
            validator = {
              field: field,
              validator: new Validators(form, form[field])
            };
            validators.push(validator);
        }

        return validator.validator;

    };

    var getErrors = function() {

        var errors = {$valid: true};

        validators.forEach(function(v) {
            var validity = v.validator.getValidity();

            if (!errors[v.field]) {
                errors[v.field] = {};
            }

            validity.forEach(function(vy) {
                errors[v.field][vy.name] = !vy.valid;
                errors.$valid = errors.$valid && !!vy.valid;
            });

        });
        errors.$invalid = !errors.$valid;

        return errors;

    };


    return {
        getErrors: getErrors,
        checkImpl: checkImpl
    };

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

module.exports = validate;
