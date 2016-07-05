/*global
    describe, beforeEach, Meteor, expect, Router, Events, Responses, afterEach, waitForRouter, moment, _, $, it,
    Accounts, Teams, Departments, Clubs, Session
 */

describe('Event details', function () {
    'use strict';

    beforeEach(function (done) {
        Meteor.loginWithPassword('richter@karlsruhe-lacrosse.de', '20077002', function (error) {
            expect(error).toBeUndefined();
            expect(Meteor.userId()).not.toBeNull();

            // Set context to 'KIT SC'
            if (Session.get('context').id !== Clubs.findOne({name: 'KIT SC'})._id) {
                Session.set('context', {
                    id: Clubs.findOne({name: 'KIT SC'})._id,
                    type: 'club'
                });
            }

            Router.go('/');
            Meteor.setTimeout(done, 200);
        });
    });

    beforeEach(waitForRouter);

    afterEach(function (done) {
        Meteor.logout(function () {
            expect(Meteor.userId()).toBeNull();

            // Reset context to 'Karlsruhe A'
            if (Session.get('context').id === Clubs.findOne({name: 'KIT SC'})._id) {
                Session.set('context', {
                    id: Teams.findOne({name: 'Karlsruhe A'})._id,
                    type: 'team'
                });
            }
            Meteor.setTimeout(done, 2000);
        });
    });

    describe('Event responses', function () {
        it('should show seven different tables', function (done) {
            Router.go('/events/details/' + Events.findOne({title: 'Today event (Karlsruhe A)'})._id);
            Meteor.setTimeout(function () {
                var responsesDiv = $('div#responses');
                expect(responsesDiv.length).toBe(1);
                expect(responsesDiv.find('table').length).toBe(7);
                done();
            }, 500);
        });
        it('should have 5 tables within the attending div with at least one row in each table', function (done) {
            Router.go('/events/details/' + Events.findOne({title: 'Today event (Karlsruhe A)'})._id);
            Meteor.setTimeout(function () {
                var $attendingTables = $('#responses').find('div#attending table');
                expect($attendingTables.length).toBe(5);
                $attendingTables.each(function (index, table) {
                    expect($(table).find('tbody tr').length).toBeGreaterThan(0);
                });
                done();
            }, 500);
        });
        it('should have 1 rows in the not attending and 0 in the unknown table', function (done) {
            Router.go('/events/details/' + Events.findOne({title: 'Today event (Karlsruhe A)'})._id);
            Meteor.setTimeout(function () {
                var responsesDiv = $('div#responses'),
                    notAttendingTable = responsesDiv.find('table#not-attending'),
                    unknownTable = responsesDiv.find('table#unknown');
                expect(notAttendingTable.find('tbody tr').length).toBe(1);
                expect(unknownTable.find('tbody tr').length).toBe(1);
                done();
            }, 500);
        });
        it('should have an \'attending-summary\' div containing info about total number of people attending and by team' +
            'when showing a department event', function (done) {
            Router.go('/events/details/' + Events.findOne({title: 'Today event (Lacrosse)'})._id);
            Meteor.setTimeout(function () {
                var attendingSummaryDiv = $('div#attending-summary');
                expect(attendingSummaryDiv.find('p#attending-total')).toContainText('1');

                // This fails currently as the 'Damen' team is still in the client's cache, after
                // logging in as Laura in a test before. Error: Expected 4 to be 3.
                expect(attendingSummaryDiv.find('ul#attending-by-team li').length).toBe(3);
                expect(attendingSummaryDiv.find('ul#attending-by-department').length).toBe(0);
                done();
            }, 500);
        });
        it('should have an \'attending-summary\' div containing info about total number of people attending and by ' +
            'department when showing a club event', function (done) {
            Router.go('/events/details/' + Events.findOne({title: 'Today event (KIT SC)'})._id);
            Meteor.setTimeout(function () {
                var attendingSummaryDiv = $('div#attending-summary');
                expect(attendingSummaryDiv.find('p#attending-total')).toContainText('1');
                expect(attendingSummaryDiv.find('ul#attending-by-team').length).toBe(0);
                expect(attendingSummaryDiv.find('ul#attending-by-department li').length).toBe(1);
                done();
            }, 500);
        });
    });
});