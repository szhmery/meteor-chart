let myChart = null;
Template.dashboard.onRendered(function () {
    Session.set('cusHisBarTitle', "Customer Case History | Loading ......");

    onDraw();
});

function onDraw() {
    if (!(FlowRouter.subsReady("case_history") && FlowRouter.subsReady("features")
            && FlowRouter.subsReady("shrunDashboard") && FlowRouter.subsReady("customerMap")
            && FlowRouter.subsReady("releaseMap") && FlowRouter.subsReady("duplicatedSr"))) {
        Meteor.setTimeout(onDraw, 1);
        return false;
    }

    let cbrData = [];
    let timeData = [];
    let ret = HIS.find({}, {"sort": {"month": 1}}).fetch();

    for (let i = 0; i < ret.length; i++) {
        if (is_cbr()) {
            cbrData.push(ret[i].cbr);
        } else {
            cbrData.push(ret[i].ubr);
        }
        timeData.push(ret[i].month);
    }

    var lineData = {
        labels: timeData,
        datasets: [
            {
                label: "Monthly CBR Cases Number",
                backgroundColor: 'rgba(26,179,148,0)',
                borderColor: "rgba(26,179,148,0.7)",
                pointBackgroundColor: "rgba(26,179,148,1)",
                pointBorderColor: "#fff",
                data: cbrData
            },
        ]
    };
    var barOptions = {
        responsive: true,
    };

    if (myChart) {
        myChart.destroy();
    }
    var ctx2 = document.getElementById("flot-dashboard-chart").getContext("2d");
    myChart = new Chart(ctx2, {type: 'line', data: lineData, options: barOptions});

    Session.set('cusHisBarTitle', "Customer Case History");
};

Template.dashboard.destroyed = function () {
    // Remove special class
    $('body').removeClass('light-navbar');
};

function getDashboardNum(field) {
    ret = tempDashboard.find({name: "dashboard"}).fetch();
    if (ret.length === 0) {
        return 0
    } else {
        return ret[0][field];
    }
}

Template.dashboard.helpers({
    case_num: function () {
        return getDashboardNum("case_num");
    },
    chassis_num: function () {
        return getDashboardNum("chassis_num");
    },
    release_num: function () {
        return getDashboardNum("release_num");
    },
    customer_num: function () {
        return getDashboardNum("customer_num");
    },
    total_case_num: function () {
        return getDashboardNum("total_case_num");
    },
    cusHisBarTitle: function () {
        return Session.get('cusHisBarTitle');
    },
});


Template.dashboard.destroyed = function () {
    // Remove special class
    $('body').removeClass('light-navbar');
};

