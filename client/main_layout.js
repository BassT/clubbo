/*global
    Template, accountsUIBootstrap3, Session, Teams, Departments, Clubs, Meteor, _, Roles
 */

Template.mainLayout.onRendered(function () {
    'use strict';
    accountsUIBootstrap3.setLanguage('de');
});

Template.mainLayout.helpers({
    isNotPhone: function () {
        'use strict';
        return !(Meteor.Device.isPhone());
    },
    toggleAttributes: function () {
        'use strict';
        if (Meteor.Device.isPhone()) {
            return {
                'data-toggle': 'collapse',
                'data-target': '#navbar-collapse'
            };
        }
    }
});
