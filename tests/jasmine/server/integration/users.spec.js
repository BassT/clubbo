/*global
    Users, describe, it, expect, Departments, Accounts, Meteor, afterAll, Clubs, afterEach, Teams
 */

describe('Users collection', function () {
    'use strict';
    afterEach(function () {
        Meteor.users.remove({'profile.firstName': 'Error'});
    });

    describe('Club - department relation', function () {
        it('should throw an error when trying to insert a user who is a member of a department but not of a club', function () {
            expect(function() {
                Accounts.createUser({
                    email: 'error@karlsruhe-lacrosse.de',
                    password: '20077002',
                    profile: {
                        firstName: 'Error',
                        lastName: 'User',
                        departmentIds: [Departments.findOne({name: 'Lacrosse'})._id]
                    }
                });
            }).toThrow();
        });
        it('should throw an error when trying to insert a user who is member of a department but only a member of ' +
            'an unrelated club', function () {
            expect(function() {
                Accounts.createUser({
                    email: 'error@karlsruhe-lacrosse.de',
                    password: '20077002',
                    profile: {
                        firstName: 'Error',
                        lastName: 'User',
                        clubIds: [Clubs.findOne({name: 'Vfl Sindelfingen'})._id],
                        departmentIds: [Departments.findOne({name: 'Lacrosse'})._id]
                    }
                });
            }).toThrow();
        });
        it('should not throw an error when trying to insert a user who is member of a department and of the correct' +
            'parent club', function () {
            expect(function() {
                Accounts.createUser({
                    email: 'error@karlsruhe-lacrosse.de',
                    password: '20077002',
                    profile: {
                        firstName: 'Error',
                        lastName: 'User',
                        clubIds: [Clubs.findOne({name: 'KIT SC'})._id],
                        departmentIds: [Departments.findOne({name: 'Lacrosse'})._id]
                    }
                });
            }).not.toThrow();
        });
    });

    describe('Team - department relation', function () {
        it('should throw an error when trying to insert a user who is a member of a team but not of a department', function () {
            expect(function() {
                Accounts.createUser({
                    email: 'error@karlsruhe-lacrosse.de',
                    password: '20077002',
                    profile: {
                        firstName: 'Error',
                        lastName: 'User',
                        teamIds: [Teams.findOne({name: 'Karlsruhe A'})._id]
                    }
                });
            }).toThrow();
        });
        it('should throw an error when trying to insert a user who is member of a team but only a member of ' +
            'an unrelated department', function () {
            expect(function() {
                Accounts.createUser({
                    email: 'error@karlsruhe-lacrosse.de',
                    password: '20077002',
                    profile: {
                        firstName: 'Error',
                        lastName: 'User',
                        clubIds: [Clubs.findOne({name: 'KIT SC'})._id],
                        departmentIds: [Departments.findOne({name: 'Lacrosse'})._id],
                        teamIds: [Teams.findOne({name: 'Talentteam Damen'})._id]
                    }
                });
            }).toThrow();
        });
        it('should not throw an error when trying to insert a user who is member of a team and of the correct' +
            'parent department', function () {
            expect(function() {
                Accounts.createUser({
                    email: 'error@karlsruhe-lacrosse.de',
                    password: '20077002',
                    profile: {
                        firstName: 'Error',
                        lastName: 'User',
                        clubIds: [Clubs.findOne({name: 'KIT SC'})._id],
                        departmentIds: [Departments.findOne({name: 'Lacrosse'})._id],
                        teamIds: [Teams.findOne({name: 'Karlsruhe A'})._id]
                    }
                });
            }).not.toThrow();
        });
    });
});