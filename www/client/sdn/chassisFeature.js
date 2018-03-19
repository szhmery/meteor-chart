ChassisFeature = new Mongo.Collection(null);
let chaFeaNum = [];

let myChart = null;

Template.chassisFeature.onRendered( function(){
    Session.set('chaFeaBarTitle', "Top Chassis Ordered by Feature | Loading ......");
    Session.set('chaFeaTableTitle', "Customer Feature Table Data | Loading ......");

    createLocalCollection();
});

var datas = [];
var labels = [];

function onDraw() {
    let chaFeaNum = tempChassisFeature.find({}).fetch();
    datas = [];
    labels = [];
    for(let i=0; i<chaFeaNum.length; i++){
        labels.push(chaFeaNum[i].name);
        datas.push(chaFeaNum[i].fea_num);
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

    Session.set('chaFeaBarTitle', "Top Chassis Ordered by Feature");
};

Template.chassisFeature.helpers ({
    ChaFeaSettings: function () {
        return {
            collection: tempChassisFeature,
            rowsPerPage: 10, 
            showFilter: true,
            fields: [
                { key: 'name',      label: 'Chassis Name'},
                { key: 'fea_num',   label: 'Feature Number', sortOrder: 0, sortDirection: 'descending'},
            ],
        }
    }, 

    chaFeaBarTitle: function(){
        return Session.get('chaFeaBarTitle');
    },
    chaFeaTableTitle: function(){
        return Session.get('chaFeaTableTitle');
    },
});
            
Template.chassisFeature.events({
    'change #my_select': function (event) {
        Session.set("select_page", $("#my_select").val());
        onDraw();
    },
});

function createLocalCollection(){
    if(!(FlowRouter.subsReady("tempChassisFeature"))){
        Meteor.setTimeout(createLocalCollection, 1);
        return false;
    }

    Session.set('chaFeaTableTitle', "Customer Feature Table Data"); 
    onDraw();
};
