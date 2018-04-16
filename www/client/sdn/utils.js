Session.set('debug',true);
Template.registerHelper("is_debug", () => {
    var debug = Session.get('debug');
    if (debug !== undefined && debug === true) {
        return true;
    } else {
        return false;
    }
});

Template.registerHelper("loading_string", () => {
    var loading = Session.get('loading');
    if (loading !== undefined && loading === false) {
        return "";
    } else {
        return " | Loading ......";
    }
});

Template.registerHelper("is_cbr", () => {
    var mode = Session.get('mode');
    if (mode === undefined || mode === "CBR") {
        return true;
    } else {
        return false;
    }
});

Template.registerHelper("is_ubr", () => {
    var mode = Session.get('mode');
    if (mode !== undefined && mode === "UBR") {
        return true;
    } else {
        return false;
    }
});

Template.registerHelper("is_total", () => {
    var mode = Session.get('mode');
    if (mode !== undefined && mode === "TOTAL") {
        return true;
    } else {
        return false;
    }
});

mode_set_cbr = function () { Session.set('mode', "CBR"); }
mode_set_ubr = function () { Session.set('mode', "UBR"); }
mode_set_total = function () { Session.set('mode', "TOTAL"); }

Template.registerHelper("current_select", function (id) {
    var nid = Session.get('input_id');
    if (nid !== undefined && nid._str === id._str) {
        return true;
    } else {
        return false;
    }
});

Template.registerHelper("is_selected", function (page) {
    var nid = Session.get('select_page');
    if (nid !== undefined && Number(nid) === Number(page)) {
        return "selected";
    } else {
        return "";
    }
});

getRandomColor = function(){
    var color = Math.floor(Math.random() * Math.pow(256, 3)).toString(16);
    while(color.length <6) {
        color ="0" + color;
    }
    return"#" + color;
}


is_ubr = () => {
    var mode = Session.get('mode');
    if (mode !== undefined && mode === "UBR") {
        return true;
    } else {
        return false;
    }
}

is_cbr = () => {
    var mode = Session.get('mode');
    if (mode === undefined || mode === "CBR") {
        return true;
    } else {
        return false;
    }
}

