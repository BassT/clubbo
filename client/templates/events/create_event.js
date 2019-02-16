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
    
    if (eventObj.repeat >= 1 && eventObj.repeat <= 24) {
      if (eventObj.repeat == 1) {
        newEventObj = EventsHelper.generateEvent(form);
        newEventObj = eventObj.add(7, 'days') 
      } else {
          var i;
          for(i = 0; i < eventObj.repeat; i++) {
            
          }
      }
    }
    // get repeat value n from form
    // generate n events seperated by 1 week

    // Iterating over dates is easier with [moment](https://momentjs.com/docs/#/manipulating/add/)
    // Start with: eventObj.start (this is a [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date))

    // Maybe use a for loop?

    Events.insert(eventObj, function(error) {
      if (error) {
        bootbox.alert({
          title: "Event konnte nicht erstellt werden",
          message: error.message
        });
      } else {
        // Other events
        // Events.insert(nextEvent)

        // if (noNextEvent)
        Router.go("/calendar");
      }
    });
  }
});
