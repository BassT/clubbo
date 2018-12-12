/*global
    Template, Meteor, Events, Responses, Session, $, EventsHelper, Teams, Departments, Clubs, bootbox
 */

Template.eventPanel.onCreated(function() {
  "use strict";
  this.subscribe(
    "responsesByUserIdAndEventId",
    Meteor.userId(),
    Template.currentData().event._id
  );
});

Template.eventPanel.helpers({
  formatStartAndEnd: function(start, end) {
    "use strict";
    return EventsHelper.formatStartEnd(start, end);
  },
  responseMissing: function(event) {
    "use strict";
    var eventResponses;

    if (
      Meteor.user().profile.teamIds.indexOf(event.teamId) !== -1 &&
      event.responseRequired
    ) {
      eventResponses = Responses.find({
        eventId: event._id,
        userId: Meteor.userId()
      });
      return eventResponses.count() <= 0;
    }

    return false;
  },
  responseRequired: function(event) {
    "use strict";
    if (
      Meteor.user().profile.teamIds.indexOf(event.teamId) !== -1 &&
      event.responseRequired
    ) {
      return true;
    }
    return false;
  },
  responseButtonStyle: function(event) {
    "use strict";
    var response;
    response = Responses.findOne({
      eventId: event._id,
      userId: Meteor.userId()
    });

    if (!response) {
      return "primary";
    }
    if (response.value === "yes") {
      return "success";
    }
    if (response.value === "no") {
      return "danger";
    }
    if (response.value === "maybe") {
      return "warning";
    }
  },
  responseButtonText: function(event) {
    "use strict";
    var response;
    response = Responses.findOne({
      eventId: event._id,
      userId: Meteor.userId()
    });

    if (response) {
      if (response.value === "yes") {
        return "Ja, ich komme";
      }
      if (response.value === "no") {
        return "Nein, ich komme nicht";
      }
      if (response.value === "maybe") {
        return "Ich komme vielleicht";
      }
    } else {
      return "Antworten";
    }
  },
  contextName: function(event) {
    "use strict";
    return Teams.findOne(event.teamId).name;
  }
});

Template.eventPanel.events({
  "click .respond, .details": function() {
    "use strict";
    Session.set("goBackTo", "/");
  },
  "click .instant-response": function(e) {
    "use strict";
    var responseLink, event, value;

    responseLink = $(e.target);
    event = Template.currentData().event;

    if (responseLink.hasClass("yes")) {
      value = "yes";
    } else if (responseLink.hasClass("no")) {
      value = "no";
    }

    Meteor.call(
      "insertResponse",
      Meteor.userId(),
      event._id,
      value,
      "",
      function(error) {
        if (error) {
          bootbox.alert({
            title: "Fehler beim Hinterlassen deiner Antwort",
            message: error.message
          });
        }
      }
    );
  }
});
