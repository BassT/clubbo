/*global
    SimpleSchema, Meteor, Roles, Teams, Clubs, Departments, _
 */
var Schema = {};

Schema.UserProfile = new SimpleSchema({
    firstName: {
        type: String,
        regEx: /^[a-zA-ZäÄüÜöÖß]{2,25}-?[a-zA-ZäÄüÜöÖß]{0,25}$/,
        optional: true
    },
    lastName: {
        type: String,
        regEx: /^[a-zA-ZäÄüÜöÖß]{2,25}-?[a-zA-ZäÄüÜöÖß]{0,25}$/,
        optional: true
    },
    birthday: {
        type: String,
        optional: true
    },
    address: {
        type: String,
        optional: true
    },
    phone: {
        type: String,
        optional: true
    },
    gender: {
        type: String,
        allowedValues: ['male', 'female'],
        optional: true
    },
    jerseyNumber: {
        type: String,
        regEx: /^[0-9]{1,3}$/,
        optional: true
    },
    positions: {
        type: [String],
        allowedValues: ['A', 'M', 'LSM', 'D', 'G'],
        optional: true
    },
    teamIds: {
        type: [String],
        optional: true
    }
});

Schema.User = new SimpleSchema({
    emails: {
        type: [Object],
        // this must be optional if you also use other login services like facebook,
        // but if you use only accounts-password, then it can be required
        optional: true
    },
    "emails.$.address": {
        type: String,
        regEx: SimpleSchema.RegEx.Email
    },
    "emails.$.verified": {
        type: Boolean
    },
    createdAt: {
        type: Date
    },
    profile: {
        type: Schema.UserProfile,
        optional: true
    },
    services: {
        type: Object,
        optional: true,
        blackbox: true
    },
    // Add `roles` to your schema if you use the meteor-roles package.
    // Option 1: Object type
    // If you specify that type as Object, you must also specify the
    // `Roles.GLOBAL_GROUP` group whenever you add a user to a role.
    // Example:
    // Roles.addUsersToRoles(userId, ["admin"], Roles.GLOBAL_GROUP);
    // You can't mix and match adding with and without a group since
    // you will fail validation in some cases.
    roles: {
        type: Object,
        optional: true,
        blackbox: true
    }
});

Meteor.users.attachSchema(Schema.User);

function isCurrentUserAdminRelevantContext(userId, doc) {
    'use strict';
    var clubs, club, departments, department, teams, team, i;

    // Is the current user an admin in all clubs?
    clubs = Clubs.find({_id: {$in: [doc.profile.clubIds]}}).fetch();
    for (i = 0; i < clubs.length; i = i + 1) {
        club = clubs[i];
        if (!Roles.userIsInRole(userId, 'admin', club._id)) {
            return false;
        }
    }

    // Is the current user an admin in all departments?
    departments = Departments.find({_id: {$in: [doc.profile.departmentIds]}}).fetch();
    for (i = 0; i < departments.length; i = i + 1) {
        department = departments[i];
        if (!Roles.userIsInRole(userId, 'admin', department._id)) {
            return false;
        }
    }

    // Is the current user an admin in all teams?
    teams = Clubs.find({_id: {$in: [doc.profile.teamIds]}}).fetch();
    for (i = 0; i < teams.length; i = i + 1) {
        team = teams[i];
        if (!Roles.userIsInRole(userId, 'admin', team._id)) {
            return false;
        }
    }

    return true;
}

// allow admins all operations on users
Meteor.users.allow({
    insert: function (userId, doc) {
        'use strict';
        return isCurrentUserAdminRelevantContext(userId, doc);
    },
    update: function (userId, doc) {
        'use strict';
        return isCurrentUserAdminRelevantContext(userId, doc);
    },
    remove: function (userId, doc) {
        'use strict';
        return isCurrentUserAdminRelevantContext(userId, doc);
    }
});

// allow user all operations on own account
Meteor.users.allow({
    insert: function (userId, doc) {
        'use strict';
        return (userId && userId === doc._id);
    },
    update: function (userId, doc) {
        'use strict';
        return (userId && userId === doc._id);
    },
    remove: function (userId, doc) {
        'use strict';
        return (userId && userId === doc._id);
    }
});
