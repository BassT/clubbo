/*global
    describe, beforeEach, Meteor, expect, Tracker, Router, $, _, afterEach, it, waitForRouter, Teams, Session,
    Departments, Events, Clubs
 */

describe('Calendar', function () {
    'use strict';

    beforeEach(function (done) {
        Meteor.loginWithPassword('roesberg@karlsruhe-lacrosse.de', '20077002', function (error) {
            expect(error).toBeUndefined();
            expect(Meteor.userId()).not.toBeNull();
            Meteor.setTimeout(function () {
                Session.set('context', {id: Teams.findOne({name: 'Karlsruhe A'})._id, type: 'team'});
                Router.go('/calendar');
                Meteor.setTimeout(done, 200);
            }, 200);
        });
    });

    beforeEach(waitForRouter);

    afterEach(function (done) {
        Meteor.logout(function () {
            expect(Meteor.userId()).toBeNull();
            Router.go('/');
            Meteor.setTimeout(done, 2000);
        });
    });

    describe('Event color coding', function () {
        it('should show a color legend if the current club has departments or teams', function (done) {
            var initialContext, context, $eventColorLegendDiv, club;
            initialContext = Session.get('context');
            expect(initialContext).toBeDefined();
            Meteor.setTimeout(function () {
                Session.set('context', {type: 'club', id: Meteor.user().profile.clubIds[0]});
                Meteor.setTimeout(function () {
                    context = Session.get('context');
                    expect(context.type).toBe('club');

                    $eventColorLegendDiv = $('#event-color-legend');
                    expect($eventColorLegendDiv.length).toBe(1);

                    club = Clubs.findOne(context.id);
                    expect($eventColorLegendDiv.find('.item').length)
                        .toBe(club.departmentIds.length + club.teamIds.length);

                    Session.set('context', initialContext);
                    Meteor.setTimeout(done, 200);
                }, 200);
            }, 200);
        });
        it('should show a different color for every legend item', function (done) {
            var initialContext, context, $itemDivs, $itemDiv, colors, itemColor;
            initialContext = Session.get('context');
            expect(initialContext).toBeDefined();
            Meteor.setTimeout(function () {
                Session.set('context', {type: 'club', id: Meteor.user().profile.clubIds[0]});
                Meteor.setTimeout(function () {
                    context = Session.get('context');
                    expect(context.type).toBe('club');

                    $itemDivs = $('#event-color-legend').find('.item');
                    colors = [];
                    $itemDivs.each(function (index) {
                        $itemDiv = $($itemDivs[index]);
                        itemColor = $itemDiv.find('span.fa-square').css('color');
                        expect(colors).not.toContain(itemColor);
                        colors.push(itemColor);
                    });

                    Session.set('context', initialContext);
                    Meteor.setTimeout(done, 200);
                }, 200);
            }, 200);
        });
    });

    /*  These tests are deprecated after introducing the 'visible' attribute to the Events collection.
        Which events are shown in the dashboard does not depend on the 'context' attribute anymore.

    describe('Context sensitivity', function () {

        it('should only show the current teams\'s events, when the current context is a team', function (done) {
            var context, $events, $event, team;
            Meteor.setTimeout(function () {
                context = Session.get('context');

                // Check if the current context is a team
                expect(context).toBeDefined();
                expect(context.type).toBe('team');

                // Get the corresponding team doc
                team = Teams.findOne(context.id);

                // Check if all displayed events belong to this team
                $events = $('#calendar').find('.fc-event');
                $events.each(function (index) {
                    $event = $($events[index]);
                    expect($event.data('contextId')).toEqual(team._id);
                });

                done();
            }, 200);
        });
        it('should only show the current department\'s events and the associated team events, where the current user ' +
            'is a member of, when the current context is a department', function (done) {
            var context, $events, $event, department, teams, contextIds, i, $calendar, counter, contextId,
                initialContext;
            Meteor.setTimeout(function () {
                initialContext = Session.get('context');
                Session.set('context', {id: Departments.findOne({name: 'Lacrosse'})._id, type: 'department'});
                Meteor.setTimeout(function () {
                    context = Session.get('context');

                    // Check if the current context is a department
                    expect(context.type).toBe('department');

                    // Get the corresponding department doc
                    department = Departments.findOne(context.id);

                    // Get team docs which are associated with the department and where the current user is a
                    // member of
                    teams = Teams.find({$and: [
                        {_id: {$in: department.teamIds}},
                        {_id: {$in: Meteor.user().profile.teamIds}}
                    ]}).fetch();
                    expect(teams.length).toBeGreaterThan(0);

                    // Collect all context IDs
                    contextIds = _.pluck(teams, '_id');
                    contextIds.push(department._id);

                    // Check if all displayed events belong to one of the contexts
                    $calendar = $('#calendar');
                    $events = $calendar.find('.fc-event');
                    $events.each(function (index) {
                        $event = $($events[index]);
                        expect(contextIds).toContain($event.data('contextId'));
                    });

                    // Check if there is at least one event for every context
                    for (i = 0; i < contextIds.length; i = i + 1) {
                        counter = 0;
                        contextId = contextIds[i];
                        //noinspection JSLint
                        $events.each(function (index) {
                            $event = $($events[index]);
                            if ($event.data('contextId') === contextId) {
                                counter = counter + 1;
                            }
                        });
                        expect(counter).toBeGreaterThan(0);
                    }

                    // Reset context.
                    Session.set('context', initialContext);
                    Meteor.setTimeout(done, 200);
                }, 200);
            }, 200);
        });
        it('should only show the current club\'s event as well as the associated department and team events, where ' +
            'the current user is a member of, when the current context is a club', function (done) {
            var context, $events, $event, club, teams, contextIds, i, $calendar, counter, contextId,
                initialContext, departments;
            Meteor.setTimeout(function () {
                initialContext = Session.get('context');
                Session.set('context', {id: Clubs.findOne({name: 'KIT SC'})._id, type: 'club'});
                Meteor.setTimeout(function () {
                    context = Session.get('context');

                    // Check if the current context is a club
                    expect(context.type).toBe('club');

                    // Get the corresponding club doc
                    club = Clubs.findOne(context.id);

                    // Get department docs which are associated with the club and where the current user is a memeber of
                    departments = Departments.find({$and: [
                        {_id: {$in: club.departmentIds}},
                        {_id: {$in: Meteor.user().profile.departmentIds}}
                    ]}).fetch();
                    expect(departments.length).toBeGreaterThan(0);

                    // Get team docs which are associated with the club and where the current user is a
                    // member of
                    teams = Teams.find({$and: [
                        {_id: {$in: club.teamIds}},
                        {_id: {$in: Meteor.user().profile.teamIds}}
                    ]}).fetch();
                    expect(teams.length).toBeGreaterThan(0);

                    // Collect all context IDs
                    contextIds = _.pluck(teams, '_id');
                    contextIds.push(_.pluck(departments, '_id'));
                    contextIds.push(club._id);
                    contextIds = _.flatten(contextIds);

                    // Check if all displayed events belong to one of the contexts
                    $calendar = $('#calendar');
                    $events = $calendar.find('.fc-event');
                    $events.each(function (index) {
                        $event = $($events[index]);
                        expect(contextIds).toContain($event.data('contextId'));
                    });

                    // Check if there is at least one event for every context
                    for (i = 0; i < contextIds.length; i = i + 1) {
                        counter = 0;
                        contextId = contextIds[i];
                        //noinspection JSLint
                        $events.each(function (index) {
                            $event = $($events[index]);
                            if ($event.data('contextId') === contextId) {
                                counter = counter + 1;
                            }
                        });
                        expect(counter).toBeGreaterThan(0);
                    }

                    // Reset context.
                    Session.set('context', initialContext);
                    Meteor.setTimeout(done, 200);
                }, 200);
            }, 200);
        });
    });*/

    describe('Calendar element', function () {
        it('should show a fullCalendar element', function (done) {
            Meteor.setTimeout(function () {
                expect($('#calendar').find('div.fc').length).toBe(1);
                done();
            }, 300);
        });
    });

    describe('Filter function', function () {
        it('should have an input element for tags', function (done) {
            Meteor.setTimeout(function () {
                expect($('select#event-tags').length).toBe(1);
                done();
            }, 300);
        });
        it('should have no options selected by default', function (done) {
            Meteor.setTimeout(function () {
                expect($('select#event-tags option[selected]').length).toBe(0);
                done();
            }, 300);
        });
        it('should have a selectpicker input field', function (done) {
            Meteor.setTimeout(function () {
                expect($('#event-tags').next('span.select2').length).toBe(1);
                done();
            }, 300);
        });
    });
});