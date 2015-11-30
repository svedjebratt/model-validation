# skymma
Simple client side form validation in javascript.

## Error object like in angular
Displaying errors when validating forms is conveniently handled in angular by specifying all error messages directly in the view. Skymma will create an error object similar to what you have in angular, but will make it possible to use with other single page app view libraries like ractive, vue, rivets etc. Just include the error object in the view and show different messages depending on which validation that failed.

## Validate a form object
First we specify a rules method on the form object

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

## Separate rules function

At times it might be appropriate to specify the rules function outside of the model object. In those cases it is possible to supply the function at validation

```javascript
var rules = function(check) {
  check('username').required();
  check('email').email();
};

var user = {
  username: '',
  email: ''
};

var errors = validate(user, rules);
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

var errors = validate(user);

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

## Manually set validity on fields
In the `rules` method, manual validation can be performed. For instance to check that a "confirm password" field has the same value as the password.

```javascript
var obj = {
    password: '',
    passwordConfirm: '',
    rules: function(check) {
        check('passwordConfirm').setValid('confirm', this.passwordConfirm == this.password);
    }
};

obj.password = "jubel och bullar";
var errors = validate(obj);
expect(errors.passwordConfirm.confirm).toBe(true);

obj.passwordConfirm = "jubel och bullar";
errors = validate(obj);
expect(errors.passwordConfirm.confirm).toBe(false);
```

The `setValid` method takes two arguments, the name of the validator and whether the field is valid or not. It can also take an optional third argument with
a custom error message, retrievable as `$message`.