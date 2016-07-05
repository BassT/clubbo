/*global
    describe, it, beforeEach, afterEach, _, $, Meteor, Router, expect, Session, Events, Teams
 */

describe('Event visibility in dashboard-Template', function () {
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
            expect(Meteor.user()).toBeNull();
            Meteor.setTimeout(done, 2000);
        });
    });

    it('should show events from the \'Karlsruhe B\' context, where \'Karlsruhe A\' was added to the visible attribute, ' +
        'in the dashboard with current context \'Karlsruhe A\'', function (done) {
        var initialContext;
        initialContext = Session.get('context');
        Session.set('context', {id: Teams.findOne({name: 'Karlsruhe A'})._id, type: 'team'});
        Meteor.setTimeout(function () {
            expect($('.event-panel .label[data-context-id=' + Teams.findOne({name: 'Karlsruhe B'})._id + ']').length).toBe(1);
            Session.set('context', initialContext);
            Meteor.setTimeout(done, 200);
        }, 200);
    });
});