/*global
    describe, beforeEach, Meteor, expect, it, afterEach, $, _, Router, Session, Teams, Departments, Clubs
 */

describe('Main layout', function () {
    'use strict';
    beforeEach(function (done) {
        Meteor.loginWithPassword('richter@karlsruhe-lacrosse.de', '20077002', function (error) {
            expect(error).toBeUndefined();
            expect(Meteor.userId()).not.toBeNull();
            Router.go('/');
            Meteor.setTimeout(done, 200);
        });
    });

    afterEach(function (done) {
        Meteor.logout(function () {
            expect(Meteor.userId()).toBeNull();
            Meteor.setTimeout(done, 2000);
        });
    });

    describe('Context dropdown', function () {
        it('should have a span with the id \'current-context\' equal to the current context', function (done) {
            var $currentContextSpan, contextType, contextId, currentContextName, currentContextPrefix;
            contextType = Session.get('context').type;
            contextId = Session.get('context').id;
            if (contextType === 'team') {
                currentContextName = Teams.findOne(contextId).name;
                currentContextPrefix = 'Team - ';
            } else if (contextType === 'department') {
                currentContextName = Departments.findOne(contextId).name;
                currentContextPrefix = 'Abteilung - ';
            } else if (contextType === 'club') {
                currentContextName = Clubs.findOne(contextId).name;
                currentContextPrefix = 'Verein - ';
            }
            $currentContextSpan = $('#current-context');
            expect($currentContextSpan.length).toBe(1);
            expect($currentContextSpan).toContainText(currentContextPrefix + currentContextName);
            done();
        });
        it('should have all other contexts of the current user in the dropdown', function (done) {
            var departments, clubs, $otherContextsDropdown, $link, teams;
            departments = Departments.find({_id: {$in: Meteor.user().profile.departmentIds}}).fetch();
            clubs = Clubs.find({_id: {$in: Meteor.user().profile.clubIds}}).fetch();
            teams = Teams.find({_id: {$in: Meteor.user().profile.teamIds}}).fetch();
            $otherContextsDropdown = $('#other-contexts-dropdown');
            _.each(departments, function (department) {
                $link = $otherContextsDropdown.find('a.other-context' +
                    '[data-context-type="department"]' +
                    '[data-context-id="' + department._id + '"]');
                expect($link.length).toBe(1);
                expect($link).toContainText('Abteilung - ' + department.name);
            });
            _.each(clubs, function (club) {
                $link = $otherContextsDropdown.find('a.other-context' +
                    '[data-context-type="club"]' +
                    '[data-context-id="' + club._id + '"]');
                expect($link.length).toBe(1);
                expect($link).toContainText('Verein - ' + club.name);
            });
            _.each(teams, function (team) {
                $link = $otherContextsDropdown.find('a.other-context' +
                    '[data-context-type="team"]' +
                    '[data-context-id="' + team._id + '"]');
                expect($link.length).toBe(1);
                expect($link).toContainText('Team - ' + team.name);
            });
            done();
        });
        it('should switch the context', function (done) {
            var i, $otherContexts, initialContext, $otherContext, newContext, otherContextId, otherContextName;
            initialContext = Session.get('context');
            $otherContexts = $('#other-contexts-dropdown').find('.other-context');
            for (i = 0; i < $otherContexts.length; i = i + 1) {
                $otherContext = $($otherContexts[i]);
                otherContextId = $otherContext.data('contextId');
                otherContextName = $otherContext.text().trim();
                if (otherContextId !== initialContext.id) {
                    $otherContext.click();
                    //noinspection JSLint
                    Meteor.setTimeout(function () {
                        newContext = Session.get('context');
                        expect(newContext.id).toEqual(otherContextId);
                        expect($('#current-context').text()).toContain(otherContextName);
                        Session.set('context', initialContext);
                        Meteor.setTimeout(done, 200);
                    }, 200);
                    break;
                }
            }
        });
    });
});