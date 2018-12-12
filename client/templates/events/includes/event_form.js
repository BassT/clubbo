/*global
    Template, $, moment, Clubs, Departments, Teams, Roles, Meteor, EventsHelper, _, Tags
 */

Template.eventForm.helpers({
  clubs: function() {
    "use strict";
    return Clubs.find({ _id: { $in: Meteor.user().profile.clubIds } }).fetch();
  },
  departments: function() {
    "use strict";
    return Departments.find({
      _id: { $in: Meteor.user().profile.departmentIds }
    }).fetch();
  },
  teams: function() {
    "use strict";
    return Teams.find({ _id: { $in: Meteor.user().profile.teamIds } }).fetch();
  },
  responseRequiredChecked: function(event) {
    "use strict";
    if (event.responseRequired) {
      return { checked: true };
    }
  },
  backgroundChecked: function(event) {
    "use strict";
    if (event.background) {
      return { checked: true };
    }
  },
  teamSelected: function(team, event) {
    "use strict";
    if (team._id === event.teamId) {
      return { selected: true };
    }
  },
  eventStartOrStartParam: function(event, startParam) {
    "use strict";
    if (event) {
      return event.start;
    }
    if (startParam) {
      return startParam;
    }
  },
  eventEndOrEndParam: function(event, endParam) {
    "use strict";
    if (event) {
      return event.end;
    }
    if (endParam) {
      return endParam;
    }
  }
});

Template.eventForm.events({
  "change select#club, change select#department, change select#team": function(
    changeEvent
  ) {
    "use strict";
    var $changedSelect,
      contextType,
      contextId,
      possibleContextIds,
      i,
      $contextDiv,
      $departmentSelect,
      $teamSelect,
      implicitContexts,
      implicitContext;

    $changedSelect = $(changeEvent.target);
    contextType = $changedSelect.attr("id");
    contextId = $changedSelect.val();
    $contextDiv = $("#context");

    // Clear or set department and team selects based on possible contexts
    possibleContextIds = EventsHelper.getPossibleContextIds(
      contextType,
      contextId
    );
    if (contextType !== "team") {
      $departmentSelect = $contextDiv.find("select#department");
      $teamSelect = $contextDiv.find("select#team");

      if (contextType === "club") {
        if (
          !(
            possibleContextIds.departmentIds &&
            _.contains(
              possibleContextIds.departmentIds,
              $departmentSelect.val()
            )
          )
        ) {
          $departmentSelect.val("null");
        }
      }
      if (
        !(
          possibleContextIds.teamIds &&
          _.contains(possibleContextIds.teamIds, $teamSelect.val())
        )
      ) {
        $teamSelect.val("null");
      }
    }

    // Set implicit contexts
    implicitContexts = EventsHelper.getImplicitContextIds(
      contextType,
      contextId
    );
    if (implicitContexts.length > 0) {
      for (i = 0; i < implicitContexts.length; i = i + 1) {
        implicitContext = implicitContexts[i];
        if (implicitContext.type === "club") {
          $contextDiv.find("select#club").val(implicitContext.id);
        } else if (implicitContext.type === "department") {
          $contextDiv.find("select#department").val(implicitContext.id);
        }
      }
    }
  },
  "change #visibility #clubs input[type=checkbox]": function(
    changeEvent,
    template
  ) {
    "use strict";
    var $changedCheckbox, checked, club, $departmentsDiv, $teamsDiv;
    $changedCheckbox = $(changeEvent.target);
    checked = $changedCheckbox.prop("checked");
    club = Clubs.findOne($changedCheckbox.data("context-id"));

    $departmentsDiv = template.$("#visibility #departments");
    _.each(club.departmentIds, function(departmentId) {
      $departmentsDiv
        .find('input[data-context-id="' + departmentId + '"]')
        .prop("checked", checked);
    });

    $teamsDiv = template.$("#visibility #teams");
    _.each(club.teamIds, function(teamId) {
      $teamsDiv
        .find('input[data-context-id="' + teamId + '"]')
        .prop("checked", checked);
    });
  },
  "change #visibility #departments input[type=checkbox]": function(
    changeEvent,
    template
  ) {
    "use strict";
    var $changedCheckbox, checked, department, $teamsDiv;
    $changedCheckbox = $(changeEvent.target);
    checked = $changedCheckbox.prop("checked");
    department = Departments.findOne($changedCheckbox.data("context-id"));

    $teamsDiv = template.$("#visibility #teams");
    _.each(department.teamIds, function(teamId) {
      $teamsDiv
        .find('input[data-context-id="' + teamId + '"]')
        .prop("checked", checked);
    });
  }
});
