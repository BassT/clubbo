/*global
    describe, beforeEach, Meteor, expect, afterEach, Router, it, $, waitForRouter, Roles, Session
 */

describe('User details', function () {
    'use strict';
    beforeEach(function (done) {
        Meteor.loginWithPassword('richter@karlsruhe-lacrosse.de', '20077002', function (error) {
            expect(error).toBeUndefined();
            expect(Meteor.userId()).not.toBeNull();
            done();
        });
    });

    beforeEach(waitForRouter);

    afterEach(function (done) {
        Meteor.logout(function () {
            expect(Meteor.userId()).toBeNull();
            Meteor.setTimeout(done, 2000);
        });
    });

    describe('Clubs, departments and teams div', function() {
        it('should have a div with the id \'membership\'', function(done) {
            Router.go('/users/details/' + Meteor.userId());
            Meteor.setTimeout(function () {
                expect($('div#membership').length).toBe(1);
                done();
            }, 200);
        });
        describe('A user who is only member in a team', function() {
            beforeEach(function (done) {
                Router.go('/users/details/' + Meteor.userId());
                Meteor.setTimeout(done, 200);
            });
            it('should show at least one club', function (done) {
                expect($('#membership').find('.club').length).toBeGreaterThan(0);
                Meteor.setTimeout(done, 200);
            });
            it('should show at least one department', function (done) {
                expect($('#membership').find('.department').length).toBeGreaterThan(0);
                Meteor.setTimeout(done, 200);
            });
            it('should show at least one team', function (done) {
                expect($('#membership').find('.team').length).toBeGreaterThan(0);
                Meteor.setTimeout(done, 200);
            });
        });

        describe('A user who is only member of a department', function () {
            beforeEach(function (done) {
                Router.go('/departments/' + Meteor.user().profile.departmentIds[0]);
                Meteor.setTimeout(function () {
                    Router.go('/users/details/' + Meteor.users.findOne({'profile.firstName': 'Department'})._id);
                    Meteor.setTimeout(done, 200);
                }, 200);
            });
            it('should show at least one club', function (done) {
                expect($('#membership').find('.club').length).toBeGreaterThan(0);
                Meteor.setTimeout(done, 200);
            });
            it('should show at least one department', function (done) {
                expect($('#membership').find('.department').length).toBeGreaterThan(0);
                Meteor.setTimeout(done, 200);
            });
            it('should show no teams', function (done) {
                expect($('#membership').find('.team').length).toBe(0);
                Meteor.setTimeout(done, 200);
            });
        });

        describe('A user who is only member of a club', function () {
            beforeEach(function (done) {
                Router.go('/clubs/' + Meteor.user().profile.clubIds[0]);
                Meteor.setTimeout(function () {
                    Router.go('/users/details/' + Meteor.users.findOne({'profile.firstName': 'Club'})._id);
                    Meteor.setTimeout(done, 200);
                }, 200);
            });
            it('should show at least one club', function (done) {
                expect($('#membership').find('.club').length).toBeGreaterThan(0);
                Meteor.setTimeout(done, 200);
            });
            it('should show no departments', function (done) {
                expect($('#membership').find('.department').length).toBe(0);
                Meteor.setTimeout(done, 200);
            });
            it('should show no teams', function (done) {
                expect($('#membership').find('.team').length).toBe(0);
                Meteor.setTimeout(done, 200);
            });
        });

        describe('A user who is member in teams of two different clubs', function() {
            beforeEach(function (done) {
                Router.go('/clubs/' + Meteor.user().profile.clubIds[0]);
                Meteor.setTimeout(function () {
                    Router.go('/users/details/' + Meteor.users.findOne({'profile.firstName': 'Laura'})._id);
                    Meteor.setTimeout(done, 200);
                }, 200);
            });
            it('should show two clubs', function (done) {
                expect($('#membership').find('.club').length).toBe(2);
                Meteor.setTimeout(done, 200);
            });
            it('should show two departments', function (done) {
                expect($('#membership').find('.department').length).toBe(2);
                Meteor.setTimeout(done, 200);
            });
            it('should show four teams', function (done) {
                expect($('#membership').find('.team').length).toBe(4);
                Meteor.setTimeout(done, 200);
            });
        });
    });

});