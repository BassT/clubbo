/*global
    Template, $, ResponsesHelper, Responses, Session, Router, Meteor, bootbox
 */

Template.respondToEvent.events({
  "submit form": function(e) {
    "use strict";
    e.preventDefault();

    var response, form;
    form = $("form");
    response = ResponsesHelper.generateResponse(form);

    Meteor.call(
      "insertResponse",
      response.userId,
      response.eventId,
      response.value,
      response.message,
      function(error) {
        if (error) {
          bootbox.alert({
            title: "Antwort konnte nicht gespeichert werden",
            message: error.message
          });
        }
      }
    );

    if (Session.get("goBackTo") === undefined) {
      Session.set("goBackTo", "/events/details/" + this.event._id);
    }
    Router.go(Session.get("goBackTo"));
    Session.set("goBackTo", undefined);
  },
  "click #abort": function() {
    "use strict";
    if (Session.get("goBackTo") === undefined) {
      Session.set("goBackTo", "/events/details/" + this.event._id);
    }
    Router.go(Session.get("goBackTo"));
    Session.set("goBackTo", undefined);
  }
});

Template.respondToEvent.onRendered(function() {
  "use strict";
  if (this.data.response) {
    $("#respond-buttons")
      .find("input[value=" + this.data.response.value + "]")
      .prop("checked", true)
      .parent("label")
      .addClass("active");
  }

  $("#context-dropdown").addClass("disabled");
});
