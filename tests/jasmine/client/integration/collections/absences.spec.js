/*global
    Router, afterAll, Absences, describe, beforeEach, Meteor, expect, $, moment, _, afterEach, it, waitForRouter,
    Events, Teams
 */
describe('Absences', function () {
    'use strict';
    beforeEach(function (done) {
        Meteor.loginWithPassword('richter@karlsruhe-lacrosse.de', '20077002', function (err) {
            expect(err).toBeUndefined();
            expect(Meteor.userId()).not.toBeNull();
            Router.go('/');
            Meteor.setTimeout(done, 200);
        });
    });

    beforeEach(waitForRouter);

    afterEach(function (done) {
        Meteor.logout(function () {
            expect(Meteor.userId()).toBeNull();
            Meteor.setTimeout(done, 2000);
        });
    });

    describe('Absences deletion', function () {
        it('should show a confirm box to delete an absence when an absence in the absence list is clicked', function (done) {
            // Navigate to user profile.
            Router.go('/users/details/' + Meteor.userId());
            Meteor.setTimeout(function () {

                var body = $('body'),
                    absencesList = body.find('#absences-list'),
                    confirmBootbox;
                expect(absencesList.find('tbody tr').length).toBe(1);

                // Click on an absence in the absence list.
                absencesList.find('tbody tr').click();

                Meteor.setTimeout(function () {

                    confirmBootbox = body.find('.bootbox-confirm');
                    expect(confirmBootbox.length).toBe(1);

                    // Confirm deletion of absences.
                    confirmBootbox.find('button[data-bb-handler="confirm"]').click();

                    Meteor.setTimeout(function () {

                        // No absences should be left.
                        expect(body.find('#absences-list').length).toBe(0);

                        // Re-add absence.
                        Absences.insert({
                            userId: Meteor.users.findOne({'profile.firstName': 'Sebastian'})._id,
                            start: moment().startOf('month').toDate(),
                            end: moment().endOf('month').toDate(),
                            note: 'Abwesend'
                        }, function (error, id) {
                            expect(error).toBeUndefined();
                            expect(id).not.toBeNull();
                            done();
                        });
                    }, 300);
                }, 300);
            }, 500);
        });
    });

    describe('Absence display', function () {

        it('should show the mail icon in the attendance list for the event today', function (done) {
            Router.go('/events/details/' + Events.findOne({title: 'Today event (Karlsruhe A)'})._id);
            Meteor.setTimeout(function () {
                var notAttendingTable;

                expect($('h1').text().indexOf('Today event')).not.toBe(-1);

                notAttendingTable = $('table#not-attending');
                expect(notAttendingTable.find('tbody tr').length).toBe(1);
                expect(notAttendingTable.find('tbody tr span.message').length).toBe(1);

                done();
            }, 500);
        });

        it('should not show the mail icon in the attendance list for the past event', function (done) {
            Router.go('/events/details/' + Events.findOne({title: 'Past event'})._id);
            Meteor.setTimeout(function () {
                var unknownTable = $('table#unknown');

                expect($('h1').text().indexOf('Past event')).not.toBe(-1);

                expect(unknownTable.find('tbody tr').length).toBe(Meteor.users.find().count());
                expect(unknownTable.find('tbody tr span.message').length).toBe(0);
                done();
            }, 500);
        });

        it('should not show the mail icon in the attendance list for the future event', function (done) {
            Router.go('/events/details/' + Events.findOne({title: 'Future event'})._id);
            Meteor.setTimeout(function () {
                var unknownTable = $('table#unknown');

                expect($('h1').text().indexOf('Future event')).not.toBe(-1);

                expect(unknownTable.find('tbody tr').length).toBe(Meteor.users.find().count());
                expect(unknownTable.find('tbody tr span.message').length).toBe(0);
                done();
            }, 500);
        });

    });

    describe('User details', function () {
        beforeEach(function () {
            Router.go('/users/details/' + Meteor.userId());
        });

        it('should have a div with the heading \'Abwesenheiten\' in the user profile', function (done) {
            Meteor.setTimeout(function () {
                expect($('#absences').text().indexOf('Abwesenheiten')).not.toBe(-1);
                done();
            }, 1000);
        });

        it('should show a table containing the users absences', function (done) {
            var absencesList;
            Meteor.setTimeout(function () {
                absencesList = $('#absences').find('table#absences-list');
                expect(absencesList.length).toBe(1);
                expect(absencesList.find('tbody tr').length).toBe(1);
                done();
            }, 500);
        });

        it('should show a \'new absence\' button if the current user equals the shown user', function (done) {
            Meteor.setTimeout(function () {
                expect($('#absences').find('a#new-absence').length).toBe(1);
                done();
            }, 500);
        });

        it('should not show a \'new absence\' button if the current user is different from the shown user', function (done) {
            Router.go('/users'); // First go to users to get all users from the server
            Meteor.setTimeout(function () {
                Router.go('/users/details/' + Meteor.users.findOne({'profile.firstName': 'Raphael'})._id);
                Meteor.setTimeout(function () {
                    expect($('#absences').find('a#new-absence').length).toBe(0);
                    done();
                }, 300);
            }, 300);
        });
        it('should not show an absence whose end date is in the past', function (done) {
            Absences.insert({
                userId: Meteor.userId(),
                start: moment().subtract(2, 'months').startOf('month').toDate(),
                end: moment().subtract(2, 'months').toDate(),
                note: 'Past absence'
            }, function (error, id) {
                expect(error).toBeUndefined();
                expect(id).not.toBeNull();
                Meteor.setTimeout(function () {
                    expect($('#absences').find('tbody tr').length).toBe(1);
                    Absences.remove(id, function (error, removed) {
                        expect(error).toBeUndefined();
                        expect(removed).toBe(1);
                        done();
                    });
                }, 300);
            });
        });
    });

    describe('Absence creation', function () {
        beforeEach(function () {
            Router.go('/absences/create');
        });

        it('should show a form with two datepickers and a text input', function (done) {
            Meteor.setTimeout(function () {
                var form = $('form');
                expect(form.length).toBe(1);
                expect(form.find('.datepicker').length).toBe(2);
                expect(form.find('input[type=text]').length).toBe(1);
                done();
            }, 500);
        });

        it('should add an absence and go back to user details on submit', function (done) {
            Meteor.setTimeout(function () {
                // Fill in form and submit new absence.
                var form = $('form');
                form.find('#start').datepicker('update', moment().add(1, 'month').startOf('month').toDate());
                form.find('#end').datepicker('update', moment().add(1, 'month').startOf('month').add(1, 'day').toDate());
                form.find('#note').val('test urlaub');
                form.submit();

                // Wait until user details are shown and check for added absence in table.
                Meteor.setTimeout(function () {
                    var absences = $('#absences');
                    expect(absences.find('tbody tr').length).toBe(2);
                    expect(absences).toContainText('test urlaub');
                    Absences.remove(Absences.findOne({note: 'test urlaub'})._id, function (error, removed) {
                        expect(error).toBeUndefined();
                        expect(removed).toBe(1);
                        done();
                    });
                }, 500);
            }, 500);
        });
    });

});