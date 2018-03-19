
let myChart = null;
Template.chassisSummary.onRendered( function(){
    Session.set('chaSumPieTitle', "Chassis Type Pie | Loading ......");
    Session.set('chaSumTableTitle', "Chassis Type Table Data | Loading ......");
    onDraw();
});

var datas = [];
var labels = [];

function onDraw() {
    //let topSelectNum = Session.get("select_page");
    //if(topSelectNum === undefined) { topSelectNum = 10; }


    if (!FlowRouter.subsReady("tempChassisSummary")) {
        Meteor.setTimeout(onDraw, 1);
        return false;
    }

    let ret = tempChassisSummary.find({}).fetch();

    datas = [];
    labels = [];
    for(let i=0; i<ret.length; i++){
        labels.push(ret[i].name);
        datas.push(ret[i].num);
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

    Session.set('chaSumTableTitle', "Chassis Type Table Data");

    let pieData = [];
    for(let i=0; i<ret.length; i++){
        pieData.push({label: ret[i].name,
                        data: ret[i].num, 
                        color: getRandomColor()});
    }

    var plotObj = $.plot($("#flot-pie-chart"), pieData, {
        series: {
            pie: {
                show: true
            }
        },
        grid: {
            hoverable: true
        },
        tooltip: true,
        tooltipOpts: {
            content: "%p.0%, %s", // show percentages, rounding to 2 decimal places
            shifts: {
                x: 20,
                y: 0
            },
            defaultTheme: false
        }
    });

    Session.set('chaSumPieTitle', "Chassis Type Pie");
};

Template.chassisSummary.helpers ({
    chaSumPieTitle: function(){
        return Session.get('chaSumPieTitle');
    },
    chaSumTableTitle: function(){
        return Session.get('chaSumTableTitle');
    },
});
            
Template.chassisSummary.events({
    'change #my_select': function (event) {
        Session.set("select_page", $("#my_select").val());
        onDraw();
    },
});

