/*global
    Responses:true, Meteor, Roles, SimpleSchema, Events, moment, ContextSchema, Teams, Departments, Clubs, check
 */
Responses = new Meteor.Collection('responses');

Responses.attachSchema(new SimpleSchema({
    eventId: {
        type: String
    },
    userId: {
        type: String
    },
    value: {
        type: String,
        allowedValues: ['yes', 'no', 'maybe']
    },
    message: {
        type: String,
        optional: true
    }
}));

Meteor.methods({
    updateResponse: function (userId, eventId, value, message) {
        'use strict';
        check(userId, String);
        check(eventId, String);
        check(value, String);
        check(message, String);

        if (userId !== Meteor.userId()) {
            if (!Roles.userIsInRole(Meteor.user(), 'admin', Events.findOne(eventId).teamId)) {
                throw new Meteor.Error(403, 'Only admins of the team can change responses.');
            }
        }

        Responses.update({userId: userId, eventId: eventId}, {$set: {value: value, message: message}});
    },
    insertResponse: function (userId, eventId, value, message) {
        'use strict';
        var teamIdsUser, eventTeamId;
        check(userId, String);
        check(eventId, String);
        check(value, String);
        check(message, String);

        if (userId !== Meteor.userId()) {
            if (!Roles.userIsInRole(Meteor.user(), 'admin', Events.findOne(eventId).teamId)) {
                throw new Meteor.Error(403, 'Only admins of the team can change responses.');
            }
        }

        teamIdsUser = Meteor.users.findOne(userId).profile.teamIds;
        eventTeamId = Events.findOne(eventId).teamId;
        if (!_.contains(teamIdsUser, eventTeamId)) {
            throw new Meteor.Error(403, 'User is not a member of the team this event belongs to.');
        }

        if (Responses.findOne({userId: userId, eventId: eventId})) {
            Responses.update({userId: userId, eventId: eventId}, {$set: {value: value, message: message}});
        } else {
            Responses.insert({userId: userId, eventId: eventId, value: value, message: message});
        }
    }
});