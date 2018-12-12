/*global
    Template, $, moment, Tags, EventsHelper, Events, Router, bootbox, Session, Teams, Departments, Clubs
 */

Template.createEvent.onCreated(function() {
  "use strict";
  this.subscribe("teamsByIds", Session.get("selectedTeamIds"));
});

Template.createEvent.onRendered(function() {
  "use strict";
  this.$("#title").focus();
});

Template.createEvent.helpers({
  startParam: function() {
    "use strict";
    return Router.current().params.start;
  },
  endParam: function() {
    "use strict";
    return Router.current().params.end;
  }
});

Template.createEvent.events({
  "submit form": function(e) {
    "use strict";
    e.preventDefault();

    var form, eventObj;
    form = $(e.target);

    eventObj = EventsHelper.generateEvent(form);

    Events.insert(eventObj, function(error) {
      if (error) {
        bootbox.alert({
          title: "Event konnte nicht erstellt werden",
          message: error.message
        });
      } else {
        Router.go("/calendar");
      }
    });
  }
});
