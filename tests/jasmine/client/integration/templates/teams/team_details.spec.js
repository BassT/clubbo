/*global
    describe, beforeEach, Meteor, expect, afterEach, it, Router, $, Clubs, Teams, Roles
 */

describe('Team details', function () {
    'use strict';
    beforeEach(function (done) {
        Meteor.loginWithPassword('richter@karlsruhe-lacrosse.de', '20077002', function (error) {
            expect(error).toBeUndefined();
            expect(Meteor.userId()).not.toBeNull();
            Router.go('/');
            Meteor.setTimeout(function () {
                Router.go('/teams/' + Meteor.user().profile.teamIds[0]);
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

    it('should show the team\'s name as heading', function (done) {
        Meteor.setTimeout(function () {
            expect($('h1').text()).toEqual(Teams.findOne(Meteor.user().profile.teamIds[0]).name);
            done();
        }, 200);
    });

    describe('Members list', function () {
        it('should show a list of the team\'s members with some members', function (done) {
            Meteor.setTimeout(function () {
                var $membersTable = $('table#members');
                expect($membersTable.length).toBe(1);
                expect($membersTable.find('tbody tr').length)
                    .toBe(Teams.findOne(Meteor.user().profile.teamIds[0]).userIds.length);
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
                    expect(Roles.userIsInRole($tableRow.data('userId'), 'admin', Meteor.user().profile.teamIds[0])).toBe(false);
                } else {
                    expect(Roles.userIsInRole($tableRow.data('userId'), 'admin', Meteor.user().profile.teamIds[0])).toBe(true);
                }
                $adminButton.find('.fa').click();
                Meteor.setTimeout(function () {
                    if (wasAdmin) {
                        expect(Roles.userIsInRole($tableRow.data('userId'), 'admin', Meteor.user().profile.teamIds[0])).toBe(true);
                    } else {
                        expect(Roles.userIsInRole($tableRow.data('userId'), 'admin', Meteor.user().profile.teamIds[0])).toBe(false);
                    }
                    done();
                }, 200);
            }, 200);
        });
    });
});