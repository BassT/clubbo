/*global
    Absences, $, Template, Meteor, bootbox, Router
 */

Template.createAbsence.onRendered(function() {
  "use strict";
  $("#start, #end").datepicker({
    language: "de"
  });
  $("#context-dropdown").addClass("disabled");
});

Template.createAbsence.events({
  "submit form": function(e) {
    "use strict";
    var absence, form;
    e.preventDefault();

    form = $("form");

    absence = {
      userId: Meteor.userId(),
      start: form.find("#start").datepicker("getDate"),
      end: form.find("#end").datepicker("getDate"),
      note: form.find("#note").val()
    };

    Absences.insert(absence, function(error) {
      if (error) {
        bootbox.alert({
          title: "Abwesenheit konnte nicht erstellt werden",
          message: error.message
        });
      } else {
        Router.go("/users/details/" + Meteor.userId());
      }
    });
  }
});
