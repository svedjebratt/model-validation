jest.dontMock('../dist/index');
var skymma = require('../dist/index');
var validate = skymma.default;
var addValidator = skymma.addValidator;


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
};

describe('validate', function() {
    it('checks that a required field is mandatory', function() {

        var errors = validate(createObj()).asObject();

        expect(errors.$valid).toBe(false);
        expect(errors.$invalid).toBe(true);
        expect(errors.username.required).toBe(true);
        expect(errors.username.$valid).toBe(false);
        expect(errors.username.$invalid).toBe(true);
        expect(errors.email.required).toBe(true);
        expect(errors.email.$valid).toBe(false);
        expect(errors.email.$invalid).toBe(true);

    });

    it('checks that a required field is valid when something is entered into the model', function() {
        var obj = createObj();
        obj.username = 'my username';

        var errors = validate(obj).asObject();
        expect(errors.username.required).toBe(false);
        expect(errors.username.$valid).toBe(true);
        expect(errors.email.required).toBe(true);
        expect(errors.email.$valid).toBe(false);

        obj.email = 'falsy email address';
        errors = validate(obj).asObject();
        expect(errors.username.required).toBe(false);
        expect(errors.username.$valid).toBe(true);
        expect(errors.email.required).toBe(false);
        expect(errors.email.email).toBe(true);
        expect(errors.email.$valid).toBe(false);
        expect(errors.$valid).toBe(false);
        expect(errors.$invalid).toBe(true);

        obj.email = 'correct@email.com';
        errors = validate(obj).asObject();
        expect(errors.username.required).toBe(false);
        expect(errors.username.$valid).toBe(true);
        expect(errors.email.required).toBe(false);
        expect(errors.email.email).toBe(false);
        expect(errors.email.$valid).toBe(true);
        expect(errors.$valid).toBe(true);
        expect(errors.$invalid).toBe(false);
    });

    it('checks that trailing spaces are ignored', function() {
        var obj = createObj();
        obj.email = ' email@email.se  ';
        obj.username = '  snabel ';
        var errors = validate(obj).asObject();
        expect(errors.username.required).toBe(false);
        expect(errors.username.$valid).toBe(true);
        expect(errors.email.required).toBe(false);
        expect(errors.email.email).toBe(false);
        expect(errors.email.$valid).toBe(true);
        expect(errors.$valid).toBe(true);
        expect(errors.$invalid).toBe(false);
    })
});

describe('validate.addValidator', function() {
    it('adds a custom validator', function() {
        var obj = {
            username: '',
            rules: function(check) {
                check('username').mustBeBulle('a bulle');
            }
        };

        addValidator('mustBeBulle', function(bulle) {
            return this.value == bulle;
        });

        var errors = validate(obj).asObject();
        expect(errors.username.mustBeBulle).toBe(true);
        expect(errors.username.$valid).toBe(false);
        expect(errors.username.$invalid).toBe(true);

        obj.username = 'a bulle';
        errors = validate(obj).asObject();
        expect(errors.username.mustBeBulle).toBe(false);
        expect(errors.username.$valid).toBe(true);
        expect(errors.username.$invalid).toBe(false);

    });

    describe('validate with min and max validators', function() {
        it('verifies that min validator works', function() {
            var obj = {
                age: null,
                rules: function(check) {
                    check('age').min(18);
                }
            };

            var errors = validate(obj).asObject();

            expect(errors.$valid).toBe(true);
            expect(errors.age.min).toBe(false);
            expect(errors.age.$valid).toBe(true);

            obj.age = 1;

            errors = validate(obj).asObject();

            expect(errors.$valid).toBe(false);
            expect(errors.age.min).toBe(true);
            expect(errors.age.$valid).toBe(false);

            obj.age = 18;

            errors = validate(obj).asObject();

            expect(errors.$valid).toBe(true);
            expect(errors.age.min).toBe(false);
            expect(errors.age.$valid).toBe(true);
        });

        it('verifies that max validator works', function() {
            var obj = {
                age: null,
                rules: function(check) {
                    check('age').max(18);
                    check('age').required();
                }
            };

            var errors = validate(obj).asObject();

            expect(errors.$valid).toBe(false);
            expect(errors.age.max).toBe(false);
            expect(errors.age.required).toBe(true);
            expect(errors.age.$valid).toBe(false);

            obj.age = 20;

            errors = validate(obj).asObject();

            expect(errors.$valid).toBe(false);
            expect(errors.age.max).toBe(true);
            expect(errors.age.required).toBe(false);
            expect(errors.age.$valid).toBe(false);

            obj.age = 18;

            errors = validate(obj).asObject();

            expect(errors.$valid).toBe(true);
            expect(errors.age.max).toBe(false);
            expect(errors.age.required).toBe(false);
            expect(errors.age.$valid).toBe(true);
        });
    });
});

