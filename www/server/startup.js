
function do_dashboard() {
    var case_num = 450+276;
    var total_case_num = 24134;
    var chassis_num = SR.find({chassis:/cbr.*/}).fetch().length;
    var release_num = releaseMap.find({chassis:'cbr', show:true}).fetch().length;
    var customer_num = 0; // It will be updated in do_customerSummary()

    var data = {name:"dashboard", 
                case_num:case_num,
                total_case_num:total_case_num,
                chassis_num:chassis_num,
                release_num:release_num,
                customer_num:customer_num};

    tempDashboard.remove({});
    tempDashboard.insert(data);

    console.log("Server: Dashboard is done! ");
}

function do_releaseSummary() {
    var ret = Shrun.find({chassis:/cbr.*/}).fetch();

    var releaseTotal = new Array();
    var releaseUBR = new Array();
    var releaseCBR = new Array();

    for(var i=0; i<ret.length; i++){
        ret[i].release = getReleaseName(ret[i].release);
    }

    for(var i=0; i<ret.length; i++){
        /*
        // total
        if(releaseTotal.hasOwnProperty(ret[i].release)){
            if(releaseTotal[ret[i].release].indexOf(ret[i].hostname) == -1){
                releaseTotal[ret[i].release].push(ret[i].hostname);
            }
        }
        else{
            releaseTotal[ret[i].release] = new Array();
            releaseTotal[ret[i].release].push(ret[i].hostname);
        }

        // ubr
        if(ret[i].chassis.indexOf("ubr") >= 0){

            if(releaseUBR.hasOwnProperty(ret[i].release)){
                if(releaseUBR[ret[i].release].indexOf(ret[i].hostname) == -1){
                    releaseUBR[ret[i].release].push(ret[i].hostname);
                }
            }
            else{
                releaseUBR[ret[i].release] = new Array();
                releaseUBR[ret[i].release].push(ret[i].hostname);
            }
        }
        */

        // cbr
        if(ret[i].chassis.indexOf("cbr") >= 0){

            if(releaseCBR.hasOwnProperty(ret[i].release)){
                if(releaseCBR[ret[i].release].indexOf(ret[i].hostname) == -1){
                    releaseCBR[ret[i].release].push(ret[i].hostname);
                }
            }
            else{
                releaseCBR[ret[i].release] = new Array();
                releaseCBR[ret[i].release].push(ret[i].hostname);
            }
        }
 
    }

    /*
    relChaTotalNum = [];
    for(var rel in releaseTotal){
        var temp = {'name':rel, 'num':releaseTotal[rel].length};
        relChaTotalNum.push(temp);
    }
    relChaTotalNum.sort(function(a, b){
        return b.num - a.num;
    });

    relChaUBRNum = [];
    for(var rel in releaseUBR){
        var temp = {'name':rel, 'num':releaseUBR[rel].length};
        relChaUBRNum.push(temp);
    }
    relChaUBRNum.sort(function(a, b){
        return b.num - a.num;
    });

    */
    relChaCBRNum = [];
    for(var rel in releaseCBR){
        var temp = {'name':rel, 'num':releaseCBR[rel].length};
        relChaCBRNum.push(temp);
    }
    relChaCBRNum.sort(function(a, b){
        return b.num - a.num;
    });


    // update collection
    tempReleaseSummary.remove({}); // clear collection
    len = relChaCBRNum.length;
    for(var i=0; i<len; i++){
        tempReleaseSummary.insert({
            name: relChaCBRNum[i].name,
            //total_ref: relChaTotalNum[i].num,
            //ubr_ref: 0,
            cbr_ref: relChaCBRNum[i].num,
        });
    }

    /*
    len = relChaUBRNum.length;
    for(var i=0; i<len; i++){
        var com = tempReleaseSummary.findOne({name: relChaUBRNum[i].name});
        tempReleaseSummary.update({_id: com._id}, { $set: { ubr_ref: relChaUBRNum[i].num}});
    }

    len = relChaCBRNum.length;
    for(var i=0; i<len; i++){
        var com = tempReleaseSummary.findOne({name: relChaCBRNum[i].name});
        tempReleaseSummary.update({_id: com._id}, { $set: { cbr_ref: relChaCBRNum[i].num}});
    }
    */

    console.log("Server: tempReleaseSummary is done! ");
}

