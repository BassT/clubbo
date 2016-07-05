/*global
    Absences, Meteor, Events, Tags, Responses, Clubs, Departments, Teams, _, moment, check
 */
'use strict';

/**
 * Created by sebastian on 27.03.15.
 */

/*  ---------------------
    Absences publications
    ---------------------   */
Meteor.publish('absencesByUserIds', function (userIds) {
    return Absences.find({userId: {$in: userIds}});
});

Meteor.publish('absencesByEventIds', function (eventIds) {
    var events = Events.find({_id: {$in: eventIds}}).fetch(),
        i, event, eventStartMom, eventEndMom,
        startMom = null,
        endMom = null;

    for (i = 0; i < events.length; i = i + 1) {
        event = events[i];
        if (startMom && endMom) {
            eventStartMom = moment(event.start);
            eventEndMom = moment(event.end);
            if (eventStartMom.isBefore(startMom)) {
                startMom = eventStartMom.clone();
            }
            if (eventEndMom.isAfter(endMom)) {
                endMom = eventEndMom.clone();
            }
        } else {
            startMom = moment(event.start);
            endMom = moment(event.end);
        }
    }
    
    return Absences.find({
        start: {$lt: endMom.toDate()},
        end: {$gt: startMom.toDate()}
    });
});

/*  -------------------
    Events publications
    ------------------- */
Meteor.publish('eventsByTimeIntervalAndTagsAndTeamIds', function (start, end, tags, teamIds) {
    var query;
    query = {
        teamId: {$in: teamIds},
        $and: [
            {start: {$gt: start}},
            {start: {$lt: end}}
        ]
    };
    if (tags.length > 0) {
        query.tags = {$in: tags};
    }
    return Events.find(query);
});

Meteor.publish('eventsByTimeIntervalAndTeamIdsPaginated', function (start, end, teamIds, limit) {
    check(start, String);
    check(start, String);
    check(teamIds, Array);
    check(limit, Number);

    return Events.find({
        teamId: {$in: teamIds},
        $and: [
            {start: {$gt: start}},
            {start: {$lt: end}}
        ]
    }, {
        sort: {start: 1, end: 1},
        limit: limit
    });
});

Meteor.publish('eventsByIds', function (eventIds) {
    return Events.find({_id: {$in: eventIds}});
});

/*  ----------------------
    Responses publications
    ----------------------  */
Meteor.publish('responsesByEventIds', function (eventIds) {
    return Responses.find({eventId: {$in: eventIds}});
});

Meteor.publish('responsesByUserId', function (userId) {
    return Responses.find({userId: userId});
});

Meteor.publish('responsesByUserIdAndEventId', function (userId, eventId) {
    return Responses.find({eventId: eventId, userId: userId});
});

Meteor.publish('responsesByUserIdAndEventIds', function (userId, eventIds) {
    return Responses.find({eventId: {$in: eventIds}, userId: userId});
});

Meteor.publish('responsesByUserIdsAndEventIds', function (userIds, eventIds) {
    return Responses.find({eventId: {$in: eventIds}, userId: {$in: userIds}});
});

/*  ------------------
 Teams publications
 ------------------  */
Meteor.publish('teamsByIds', function(teamIds) {
    return Teams.find({_id: {$in: teamIds}});
});

/*  ------------------
    Users publications
    ------------------  */
Meteor.publish('usersByIds', function (userIds) {
    return Meteor.users.find({_id: {$in: userIds}});
});

Meteor.publish('usersByEventId', function (eventId) {
    var teamId = Events.findOne(eventId).teamId;
    return Meteor.users.find({'profile.teamIds': {$in: [teamId]}});
});

Meteor.publish('usersByTeamIds', function (teamIds) {
    return Meteor.users.find({'profile.teamIds': {$in: teamIds}});
});