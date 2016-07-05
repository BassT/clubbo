/*global
 describe, beforeEach, Meteor, expect, afterEach, it, Router, $, Clubs, Departments, Roles
 */

describe('Department details', function () {
    'use strict';
    beforeEach(function (done) {
        Meteor.loginWithPassword('richter@karlsruhe-lacrosse.de', '20077002', function (error) {
            expect(error).toBeUndefined();
            expect(Meteor.userId()).not.toBeNull();
            Router.go('/');
            Meteor.setTimeout(function () {
                Router.go('/departments/' + Departments.findOne({name: 'Lacrosse'})._id);
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

    it('should show the department\'s name as heading', function (done) {
        expect($('h1').text()).toEqual(Departments.findOne({name: 'Lacrosse'}).name);
        done();
    });

    describe('Members list', function () {
        it('should show a list of the department\'s members with some members', function (done) {
            var $membersTable = $('table#members');
            expect($membersTable.length).toBe(1);
            expect($membersTable.find('tbody tr').length)
                .toBe(Departments.findOne({name: 'Lacrosse'}).userIds.length);
            done();
        });
        it('should link the table rows to the profile of the members', function (done) {
            var $firstRow, firstName;
            $firstRow = $($('table#members').find('tbody tr')[0]);
            firstName = $($firstRow.find('td')[0]).text();
            $firstRow.click();
            Meteor.setTimeout(function () {
                expect($('h1')).toContainText(firstName);
                done();
            }, 200);
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
                    expect(Roles.userIsInRole($tableRow.data('userId'), 'admin', Departments.findOne({name: 'Lacrosse'})._id)).toBe(false);
                } else {
                    expect(Roles.userIsInRole($tableRow.data('userId'), 'admin', Departments.findOne({name: 'Lacrosse'})._id)).toBe(true);
                }
                $adminButton.find('.fa').click();
                Meteor.setTimeout(function () {
                    if (wasAdmin) {
                        expect(Roles.userIsInRole($tableRow.data('userId'), 'admin', Departments.findOne({name: 'Lacrosse'})._id)).toBe(true);
                    } else {
                        expect(Roles.userIsInRole($tableRow.data('userId'), 'admin', Departments.findOne({name: 'Lacrosse'})._id)).toBe(false);
                    }
                    done();
                }, 200);
            }, 200);
        });
    });

    describe('Teams list', function () {
        it('should show a list of the department\'s teams with some teams', function (done) {
            var $teamsTable = $('table#teams');
            expect($teamsTable.length).toBe(1);
            expect($teamsTable.find('tbody tr').length)
                .toBe(Departments.findOne({name: 'Lacrosse'}).teamIds.length);
            done();
        });
        it('should link the table rows to the team\'s detail page', function (done) {
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