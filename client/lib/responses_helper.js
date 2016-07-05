ResponsesHelper = {};

ResponsesHelper.generateResponse = function (form) {
    "use strict";
    form = $(form);

    return {
        eventId: form.find('#event-id').val(),
        userId: Meteor.userId(),
        value: form.find('#respond-buttons input:checked').val(),
        message: form.find('#message').val()
    };
};

ResponsesHelper.getValue = function (form) {
    "use strict";
    form = $(form);

    var checkedButton;
    checkedButton = form.find('#respond-buttons input:checked');

    if (checkedButton.length === 1) {
        return checkedButton.val();
    }
    return 'maybe';
};