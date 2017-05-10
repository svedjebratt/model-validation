# skymma
Simple client side object validation in javascript.

## Install
Install skymma by running `npm install --save skymma`.

## List of validation errors
By default skymma will create a list of validation errors. The list contains objects with the fields:

* `field [ String ]` = name of the field being validated
* `name [ String ]` = name of the validator
* `valid [ Boolean ]` = `true` if valid, `false` otherwise
* `message [ String ]` = an optionally specified message when manually setting the validity of a validator 

## Error object like in angular
Displaying errors when validating forms is conveniently handled in angular by specifying all error messages directly in the view. Skymma can create an error object similar to what you have in angular, but will make it possible to use with other single page app view libraries like react, ractive, vue, rivets etc. Just include the error object in the view and show different messages depending on which validation that failed.

To convert the validation list to an error object, just call the method `asObject` on the list.

## Validate a form object
First we specify a rules method on the form object

```javascript
const user = {
  username: '',
  email: '',
  rules: function(check) {
    check('username').required();
    check('email').email();
  }
};
```

Then import skymma and validate the object

```javascript
import validate from 'skymma';
 
// as a list of errors
const errors = validate(user);
 
// or as an object
const errorsObj = errors.asObject();
```

the `errorsObj` object is then included in the view to manage errors shown in the client.

## Separate rules function

At times it might be appropriate to specify the rules function outside of the model object. In those cases it is possible to supply the function at validation

```javascript
const rules = function(check) {
  check('username').required();
  check('email').email();
};
 
const user = {
  username: '',
  email: ''
};
 
const errors = validate(user, rules).asObject();
```

## Properties on the error object.
The `errors` object contains `$valid` and `$invalid` properties that says if the object has any errors or not.

For every field validated, a property with that name is added to `errors`, with an object where properties corresponds to the validators and with a value of `true` if the validation failed and `false` otherwise. The object also contains the properties `$valid` and `$invalid`, which is specific for that field.

```javascript
expect(errors.$valid).toBe(false);
expect(errors.$invalid).toBe(true);
expect(errors.username.required).toBe(true);
expect(errors.username.$valid).toBe(false);
expect(errors.email.email).toBe(false);
expect(errors.email.$valid).toBe(true);
```

Changing the user input and validating again we get

```javascript
user.username = 'Muppen';
user.email = 'muppen@svimma.se';
 
const errors = validate(user);
 
expect(errors.$valid).toBe(true);
expect(errors.$invalid).toBe(false);
expect(errors.username.required).toBe(false);
expect(errors.email.email).toBe(false);
```

## Included validators
By default the different validators available are

### required
Check that a field is set to any value.

### email
Check that the field is an email.

### minLength
Check for a minimum length of a field.

### maxLength
Check for a maximum length of a field.

### min
Check for a minimum value of a numeric field.

### max
Check for a maximum value of a numeric field.

## Custom validators
A new validator is easily added

```javascript
import {addValidator} from 'skymma';
 
const user = {
  username: '',
  rules: function(check) {
    check('username').mustBeBulle('a bulle');
  }
};
 
addValidator('mustBeBulle', function(bulle) {
  return this.value == bulle;
});
 
let errors = validate(user).asObject();
expect(errors.username.mustBeBulle).toBe(true);
 
user.username = 'a bulle';
errors = validate(user).asObject();
expect(errors.username.mustBeBulle).toBe(false);
```

## Manually set validity on fields
In the `rules` method, manual validation can be performed. For instance to check that a "confirm password" field has the same value as the password.

```javascript
const obj = {
    password: '',
    passwordConfirm: '',
    rules: function(check) {
        check('passwordConfirm').setValid('confirm', this.passwordConfirm == this.password);
    }
};
 
obj.password = "jubel och bullar";
let errors = validate(obj).asObject();
expect(errors.passwordConfirm.confirm).toBe(true);
 
obj.passwordConfirm = "jubel och bullar";
errors = validate(obj).asObject();
expect(errors.passwordConfirm.confirm).toBe(false);
```

The `setValid` method takes two arguments, the name of the validator and whether the field is valid or not. It can also take an optional third argument with
a custom error message, retrievable from the object `$messages`.