function do_releaseFeature() {
    tempReleaseFeature.remove({});

    var ret = Shrun.find({chassis:/cbr.*/}).fetch();
    var releaseFeaTotal = new Array();
    var releaseFeaUBR = new Array();
    var releaseFeaCBR = new Array();

    for(var i=0; i<ret.length; i++){
        ret[i].release = getReleaseName(ret[i].release);
    }

    for(var i=0; i<ret.length; i++){
        // total
        if(releaseFeaTotal.hasOwnProperty(ret[i].release)){
            for(var j in ret[i].featureList){
                if(releaseFeaTotal[ret[i].release].indexOf(ret[i].featureList[j]) == -1){
                    releaseFeaTotal[ret[i].release].push(ret[i].featureList[j]);
                }
            }
        }
        else{
            releaseFeaTotal[ret[i].release] = new Array();
            for(var j in ret[i].featureList){
                releaseFeaTotal[ret[i].release].push(ret[i].featureList[j]);
            }
        }

        // ubr
        if(ret[i].chassis.indexOf("ubr") >= 0){
            if(releaseFeaUBR.hasOwnProperty(ret[i].release)){
                for(var j in ret[i].featureList){
                    if(releaseFeaUBR[ret[i].release].indexOf(ret[i].featureList[j]) == -1){
                        releaseFeaUBR[ret[i].release].push(ret[i].featureList[j]);
                    }
                }
            }
            else{
                releaseFeaUBR[ret[i].release] = new Array();
                for(var j in ret[i].featureList){
                    releaseFeaUBR[ret[i].release].push(ret[i].featureList[j]);
                }
            }
        }

        // cbr
        if(ret[i].chassis.indexOf("cbr") >= 0){
            if(releaseFeaCBR.hasOwnProperty(ret[i].release)){
                for(var j in ret[i].featureList){
                    if(releaseFeaCBR[ret[i].release].indexOf(ret[i].featureList[j]) == -1){
                        releaseFeaCBR[ret[i].release].push(ret[i].featureList[j]);
                    }
                }
            }
            else{
                releaseFeaCBR[ret[i].release] = new Array();
                for(var j in ret[i].featureList){
                    releaseFeaCBR[ret[i].release].push(ret[i].featureList[j]);
                }
            }
        }
    }

    relFeaTotalNum = [];
    for(var rel in releaseFeaTotal){
        var temp = {'name':rel, 'num':releaseFeaTotal[rel].length};
        relFeaTotalNum.push(temp);
    }
    relFeaTotalNum.sort(function(a, b){
        return b.num - a.num;
    });

    relFeaUBRNum = [];
    for(var rel in releaseFeaUBR){
        var temp = {'name':rel, 'num':releaseFeaUBR[rel].length};
        relFeaUBRNum.push(temp);
    }
    relFeaUBRNum.sort(function(a, b){
        return b.num - a.num;
    });

    relFeaCBRNum = [];
    for(var rel in releaseFeaCBR){
        var temp = {'name':rel, 'num':releaseFeaCBR[rel].length};
        relFeaCBRNum.push(temp);
    }
    relFeaCBRNum.sort(function(a, b){
        return b.num - a.num;
    });

    len = relFeaTotalNum.length;
    for(var i=0; i<len; i++){
        tempReleaseFeature.insert({
            name: relFeaTotalNum[i].name,
            total_ref: relFeaTotalNum[i].num,
            ubr_ref: 0,
            cbr_ref: 0,
        });
    }

    len = relFeaUBRNum.length;
    for(var i=0; i<len; i++){
        var com = tempReleaseFeature.findOne({name: relFeaUBRNum[i].name});
        tempReleaseFeature.update({_id: com._id}, { $set: { ubr_ref: relFeaUBRNum[i].num}});
    }

    len = relFeaCBRNum.length;
    for(var i=0; i<len; i++){
        var com = tempReleaseFeature.findOne({name: relFeaCBRNum[i].name});
        tempReleaseFeature.update({_id: com._id}, { $set: { cbr_ref: relFeaCBRNum[i].num}});
    }

    console.log("Server: tempReleaseFeature is done! ");
}

