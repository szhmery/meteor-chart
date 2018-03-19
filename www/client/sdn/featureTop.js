
let myChart = null;
Template.featureTop.onRendered( function(){
    Session.set('loading', true);
    onDraw();
});

var datas = [];
var labels = [];

function onDraw() {
    let topSelectNum = Session.get("select_page");
    if(topSelectNum === undefined) { topSelectNum = 10; }

    if (!FlowRouter.subsReady("featureTop")) {
        Meteor.setTimeout(onDraw, 1);
        return false;
    }

    let ret = null;
    let mode = Session.get("mode");
    if (mode === undefined) { mode = "CBR"; }
    switch(mode){
        case "TOTAL":
            ret = Features.find({}, { "sort": { "total_reference": -1 }, "limit": parseInt(topSelectNum)}).fetch();
            break;
        case "UBR":
            ret = Features.find({}, { "sort": { "ubr_reference": -1 }, "limit": parseInt(topSelectNum)}).fetch();
            break;
        case "CBR":
            ret = Features.find({}, { "sort": { "cbr_reference": -1 }, "limit": parseInt(topSelectNum)}).fetch();
            break;
    }

    if (ret === null || ret.length === 0 ) {
        Meteor.setTimeout(onDraw, 1);
        return [];
    } 
    let refnum = 0;

    let len = ret.length;

    datas = [];
    labels = [];
    if ( len !== 0 ) {
        for (let i=0; i<len; i++) {
            switch(mode){
                case "TOTAL":
                    refnum = ret[i].total_reference;
                    break;
                case "UBR":
                    refnum = ret[i].ubr_reference;
                    break;
                case "CBR":
                    refnum = ret[i].cbr_reference;
                    break;

            }
            labels.push(ret[i].name);
            datas.push(refnum);
        }
    }
    var barData = {
        labels: labels,
        datasets: [
            {
                label: "Chassis Number",
                backgroundColor: 'rgba(26,179,148,0.5)',
                borderColor: "rgba(26,179,148,0.7)",
                pointBackgroundColor: "rgba(255,179,148,1)",
                pointBorderColor: "#000",
                data: datas
            }
        ]
    };

    if(Number(datas.length) > 25) {
        var barOptions = {
            responsive: true
        };
    } else {
        var barOptions = {
            responsive: true,
            scales: {
                xAxes: [{
                    ticks: {
                        autoSkip: false
                    }
                }],
                yAxes: [{
                    display: true,
                    ticks: {
                        beginAtZero: true, 
                        callback: function(value) {if (value % 1 === 0) {return value;}}      
                    }
                }]
            }
        };
    }

    if (myChart) {
        myChart.destroy();
    }
    var ctx2 = document.getElementById("barChart").getContext("2d");
    myChart = new Chart(ctx2, {type: 'bar', data: barData, options:barOptions});

    Session.set('loading', false);
};

Template.featureTop.helpers ({
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
    feaBarTitle: function(){
        return Session.get('feaBarTitle');
    },
});
            
Template.featureTop.events({
    'change #radio_cbr': function (event) {
        Session.set("mode", "CBR");
        onDraw();
    },
    'change #radio_ubr': function (event) {
        Session.set("mode", "UBR");
        onDraw();
    },
    'change #radio_total': function (event) {
        Session.set("mode", "TOTAL");
        onDraw();
    },
    'change #my_select': function (event) {
        Session.set("select_page", $("#my_select").val());
        onDraw();
    },
});

