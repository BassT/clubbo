/*global
    Template, moment
 */

Template.clockpickerInput.onRendered(function() {
  "use strict";
  this.$("#" + this.data.id).clockpicker({
    vibrate: false,
    default: "now",
    donetext: "Fertig"
  });
});

Template.clockpickerInput.helpers({
  getTime: function(isoString) {
    "use strict";
    return moment(isoString).format("HH:mm");
  }
});
