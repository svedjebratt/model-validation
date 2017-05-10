/**
 * Convert a list of validations to an object representation
 * @param validations the list
 * @returns object the error object
 */
export default function asObject(validations) {
    const errors = {$valid: true, $messages: {}};

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
