# skymma
Simple client side form validation in javascript.

## Error object like in angular
Displaying errors when validating forms, is conveniently handled in angular by specifying everything in the view. Skymma will create an error object similar to what you have in angular, but will make it possible to use with other single page app view libraries like ractive, vue, rivets etc.

## Validate a form object
First we specify a rules method on your form object

```javascript
var user = {
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
var validate = require('skymma');

var errors = validate(user);
```

the `errors` object is then included in the view to manage errors shown in the client.

## Properties on the error object.
The `errors` object contains `$valid` and `$invalid` properties that says if the object has any errors or not.

For every field validated, a property with that name is added to `errors`, with an object where properties corresponds to the validators and with a value of `true` if the validation failed and `false` otherwise.

```javascript
expect(errors.$valid).toBe(false);
expect(errors.$invalid).toBe(true);
expect(errors.username.required).toBe(true);
expect(errors.email.email).toBe(false);
```

Changing the user input and validating again we getErrors

```javascript
user.username = 'Muppen';
user.email = 'muppen@svimma.se';

var errors = validate(user);

expect(errors.$valid).toBe(true);
expect(errors.$invalid).toBe(false);
expect(errors.username.required).toBe(false);
expect(errors.email.email).toBe(false);
```

## Included validators
By default the different validators available address

### required
Check that a field is set to any value.

### email
Check that the field is an email.

### minLength
Set a minimum length of a field.

### maxLength
Set a maximum lenght of a field.

## Custom validators
A new validator is easily added with

```javascript
var user = {
  username: '',
  rules: function(check) {
    check('username').mustBeBulle('a bulle');
  }
}

validate.addValidator('mustBeBulle', function(bulle) {
  return this.value == bulle;
});

var errors = validate(user);
expect(errors.username.mustBeBulle).toBe(true);

user.username = 'a bulle';
var errors = validate(user);
expect(errors.username.mustBeBulle).toBe(false);
```
