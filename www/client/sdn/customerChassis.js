
tempChassisTop = new Mongo.Collection(null);
let myChart = null;
Template.customerChassis.onRendered(function (){
    $('.chosen-select').select2();

    Session.set('loading', true);

    Session.set("customer_select", "COMCAST CABLE");
    $(".select2-selection__rendered").text("COMCAST CABLE");

    onDraw();
});

function onDraw(){
    let topSelectNum = Session.get("select_page");
    if(topSelectNum === undefined) { topSelectNum = 10; }

    if (!(FlowRouter.subsReady("tempCustomerMap") && FlowRouter.subsReady("tempCustomerChassis"))){
        Meteor.setTimeout(onDraw, 1);
        return;
    }

    let customerSelected = Session.get("customer_select");
    if (customerSelected === undefined || customerSelected === "") {
        return;
    }

    //createLocalCollection(customerSelected);

    let mode = Session.get("mode");
    if (mode === undefined) { mode = "CBR"; }
    mode = mode.toLowerCase();

    var tempList = tempCustomerChassis.find({customer:customerSelected}).fetch();
    var chassisList = tempList[0].chassisList //get first element
    tempChassisTop.remove({});
    for(let i=0; i<chassisList.length; i++){
        tempChassisTop.insert(chassisList[i]);
    }


    let names = [];
    let nums  = [];
    let count = 0 ;
    for(let i=0; i<chassisList.length; i++){
        names.push(chassisList[i].hostname);
        nums.push(chassisList[i].num);
        count = count + 1;
        if(Number(count) === Number(topSelectNum))
            break;
    }

    var barData = {
        labels: names,
        datasets: [
            {
                label: "Top Chassiss Number",
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

Template.customerChassis.helpers ({
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
    chaTopBarTitle: function() {
        return Session.get('chaTopBarTitle');
    },
    chaTopTableTitle: function(){
        return Session.get('chaTopTableTitle');
    },
    customers: function () {
        if(FlowRouter.subsReady("tempCustomerMap")){
            let ret = tempCustomerMap.find({}, { "sort": { "name":1}}).fetch();
            Session.set('chaTopBarTitle', "The Top Chassis");
            return ret;
        } else {
            return [];
        }
    },
        
    ChsTopSettings: function () {
        return {
            collection: tempChassisTop,
            rowsPerPage: 10, 
            showFilter: true,
            fields: [
                { key: 'hostname',      label: 'Chassis Name'},
                { key: 'num',   label: 'Case Number', sortOrder: 0, sortDirection: 'descending'},
            ],
        }
    }, 

});

Template.customerChassis.events({
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

        onDraw();
    },
});

function createLocalCollection(customerName){
    
    if(!(FlowRouter.subsReady("shrun"))){
        Meteor.setTimeout(createLocalCollection(customerName), 1);
        return;
    }

};
