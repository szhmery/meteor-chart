Template.userSelect.rendered = function(){
};

Template.userSelect.helpers ({
    is_cbr_active: function () {
        var mode = Session.get('mode');
        if (mode === undefined || mode === "CBR") {
            return "btn-primary active";
        } else {
            return "";
        }
    },
    is_ubr_active: function () {
        var mode = Session.get('mode');
        if (mode !== undefined && mode === "UBR") {
            return "btn-primary active";
        } else {
            return "";
        }
    },
    is_total_active: function () {
        var mode = Session.get('mode');
        if (mode !== undefined && mode === "TOTAL") {
            return "btn-primary active";
        } else {
            return "";
        }
    },
});

            
            
Template.userSelect.events({
    'change #radio_cbr': function (event) {
        Session.set("mode", "CBR");
    },
    'change #radio_ubr': function (event) {
        Session.set("mode", "UBR");
    },
    'change #radio_total': function (event) {
        Session.set("mode", "TOTAL");
    },
});

