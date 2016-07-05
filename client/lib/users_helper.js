/*global
    UsersHelper:true, $
 */

UsersHelper = {};

/**
 * Gets the value of the #birthday input field from the DateTimePicker
 * and returns it as an ISO DateString. If null, returns empty string.
 * @param {jQuery} form
 * @returns {string} birthdayDate - an ISODate representing the birthday
 */

UsersHelper.getBirthday = function (form) {
    'use strict';
    return UsersHelper.getDate(form, '#birthday');
};

UsersHelper.getAbsenceValidUntil = function (form) {
    'use strict';
    return UsersHelper.getDate(form, '#absenceValidUntil');
};

UsersHelper.getDate = function (form, fieldSelector) {
    'use strict';
    var date;

    date = form.find(fieldSelector).datepicker('getDate');

    if (date === null) {
        date = '';
    } else {
        date = date.toISOString();
    }

    return date;
};

/**
 * Generates an user object which can be used to update or insert into the database.
 * @param {jQuery} $form
 * @returns {{email: *, profile: {firstName: String, lastName: String, birthday: String, address: String, phone: String, gender: String, jerseyNumber: Number}}}
 */
UsersHelper.generateUser = function ($form) {
    'use strict';
    var teamIds;
    
    teamIds = [];
    $form.find('#teams input:checked').each(function (index, elem) {
        teamIds.push($(elem).val());
    });

    return {
        email: $form.find('#email').val(),
        profile: {
            firstName: $form.find('#first-name').val(),
            lastName: $form.find('#last-name').val(),
            birthday: UsersHelper.getBirthday($form),
            address: $form.find('#address').val(),
            phone: $form.find('#phone').val(),
            gender: $form.find('input[name="gender-radio"]:checked').val(),
            jerseyNumber: $form.find('#jersey-number').val(),
            positions: UsersHelper.getPositions($form),
            teamIds: teamIds
        }
    };
};

/**
 * Gets and returns an array of Strings containing the checked position
 * checkbox values.
 * @param {jQuery} $form
 * @returns {Array}
 */

UsersHelper.getPositions = function ($form) {
    'use strict';
    var positions;

    positions = [];
    $form.find('#positions input:checked').each(function (index, element) {
        positions.push($(element).val());
    });

    return positions;
};