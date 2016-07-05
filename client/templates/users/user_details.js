/*global
    Absences, Responses, _, Tags, Template, Roles, Meteor, Events, moment, $, bootbox, Teams, Departments, Clubs,
    Router, ReactiveVar
 */

//TODO

function userAbsencesQuery(userId) {
    'use strict';
    return {$and: [
        { userId: userId },
        { $or: [
            {start: {$gt: new Date()}},
            {end: {$gt: new Date()}}
        ]}
    ]};
}

Template.userDetails.onCreated(function () {
    'use strict';
    var template = this;
    template.subscribe('usersByIds', [Router.current().params._id]);
    template.subscribe('absencesByUserIds', [Router.current().params._id]);
    template.subscribe('teamsByIds', Meteor.user().profile.teamIds);
    template.user = new ReactiveVar(Meteor.users.findOne(Router.current().params._id));
});

Template.userDetails.helpers({
    user: function () {
        'use strict';
        return Template.instance().user.get();
    },
    convertGender: function (genderValue) {
        'use strict';
        var result;
        if (genderValue === 'male') {
            result = 'Männlich';
        } else if (genderValue === 'female') {
            result = 'Weiblich';
        } else {
            result = 'Unbekannt';
        }
        return result;
    },
    userCanEdit: function () {
        'use strict';
        var editedUser, editingUser, editingUserAdminships;

        editedUser = Template.instance().user.get();

        editingUser = Meteor.user();
        editingUserAdminships = Roles.getGroupsForUser(editingUser, 'admin');

        return _.intersection(editedUser.profile.teamIds, editingUserAdminships).length > 0 ||
            editingUser._id === editedUser._id;
    },
    formatPositions: function (positions) {
        'use strict';
        if (positions) {
            return positions.join(', ');
        }
    },
    hasAbsences: function () {
        'use strict';
        return Absences.find(userAbsencesQuery(Template.instance().user.get()._id)).count() > 0;
    },
    userAbsences: function () {
        'use strict';
        return Absences.find(userAbsencesQuery(Template.instance().user.get()._id)).fetch();
    },
    currentIsShownUser: function () {
        'use strict';
        return Meteor.userId() === Template.instance().user.get()._id;
    },
    teams: function () {
        'use strict';
        return Teams.find({_id: {$in: Template.instance().user.get().profile.teamIds}}).fetch();
    }
});

Template.userDetails.events({
    'click #absences-list tbody tr': function () {
        'use strict';
        var absence = this;
        bootbox.confirm({
            title: 'Diese Abwesenheit wirklich löschen?',
            message: 'Das Löschen kann nicht rückgängig gemacht werden.',
            buttons: {
                cancel: {
                    label: 'Nein, Abwesenheit nicht löschen',
                    className: 'btn-default'
                },
                confirm: {
                    label: 'Ja, Abwesenheit löschen',
                    className: 'btn-danger'
                }
            },
            callback: function (result) {
                if (result) {
                    Absences.remove(absence._id);
                }
            }
        });
    }
});
