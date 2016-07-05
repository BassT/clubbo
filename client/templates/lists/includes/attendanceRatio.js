/*global
    Template, Responses
 */

Template.attendanceRatio.onCreated(function () {
    'use strict';
    var template = this;
    template.autorun(function () {
        template.subscribe('responsesByUserIdAndEventIds', Template.currentData().user._id, Template.currentData().eventIds);
    });
});

Template.attendanceRatio.helpers({
    getRatio: function () {
    'use strict';
    var yesCount;

    yesCount = Responses.find({userId: Template.currentData().user._id, value: 'yes'}).count();

    if (Template.currentData().eventIds.length > 0) {
        return Math.floor(yesCount / Template.currentData().eventIds.length * 100) + '%';
    }
    return 'Kein Training';
}
});