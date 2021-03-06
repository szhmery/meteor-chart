
let myChart = null;
Template.releaseFeature.onRendered( function(){
    Session.set('loading', true);

    createLocalCollection();
    onDraw();
});

var datas = [];
var labels = [];

function onDraw() {
    let topSelectNum = Session.get("select_page");
    if(topSelectNum === undefined) { topSelectNum = 10; }

    if (!( FlowRouter.subsReady("tempReleaseFeature"))) {
        Meteor.setTimeout(onDraw, 1);
        return false;
    }

    let mode = Session.get("mode");
    if (mode === undefined) { mode = "CBR"; }
    mode = mode.toLowerCase();

    let tempList = [];
    switch(mode){
        case "total":
            tempList = tempReleaseFeature.find({}, { "sort": { "total_ref": -1 }}).fetch();
            break;
        case "ubr":
            tempList = tempReleaseFeature.find({}, { "sort": { "ubr_ref": -1 }}).fetch();
            break
        case "cbr":
            tempList = tempReleaseFeature.find({}, { "sort": { "cbr_ref": -1 }}).fetch();
            break;
        default:
            break;
    }

    let names = [];
    let nums  = [];
    let count = 0 ;
    for(let i=0; i<tempList.length; i++){
        names.push(tempList[i].name);
        switch(mode){
            case "total":
                nums.push(tempList[i].total_ref);
                break;
            case "ubr":
                nums.push(tempList[i].ubr_ref);
                break;
            case "cbr":
                nums.push(tempList[i].cbr_ref);
                break;
            default:
                break;
        }
        count = count + 1;
        if(Number(count) === Number(topSelectNum))
            break;
    }

    var barData = {
        labels: names,
        datasets: [
            {
                label: "Feature Reference Number",
                backgroundColor: 'rgba(26,179,148,0.5)',
                borderColor: "rgba(26,179,148,0.7)",
                pointBackgroundColor: "rgba(255,179,148,1)",
                pointBorderColor: "#000",
                data: nums
            }
        ]
    };

    if(Number(nums.length) > 25) {
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

Template.releaseFeature.helpers ({
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

    RelFeaSettings: function () {
        if (is_cbr()) {
            return {
                collection: tempReleaseFeature,
                rowsPerPage: 10,
                showFilter: true,
                fields: [
                    { key: 'name',        label: 'Release Name'},
                    { key: 'cbr_ref',   label: 'Feature Number', sortOrder: 0, sortDirection: 'descending'},
                ],
            }
        } else {
            return {
                collection: tempReleaseFeature,
                rowsPerPage: 10,
                showFilter: true,
                fields: [
                    { key: 'name',        label: 'Release Name'},
                    { key: 'ubr_ref',   label: 'Feature Number', sortOrder: 0, sortDirection: 'descending'},
                ],
            }
        }
    },

    relFeaBarTitle: function(){
        return Session.get('relFeaBarTitle');
    },
    relFeaTableTitle: function(){
        return Session.get('relFeaTableTitle');
    },
});
            
Template.releaseFeature.events({
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

function createLocalCollection(){
    Session.set('relFeaTableTitle', "Release Feature Table Data");
};
