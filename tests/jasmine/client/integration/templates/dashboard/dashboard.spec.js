/*global
    describe, Meteor, beforeEach, afterEach, it, $, _, Teams, Events, Clubs, Departments, expect, Router, Session
 */
'use strict';

describe('Dashboard', function () {
    beforeEach(function (done) {
        Meteor.loginWithPassword('richter@karlsruhe-lacrosse.de', '20077002', function (error) {
            expect(error).not.toBeDefined();
            expect(Meteor.user()).not.toBeNull();

            Router.go('/');

            Meteor.setTimeout(done, 200);
        });
    });

    afterEach(function (done) {
        Meteor.logout(function () {
            Meteor.setTimeout(done, 2000);
        });
    });

    describe('Context sensitivity', function () {
        it('should show labels with the context name', function (done) {
            var initialContext, context, $eventPanels;

            initialContext = Session.get('context');

            Session.set('context', {type: 'club', id: Meteor.user().profile.clubIds[0]});
            Meteor.setTimeout(function () {
                context = Session.get('context');
                expect(context.type).toBe('club');

                $eventPanels = $('.event-panel');
                expect($eventPanels.length).toBeGreaterThan(0);

                // Expect every event panel to have a label in the heading
                expect($eventPanels.find('.label').length).toBe($eventPanels.length);

                Session.set('context', initialContext);
                Meteor.setTimeout(done, 200);
            }, 200);
        });

        /*  These tests are deprecated after introducing the 'visible' attribute to the Events collection.
            Which events are shown in the dashboard does not depend on the 'context' attribute anymore.

        it('should only show the current team\'s events when a team is selected as context', function (done) {
            var context, $eventPanels, $eventPanel, eventDoc, teamEvents, departmentEvents,
                clubEvents;

            teamEvents = 0;
            departmentEvents = 0;
            clubEvents = 0;

            context = Session.get('context');
            expect(context.type).toBe('team');

            $eventPanels = $('.event-panel');
            expect($eventPanels.length).toBeGreaterThan(0);
            $eventPanels.each(function(index, elem) {
                $eventPanel = $(elem);
                eventDoc = Events.findOne($eventPanel.data('eventId'));
                expect(eventDoc.context.id).toBe(context.id);

                if (eventDoc.context.type === 'team') {
                    teamEvents = teamEvents + 1;
                } else if (eventDoc.context.type === 'department') {
                    departmentEvents = departmentEvents + 1;
                } else if (eventDoc.context.type === 'club') {
                    clubEvents = clubEvents + 1;
                }
            });

            expect(teamEvents).toBeGreaterThan(0);
            expect(departmentEvents).toBe(0);
            expect(clubEvents).toBe(0);

            Meteor.setTimeout(done, 200);
        });
        it('should show the current department\'s events and the events of its\' teams where the current user' +
            'is a member of when a department is selected as context', function (done) {
            var initialContext, context, department, contextIds, teams, $eventPanels, teamEvents, departmentEvents,
                clubEvents, $eventPanel, eventDoc;

            teamEvents = 0;
            departmentEvents = 0;
            clubEvents = 0;

            initialContext = Session.get('context');

            Session.set('context', {type: 'department', id: Meteor.user().profile.departmentIds[0]});
            Meteor.setTimeout(function () {
                context = Session.get('context');
                expect(context.type).toBe('department');

                department = Departments.findOne(context.id);
                contextIds = [department._id];

                // Collect team ids
                teams = Teams.find({$and: [
                    {_id: {$in: department.teamIds}},
                    {_id: {$in: Meteor.user().profile.teamIds}}
                ]}).fetch();
                contextIds.push(_.pluck(teams, '_id'));
                contextIds = _.flatten(contextIds);

                $eventPanels = $('.event-panel');
                expect($eventPanels.length).toBeGreaterThan(0);
                $eventPanels.each(function(index, elem) {
                    $eventPanel = $(elem);
                    eventDoc = Events.findOne($eventPanel.data('eventId'));
                    expect(contextIds).toContain(eventDoc.context.id);

                    if (eventDoc.context.type === 'team') {
                        teamEvents = teamEvents + 1;
                    } else if (eventDoc.context.type === 'department') {
                        departmentEvents = departmentEvents + 1;
                    } else if (eventDoc.context.type === 'club') {
                        clubEvents = clubEvents + 1;
                    }
                });

                expect(teamEvents).toBeGreaterThan(0);
                expect(departmentEvents).toBeGreaterThan(0);
                expect(clubEvents).toBe(0);

                Session.set('context', initialContext);
                Meteor.setTimeout(done, 200);
            }, 200);
        });
        it('should show the current club\'s events and the events of its\' departments and teams where the current user' +
            'is a member of when a club is selected as context', function (done) {
            var initialContext, context, club, contextIds, teams, $eventPanels, teamEvents, departmentEvents,
                clubEvents, $eventPanel, eventDoc, departments;

            teamEvents = 0;
            departmentEvents = 0;
            clubEvents = 0;

            initialContext = Session.get('context');

            Session.set('context', {type: 'club', id: Meteor.user().profile.clubIds[0]});
            Meteor.setTimeout(function () {
                context = Session.get('context');
                expect(context.type).toBe('club');

                club = Clubs.findOne(context.id);
                contextIds = [club._id];
                
                // Collect department ids
                departments = Departments.find({$and: [
                    {_id: {$in: club.departmentIds}},
                    {_id: {$in: Meteor.user().profile.departmentIds}}
                ]}).fetch();
                contextIds.push(_.pluck(departments, '_id'));
                contextIds = _.flatten(contextIds);
                
                // Collect team ids
                teams = Teams.find({$and: [
                    {_id: {$in: club.teamIds}},
                    {_id: {$in: Meteor.user().profile.teamIds}}
                ]}).fetch();
                contextIds.push(_.pluck(teams, '_id'));
                contextIds = _.flatten(contextIds);

                $eventPanels = $('.event-panel');
                expect($eventPanels.length).toBeGreaterThan(0);
                $eventPanels.each(function(index, elem) {
                    $eventPanel = $(elem);
                    eventDoc = Events.findOne($eventPanel.data('eventId'));
                    expect(contextIds).toContain(eventDoc.context.id);

                    if (eventDoc.context.type === 'team') {
                        teamEvents = teamEvents + 1;
                    } else if (eventDoc.context.type === 'department') {
                        departmentEvents = departmentEvents + 1;
                    } else if (eventDoc.context.type === 'club') {
                        clubEvents = clubEvents + 1;
                    }
                });

                expect(teamEvents).toBeGreaterThan(0);
                expect(departmentEvents).toBeGreaterThan(0);
                expect(clubEvents).toBeGreaterThan(0);

                Session.set('context', initialContext);
                Meteor.setTimeout(done, 200);
            }, 200);
        });*/
    });
});