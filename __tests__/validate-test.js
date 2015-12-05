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
};

describe('validate', function() {
    it('checks that a required field is mandatory', function() {

        var errors = validate(createObj());

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

        var errors = validate(obj);
        expect(errors.username.required).toBe(false);
        expect(errors.username.$valid).toBe(true);
        expect(errors.email.required).toBe(true);
        expect(errors.email.$valid).toBe(false);

        obj.email = 'falsy email address';
        errors = validate(obj);
        expect(errors.username.required).toBe(false);
        expect(errors.username.$valid).toBe(true);
        expect(errors.email.required).toBe(false);
        expect(errors.email.email).toBe(true);
        expect(errors.email.$valid).toBe(false);
        expect(errors.$valid).toBe(false);
        expect(errors.$invalid).toBe(true);

        obj.email = 'correct@email.com';
        errors = validate(obj);
        expect(errors.username.required).toBe(false);
        expect(errors.username.$valid).toBe(true);
        expect(errors.email.required).toBe(false);
        expect(errors.email.email).toBe(false);
        expect(errors.email.$valid).toBe(true);
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
        };

        validate.addValidator('mustBeBulle', function(bulle) {
            return this.value == bulle;
        });

        var errors = validate(obj);
        expect(errors.username.mustBeBulle).toBe(true);
        expect(errors.username.$valid).toBe(false);
        expect(errors.username.$invalid).toBe(true);

        obj.username = 'a bulle';
        errors = validate(obj);
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

            var errors = validate(obj);

            expect(errors.$valid).toBe(true);
            expect(errors.age.min).toBe(false);
            expect(errors.age.$valid).toBe(true);

            obj.age = 1;

            errors = validate(obj);

            expect(errors.$valid).toBe(false);
            expect(errors.age.min).toBe(true);
            expect(errors.age.$valid).toBe(false);

            obj.age = 18;

            errors = validate(obj);

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

            var errors = validate(obj);

            expect(errors.$valid).toBe(false);
            expect(errors.age.max).toBe(false);
            expect(errors.age.required).toBe(true);
            expect(errors.age.$valid).toBe(false);

            obj.age = 20;

            errors = validate(obj);

            expect(errors.$valid).toBe(false);
            expect(errors.age.max).toBe(true);
            expect(errors.age.required).toBe(false);
            expect(errors.age.$valid).toBe(false);

            obj.age = 18;

            errors = validate(obj);

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
        var errors = validate(obj);
        expect(errors.passwordConfirm.confirm).toBe(true);

        obj.passwordConfirm = "jubel och bullar";
        errors = validate(obj);
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
        var errors = validate(obj);
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

        var errors = validate(obj, rules);
        expect(errors.$valid).toBe(false);
        expect(errors.$invalid).toBe(true);

        obj.username = "underhuggen";
        obj.email = "underhuggen@vilsen.se";

        errors = validate(obj, rules);
        expect(errors.$valid).toBe(true);
        expect(errors.$invalid).toBe(false);
    });
});