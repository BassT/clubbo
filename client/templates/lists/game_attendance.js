/*global
    Template, moment, Session, Meteor, Events, ReactiveVar, Responses
 */

Template.gameAttendance.onCreated(function () {
    'use strict';
    var template = this;
    template.userIds = new ReactiveVar([]);
    template.eventIds = new ReactiveVar([]);
    template.autorun(function () {
        var start, end, tags, teamIds, userIds, eventIds;

        // get team ids
        teamIds = Session.get('selectedTeamIds');

        // get user ids
        userIds = Meteor.users.find({'profile.teamIds': {$in: teamIds}}).map(function (user) {
            return user._id;
        });
        template.userIds.set(userIds);

        // get event ids
        start = moment().startOf('day').format();
        end = moment().startOf('day').add(1, 'year').format();
        tags = ['Spiel'];
        eventIds = Events.find({tags: {$in: ['Spiel']}}).map(function (event) {
            return event._id;
        });
        template.eventIds.set(eventIds);

        // subscribe
        template.subscribe('eventsByTimeIntervalAndTagsAndTeamIds', start, end, tags, teamIds);
        template.subscribe('usersByTeamIds', teamIds);
        template.subscribe('teamsByIds', teamIds);
        template.subscribe('absencesByUserIds', userIds);
        template.subscribe('responsesByUserIdsAndEventIds', userIds, eventIds);
    });
});

Template.gameAttendance.helpers({
    upcomingGames: function () {
        'use strict';
        return Events.find({tags: {$in: ['Spiel']}}, {limit: 9}).fetch();
    },
    users: function () {
        'use strict';
        return Meteor.users.find({'profile.teamIds': {$in: Session.get('selectedTeamIds')}}).fetch();
    },
    gameResponses: function () {
        'use strict';
        var template = Template.instance();
        return Responses.find({eventId: {$in: template.eventIds.get()}, userId: {$in: template.userIds.get()}}).fetch();
    }
});