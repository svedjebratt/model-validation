export default function Validators(model, field) {
    this.model = model;
    this.value = model[field];
    this._field = field;
    const _validity = [];

    this.getValidity = function() {
        return _validity;
    };

    this._setValidity = function(validation) {
        const existing = _validity.filter(function(v) {
            return v.name === validation.name;
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