Template.dashboard.events({
    'click .downloadAllRaw'() {

        let features = Features.find().fetch();
        let table = document.createElement("table");
        let tbody = document.createElement("tbody");

        let title_tr = document.createElement("tr");

        let title_th1 = document.createElement("th");
        title_th1.setAttribute("rowspan", "2")
        let title_inner1 = document.createTextNode("SR ID");
        title_th1.appendChild(title_inner1);

        let title_th2 = document.createElement("th");
        title_th2.setAttribute("rowspan", "2");
        let title_inner2 = document.createTextNode("Customer");
        title_th2.appendChild(title_inner2);

        let title_th3 = document.createElement("th");
        title_th3.setAttribute("rowspan", "2");
        let title_inner3 = document.createTextNode("Release");
        title_th3.appendChild(title_inner3);

        let title_th4 = document.createElement("th");
        title_th4.setAttribute("rowspan", "2");
        let title_inner4 = document.createTextNode("Chassis");
        title_th4.appendChild(title_inner4);

        let title_th5 = document.createElement("th");
        title_th5.setAttribute("colspan", features.length);
        let title_inner5 = document.createTextNode("Features");
        title_th5.appendChild(title_inner5);

        title_tr.appendChild(title_th1);
        title_tr.appendChild(title_th2);
        title_tr.appendChild(title_th3);
        title_tr.appendChild(title_th4);
        title_tr.appendChild(title_th5);

        let title_tr_feature = document.createElement("tr");

        for (let i = 0; i < features.length; i++) {
            let title_th_feature = document.createElement("th");
            let title_inner_feature = document.createTextNode(features[i].name);
            title_th_feature.appendChild(title_inner_feature);
            title_tr_feature.appendChild(title_th_feature);
        }

        tbody.appendChild(title_tr);
        tbody.appendChild(title_tr_feature);

        let ret = Shrun.find({chassis: /cbr.*/}).fetch();
        let len = ret.length;
        if (len !== 0) {
            for (let i = 0; i < len; i++) {
                let tr = document.createElement("tr");

                let td1 = document.createElement("td");
                let inner1 = document.createTextNode(ret[i].idsr);
                td1.appendChild(inner1);

                let td2 = document.createElement("td");
                let inner2 = document.createTextNode(getCustomerName(ret[i].company));
                td2.appendChild(inner2);

                let td3 = document.createElement("td");
                let inner3 = document.createTextNode(getReleaseName(ret[i].release));
                td3.appendChild(inner3);

                let td4 = document.createElement("td");
                let inner4 = document.createTextNode(ret[i].hostname);
                td4.appendChild(inner4);

                tr.appendChild(td1);
                tr.appendChild(td2);
                tr.appendChild(td3);
                tr.appendChild(td4);

                // todo feature list
                for (let j = 0; j < features.length; j++) {
                    let td5 = document.createElement("td");
                    let inner5 = null;
                    if (ret[i].featureList.indexOf(features[j].name) != -1) {
                        inner5 = document.createTextNode("Y");
                    }
                    else {
                        inner5 = document.createTextNode("N");
                    }
                    td5.appendChild(inner5);
                    tr.appendChild(td5);
                }

                tbody.appendChild(tr);
            }
        }
        let duplicatedSr = DuplicatedSr.find().fetch();
        if (duplicatedSr.length != 0) {
            for (let i = 0; i < duplicatedSr.length; i++) {
                let tr = document.createElement("tr");
                let td1 = document.createElement("td");
                let inner1 = document.createTextNode(duplicatedSr[i].origin_sr);
                td1.appendChild(inner1);

                let td2 = document.createElement("td");
                let inner2 = document.createTextNode(duplicatedSr[i].company);
                td2.appendChild(inner2);

                let td3 = document.createElement("td");
                let inner3 = document.createTextNode(duplicatedSr[i].release);
                td3.appendChild(inner3);

                let td4 = document.createElement("td");
                let inner4 = document.createTextNode(duplicatedSr[i].hostname);
                td4.appendChild(inner4);

                tr.appendChild(td1);
                tr.appendChild(td2);
                tr.appendChild(td3);
                tr.appendChild(td4);

                for (let j = 0; j < features.length; j++) {
                    let td5 = document.createElement("td");
                    let inner5 = null;
                    if (duplicatedSr[i].featureList.indexOf(features[j].name) != -1) {
                        inner5 = document.createTextNode("Y");
                    }
                    else {
                        inner5 = document.createTextNode("N");
                    }
                    td5.appendChild(inner5);
                    tr.appendChild(td5);
                }

                tbody.appendChild(tr);
            }
        }
        table.appendChild(tbody);

        let uri = 'data:application/vnd.ms-excel;base64,',
            template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><?xml version="1.0" encoding="UTF-8" standalone="yes"?><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table style="vnd.ms-excel.numberformat:@">{table}</table></body></html>',
            base64 = function (s) {
                return window.btoa(unescape(encodeURIComponent(s)));
            },
            format = function (s, c) {
                return s.replace(/{(\w+)}/g, function (m, p) {
                    return c[p];
                });
            };
        let ctx = {
            worksheet: name || 'All Raw Datas',
            table: table.innerHTML
        };
        window.location.href = uri + base64(format(template, ctx));

    }
});