let myChart = null;

var datas = [];
var labels = [];

function onDraw() {
    let topSelectNum = Session.get("select_page");
    if(topSelectNum === undefined) { topSelectNum = 10; }

    if (!FlowRouter.subsReady("featureSummary")) {
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

Template.featureSummary.rendered = function(){
//    Meteor.subscribe('features');
//    $('.footable').DataTable({
//        dom: '<"html5buttons"B>lTfgitp',
//        buttons: [
//            {extend: 'excel', title: 'ExampleFile'},
//            {extend: 'pdf', title: 'ExampleFile'},
//        ]
//
//    });
//    console.log("Load feature successfully!");
    Session.set("loading", true);
    initFeaSumTable();
    onDraw();
};

function initFeaSumTable(){
    if(!(FlowRouter.subsReady("featureSummary"))){
        Meteor.setTimeout(initFeaSumTable, 1);
        return;
    }

    Session.set("loading", false);
//    setTimeout(function(){ 
//    }, 3000); 

    $('.feaSumTable').DataTable({
        dom: '<"html5buttons"B>lTfgitp',
        buttons: [
            {extend: 'excel', title: 'ExampleFile'},
            {extend: 'pdf', title: 'ExampleFile'},
        ]

    });
    console.log("Load feature successfully!");

};

Template.featureSummary.helpers ({
    features: function () {
        return Features.find({});
    },
});

