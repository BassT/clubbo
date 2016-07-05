/*global
    Template, $, UsersHelper, Router, Meteor, bootbox, _
 */

Template.createUser.onRendered(function () {
    'use strict';
    $('#birthday').datetimepicker({
        locale: 'de',
        format: 'DD.MM.YYYY'
    });
    $('#delete').remove();

    $('#context-dropdown').addClass('disabled');
});

Template.createUser.events({
    'submit form': function (e) {
        'use strict';
        var user, form, addedToContextIds, implicitContextIds, $context;
        e.preventDefault();

        form = $(e.target);
        user = UsersHelper.generateUser(form);
        user.password = form.find('#password').val();

        $context = $('#context');
        addedToContextIds = _.map($context.find('input:checked:enabled'), function(context) {
            return $(context).val();
        });
        implicitContextIds = _.map($context.find('input:checked:disabled'), function(context) {
            return $(context).val();
        });

        Meteor.call('createUserAccount', user, addedToContextIds, implicitContextIds, function (error) {
            if (error) {
                bootbox.alert({
                    title: 'Mitglied konnte nicht erstellt werden',
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