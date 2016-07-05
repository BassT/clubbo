/*global
    Absences, Template, Responses, _, moment, Tracker, Meteor, $, bootbox, ReactiveVar
 */

Template.attendanceList.onCreated(function () {
    'use strict';
    var responsesByEventId, responsesByEventIdAndUserId, template;
    template = this;

    responsesByEventId = {};
    responsesByEventIdAndUserId = {};
    template.responsesByEventId = new ReactiveVar(responsesByEventId);
    template.responsesByEventIdAndUserId = new ReactiveVar(responsesByEventIdAndUserId);

    template.autorun(function () {
        responsesByEventId = {};
        responsesByEventIdAndUserId = {};
        _.each(Template.currentData().attendances, function (response) {
            if (_.has(responsesByEventId, response.eventId)) {
                responsesByEventId[response.eventId].push(response);
            } else {
                responsesByEventId[response.eventId] = [response];
            }
            responsesByEventIdAndUserId[response.eventId + '_' + response.userId] = response;
        });
        template.responsesByEventId.set(responsesByEventId);
        template.responsesByEventIdAndUserId.set(responsesByEventIdAndUserId);
    });
});

Template.attendanceList.helpers({
    totalAttendance: function (event) {
        'use strict';
        var responsesByEventId = Template.instance().responsesByEventId.get();
        if (_.has(responsesByEventId, event._id)) {
            return _.filter(responsesByEventId[event._id], function (response) {
                return response.value === 'yes';
            }).length;
        }
        return 0;
    },
    positions: function (user) {
        'use strict';
        return user.profile.positions.join(', ');
    },
    cellClass: function (user, event) {
        'use strict';
        var responsesByEventIdAndUserId, responseValue, key;
        responsesByEventIdAndUserId = Template.instance().responsesByEventIdAndUserId.get();
        key = event._id + '_' + user._id;
        if (_.has(responsesByEventIdAndUserId, key)) {
            responseValue = responsesByEventIdAndUserId[key].value;
            if (responseValue === 'yes') {
                return {class: 'success attending'};
            }
            if (responseValue === 'no') {
                return {class: 'danger not-attending'};
            }
        }
    },
    userHasMessageOrAbsence: function (user, event) {
        'use strict';
        var responsesByEventIdAndUserId, absencesCount, hasMessage, key, message;
        responsesByEventIdAndUserId = Template.instance().responsesByEventIdAndUserId.get();
        key = event._id + '_' + user._id;

        hasMessage = false;
        if (_.has(responsesByEventIdAndUserId, key)) {
            message = responsesByEventIdAndUserId[key].message;
            if (message) {
                hasMessage = true;
            }
        }

        absencesCount = Absences.find({
            userId: user._id,
            start: {$lt: moment(event.end).toDate()},
            end: {$gt: moment(event.start).toDate()}
        }).count();

        return hasMessage || absencesCount > 0;
    },
    userHasMessage: function (user, event) {
        'use strict';
        var responsesByEventIdAndUserId, key, message;
        responsesByEventIdAndUserId = Template.instance().responsesByEventIdAndUserId.get();
        key = event._id + '_' + user._id;
        if (_.has(responsesByEventIdAndUserId, key)) {
            message = responsesByEventIdAndUserId[key].message;
            return message;
        }
        return false;
    },
    userMessage: function (user, event) { // DO NOT REMOVE - THIS HELPER IS IN USE!
        'use strict';
        var responsesByEventIdAndUserId = Template.instance().responsesByEventIdAndUserId.get();
        return responsesByEventIdAndUserId[event._id + '_' + user._id].message;
    },
    userAbsence: function (user, event) { // DO NOT REMOVE - THIS HELPER IS IN USE!
        'use strict';
        var absence = Absences.findOne({
            userId: user._id,
            start: {$lt: moment(event.end).toDate()},
            end: {$gt: moment(event.start).toDate()}
        });
        return moment(absence.start).format('DD.MM.YYYY') + ' - ' + moment(absence.end).format('DD.MM.YYYY') + ': ' + absence.note;
    },
    responseValue: function (user, event) {
        'use strict';
        var response = Template.instance().responsesByEventIdAndUserId.get()[event._id + '_' + user._id];
        if (response) {
            if (response.value === 'yes') {
                return 'Ja';
            }
            if (response.value === 'no') {
                return 'Nein';
            }
        } else {
            return '?';
        }
    },
    isCurrentUser: function (user) {
        'use strict';
        return Meteor.userId() === user._id;
    },
    userHasResponse: function (user, event) {
        'use strict';
        var responsesByEventIdAndUserId = Template.instance().responsesByEventIdAndUserId.get();
        return _.has(responsesByEventIdAndUserId, event._id + '_' + user._id);
    }
});

Template.attendanceList.events({
    'click .switch-response': function (event) {
        'use strict';
        var $button, $cell, value, userId, eventId;

        $button = $(event.currentTarget);
        $cell = $button.parent('td[data-event-id]');
        if ($cell.hasClass('attending')) {
            value = 'no';
        } else if ($cell.hasClass('not-attending')) {
            value = 'yes';
        }

        eventId = $cell.data('eventId');
        userId = $cell.parent('tr[data-user-id]').data('userId');

        Meteor.call('updateResponse', userId, eventId, value, '', function (error) {
            if (error) {
                bootbox.alert({
                    title: 'Antwort konnte nicht geändert werden.',
                    message: error.message
                });
            }
        });
    },
    'click .add-response': function (event) {
        'use strict';
        var $button, value, userId, eventId;

        $button = $(event.currentTarget);
        if ($button.hasClass('attending')) {
            value = 'yes';
        } else if ($button.hasClass('not-attending')) {
            value = 'no';
        }

        eventId = $button.parentsUntil('tr', 'td[data-event-id]').data('eventId');
        userId = $button.parentsUntil('tbody', 'tr[data-user-id]').data('userId');

        Meteor.call('insertResponse', userId, eventId, value, '', function (error) {
            if (error) {
                bootbox.alert({
                    title: 'Antwort konnte nicht erstellt werden.',
                    message: error.message
                });
            }
        });
    }
});

Template.attendanceList.onRendered(function () {
    'use strict';
    $('#context-dropdown').removeClass('disabled');
});

