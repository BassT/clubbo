/*global
    Template, $, moment, Tags, _, EventsHelper, bootbox, Events, Router, Departments, Teams, Session
 */

Template.updateEvent.onCreated(function() {
  "use strict";
  this.subscribe("eventsByIds", [Router.current().params._id]);
  this.subscribe("teamsByIds", Session.get("selectedTeamIds"));
});

Template.updateEvent.helpers({
  event: function() {
    "use strict";
    return Events.findOne(Router.current().params._id);
  }
});

Template.updateEvent.onRendered(function() {
  "use strict";
  this.$("#title").focus();
});

Template.updateEvent.events({
  "submit form": function(e) {
    "use strict";
    e.preventDefault();

    var form, eventObj;
    form = $(e.target);
    eventObj = EventsHelper.generateEvent(form);

    Events.update(
      form.find("#_id").val(),
      {
        $set: {
          end: eventObj.end,
          location: eventObj.location,
          notes: eventObj.notes,
          start: eventObj.start,
          tags: eventObj.tags,
          title: eventObj.title,
          responseRequired: eventObj.responseRequired,
          background: eventObj.background,
          teamId: eventObj.teamId
        }
      },
      function(error) {
        if (error) {
          bootbox.alert({
            title: "Event konnte nicht bearbeitet werden",
            message: error.message
          });
        } else {
          Router.go("/events/details/" + form.find("#_id").val());
        }
      }
    );
  },
  "click #delete": function(e) {
    "use strict";
    e.preventDefault();

    var form;

    bootbox.confirm({
      title: "Dieses Event wirklich löschen?",
      message: "Das Löschen kann nicht rückgängig gemacht werden.",
      buttons: {
        cancel: {
          label: "Nein, Event nicht löschen",
          className: "btn-default"
        },
        confirm: {
          label: "Ja, Event löschen",
          className: "btn-danger"
        }
      },
      callback: function(result) {
        if (result) {
          form = $(e.target).parent("form");
          Events.remove(form.find("#_id").val());
          Router.go("/calendar");
        }
      }
    });
  },
  "click #abort": function() {
    "use strict";
    Router.go("/events/details/" + $("#_id").val());
  }
});
