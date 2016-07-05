/*global
    Template, Router, Session, $, _, Events, Tags, Meteor, moment, Clubs, Departments, Teams, Roles, ReactiveVar
 */

Template.calendar.onCreated(function () {
    'use strict';
    var template, colorCounter, selectedTeamIds, contexts;

    template = this;

    Session.setDefault('calDate', new Date());

    template.viewStart = new ReactiveVar(moment(Session.get('calDate')));
    template.viewEnd = new ReactiveVar(moment(Session.get('calDate')).add(1, 'month'));
    template.tags = new ReactiveVar([]);
    template.contexts = new ReactiveVar([]);
    template.contextToColorMapping = new ReactiveVar({});
    template.colors = new ReactiveVar(['#3a87ad',
        '#2ecc71',
        '#e67e22',
        '#95a5a6',
        '#e74c3c',
        '#bdc3c7',
        '#f1c40f',
        '#9b59b6',
        '#3498db',
        '#1abc9c',
        '#34495e'
    ]);

    template.autorun(function () {
        var start, end, tags, teamIds;
        template.subscribe('teamsByIds', Session.get('selectedTeamIds'));

        start = template.viewStart.get().format();
        end = template.viewEnd.get().format();
        tags = template.tags.get();
        teamIds = Session.get('selectedTeamIds');
        template.subscribe('eventsByTimeIntervalAndTagsAndTeamIds', start, end, tags, teamIds);

        colorCounter = 0;
        contexts = [];
        selectedTeamIds = Session.get('selectedTeamIds');
        _.each(selectedTeamIds, function (teamId) {
            var color = template.colors.get()[colorCounter];
            colorCounter = colorCounter + 1;
            if (Teams.findOne(teamId)) {
                contexts.push({name: Teams.findOne(teamId).name, color: color});
            }
            template.contextToColorMapping.get()[teamId] = color;
        });

        template.contexts.set(contexts);
    });
});

Template.calendar.onRendered(function () {
    'use strict';
    var contextToColorMapping, template;
    template = this;
    contextToColorMapping = template.contextToColorMapping.get();
    template.$('#calendar').fullCalendar({
        // options
        selectable: true,
        lang: 'de',
        header: {
            left:   'today prev,next',
            center: 'title',
            right:  'month,agendaWeek'
        },
        firstDay: 1,
        weekNumbers: true,
        lazyFetching: true,
        defaultDate: Session.get('calDate'),
        defaultView: (function () {
            var fcView = $.cookie('fcView');
            if (fcView) {
                return fcView;
            }
            return 'agendaWeek';
        }()),
        timezone: 'local',
        scrollTime: '10:00:00',

        eventSources: [
            function (start, end, timezone, callback) { // 'real' events
                var events, tags, query, i, event;

                query = {
                    start: {
                        $gt: start.format(),
                        $lt: end.format()
                    },
                    background: {$ne: true}
                };

                tags = template.tags.get();

                if (tags && tags.length > 0) {
                    query.tags = { $all: tags };
                }

                events = Events.find(query).fetch();

                for (i = 0; i < events.length; i = i + 1) {
                    event = events[i];
                    if (_.has(contextToColorMapping, event.teamId)) {
                        event.color = contextToColorMapping[event.teamId];
                    }
                }

                callback(events);
            },
            function (start, end, timezone, callback) { // background events
                var backgroundEvents, tags, query, i;

                query = {
                    start: {
                        $gt: start.subtract(1, 'weeks').format(),
                        $lt: end.add(1, 'weeks').format()
                    },
                    background: true
                };

                tags = template.tags.get();

                if (tags && tags.length > 0) {
                    query.tags = { $all: tags };
                }

                backgroundEvents = Events.find(query).fetch();

                for (i = 0; i < backgroundEvents.length; i = i + 1) {
                    backgroundEvents[i].allDay = true;
                    backgroundEvents[i].backgroundColor = 'grey';
                }

                callback(backgroundEvents);

            },
            function (start, end, timezone, callback) { // just birthdays
                var userNamesAndBirthdays, birthdayEvents, i, userNameAndBirthday, birthdayMoment, tags;

                tags = template.tags.get();

                if (tags && tags.length > 0) {
                    callback([]);
                } else {
                    userNamesAndBirthdays = Meteor.users.find().fetch();

                    birthdayEvents = [];
                    for (i = 0; i < userNamesAndBirthdays.length; i = i + 1) {
                        userNameAndBirthday = userNamesAndBirthdays[i];
                        birthdayMoment = moment(userNameAndBirthday.profile.birthday);

                        if (userNameAndBirthday.profile.birthday && birthdayMoment.isBefore(end, 'month')) {
                            birthdayEvents.push({
                                start: birthdayMoment.year(start.year()),
                                allDay: true,
                                isBirthday: true,
                                backgroundColor: 'grey',
                                title: 'Geb. ' + userNameAndBirthday.profile.firstName + ' ' + userNameAndBirthday.profile.lastName
                            });
                        }
                    }

                    callback(birthdayEvents);
                }
            }
        ],
        select: function (start, end) {
            Session.set('calDate', start.toDate());
            Router.go('/events/create/' + start.format() + '/' + end.format());
        },
        dayClick: function (date) {
            Session.set('calDate', date.toDate());
            Router.go('/events/create/' + date.format());
        },
        eventClick: function (event) {
            if (!event.isBirthday) {
                Session.set('calDate', event.start.toDate());
                Router.go('/events/details/' + event._id);
            }
        },
        eventRender: function (event, $element) {
            if (_.has(event, 'context')) {
                $element.data('contextId', event.teamId);
                $element.data('contextType', 'team');
            }
            if (event.isBirthday) {
                $element.tooltip({
                    title: event.title
                });
            }
        },
        eventAfterAllRender: function () {
            var calendar;
            calendar = $('#calendar');
            calendar.find('.fc-toolbar h2').addClass('hidden-xs');
        },
        viewRender: function (view) {
            $.cookie('fcView', view.name);
            template.viewStart.set(view.start);
            template.viewEnd.set(view.end);
        }
    });

    template.autorun(function () {
        var events = Events.find().fetch();
        template.$('#calendar').fullCalendar('refetchEvents');
    });
});

Template.calendar.onDestroyed(function () {
    'use strict';
    Session.set('calDate', $('div.fc').fullCalendar('getDate').toDate());
});

Template.calendar.helpers({
    contexts: function () {
        'use strict';
        return Template.instance().contexts.get();
    },
    multipleSelectedTeamIds: function () {
        'use strict';
        return Session.get('selectedTeamIds').length > 1;
    }
});

Template.calendar.events({
    'change #event-tags': function (event, template) {
        'use strict';
        var tags = $(event.currentTarget).val();
        if (tags === null) {
            tags = [];
        }
        template.tags.set(tags);
        $('#calendar').find('div.fc').fullCalendar('refetchEvents');
    }
});