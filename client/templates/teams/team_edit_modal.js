/*global
    Template, Meteor, Teams, ReactiveVar
 */

Template.teamEditModal.onCreated(function() {
  "use strict";
  var template = this;
  template.team = new ReactiveVar(Teams.findOne(Template.currentData().teamId));
  template.subscribe("teamsByIds", [Template.currentData().teamId], function(
    err
  ) {
    if (err) {
      alert(err);
    }
    template.team.set(Teams.findOne(template.data.teamId));
  });
});

Template.teamEditModal.helpers({
  team: function() {
    "use strict";
    return Template.instance().team.get();
  }
});

Template.teamEditModal.events({
  "click .submit": function(clickEvent, template) {
    "use strict";
    var team = {};
    team._id = template.team.get()._id;
    team.name = template.$("#name").val();
    Meteor.call("updateTeam", team, function(err) {
      if (err) {
        alert(err);
      } else {
        template.$(".modal").modal("hide");
      }
    });
  }
});
