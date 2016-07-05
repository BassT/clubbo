/*global
 Template, Meteor, Events, moment, ReactiveVar, Responses, Tracker
 */

Template.practiceAttendanceRatio.onCreated(function () {
    'use strict';
    var template = this;
    template.month = new ReactiveVar(moment().month());
    template.loaded = new ReactiveVar(false);
    template.eventIds = new ReactiveVar([]);
    template.subscribe('usersByTeamIds', Meteor.user().profile.teamIds);
    template.autorun(function () {
        var start, end, tags, teamIds;
        start = moment().month(template.month.get()).startOf('month').format();
        end = moment().month(template.month.get()).endOf('month').format();
        tags = ['Training'];
        teamIds = Session.get('selectedTeamIds');
        template.subscribe('eventsByTimeIntervalAndTagsAndTeamIds', start, end, tags, teamIds, function () {
                var eventIds = Events.find({
                        start: {$lt: moment().month(template.month.get()).endOf('month').format()},
                        end: {$gt: moment().month(template.month.get()).startOf('month').format()}
                    }).map(function (event) {
                        return event._id;
                    });
                template.eventIds.set(eventIds);
            }
        );
    });
});

Template.practiceAttendanceRatio.onRendered(function () {
    'use strict';
    var template = this;
    template.autorun(function () {
        // Set up a reactive data source
        var month = template.month.get();
        Tracker.afterFlush(function () {
            template.loaded.set(true);
            Meteor.setTimeout(function () {
                template.$('table.tablesorter').tablesorter({});
            }, 300);
        });
    });

    $('#context-dropdown').addClass('disabled');
});

Template.practiceAttendanceRatio.helpers({
    users: function () {
        'use strict';
        return Meteor.users.find({'profile.teamIds': {$in: Session.get('selectedTeamIds')}}).fetch();
    },
    eventIds: function () {
        'use strict';
        return Template.instance().eventIds.get();
    },
    currentMonth: function () {
        'use strict';
        return moment().month(Template.instance().month.get()).format('MMMM');
    },
    loaded: function () {
        'use strict';
        return Template.instance().loaded.get();
    }
});

Template.practiceAttendanceRatio.events({
    'click .next-month': function (event, template) {
        'use strict';
        template.loaded.set(false);
        Meteor.setTimeout(function () {
            template.month.set(template.month.get() + 1);
        }, 200);
    },
    'click .previous-month': function (event, template) {
        'use strict';
        template.loaded.set(false);
        Meteor.setTimeout(function () {
            template.month.set(template.month.get() - 1);
        }, 200);
    }
});