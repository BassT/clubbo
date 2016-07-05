/*global
    describe, it, afterEach, beforeEach, Teams, Departments, Clubs, $, _, expect, Meteor, Router
 */

describe('Edit user template', function () {
    'use strict';
    beforeEach(function (done) {
        Meteor.loginWithPassword('richter@karlsruhe-lacrosse.de', '20077002', function (error) {
            expect(error).toBeUndefined();
            expect(Meteor.user()).not.toBeNull();

            Router.go('/users/edit/' + Meteor.userId());

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

    it('should check all clubs, departments and teams where the edited user is a member of', function (done) {
        var $contextDiv;

        $contextDiv = $('#context');

        _.each(_.union(
            Meteor.user().profile.clubIds,
            Meteor.user().profile.departmentIds,
            Meteor.user().profile.teamIds
        ), function (contextId) {
            expect($contextDiv.find('input[value=' + contextId + ']').prop('checked')).toBe(true);
        });

        done();
    });
});