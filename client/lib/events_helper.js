/*global
    EventsHelper:true, moment, $, _, Tags, Departments, Clubs, Teams
 */

//noinspection JSLint
EventsHelper = {};

EventsHelper.getImplicitContextIds = function(contextType, contextId) {
  "use strict";
  var club, department, result;

  result = [];

  if (contextId !== "null") {
    if (contextType === "department") {
      club = Clubs.findOne(Departments.findOne(contextId).clubId);
      result.push({ type: "club", id: club._id });
    }
    if (contextType === "team") {
      department = Departments.findOne(Teams.findOne(contextId).departmentId);
      club = Clubs.findOne(department.clubId);
      result.push(
        { type: "club", id: club._id },
        { type: "department", id: department._id }
      );
    }
  }

  return result;
};

EventsHelper.getPossibleContextIds = function(contextType, contextId) {
  "use strict";
  var result, club, department, departments, teams, i;

  result = {};

  if (contextId !== "null") {
    if (contextType === "club") {
      club = Clubs.findOne(contextId);

      departments = Departments.find({ clubId: club._id }).fetch();
      if (departments.length > 0) {
        result.departmentIds = [];
        for (i = 0; i < departments.length; i = i + 1) {
          result.departmentIds.push(departments[i]._id);
        }
      }

      teams = Teams.find({ clubId: club._id }).fetch();
      if (teams.length > 0) {
        result.teamIds = [];
        for (i = 0; i < teams.length; i = i + 1) {
          result.teamIds.push(teams[i]._id);
        }
      }
    } else if (contextType === "department") {
      department = Departments.findOne(contextId);

      teams = Teams.find({ departmentId: department._id }).fetch();
      if (teams.length > 0) {
        result.teamIds = [];
        for (i = 0; i < teams.length; i = i + 1) {
          result.teamIds.push(teams[i]._id);
        }
      }
    }
  }

  return result;
};

EventsHelper.generateEvent = function($form) {
  "use strict";
  var startDate, startTime, endDate, endTime, start, end;

  startDate = moment($("#start-date").datepicker("getDate"));
  startTime = moment($("#start-time").val(), "HH:mm");
  start = moment(
    startDate.format("YYYY-MM-DD") + " " + startTime.format("HH:mm"),
    "YYYY-MM-DD HH:mm"
  );

  endDate = moment($("#end-date").datepicker("getDate"));
  endTime = moment($("#end-time").val(), "HH:mm");
  end = moment(
    endDate.format("YYYY-MM-DD") + " " + endTime.format("HH:mm"),
    "YYYY-MM-DD HH:mm"
  );

  return {
    end: end.format(),
    location: $form.find("#location").val(),
    notes: $form.find("#notes").val(),
    start: start.format(),
    tags: $form.find("#tags").val(),
    title: $form.find("#title").val(),
    responseRequired: EventsHelper.getRespRequired($form),
    background: EventsHelper.getBackgroundEvent($form),
    teamId: $form.find("#team").val()
  };
};

EventsHelper.getBackgroundEvent = function(form) {
  "use strict";
  return !!$(form)
    .find("#background")
    .is(":checked");
};

EventsHelper.getRespRequired = function(form) {
  "use strict";
  return !!$(form)
    .find("#response-required")
    .is(":checked");
};

/**
 * Displays the start and end date of an event like so: 01.01.2015 - 02.01.2015.
 * If start and end are identical, then end date will be omitted: 01.01.2015.
 *
 * If both start and end have also time, then time is added aswell.
 * And if the date is identical, then it'll be like 01.01.2015 14:00 - 16:00,
 * otherwise 01.01.2015 14:00 - 02.01.2015 16:00.
 *
 * @param start
 * @param end
 * @returns {String} the formated date
 */

EventsHelper.formatStartEnd = function(start, end) {
  "use strict";
  var result, timeFormat, dateFormat, dateTimeFormat;

  timeFormat = "HH:mm";
  dateFormat = "dd, DD.MM.YYYY";
  dateTimeFormat = dateFormat + " " + timeFormat;

  start = moment(start);
  end = moment(end);

  if (start.hasTime() && end.hasTime()) {
    if (start.date() === end.date() && start.month() === end.month()) {
      result = start.format(dateTimeFormat) + " - " + end.format(timeFormat);
    } else {
      result =
        start.format(dateTimeFormat) + " - " + end.format(dateTimeFormat);
    }
  } else {
    if (start.date() === end.date() && start.month() === end.month()) {
      result = start.format(dateFormat);
    } else {
      result = start.format(dateFormat) + " - " + end.format(dateFormat);
    }
  }

  return result;
};
