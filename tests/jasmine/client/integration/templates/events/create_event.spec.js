/*global
    describe, it, $, afterEach, beforeEach, _, Meteor, expect, Router, Roles, Clubs, Departments, Teams
 */

describe('Create event', function () {
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

    describe('Context sensitivity', function () {
        it('should have three selects in the context div', function (done) {
            var $contextDiv;

            $contextDiv = $('#context');
            expect($contextDiv.length).toBe(1);
            expect($contextDiv.find('select').length).toBe(3);

            done();
        });
        it('should only show clubs, departments and teams where the user is a member of', function (done) {
            var $clubSelect, $clubOption, clubIds, departmentIds, $departmentSelect, $departmentOption, teamIds,
                $teamSelect, $teamOption, $context;

            $context = $('#context');

            // Check clubs
            clubIds = Meteor.user().profile.clubIds;
            $clubSelect = $context.find('select#club');
            $clubSelect.find('option').each(function(index, option) {
                $clubOption = $(option);
                expect(clubIds).toContain($clubOption.val());
            });
            
            // Check departments
            departmentIds = Meteor.user().profile.departmentIds;
            departmentIds.push('null');
            $departmentSelect = $context.find('select#department');
            $departmentSelect.find('option').each(function(index, option) {
                $departmentOption = $(option);
                expect(departmentIds).toContain($departmentOption.val());
            });
            
            // Check teams
            teamIds = Meteor.user().profile.teamIds;
            teamIds.push('null');
            $teamSelect = $context.find('select#team');
            $teamSelect.find('option').each(function(index, option) {
                $teamOption = $(option);
                expect(teamIds).toContain($teamOption.val());
            });

            done();
        });
        it('should allow selection of clubs, departments and teams only where the user is an admin', function (done) {
            var contextIds, userGroups, i, enabledContexts, disabledContexts, predicate, contextId, $context;

            contextIds = _.pluck(_.union(
                Clubs.find({_id: {$in: Meteor.user().profile.clubIds}}).fetch(),
                Departments.find({_id: {$in: Meteor.user().profile.departmentIds}}).fetch(),
                Teams.find({_id: {$in: Meteor.user().profile.teamIds}}).fetch()
            ), '_id');
            userGroups = Roles.getGroupsForUser(Meteor.user());

            predicate = function (userGroup) {
                return userGroup === contextId;
            };

            enabledContexts = [];
            disabledContexts = [];

            // Split context ids into enabled and disabled contexts
            for (i = 0; i < contextIds.length; i = i + 1) {
                contextId = contextIds[i];
                if (_.some(userGroups, predicate)) {
                    enabledContexts.push(contextId);
                } else {
                    disabledContexts.push(contextId);
                }
            }

            // Check selectability of options
            $context = $('#context');
            for (i = 0; i < enabledContexts.length; i = i + 1) {
                expect($context.find('option[value=' + enabledContexts[i] + ']').prop('disabled')).toBe(false);
            }
            for (i = 0; i < disabledContexts.length; i = i + 1) {
                expect($context.find('option[value=' + disabledContexts[i] + ']').prop('disabled')).toBe(true);
            }

            done();
        });
        it('should also select implicit contexts when a context is selected', function (done) {
            var $contextDiv, $clubSelect, $departmentSelect, $teamSelect;

            $contextDiv = $('#context');

            $clubSelect = $contextDiv.find('select#club');
            expect($clubSelect.find('option').length).toBe(3);

            $departmentSelect = $contextDiv.find('select#department');
            $teamSelect = $contextDiv.find('select#team');

            // Expect club 'Rheinbrüder'
            expect($clubSelect.val()).toBe(Clubs.findOne()._id);

            // Select team 'Karlsruhe A'
            $teamSelect.val(Teams.findOne({name: 'Karlsruhe A'})._id);
            $teamSelect.trigger('change');

            Meteor.setTimeout(function () {
                // Expect that club 'KIT SC' and department 'Lacrosse' are selected
                expect($clubSelect.val()).toBe(Clubs.findOne({name: 'KIT SC'})._id);
                expect($departmentSelect.val()).toBe(Departments.findOne({name: 'Lacrosse'})._id);

                // Select club 'Rheinbrüder'
                $clubSelect.val(Clubs.findOne({name: 'Rheinbrüder'})._id);
                $clubSelect.trigger('change');

                Meteor.setTimeout(function () {
                    // Expect that no departments and teams are selected
                    expect($departmentSelect.val()).toBe('null');
                    expect($teamSelect.val()).toBe('null');

                    done();
                }, 100);
            }, 100);
        });
    });
});