function do_chassisSummary() {
    var chaFea = new Array();

    var ret = Shrun.find({}, {chassis:1, featureList:1}).fetch();
    for(var i=0; i<ret.length; i++){
        // Fix the wrong chassis type; BTW, there is ubr10k type need to enhance
        if (ret[i].chassis === "cbr") {
            ret[i].chassis = "cbr8";
        }
        if(chaFea.hasOwnProperty(ret[i].chassis)){
            chaFea[ret[i].chassis] = chaFea[ret[i].chassis] + 1;
        } else{
            chaFea[ret[i].chassis] = 1;
        }
    }

    chaFeaNum = [];
    for(var cha in chaFea){
        var temp = {'name':cha, 'num':chaFea[cha]};
        chaFeaNum.push(temp);
    }
    chaFeaNum.sort(function(a, b){
        return b.num - a.num;
    });

    tempChassisSummary.remove({});
    for(var i=0; i<chaFeaNum.length; i++){
        tempChassisSummary.insert(
                { name:chaFeaNum[i].name, num:chaFeaNum[i].num }
        );
    }
    console.log("Server: tempChassisSummary is done! ");
}

function do_chassisFeature() {
    var ret = Shrun.find({}, {chassis:1, featureList:1}).fetch();

    var chaFea = new Array();

    for(var i=0; i<ret.length; i++){
        if(ret[i].chassis === "cbr"){
            ret[i].chassis = "cbr8";
        }

        if(chaFea.hasOwnProperty(ret[i].chassis)){
            for(var j in ret[i].featureList){
                if(chaFea[ret[i].chassis].indexOf(ret[i].featureList[j]) == -1){
                    chaFea[ret[i].chassis].push(ret[i].featureList[j]);
                }
            }
        }
        else{
            chaFea[ret[i].chassis] = new Array();
            for(var j in ret[i].featureList){
                chaFea[ret[i].chassis].push(ret[i].featureList[j]);
            }
        }
    }

    chaFeaNum = [];
    for(var cha in chaFea){
        var temp = {'name':cha, 'num':chaFea[cha].length};
        chaFeaNum.push(temp);
    }
    chaFeaNum.sort(function(a, b){
        return b.num - a.num;
    });

    tempChassisFeature.remove({}); // clear collection
    for(var i=0; i<chaFeaNum.length; i++){
        tempChassisFeature.insert({
            name: chaFeaNum[i].name,
            fea_num: chaFeaNum[i].num,
        });
    }
    console.log("Server: tempChassisFeature is done! ");
}

