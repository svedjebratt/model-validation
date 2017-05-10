import Validators from './Validators';

export default function Check(form) {
    const validators = [];

    const checkImpl = function(field) {

        let validator = validators.filter(function(v) {
            return v.field === field;
        })[0];

        if (!validator) {
            validator = new Validators(form, field);
            validators.push(validator);
        }

        return validator;

    };

    function getValidations() {
        const validations = [];

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
