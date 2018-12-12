/*global
    Absences, Template, EventsHelper, Meteor, moment, _, Events, Roles, Tracker, $, Session, Responses, Teams,
    Departments, Clubs, ReactiveVar, bootbox
 */

function userAbsencesQuery(userId, startDate, endDate) {
  "use strict";

  // which absences are relevant for an event which start at `startDate` and ends at `endDate`?
  // 0 | 1 | 2 | 3 | 4 | 5
  //        |-|            <-- event
  // |---|                 <-- not relevant
  //     |--------|        <-- relevant
  //          |------|     <-- relevant

  return {
    $and: [
      { userId: userId },
      { start: { $lt: endDate } },
      { end: { $gt: startDate } }
    ]
  };
}

function getRelevantYeses(position) {
  "use strict";
  var users = Meteor.users
      .find({ "profile.positions": { $in: [position] } })
      .fetch(),
    i,
    user,
    result,
    response;

  result = [];

  for (i = 0; i < users.length; i = i + 1) {
    user = users[i];
    response = Responses.findOne({
      userId: user._id,
      eventId: Template.parentData().event._id,
      value: "yes"
    });
    if (response) {
      result.push(response);
    }
  }

  return result;
}

Template.eventDetails.onCreated(function() {
  "use strict";
  this.event = new ReactiveVar(this.data.event);
  this.subscribe("teamsByIds", Session.get("selectedTeamIds"));
});

Template.eventDetails.helpers({
  formatStartEnd: function(start, end) {
    "use strict";
    return EventsHelper.formatStartEnd(start, end);
  },
  getUsername: function() {
    "use strict";
    var user = Meteor.users.findOne(this.userId);
    return user.profile.firstName + " " + user.profile.lastName;
  },
  getMessageOrNoteOfAbsence: function() {
    "use strict";
    var response, absence;
    response = this;
    if (response.message) {
      return response.message;
    }
    absence = Absences.findOne(
      userAbsencesQuery(
        response.userId,
        moment(event.start).toDate(),
        moment(event.end).toDate()
      ),
      {
        sort: ["start"]
      }
    );
    return (
      moment(absence.start).format("DD.MM.YYYY") +
      " - " +
      moment(absence.end).format("DD.MM.YYYY") +
      ": " +
      absence.note
    );
  },
  usersWithNoResponse: function() {
    "use strict";
    var users, userIdsFromResponses, user, i, result;
    users = this.users.fetch();
    userIdsFromResponses = _.pluck(this.responses, "userId");

    result = [];
    for (i = 0; i < users.length; i = i + 1) {
      user = users[i];
      if (!_.contains(userIdsFromResponses, user._id)) {
        result.push(user);
      }
    }

    return result;
  },
  messageAvailable: function() {
    "use strict";
    var response, event, absencesCursor;
    response = this;
    event = Events.findOne(response.eventId);
    absencesCursor = Absences.find(
      userAbsencesQuery(
        response.userId,
        moment(event.start).toDate(),
        moment(event.end).toDate()
      )
    );
    return !!(response.message || absencesCursor.count() > 0);
  },
  userHasAbsence: function() {
    "use strict";
    var event, user, absencesCursor;
    user = this;
    event = Template.parentData().event;
    absencesCursor = Absences.find(
      userAbsencesQuery(
        user._id,
        moment(event.start).toDate(),
        moment(event.end).toDate()
      )
    );
    return absencesCursor.count() > 0;
  },
  getAbsence: function() {
    "use strict";
    var user, event, absence;
    user = this;
    event = Template.parentData().event;
    absence = Absences.findOne(
      userAbsencesQuery(
        user._id,
        moment(event.start).toDate(),
        moment(event.end).toDate()
      ),
      {
        sort: ["start"]
      }
    );
    return (
      moment(absence.start).format("DD.MM.YYYY") +
      " - " +
      moment(absence.end).format("DD.MM.YYYY") +
      ": " +
      absence.note
    );
  },
  didNotStartYet: function() {
    "use strict";
    return moment(this.event.start).isAfter(moment());
  },
  positions: function() {
    "use strict";
    return ["A", "M", "LSM", "D", "G"];
  },
  relevantYeses: function() {
    "use strict";
    return getRelevantYeses(this);
  },
  numberOfRelevantYeses: function() {
    "use strict";
    return getRelevantYeses(this).length;
  },
  totalNumberAttending: function() {
    "use strict";
    return Template.currentData().yeses.length;
  },
  teamsOfRespondents: function() {
    "use strict";
    var currentData;
    currentData = Template.currentData();

    return Teams.find({ _id: { $in: Session.get("selectedTeamIds") } }).map(
      function(team) {
        return {
          _id: team._id,
          name: team.name,
          numberOfRespondents: Meteor.users
            .find({
              _id: { $in: _.pluck(currentData.yeses, "userId") },
              "profile.teamIds": { $in: [team._id] }
            })
            .count()
        };
      }
    );
  },
  currentUserIsAdmin: function() {
    "use strict";
    var event;
    event = Template.instance().event.get();
    return Roles.userIsInRole(Meteor.user(), "admin", event.teamId);
  },
  currentUserIsMember: function(event) {
    "use strict";
    return _.contains(Meteor.user().profile.teamIds, event.teamId);
  }
});

Template.eventDetails.events({
  "click #respond": function() {
    "use strict";
    Session.set("goBackTo", "/events/details/" + this.event._id);
  },
  "click .switch-response": function(event, template) {
    "use strict";
    var $button, value, userId, eventId;

    $button = $(event.currentTarget);
    if ($button.hasClass("attending")) {
      value = "no";
    } else if ($button.hasClass("not-attending")) {
      value = "yes";
    }

    eventId = template.event.get()._id;
    userId = $button.parentsUntil("tbody", "tr[data-user-id]").data("userId");

    Meteor.call("updateResponse", userId, eventId, value, "", function(error) {
      if (error) {
        bootbox.alert({
          title: "Antwort konnte nicht geändert werden.",
          message: error.message
        });
      }
    });
  },
  "click .add-response": function(event, template) {
    "use strict";
    var $button, value, userId, eventId;

    $button = $(event.currentTarget);
    if ($button.hasClass("attending")) {
      value = "yes";
    } else if ($button.hasClass("not-attending")) {
      value = "no";
    }

    eventId = template.event.get()._id;
    userId = $button.parentsUntil("tbody", "tr[data-user-id]").data("userId");

    Meteor.call("insertResponse", userId, eventId, value, "", function(error) {
      if (error) {
        bootbox.alert({
          title: "Antwort konnte nicht erstellt werden.",
          message: error.message
        });
      }
    });
  }
});

Template.eventDetails.onRendered(function() {
  "use strict";
  this.autorun(function() {
    var dummyVar, responses;
    dummyVar = Template.currentData();
    Tracker.afterFlush(function() {
      responses = $("#responses");
      responses.find("table").trigger("destroy");
      responses.find("table").tablesorter();
      responses.find('[data-toggle="popover"]').popover("destroy");
      responses.find('[data-toggle="popover"]').popover();
    });
  });

  $("#context-dropdown").addClass("disabled");
});
