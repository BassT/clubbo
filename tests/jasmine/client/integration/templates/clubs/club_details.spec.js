/*global
    describe, beforeEach, Meteor, expect, afterEach, it, Router, $, Clubs, Roles
 */

describe('Club details', function () {
    'use strict';
    beforeEach(function (done) {
        Meteor.loginWithPassword('richter@karlsruhe-lacrosse.de', '20077002', function (error) {
            expect(error).toBeUndefined();
            expect(Meteor.userId()).not.toBeNull();
            Router.go('/');
            Meteor.setTimeout(function () {
                Router.go('/clubs/' + Meteor.user().profile.clubIds[0]);
                Meteor.setTimeout(done, 200);
            }, 200);
        });
    });
    afterEach(function (done) {
        Meteor.logout(function () {
            expect(Meteor.userId()).toBeNull();
            Meteor.setTimeout(done, 2000);
        });
    });

    it('should show the club\'s name as heading', function (done) {
        Meteor.setTimeout(function () {
            expect($('h1').text()).toEqual(Clubs.findOne(Meteor.user().profile.clubIds[0]).name);
            done();
        }, 200);
    });

    describe('Members list', function () {
        it('should show a list of the club\'s members with its\' members', function (done) {
            Meteor.setTimeout(function () {
                var $membersTable = $('table#members');
                expect($membersTable.length).toBe(1);
                expect($membersTable.find('tbody tr').length)
                    .toBe(Clubs.findOne(Meteor.user().profile.clubIds[0]).userIds.length);
                done();
            }, 200);
        });
        it('should link the table rows to the profile of the members', function (done) {
            Meteor.setTimeout(function () {
                var $firstRow, firstName;
                $firstRow = $($('table#members').find('tbody tr')[0]);
                firstName = $($firstRow.find('td')[0]).text();
                $firstRow.click();
                Meteor.setTimeout(function () {
                    expect($('h1')).toContainText(firstName);
                    done();
                }, 200);
            });
        });
        it('should add or remove a user to the admin role', function (done) {
            var $membersTable, $tableRow, $adminButton, wasAdmin;
            $membersTable = $('table#members');
            $tableRow = $membersTable.find('tbody tr[data-user-id!="' + Meteor.userId() + '"]:first');
            $adminButton = $tableRow.find('.admin');
            wasAdmin = $adminButton.hasClass('btn-primary');
            $adminButton.find('.fa').click();
            Meteor.setTimeout(function () {
                if (wasAdmin) {
                    expect(Roles.userIsInRole($tableRow.data('userId'), 'admin', Meteor.user().profile.clubIds[0])).toBe(false);
                    expect($adminButton.hasClass('btn-primary')).toBe(false);
                } else {
                    expect(Roles.userIsInRole($tableRow.data('userId'), 'admin', Meteor.user().profile.clubIds[0])).toBe(true);
                    expect($adminButton.hasClass('btn-primary')).toBe(true);
                }
                $adminButton.find('.fa').click();
                Meteor.setTimeout(function () {
                    if (wasAdmin) {
                        expect(Roles.userIsInRole($tableRow.data('userId'), 'admin', Meteor.user().profile.clubIds[0])).toBe(true);
                        expect($adminButton.hasClass('btn-primary')).toBe(true);
                    } else {
                        expect(Roles.userIsInRole($tableRow.data('userId'), 'admin', Meteor.user().profile.clubIds[0])).toBe(false);
                        expect($adminButton.hasClass('btn-primary')).toBe(false);
                    }
                    done();
                }, 200);
            }, 200);
        });
    });

    describe('Departments list', function () {
        it('should show a list of the club\'s departments with its\' departments', function (done) {
            Meteor.setTimeout(function () {
                var $departmentsTable = $('table#departments');
                expect($departmentsTable.length).toBe(1);
                expect($departmentsTable.find('tbody tr').length)
                    .toBe(Clubs.findOne(Meteor.user().profile.clubIds[0]).departmentIds.length);
                done();
            }, 200);
        });
        it('should link the table rows to the departments\'s detail page', function (done) {
            Meteor.setTimeout(function () {
                var $firstRow, departmentName;
                $firstRow = $($('table#departments').find('tbody tr')[0]);
                departmentName = $($firstRow.find('td')[0]).text();
                $firstRow.click();
                Meteor.setTimeout(function () {
                    expect($('h1')).toContainText(departmentName);
                    done();
                }, 200);
            });
        });
    });

    describe('Teams list', function () {
        it('should show a list of the club\'s teams with its\' teams', function (done) {
            Meteor.setTimeout(function () {
                var $teamsTable = $('table#teams');
                expect($teamsTable.length).toBe(1);
                expect($teamsTable.find('tbody tr').length)
                    .toBe(Clubs.findOne(Meteor.user().profile.clubIds[0]).teamIds.length);
                done();
            }, 200);
        });
        it('should link the table rows to the team\'s detail page', function (done) {
            Meteor.setTimeout(function () {
                var $firstRow, teamName;
                $firstRow = $($('table#teams').find('tbody tr')[0]);
                teamName = $($firstRow.find('td')[0]).text();
                $firstRow.click();
                Meteor.setTimeout(function () {
                    expect($('h1')).toContainText(teamName);
                    done();
                }, 200);
            });
        });
    });

    describe('Experienced bugs', function () {
        /*
         * When navigating to the clubDetails template from a user who is member in another club, the members,
         * departments and teams from the other club were also shown in the tables. This should not happen, we still
         * only want the members, departments and teams of the current club only to be displayed in the tables.
         */
        it('should show only the current club\'s members, departments and teams when coming from a user who is ' +
            'a member in another club', function (done) {
            Router.go('/users/details/' + Meteor.users.findOne({'profile.firstName': 'Laura'})._id);
            Meteor.setTimeout(function () {
                Router.go('/clubs/' + Meteor.user().profile.clubIds[0]);
                Meteor.setTimeout(function () {
                    expect($('#members').find('tbody tr').length)
                        .toBe(Clubs.findOne(Meteor.user().profile.clubIds[0]).userIds.length);
                    expect($('#departments').find('tbody tr').length)
                        .toBe(Clubs.findOne(Meteor.user().profile.clubIds[0]).departmentIds.length);
                    expect($('#teams').find('tbody tr').length)
                        .toBe(Clubs.findOne(Meteor.user().profile.clubIds[0]).teamIds.length);
                    done();
                }, 200);
            }, 200);
        });
    });

});