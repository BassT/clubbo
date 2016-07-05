/*global
    Events:true, Meteor, SimpleSchema, ContextSchema, Teams, Departments, Clubs, Roles, _
 */
Events = new Meteor.Collection('events');

Events.attachSchema(new SimpleSchema({
    end: {
        type: String,
        label: 'End'
    },
    location: {
        type: String,
        label: 'Ort',
        optional: true
    },
    notes: {
        type: String,
        label: 'Notiz',
        optional: true
    },
    start: {
        type: String,
        label: 'Start'
    },
    tags: {
        type: [String],
        label: 'Tags',
        optional: true
    },
    title: {
        type: String,
        label: 'Titel'
    },
    responseRequired: {
        type: Boolean
    },
    background: {
        type: Boolean
    },
    teamId: {
        type: String
    }
}));

Events.allow({
    insert: function (userId) {
        'use strict';
        // Has to be logged in
        if (userId === undefined || userId === null) {
            return false;
        }

        return true;
    },
    update: function (userId) {
        'use strict';
        // Has to be logged in
        if (userId === undefined || userId === null) {
            return false;
        }

        return true;
    },
    remove: function (userId) {
        'use strict';
        // Has to be logged in
        if (userId === undefined || userId === null) {
            return false;
        }

        return true;
    }
});