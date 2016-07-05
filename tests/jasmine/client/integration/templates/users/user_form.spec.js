/*global
    describe, Template, $, _, Meteor, afterEach, beforeEach, Clubs, Teams, Departments, it, expect, Router, Roles
 */

describe('User form', function () {
    'use strict';

    beforeEach(function (done) {
        Meteor.loginWithPassword('richter@karlsruhe-lacrosse.de', '20077002', function (error) {
            expect(error).toBeUndefined();
            expect(Meteor.user()).not.toBeNull();

            Router.go('/users/create');

            Meteor.setTimeout(done, 200);
        });
    });

    afterEach(function (done) {
        Meteor.logout(function () {
            expect(Meteor.user()).toBeNull();
            Router.go('/');

            Meteor.setTimeout(done, 2000);
        });
    });

    describe('Context div', function () {
        it('should have a div with the id \'context\' which has three divs with at least one checkbox each', function (done) {
            var $contextDiv, $innerDivs;

            $contextDiv = $('#context');
            expect($contextDiv.length).toBe(1);

            $innerDivs = $contextDiv.find('div');
            expect($innerDivs.length).toBe(3);

            $innerDivs.each(function (index, elem) {
                expect($(elem).find('input[type=checkbox]').length).toBeGreaterThan(0);
            });

            done();
        });
        it('should disable clubs, departments and teams where the current user is not an admin', function (done) {
            var $contextDiv, clubs, clubsWhereAdmin, clubsWhereNotAdmin, departments, departmentsWhereAdmin, 
                departmentsWhereNotAdmin, teams, teamsWhereAdmin, teamsWhereNotAdmin, i;

            clubs = Clubs.find({_id: {$in: Meteor.user().profile.clubIds}}).fetch();
            clubsWhereAdmin = [];
            clubsWhereNotAdmin = [];
            for (i = 0; i < clubs.length; i = i + 1) {
                if (Roles.userIsInRole(Meteor.user(), ['admin'], clubs[i]._id)) {
                    clubsWhereAdmin.push(clubs[i]);
                } else {
                    clubsWhereNotAdmin.push(clubs[i]);
                }
            }

            departments = Departments.find({_id: {$in: Meteor.user().profile.departmentIds}}).fetch();
            departmentsWhereAdmin = [];
            departmentsWhereNotAdmin = [];
            for (i = 0; i < departments.length; i = i + 1) {
                if (Roles.userIsInRole(Meteor.user(), ['admin'], departments[i]._id) ||
                    Roles.userIsInRole(Meteor.user(), ['admin'], departments[i].clubId)) {
                    departmentsWhereAdmin.push(departments[i]);
                } else {
                    departmentsWhereNotAdmin.push(departments[i]);
                }
            }

            teams = Teams.find({_id: {$in: Meteor.user().profile.teamIds}}).fetch();
            teamsWhereAdmin = [];
            teamsWhereNotAdmin = [];
            for (i = 0; i < teams.length; i = i + 1) {
                if (Roles.userIsInRole(Meteor.user(), ['admin'], teams[i]._id) ||
                    Roles.userIsInRole(Meteor.user(), ['admin'], teams[i].departmentId) ||
                    Roles.userIsInRole(Meteor.user(), ['admin'], teams[i].clubId)) {
                    teamsWhereAdmin.push(teams[i]);
                } else {
                    teamsWhereNotAdmin.push(teams[i]);
                }
            }

            $contextDiv = $('#context');
            expect(clubsWhereAdmin.length).toBeGreaterThan(0);
            _.each(clubsWhereAdmin, function (club) {
                expect($contextDiv.find('input[value=' + club._id + ']').prop('disabled')).toBeFalsy();
            });

            expect(clubsWhereNotAdmin.length).toBeGreaterThan(0);
            _.each(clubsWhereNotAdmin, function (club) {
                expect($contextDiv.find('input[value=' + club._id + ']').prop('disabled')).toBeTruthy();
            });

            expect(departmentsWhereAdmin.length).toBeGreaterThan(0);
            _.each(departmentsWhereAdmin, function (department) {
                expect($contextDiv.find('input[value=' + department._id + ']').prop('disabled')).toBeFalsy();
            });

            expect(departmentsWhereNotAdmin.length).toBeGreaterThan(0);
            _.each(departmentsWhereNotAdmin, function (department) {
                expect($contextDiv.find('input[value=' + department._id + ']').prop('disabled')).toBeTruthy();
            });

            expect(teamsWhereAdmin.length).toBeGreaterThan(0);
            _.each(teamsWhereAdmin, function (team) {
                expect($contextDiv.find('input[value=' + team._id + ']').prop('disabled')).toBeFalsy();
            });

            expect(teamsWhereNotAdmin.length).toBeGreaterThan(0);
            _.each(teamsWhereNotAdmin, function (team) {
                expect($contextDiv.find('input[value=' + team._id + ']').prop('disabled')).toBeTruthy();
            });

            done();
        });
        it('should select implicit clubs or departments, when a team or department is (un)checked', function (done) {
            var $contextDiv, $karlsruheACheckbox, $lacrosseCheckbox, $kitScCheckbox, $paddelnCheckbox,
                $rheinbruederCheckbox;

            $contextDiv = $('#context');

            expect($contextDiv.find('input:checked').length).toBe(0);

            // Check team 'Karlsruhe A'
            $karlsruheACheckbox = $contextDiv.find('input[value=' + Teams.findOne({name: 'Karlsruhe A'})._id + ']');
            $karlsruheACheckbox.prop('checked', true);
            $karlsruheACheckbox.trigger('change');
            Meteor.setTimeout(function () {
                expect($contextDiv.find('input:checked').length).toBe(3);

                $lacrosseCheckbox = $contextDiv.find('input[value=' + Departments.findOne({name: 'Lacrosse'})._id + ']');
                expect($lacrosseCheckbox.prop('checked')).toBeTruthy();

                $kitScCheckbox = $contextDiv.find('input[value=' + Clubs.findOne({name: 'KIT SC'})._id + ']');
                expect($kitScCheckbox.prop('checked')).toBeTruthy();

                // Check department 'Paddeln'
                $paddelnCheckbox = $contextDiv.find('input[value=' + Departments.findOne({name: 'Paddeln'})._id + ']');
                $paddelnCheckbox.prop('checked', true);
                $paddelnCheckbox.trigger('change');
                Meteor.setTimeout(function () {
                    expect($contextDiv.find('input:checked').length).toBe(5);

                    $rheinbruederCheckbox = $contextDiv.find('input[value=' + Clubs.findOne({name: 'Rheinbrüder'})._id + ']');
                    expect($rheinbruederCheckbox.prop('checked')).toBeTruthy();

                    // Uncheck club 'KIT SC'
                    $kitScCheckbox.prop('checked', false);
                    $kitScCheckbox.trigger('change');
                    Meteor.setTimeout(function () {
                        expect($contextDiv.find('input:checked').length).toBe(2);
                        expect($lacrosseCheckbox.prop('checked')).toBeFalsy();
                        expect($karlsruheACheckbox.prop('checked')).toBeFalsy();

                        // Uncheck department 'Paddeln'
                        $paddelnCheckbox.prop('checked', false);
                        $paddelnCheckbox.trigger('change');
                        Meteor.setTimeout(function () {
                            expect($contextDiv.find('input:checked').length).toBe(1);
                            expect($rheinbruederCheckbox.prop('checked')).toBeTruthy();

                            done();
                        }, 100);
                    }, 100);
                }, 100);
            }, 100);
        });
    });
});