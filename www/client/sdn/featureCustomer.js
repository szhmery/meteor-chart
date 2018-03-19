
FeaturesCustomer = new Mongo.Collection(null);

let myChart = null;
Template.featureCustomer.onRendered( function(){
    $('.chosen-select').select2();

    Session.set('loading', true);

    Session.set("feature_select", "ARP Filter for CBR");
    $(".select2-selection__rendered").text("ARP Filter for CBR");

    onDraw();
});

var datas = [];
var labels = [];

function onDraw() {
    if (!(FlowRouter.subsReady("tempFeatureCustomer"))){
        Meteor.setTimeout(onDraw, 1);
        return;
    }
    
    Session.set('loading', false);

    let feaSelected = Session.get("feature_select");
    if (feaSelected === undefined || feaSelected === "") {
        if (myChart) {
            myChart.destroy();
        }
        return;
    }

    let topSelectNum = Session.get("select_page");
    if(topSelectNum === undefined) { topSelectNum = 10; }

    let mode = Session.get("mode");
    if (mode === undefined) { mode = "CBR"; }
    mode = mode.toLowerCase();

    let comName = [];
    let comNum = [];
    let comHost = [];

    // update local collection
    FeaturesCustomer.remove({});
    let count = 0;
    let rc = tempFeatureCustomer.find({feature:feaSelected}).fetch();
    for (let i=0; i<rc[0].customerList.length; i++) {
        FeaturesCustomer.insert(rc[0].customerList[i]);

        if(count < 10){
            comName.push(rc[0].customerList[i].name);
            comNum.push(rc[0].customerList[i].used);
            comHost.push(rc[0].customerList[i].total);
            count = count + 1;
        }
    }

    var barData = {
        labels: comName,
        datasets: [
            {
                label: "Chassis Number",
                backgroundColor: 'rgba(90, 90, 90, 0.5)',
                pointBorderColor: "#fff",
                data: comHost
            },{
                label: "Chassis Running with the Features",
                backgroundColor: 'rgba(26,179,148,0.5)',
                borderColor: "rgba(26,179,148,0.7)",
                pointBackgroundColor: "rgba(255,179,148,1)",
                pointBorderColor: "#000",
                data: comNum
            },
        ]
    };

    if(Number(comNum.length) > 25) {
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

};

Template.featureCustomer.helpers ({
    features: function () {
        if(FlowRouter.subsReady("featureCustomer")){
            let ret = Features.find({}, { "sort": { "name":1}});
            return ret;
        }
    },
    is_selected: function (fea) {
        if(Session.get("feature_select") === fea){
            return "selected"
        } else {
            return ""
        }
    },
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
    feaCusBarTitle: function(){
        return Session.get('feaCusBarTitle');
    },

    FeaCusSettings: function () {
        let customer = Session.get("feature_select");
        if (is_cbr()) {
            return {
                collection: FeaturesCustomer,
                rowsPerPage: 10,
                showFilter: true,
                fields: [
                    { key: 'name',  label: 'Customer Name'},
                    { key: 'used',   label: 'Chassis Used', sortOrder: 0, sortDirection: 'descending'},
                    { key: 'total',   label: 'Chassis Number'},
                ],
            }
        } else {
            return {
                collection: FeaturesCustomer,
                rowsPerPage: 10,
                showFilter: true,
                fields: [
                    { key: 'name',  label: 'Customer Name'},
                    { key: 'used',   label: 'Chassis Used', sortOrder: 0, sortDirection: 'descending'},
                    { key: 'total',   label: 'Chassis Number'},
                ],
            }
        }
    },
});
            
Template.featureCustomer.events({
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
    'change .chosen-select': function (event) {
        Session.set("feature_select", $(".chosen-select").val());
        onDraw();
    },
});

