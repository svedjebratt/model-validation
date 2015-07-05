jest.dontMock('../index');
var validate = require('../index');

var createObj = function() {
  return {
    username: '',
    email: '',
    rules: function(check) {
      check('username').required();
      check('username').minLength(4);
      check('username').maxLength(12);
      check('email').required();
      check('email').email();
    }
  };
}

describe('validate', function() {
 it('checks that a required field is mandatory', function() {

   var errors = validate(createObj());

   expect(errors.$valid).toBe(false);
   expect(errors.$invalid).toBe(true);
   expect(errors.username.required).toBe(true);
   expect(errors.email.required).toBe(true);

 });

 it('checks that a required field is valid when something is entered into the model', function() {
   var obj = createObj();
   obj.username = 'my username';

   var errors = validate(obj);
   expect(errors.username.required).toBe(false);
   expect(errors.email.required).toBe(true);

   obj.email = 'falsy email address';
   errors = validate(obj);
   expect(errors.username.required).toBe(false);
   expect(errors.email.required).toBe(false);
   expect(errors.email.email).toBe(true);
   expect(errors.$valid).toBe(false);
   expect(errors.$invalid).toBe(true);

   obj.email = 'correct@email.com';
   errors = validate(obj);
   expect(errors.username.required).toBe(false);
   expect(errors.email.required).toBe(false);
   expect(errors.email.email).toBe(false);
   expect(errors.$valid).toBe(true);
   expect(errors.$invalid).toBe(false);
 });
});

describe('validate.addValidator', function() {
  it('adds a custom validator', function() {
    var obj = {
      username: '',
      rules: function(check) {
        check('username').mustBeBulle('a bulle');
      }
    }

    validate.addValidator('mustBeBulle', function(bulle) {
      return this.value == bulle;
    });

    var errors = validate(obj);
    expect(errors.username.mustBeBulle).toBe(true);

    obj.username = 'a bulle';
    var errors = validate(obj);
    expect(errors.username.mustBeBulle).toBe(false);
  });
});
