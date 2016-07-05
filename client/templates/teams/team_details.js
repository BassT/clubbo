/*global
    Template, Clubs, Meteor, Departments, Teams, Router, $, Roles, bootbox
 */

Template.teamDetails.onCreated(function () {
    'use strict';
    var template = this;

    template.subscribe('teamsByIds', [Router.current().params._id]);
    template.subscribe('usersByTeamIds', [Router.current().params._id]);
});

Template.teamDetails.helpers({
    name: function () {
        'use strict';
        return Teams.findOne(Router.current().params._id).name;
    },
    members: function () {
        'use strict';
        return Meteor.users.find({_id: {$in: Teams.findOne(Router.current().params._id).userIds}}).fetch();
    },
    currentUserIsAdmin: function () {
        'use strict';
        return Roles.userIsInRole(Meteor.user(), 'admin', Router.current().params._id);
    },
    btnClass: function (userId) {
        'use strict';
        if (Roles.userIsInRole(userId, 'admin', Router.current().params._id)) {
            return 'btn-primary';
        }
        return 'btn-default';
    },
    teamId: function () {
        'use strict';
        return Router.current().params._id;
    }
});

Template.teamDetails.events({
    'click table#members tbody tr': function (event) {
        'use strict';
        Router.go('/users/details/' + $(event.currentTarget).data('userId'));
    },
    'click table#members tbody .admin': function (event) {
        'use strict';
        event.stopPropagation();
        var $adminButton;
        $adminButton = $(event.currentTarget);
        if ($adminButton.hasClass('btn-primary')) {
            Meteor.call('removeAdmin', Router.current().params._id, $adminButton.parentsUntil('tbody', 'tr').data('userId'),
                function (error) {
                    if (error) {
                        bootbox.alert({
                            title: 'Admin konnte nicht entfernt werden.',
                            message: error.message
                        });
                    }
                }
            );
        } else if ($adminButton.hasClass('btn-default')) {
            Meteor.call('addAdmin', Router.current().params._id, $adminButton.parentsUntil('tbody', 'tr').data('userId'),
                function (error) {
                    if (error) {
                        bootbox.alert({
                            title: 'Admin konnte nicht hinzugefügt werden.',
                            message: error.message
                        });
                    }
                }
            );
        }
    },
    'click button.edit-team': function (event, template) {
        'use strict';
        template.$('.team-edit-modal').modal('show');
    }
});