describe('validate with manual validity of field', function() {
    it('sets a manual validity', function() {
        var obj = {
            password: '',
            passwordConfirm: '',
            rules: function(check) {
                check('passwordConfirm').setValid('confirm', this.passwordConfirm == this.password);
            }
        };

        obj.password = "jubel och bullar";
        var errors = validate(obj).asObject();
        expect(errors.passwordConfirm.confirm).toBe(true);

        obj.passwordConfirm = "jubel och bullar";
        errors = validate(obj).asObject();
        expect(errors.passwordConfirm.confirm).toBe(false);
    });

    it('should be able to save and retrieve a custom message', function() {
        var obj = {
            password: '',
            passwordConfirm: '',
            rules: function(check) {
                check('passwordConfirm').setValid('confirm', this.passwordConfirm == this.password, 'The passwords does not match');
                check('passwordConfirm').setValid('custom', false, 'Custom message');
            }
        };

        obj.password = 'jubel och bullar';
        var errors = validate(obj).asObject();
        expect(errors.$messages.passwordConfirm.confirm).toBe('The passwords does not match');
        expect(errors.$messages.passwordConfirm.custom).toBe('Custom message');
    });
});

describe("specifying rules function outside model", function() {
    it('should use the rules function specified at validation time', function() {
        var obj = {
            username: '',
            email: ''
        };

        var rules = function(check) {
            check('username').required();
            check('username').minLength(4);
            check('username').maxLength(12);
            check('email').required();
            check('email').email();
        };

        var errors = validate(obj, rules).asObject();
        expect(errors.$valid).toBe(false);
        expect(errors.$invalid).toBe(true);

        obj.username = "underhuggen";
        obj.email = "underhuggen@vilsen.se";

        errors = validate(obj, rules).asObject();
        expect(errors.$valid).toBe(true);
        expect(errors.$invalid).toBe(false);
    });
});

describe('validate with list response', function() {
    it('should return an object with lists of errors', function() {

        var obj = createObj();
        var errors = validate(obj);

        expect(errors.length).toBe(5);
        var required = errors.filter(function(err) { return err.field === 'username' && err.name === 'required' })[0];
        expect(required.name).toBe('required');
        expect(required.valid).toBe(false);
        expect(required.message).toBe(null);

        var minLength = errors.filter(function(err) { return err.field === 'username' && err.name === 'minLength' })[0];
        expect(minLength.name).toBe('minLength');
        expect(minLength.valid).toBe(true);
        expect(minLength.message).toBe(null);

        var maxLength = errors.filter(function(err) { return err.field === 'username' && err.name === 'maxLength' })[0];
        expect(maxLength.name).toBe('maxLength');
        expect(maxLength.valid).toBe(true);
        expect(maxLength.message).toBe(null);

        var emailRequired = errors.filter(function(err) { return err.field === 'email' && err.name === 'required' })[0];
        expect(emailRequired.name).toBe('required');
        expect(emailRequired.valid).toBe(false);
        expect(emailRequired.message).toBe(null);

        var email = errors.filter(function(err) { return err.field === 'email' && err.name === 'email' })[0];
        expect(email.name).toBe('email');
        expect(email.valid).toBe(true);
        expect(email.message).toBe(null);

        // check invalid email
        obj.email = 'snubbel@klister';
        errors = validate(obj);

        emailRequired = errors.filter(function(err) { return err.field === 'email' && err.name === 'required' })[0];
        expect(emailRequired.name).toBe('required');
        expect(emailRequired.valid).toBe(true);
        expect(emailRequired.message).toBe(null);

        email = errors.filter(function(err) { return err.field === 'email' && err.name === 'email' })[0];
        expect(email.name).toBe('email');
        expect(email.valid).toBe(false);
        expect(email.message).toBe(null);

    });
});
