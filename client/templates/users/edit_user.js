/*global
    Template, $, UsersHelper, Meteor, Router, bootbox, ReactiveVar
 */

Template.editUser.onCreated(function () {
    'use strict';
    this.subscribe('usersByIds', [Router.current().params._id]);
    this.user = new ReactiveVar(Meteor.users.findOne(Router.current().params._id));
});

Template.editUser.onRendered(function () {
    'use strict';
    $('label[for=password], #password').hide();
    $('#email').prop('disabled', true);

    $('#context-dropdown').addClass('disabled');
});

Template.editUser.helpers({
    user: function () {
        'use strict';
        return Template.instance().user.get();
    }
});

Template.editUser.events({
    'submit form': function (e) {
        'use strict';
        e.preventDefault();

        var user, form;

        form = $(e.target);
        user = UsersHelper.generateUser(form);
        user._id = form.find('#_id').val();

        Meteor.call('updateProfile', user, function (error) {
            if (error) {
                bootbox.alert({
                    title: 'Bearbeiten nicht erfolgreich',
                    message: error.message
                });
            } else {
                Router.go('/users');
            }
        });
    },
    'click #abort': function () {
        'use strict';
        Router.go('/users');
    }
});