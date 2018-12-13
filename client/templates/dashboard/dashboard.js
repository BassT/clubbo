/*global
    Template, Meteor, $, Events, ReactiveVar, moment, Session
 */

Template.dashboard.onCreated(function() {
  "use strict";
  var template = this;

  // Set up reactive vars
  template.eventCount = new ReactiveVar(3);

  template.autorun(function() {
    var start, end, teamIds, limit;

    template.subscribe("teamsByIds", Session.get("selectedTeamIds"));

    start = moment()
      .startOf("day")
      .format();
    end = moment()
      .add(6, "months")
      .format();
    teamIds = Session.get("selectedTeamIds");
    limit = template.eventCount.get();
    template.subscribe(
      "eventsByTimeIntervalAndTeamIdsPaginated",
      start,
      end,
      teamIds,
      limit
    );
  });
});

Template.dashboard.helpers({
  events: function() {
    "use strict";
    return Events.find().fetch();
  }
});

Template.dashboard.events({
  "click #load-more": function(event, template) {
    "use strict";
    template.eventCount.set(template.eventCount.get() + 3);
  }
});