function do_customerSummary() {
    var shrun = Shrun.find({chassis:/cbr.*/}).fetch();

    var len = shrun.length;

    // Transfer the customer name from the customer name mapping
    for(var i=0; i<len; i++){
        shrun[i].company = getCustomerName(shrun[i].company);
    }

    companyList = [];
    for(var i=0; i<len; i++){
        if(companyList.indexOf(shrun[i].company) == -1){
            companyList.push(shrun[i].company);
        }
    }
    console.log("Customer Num: " + companyList.length);
    // Help to update the customer number in dashboard
    var system = tempDashboard.findOne({name: 'dashboard'});
    tempDashboard.update({_id: system._id}, { $set: {
                                                customer_num: companyList.length}});
    tempCustomerMap.remove({});
    for(var i=0; i<companyList.length; i++){
        tempCustomerMap.insert({
            name: companyList[i],
            origin_name: "", // Need not origin name
        });
        //console.log("Add customer - " + i + "/" + companyList[i]);
    }

    //var companiesTotal = new Array();
    //var companiesUBR = new Array();
    var companiesCBR = new Array();

    for(var i=0; i<len; i++){
        /*
        // total
        if(companiesTotal.hasOwnProperty(shrun[i].company)){
            if(companiesTotal[shrun[i].company].indexOf(shrun[i].hostname) == -1){
                companiesTotal[shrun[i].company].push(shrun[i].hostname);
            }
        }
        else{
            companiesTotal[shrun[i].company] = new Array;
            companiesTotal[shrun[i].company].push(shrun[i].hostname);
        }

        // ubr
        if(shrun[i].chassis.indexOf("ubr") >= 0){

            if(companiesUBR.hasOwnProperty(shrun[i].company)){
                if(companiesUBR[shrun[i].company].indexOf(shrun[i].hostname) == -1){
                    companiesUBR[shrun[i].company].push(shrun[i].hostname);
                }
            }
            else{
                companiesUBR[shrun[i].company] = new Array;
                companiesUBR[shrun[i].company].push(shrun[i].hostname);
            }
        }
        */

        // cbr
        if(shrun[i].chassis.indexOf("cbr") >= 0){

            if(companiesCBR.hasOwnProperty(shrun[i].company)){
                companiesCBR[shrun[i].company] = companiesCBR[shrun[i].company] + 1 ;
            }
            else{
                companiesCBR[shrun[i].company] = 1;
            }
        }
    }

    /*
    comChaTotalNum = [];
    for(var com in companiesTotal){
        var temp = {'name':com, 'num':companiesTotal[com].length};
        comChaTotalNum.push(temp);
    }
    comChaTotalNum.sort(function(a, b){
        return b.num - a.num;
    });

    comChaUBRNum = [];
    for(var com in companiesUBR){
        var temp = {'name':com, 'num':companiesUBR[com].length};
        comChaUBRNum.push(temp);
    }
    comChaUBRNum.sort(function(a, b){
        return b.num - a.num;
    });
    */

    comChaCBRNum = [];
    for(var com in companiesCBR){
        var temp = {'name':com, 'num':companiesCBR[com]};
        comChaCBRNum.push(temp);
    }
    comChaCBRNum.sort(function(a, b){
        return b.num - a.num;
    });

    // update collection
    /*
    tempCustomerSummary.remove({}); // clear collection
    len = comChaTotalNum.length;
    for(var i=0; i<len; i++){
        tempCustomerSummary.insert({
            name: comChaTotalNum[i].name,
            total_ref: comChaTotalNum[i].num,
            ubr_ref: 0,
            cbr_ref: 0,
        });
    }

    len = comChaUBRNum.length;
    for(var i=0; i<len; i++){
        var com = tempCustomerSummary.findOne({name: comChaUBRNum[i].name});
        tempCustomerSummary.update({_id: com._id}, { $set: { ubr_ref: comChaUBRNum[i].num}});
    }
    */

    tempCustomerSummary.remove({});
    len = comChaCBRNum.length;
    for(var i=0; i<len; i++){
        tempCustomerSummary.insert({
            name: comChaCBRNum[i].name,
            cbr_ref: comChaCBRNum[i].num,
        });
    }

    console.log("Server: tempCustomerSummary is done! ");
}

function createCustomerFeatureListDB(customerName){
    var shrun = Shrun.find({}).fetch();

    for(var i=0; i<shrun.length; i++){
        shrun[i].company = getCustomerName(shrun[i].company);
    }

    var comFeaCBR = new Array();

    for(var i=0; i<shrun.length; i++){
        if(shrun[i].company == customerName){
            // cbr, only need cbr data
            if(shrun[i].chassis.indexOf("cbr") >= 0){
                for(var j=0; j<shrun[i].featureList.length; j++){
                    if(comFeaCBR.hasOwnProperty(shrun[i].featureList[j])){
                        comFeaCBR[shrun[i].featureList[j]] = comFeaCBR[shrun[i].featureList[j]] + 1;
                    }
                    else {
                        comFeaCBR[shrun[i].featureList[j]] = 1;
                    }
                }
            }
        }
    }
    comFeaCBRNum = [];
    for(var fea in comFeaCBR){
        var temp = {'name':fea, 'num':comFeaCBR[fea]};
        comFeaCBRNum.push(temp);
    }
    comFeaCBRNum.sort(function(a, b){
        return b.num - a.num;
    });
    console.log("createCustomerFeatureListDB insert to DB");

    tempCustomerFeature.insert({
        customer:customerName,
        featureList: comFeaCBRNum
    });

};
function createCustomerChassisDB(customerName){

    var tempList = []
    var info = []
    info = customerInfo.find({}).fetch();
    for (var i=0; i<info.length; i++) {
        var customer = getCustomerName(info[i].company);
        if (customer !== info[i].company) {
            customerInfo.update({_id:info[i]._id}, {$set: {company:customer}});
        }
    }

    tempList = customerInfo.find({company:customerName}, {sort:{num:-1}}).fetch();

    var comChaCBRNum = [];
    for(var i=0; i<tempList.length; i++) {
        // only need cbr
        if(tempList[i].chassis != undefined) {
            if (tempList[i].chassis.indexOf("cbr") >= 0) {
                var temp = {'hostname': tempList[i].hostname, 'num': tempList[i].hostnum};
                comChaCBRNum.push(temp);
            }
        }
    }

    comChaCBRNum.sort(function(a, b){
        return b.num - a.num;
    });
    console.log("createCustomerChassisDB insert to DB");

    tempCustomerChassis.insert({
        customer:customerName,
        chassisList: comChaCBRNum
    });

};

