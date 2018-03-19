CustomerFeature = new Mongo.Collection(null);

let comFeaCBRNum = [];

let myChart = null;
Template.customerFeature.onRendered( function(){
    $('.chosen-select').select2();

    Session.set('loading', true);

    // Set the default customer to comcast cable
    Session.set("customer_select", "COMCAST CABLE");
    $(".select2-selection__rendered").text("COMCAST CABLE");

    onDraw();
});

var labels = [];

function onDraw() {
    if (!(FlowRouter.subsReady("tempCustomerFeature"))){
        Meteor.setTimeout(onDraw, 1);
        return;
    }

    let topSelectNum = Session.get("select_page");
    if(topSelectNum === undefined) { topSelectNum = 10; }

    Session.set('loading', false);

    let customerSelected = Session.get("customer_select");
    if (customerSelected === undefined || customerSelected === "") {
        if (myChart) {
            myChart.destroy();
        }
        return;
    }

    CustomerFeature.remove({});
    let rc = tempCustomerFeature.find({customer:customerSelected}).fetch();
    for (let i=0; i<rc[0].featureList.length; i++) {
        CustomerFeature.insert(rc[0].featureList[i]);
    }

    let mode = Session.get("mode");
    if (mode === undefined) { mode = "CBR"; }
    mode = mode.toLowerCase();

    var tempList = rc[0].featureList;
    /*switch(mode){
        case "total":
            tempList = tempCustomerFeature.find({customer:customerSelected}, { "sort": { "total_ref": -1 }}).fetch();
            break;
        case "ubr":
            tempList = tempCustomerFeature.find({customer:customerSelected}, { "sort": { "ubr_ref": -1 }}).fetch();
            break;
        case "cbr":
            tempList = tempCustomerFeature.find({customer:customerSelected}, { "sort": { "cbr_ref": -1 }}).fetch();
            break;
        default:
            break;
    }*/

    let names = [];
    let nums  = [];
    let count = 0 ;
    for(let i=0; i<tempList.length; i++){
        names.push(tempList[i].name);
        nums.push(tempList[i].num);
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

    Session.set('cusFeaBarTitle', "Top Feature");
};

Template.customerFeature.helpers ({
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
    cusFeaBarTitle: function() {
        return Session.get('cusFeaBarTitle');
    },
    cusFeaTableTitle: function(){
        return Session.get('cusFeaTableTitle');
    },
    customers: function () {
        if(FlowRouter.subsReady("tempCustomerMap")){
            let ret = tempCustomerMap.find({}, { "sort": { "name":1}}).fetch();
            Session.set('cusFeaBarTitle', "The Top Feature Ordered by Chassis");
            return ret;
        } else {
            return [];
        }
    },
    is_selected: function (cus) {
        if(Session.get("customer_select") === cus){
            return "selected"
        } else {
            return ""
        }
    },
    ComFeaSettings: function () {
        let customer = Session.get("customer_select");
        if (is_cbr()) {
            return {
                collection: CustomerFeature,
                rowsPerPage: 10,
                showFilter: true,
                fields: [
                    { key: 'name',        label: 'Feature Name'},
                    { key: 'num',   label: 'Reference Number', sortOrder: 0, sortDirection: 'descending'},
                ],
            }
        } else {
            return {
                collection: CustomerFeature,
                rowsPerPage: 10,
                showFilter: true,
                fields: [
                    { key: 'name',        label: 'Feature Name'},
                    { key: 'num',   label: 'Reference Number', sortOrder: 0, sortDirection: 'descending'},
                ],
            }
        }

    },
});
            
Template.customerFeature.events({
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
        Session.set("customer_select", $(".chosen-select").val());

        Session.set('cusFeaTableTitle', "Feature Reference Statics");
        Session.set('cusFeaBarTitle', "The Top Feature | Loading ......");

        onDraw();
    },
});

