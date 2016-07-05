/*global
    describe, beforeEach, Meteor, expect, waitForRouter, afterEach, Router, $, _, it, Events, moment, Tags, Responses,
    Session, Teams, Departments, Clubs
 */

describe('User list', function () {
    'use strict';
    beforeEach(function (done) {
        Meteor.loginWithPassword('richter@karlsruhe-lacrosse.de', '20077002', function (error) {
            expect(error).toBeUndefined();
            expect(Meteor.userId()).not.toBeNull();

            Router.go('/users');

            done();
        });
    });

    beforeEach(waitForRouter);

    afterEach(function (done) {
        Meteor.logout(function () {
            expect(Meteor.userId()).toBeNull();
            Router.go('/');
            Meteor.setTimeout(done, 1500);
        });
    });

    describe('Context sensitivity', function () {
        it('should only show the team\'s members when the current context is a team', function (done) {
            var currentContext, $userTableRows, userIds, userId, user, teamMembers, departmentMembers, clubMembers;

            teamMembers = 0;
            departmentMembers = 0;
            clubMembers = 0;

            Meteor.setTimeout(function () {
                currentContext = Session.get('context');
                expect(currentContext.type).toBe('team');

                userIds = Teams.findOne(currentContext.id).userIds;

                $userTableRows = $('#users-table').find('tbody tr');
                expect($userTableRows.length).toBeGreaterThan(0);

                $userTableRows.each(function (index) {
                    userId = $($userTableRows[index]).data('userId');
                    expect(userIds).toContain(userId);

                    user = Meteor.users.findOne(userId);
                    if (user.profile.teamIds && user.profile.teamIds.length > 0) {
                        teamMembers = teamMembers + 1;
                    } else if (user.profile.departmentIds && user.profile.departmentIds.length > 0) {
                        departmentMembers = departmentMembers + 1;
                    } else  if (user.profile.clubIds && user.profile.clubIds.length > 0) {
                        clubMembers = clubMembers + 1;
                    }
                });

                expect(teamMembers).toBeGreaterThan(0);
                expect(departmentMembers).toBe(0);
                expect(clubMembers).toBe(0);

                done();
            }, 200);
        });
        it('should show the current department\'s members and the members of the department\'s teams where the current' +
            'user is a member of', function (done) {
            var initialContext, currentContext, departmentUserIds, department, teams, $userTableRows, departmentMembers,
                clubMembers, teamMembers, teamUserIds, userIds, userId, user;

            // Initialize counters
            teamMembers = 0;
            departmentMembers = 0;
            clubMembers = 0;

            Meteor.setTimeout(function () {
                initialContext = Session.get('context');
                Session.set('context', {type: 'department', id: Meteor.user().profile.departmentIds[0]});

                Meteor.setTimeout(function () {
                    currentContext = Session.get('context');
                    expect(currentContext.type).toBe('department');

                    // Collect user ids from current department
                    department = Departments.findOne(currentContext.id);
                    departmentUserIds = department.userIds;

                    // Collect user ids from the current department's teams where the user is a member of
                    teams = Teams.find({$and: [
                        {_id: {$in: department.teamIds}},
                        {_id: {$in: Meteor.user().profile.teamIds}}
                    ]}).fetch();
                    teamUserIds = _.pluck(teams, 'userIds');
                    teamUserIds = _.flatten(teamUserIds);

                    $userTableRows = $('#users-table').find('tbody tr');
                    expect($userTableRows.length).toBeGreaterThan(0);

                    // Expect that there are no users from non-relevant departments or teams
                    userIds = _.union(departmentUserIds, teamUserIds);
                    $userTableRows.each(function (index) {
                        userId = $($userTableRows[index]).data('userId');
                        expect(userIds).toContain(userId);

                        user = Meteor.users.findOne(userId);
                        if (user.profile.teamIds && user.profile.teamIds.length > 0) {
                            teamMembers = teamMembers + 1;
                        } else if (user.profile.departmentIds && user.profile.departmentIds.length > 0) {
                            departmentMembers = departmentMembers + 1;
                        } else  if (user.profile.clubIds && user.profile.clubIds.length > 0) {
                            clubMembers = clubMembers + 1;
                        }
                    });

                    expect(teamMembers).toBeGreaterThan(0);
                    expect(departmentMembers).toBeGreaterThan(0);
                    expect(clubMembers).toBe(0);

                    Session.set('context', initialContext);
                    Meteor.setTimeout(done, 200);
                }, 200);
            }, 200);
        });
        it('should show the current club\'s members and the members of the club\'s departments and teams where the' +
            'current user is a member of', function (done) {
            var initialContext, currentContext, departmentUserIds, teams, $userTableRows, departmentMembers,
                clubMembers, teamMembers, teamUserIds, userIds, userId, user, club, clubUserIds, departments;

            // Initialize counters
            teamMembers = 0;
            departmentMembers = 0;
            clubMembers = 0;

            Meteor.setTimeout(function () {
                initialContext = Session.get('context');
                Session.set('context', {type: 'club', id: Meteor.user().profile.clubIds[0]});

                Meteor.setTimeout(function () {
                    currentContext = Session.get('context');
                    expect(currentContext.type).toBe('club');

                    // Collect user ids from current club
                    club = Clubs.findOne(currentContext.id);
                    clubUserIds = club.userIds;

                    // Collect user ids from the current club's departments where the user is a member of
                    departments = Departments.find({$and: [
                        {_id: {$in: club.departmentIds}},
                        {_id: {$in: Meteor.user().profile.departmentIds}}
                    ]}).fetch();
                    departmentUserIds = _.pluck(departments, 'userIds');
                    departmentUserIds = _.flatten(departmentUserIds);

                    // Collect user ids from the current department's teams where the user is a member of
                    teams = Teams.find({$and: [
                        {_id: {$in: club.teamIds}},
                        {_id: {$in: Meteor.user().profile.teamIds}}
                    ]}).fetch();
                    teamUserIds = _.pluck(teams, 'userIds');
                    teamUserIds = _.flatten(teamUserIds);

                    $userTableRows = $('#users-table').find('tbody tr');
                    expect($userTableRows.length).toBeGreaterThan(0);

                    // Expect that there are no users from non-relevant departments or teams
                    userIds = _.union(clubUserIds, departmentUserIds, teamUserIds);
                    $userTableRows.each(function (index) {
                        userId = $($userTableRows[index]).data('userId');
                        expect(userIds).toContain(userId);

                        user = Meteor.users.findOne(userId);
                        if (user.profile.teamIds && user.profile.teamIds.length > 0) {
                            teamMembers = teamMembers + 1;
                        } else if (user.profile.departmentIds && user.profile.departmentIds.length > 0) {
                            departmentMembers = departmentMembers + 1;
                        } else  if (user.profile.clubIds && user.profile.clubIds.length > 0) {
                            clubMembers = clubMembers + 1;
                        }
                    });

                    expect(teamMembers).toBeGreaterThan(0);
                    expect(departmentMembers).toBeGreaterThan(0);
                    expect(clubMembers).toBeGreaterThan(0);

                    Session.set('context', initialContext);
                    Meteor.setTimeout(function () {
                        done();
                    }, 200);
                }, 200);
            }, 200);
        });
    });

    it('should contain a table with the id \'users-table\'', function (done) {
        Meteor.setTimeout(function (){
            expect($('body').find('table#users-table').length).toBe(1);
            done();
        }, 500);
    });

    describe('table headers', function () {
        it('should contain a column with the id \'practice-attendance\'', function (done) {
            Meteor.setTimeout(function () {
                expect($('body').find('#users-table thead th#practice-attendance').length).toBe(1);
                done();
            }, 500);
        });
    });

    describe('table body', function () {
        it('should contain a column with the class \'practice-attendance\'', function (done) {
            Meteor.setTimeout(function () {
                expect($('body').find('#users-table tbody td.practice-attendance').length).toBe(Meteor.users.find().count());
                done();
            }, 500);
        });
    });

    describe('practice attendance values', function () {
        it('should show \'100% (last month), 100% (this month)\' for the current user, \'0% (last month), 0% (this month)\' otherwise', function (done) {
            Meteor.setTimeout(function () {
                var $rows = $('#users-table').find('tbody tr'),
                    $row,
                    currentUserAttendanceString = '100% (' + moment().subtract(1, 'month').format('MMMM') + '), 100% (' + moment().format('MMMM') + ')',
                    otherUsersAttendanceString = '0% (' + moment().subtract(1, 'month').format('MMMM') + '), 0% (' + moment().format('MMMM') + ')';
                $rows.each(function (index, row) {
                    $row = $(row);
                    if ($row.data('userId') === Meteor.userId()) {
                        expect($row.find('td.practice-attendance').text()).toEqual(currentUserAttendanceString);
                    } else {
                        expect($row.find('td.practice-attendance').text()).toEqual(otherUsersAttendanceString);
                    }
                });
                done();
            }, 500);
        });
    });
});