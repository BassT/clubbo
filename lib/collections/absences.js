/*global
    Absences:true, Meteor, SimpleSchema
*/
Absences = new Meteor.Collection('absences');

Absences.attachSchema(new SimpleSchema({
    end: {
        type: Date,
        label: 'Enddatum'
    },
    start: {
        type: Date,
        label: 'Startdatum'
    },
    note: {
        type: String,
        label: 'Notiz',
        optional: true
    },
    userId: {
        type: String,
        label: 'userId'
    }
}));

Absences.allow({
    insert: function (userId, doc) {
        'use strict';
        return !!(userId !== undefined && userId !== null && (doc.userId === userId));
    },
    remove: function (userId, doc) {
        'use strict';
        return !!(userId !== undefined && userId !== null && (doc.userId === userId));
    }
});