/*global
    describe, it, beforeEach, afterEach, $, _, expect, Meteor, Router, Clubs, Departments, Teams, moment, Events,
    Session
 */

describe('Event visibility in eventForm template', function () {
    'use strict';

    beforeEach(function (done) {
        Meteor.loginWithPassword('richter@karlsruhe-lacrosse.de', '20077002', function (error) {
            expect(error).toBeUndefined();
            expect(Meteor.user()).not.toBeNull();

            Router.go('/events/create');
            Meteor.setTimeout(done, 200);
        });
    });

    afterEach(function (done) {
        Meteor.logout(function () {
            expect(Meteor.user()).toBeNull();
            Meteor.setTimeout(done, 2000);
        });
    });

    it('should have a div with the id \'visibility\' in the form', function (done) {
        expect($('form').find('#visibility').length).toBe(1);
        done();
    });

    it('should have three divs with the ids \'clubs\', \'deparments\' and \'teams\' within the ' +
        '\'visibility\' div', function (done) {
        var $visibilityDiv;
        $visibilityDiv = $('form').find('#visibility');
        expect($visibilityDiv.find('#clubs').length).toBe(1);
        expect($visibilityDiv.find('#departments').length).toBe(1);
        expect($visibilityDiv.find('#teams').length).toBe(1);
        done();
    });

    it('should have some checkboxes in the club, department and team visibility div', function (done) {
        var $visibilityDiv;
        $visibilityDiv = $('form').find('#visibility');
        expect($visibilityDiv.find('#clubs input[type=checkbox]').length).toBeGreaterThan(0);
        expect($visibilityDiv.find('#departments input[type=checkbox]').length).toBeGreaterThan(0);
        expect($visibilityDiv.find('#teams input[type=checkbox]').length).toBeGreaterThan(0);
        done();
    });

    it('should show all departments and teams of the clubs the current user is a member of, including those, ' +
        'departments and teams where he\'s not a member of', function (done) {
        var clubs, club, $visibilityDiv, $departmentsDiv, $teamsDiv, i, j;
        clubs = Clubs.find({_id: {$in: Meteor.user().profile.clubIds}}).fetch();
        $visibilityDiv = $('#visibility');
        for (i = 0; i < clubs.length; i = i + 1) {
            club = clubs[i];
            $departmentsDiv = $visibilityDiv.find('#departments');
            for (j = 0; j < club.departmentIds.length; j = j + 1) {
                expect($departmentsDiv.find('input[type=checkbox][data-context-id=' + club.departmentIds[j] + ']').length).toBe(1);
            }
            $teamsDiv = $visibilityDiv.find('#teams');
            for (j = 0; j < club.teamIds.length; j = j + 1) {
                expect($teamsDiv.find('input[type=checkbox][data-context-id=' + club.teamIds[j] + ']').length).toBe(1);
            }
        }
        done();
    });

    it('should select all corresponding departments and teams when a club is selected', function (done) {
        var $visibilityDiv, club;
        $visibilityDiv = $('#visibility');
        club = Clubs.findOne({name: 'KIT SC'});

        // All departments and teams should be unchecked
        _.each(club.departmentIds, function (departmentId) {
            expect($visibilityDiv.find('input[data-context-id="' + departmentId + '"]').prop('checked')).toBe(false);
        });
        _.each(club.teamIds, function (teamId) {
            expect($visibilityDiv.find('input[data-context-id="' + teamId + '"]').prop('checked')).toBe(false);
        });

        // Check club
        $visibilityDiv.find('#clubs')
            .find('input[data-context-id="' + club._id + '"]')
            .prop('checked', true)
            .trigger('change');

        // All departments and teams should be checked
        Meteor.setTimeout(function () {
            _.each(club.departmentIds, function (departmentId) {
                expect($visibilityDiv.find('input[data-context-id="' + departmentId + '"]').prop('checked')).toBe(true);
            });
            _.each(club.teamIds, function (teamId) {
                expect($visibilityDiv.find('input[data-context-id="' + teamId + '"]').prop('checked')).toBe(true);
            });
            done();
        }, 200);
    });

    it('should select all corresponding teams when a department is selected', function (done) {
        var $visibilityDiv, department;
        $visibilityDiv = $('#visibility');
        department = Departments.findOne({name: 'Lacrosse'});

        // All teams should be unchecked
        _.each(department.teamIds, function (teamId) {
            expect($visibilityDiv.find('input[data-context-id="' + teamId + '"]').prop('checked')).toBe(false);
        });

        // Check department
        $visibilityDiv.find('#departments')
            .find('input[data-context-id="' + department._id + '"]')
            .prop('checked', true)
            .trigger('change');

        // All teams should be checked
        Meteor.setTimeout(function () {
            _.each(department.teamIds, function (teamId) {
                expect($visibilityDiv.find('input[data-context-id="' + teamId + '"]').prop('checked')).toBe(true);
            });
            done();
        }, 200);
    });

    describe('createEvent', function () {
        afterEach(function (done) {
            var newEvent = Events.findOne({title: 'New event'});
            if (newEvent) {
                Events.remove(newEvent._id);
            }
            done();
        });

        it('should insert an event with the appropriate visibility', function (done) {
            var $form, newEventDoc, club;
            club = Clubs.findOne({name: 'KIT SC'});

            // Insert event
            $form = $('form');
            $form.find('#start-date').datepicker('setDate', moment().toDate());
            $form.find('#start-time').val('10:00');
            $form.find('#end-date').datepicker('setDate', moment().toDate());
            $form.find('#end-time').val('11:00');
            $form.find('#title').val('New event');
            $form.find('#responseRequired').val(false);
            $form.find('#background').val(false);
            $form.find('#visibility #clubs input[data-context-id=' + club._id + ']')
                .prop('checked', true)
                .trigger('change');
            console.info('Inserted form data');
            Meteor.setTimeout(function () {
                $form.submit();
                console.info('Submitted form.');

                // Check visibility
                Meteor.setTimeout(function () {
                    newEventDoc = Events.findOne({title: 'New event'});
                    console.info('Found new event in collection: ' + JSON.stringify(newEventDoc));
                    expect(newEventDoc).not.toBeNull();
                    expect(newEventDoc.visible).toContain(club._id);
                    _.each(club.departmentIds, function (departmentId) {
                        expect(newEventDoc.visible).toContain(departmentId);
                    });
                    _.each(club.teamIds, function (teamId) {
                        expect(newEventDoc.visible).toContain(teamId);
                    });
                    expect(newEventDoc.visible.length).toBe(club.departmentIds.length + club.teamIds.length + 1);
                    done();
                }, 200);
            }, 200);
        });
    });
});