function createFeatureCustomerListDB(featureName){
    var comList = new Array();
    var comHostList = new Array();

    var ret = Shrun.find({}, {company:1, hostname:1, featureList:1, chassis:1}).fetch();

    for(var i=0; i<ret.length; i++){
        ret[i].company = getCustomerName(ret[i].company);
    }

    for(var i=0; i<ret.length; i++){
        if(ret[i].chassis.indexOf("cbr") >= 0){

            if(comHostList.hasOwnProperty(ret[i].company)){
                comHostList[ret[i].company] =  comHostList[ret[i].company] + 1;
            }
            else {
                comHostList[ret[i].company] = 1;
            }

            if(ret[i].featureList.indexOf(featureName) != -1){
                if(comList.hasOwnProperty(ret[i].company)){
                    comList[ret[i].company] =  comList[ret[i].company] + 1;
                } else {
                    comList[ret[i].company] = 1;
                }
            }
        }
    }

    var tempList = [];
    for(var com in comList){
        var temp = {'name':com, 'used':comList[com], 'total':comHostList[com]};
        tempList.push(temp);
    }
    tempList.sort(function(a, b){
        return b.used - a.used;
    });

    console.log("createFeatureCustomerListDB insert to DB");

    tempFeatureCustomer.insert({
        feature: featureName,
        customerList: tempList
    });
};

function do_customerFeature() {
    tempCustomerFeature.remove({});
    var ret = tempCustomerMap.find({}, { "sort": { "name":1}}).fetch();
    for (var i=0; i<ret.length; i++) {
        console.log("do_customerFeature Customer is " + ret[i].name);
        createCustomerFeatureListDB(ret[i].name);
    }
    console.log("Server: tempCustomerFeature is done! ");
}

function do_customerChassis() {
    tempCustomerChassis.remove({});
    var ret = tempCustomerMap.find({}, { "sort": { "name":1}}).fetch();
    for (var i=0; i<ret.length; i++) {
        console.log("do_customerChassis Customer is " + ret[i].name);
        createCustomerChassisDB(ret[i].name);
    }
    console.log("Server: tempCustomerFeature is done! ");
}

function do_featureTop() {
    console.log("Server: tempFeatureTop is done! ");
}

function do_featureCustomer() {
    tempFeatureCustomer.remove({});
    var ret = Features.find({}, { "sort": { "name":1}}).fetch();
    for (var i=0; i<ret.length; i++) {
        console.log("do_featureCustomer Customer is " + ret[i].name);
        createFeatureCustomerListDB(ret[i].name);
    }
    
    console.log("Server: tempFeatureCustomer is done! ");
}

Meteor.startup(function () {
    console.log("Server: Start to calculate the data in Server!");
    // because we have ever run below code and update DB. So do not need run again.
    /*do_dashboard();
    do_releaseSummary();
    do_releaseFeature();
    do_chassisSummary();
    do_chassisFeature();
    do_featureTop();
    do_featureCustomer();

    do_customerSummary();
    do_customerFeature(); // change the data structure to fix slow issue.
    do_customerChassis();*/

    console.log("Server: finish to calculate the data in Server!");
});
