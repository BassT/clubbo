/*global
    Template, moment
 */

Template.inlineDatepickerDiv.onRendered(function () {
    'use strict';
    var template, $div;
    template = Template.instance();
    $div = template.$('#' + template.data.id);
    $div.datepicker({language: 'de'});
    if (template.data.value) {
        $div.datepicker('update', moment(template.data.value).format('DD.MM.YYYY'));
    } else {
        $div.datepicker('update', moment().format('DD.MM.YYYY'));
    }
});