UI.registerHelper("formatDate", function (dateTime, format) {
    "use strict";
    return moment(dateTime).format(format);
});

UI.registerHelper("convertLineBreaks", function (text) {
    "use strict";
    if (text !== undefined && text !== null) {
        text = text.replace(/(?:\r\n|\r|\n)/g, '<br />');
    }
    return text;
});