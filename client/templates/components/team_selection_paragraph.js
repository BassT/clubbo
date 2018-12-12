/*global
    Template, Session, Teams, Meteor, ReactiveVar, _, $
 */

Template.teamSelectionParagraph.onCreated(function() {
  "use strict";
  var template = this;

  template.possibleTeamIds = new ReactiveVar(Session.get("selectedTeamIds"));

  template.autorun(function() {
    template.subscribe(
      "teamsByIds",
      template.possibleTeamIds.get(),
      function() {
        var teamIds = Meteor.user().profile.teamIds;
        Teams.find({ _id: { $in: Meteor.user().profile.teamIds } }).map(
          function(team) {
            _.each(team.connectedTeamIds, function(teamId) {
              teamIds.push(teamId);
            });
          }
        );
        template.possibleTeamIds.set(_.uniq(teamIds));
      }
    );
  });
});

Template.teamSelectionParagraph.helpers({
  selectedTeams: function() {
    "use strict";
    return Teams.find({ _id: { $in: Session.get("selectedTeamIds") } }).map(
      function(team, index) {
        var separator = false;
        if (index > 0) {
          separator = true;
        }
        return { _id: team._id, name: team.name, separator: separator };
      }
    );
  },
  notAllTeamsSelected: function() {
    "use strict";
    return (
      _.difference(
        Template.instance().possibleTeamIds.get(),
        Session.get("selectedTeamIds")
      ).length > 0
    );
  },
  notSelectedTeams: function() {
    "use strict";
    return Teams.find({
      _id: {
        $in: _.difference(
          Template.instance().possibleTeamIds.get(),
          Session.get("selectedTeamIds")
        )
      }
    }).map(function(team, index) {
      var separator = false;
      if (index > 0) {
        separator = true;
      }
      return { _id: team._id, name: team.name, separator: separator };
    });
  }
});

Template.teamSelectionParagraph.events({
  "click .team": function(event) {
    "use strict";
    var $link, selectedTeamIds;
    selectedTeamIds = Session.get("selectedTeamIds");
    $link = $(event.currentTarget);
    if ($link.hasClass("selected")) {
      Session.set(
        "selectedTeamIds",
        _.without(selectedTeamIds, $link.data("teamId"))
      );
    } else if ($link.hasClass("not-selected")) {
      selectedTeamIds.push($link.data("teamId"));
      Session.set("selectedTeamIds", selectedTeamIds);
    }
  }
});
