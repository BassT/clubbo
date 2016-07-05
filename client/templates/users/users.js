/*global
    Template, Meteor, $, Events, moment, Router, Tracker, _, Responses, Roles, Session
 */

Template.users.onCreated(function () {
    'use strict';
    var template = this;

    template.autorun(function () {
        template.subscribe('usersByTeamIds', Session.get('selectedTeamIds'));
    });
});

Template.users.helpers({
    users: function () {
        'use strict';
        return Meteor.users.find({}, {sort: ['profile.lastName']}).fetch();
    },
    isAdminInAnyContext: function () {
        'use strict';
        return Roles.getGroupsForUser(Meteor.user()).length > 0;
    }
});

Template.users.events({
    'click #users-table tbody tr': function (event) {
        'use strict';
        Router.go('/users/details/' + $(event.currentTarget).data('userId'));
    }
});

Template.users.onRendered(function() {
    'use strict';
    this.autorun(function () {
        //noinspection JSLint
        var dummyVar, usersTable;
        dummyVar = Template.currentData();
        Tracker.afterFlush(function () {
            usersTable = $('#users-table');
            usersTable.trigger('destroy');
            usersTable.tablesorter();
        });
    });

    $('#context-dropdown').removeClass('disabled');
});