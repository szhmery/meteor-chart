//import Tabular from 'meteor/aldeed:tabular'

//import { Features } from '../import/api/features.js'

Meteor.startup(function () {
    testCollection = new Mongo.Collection('tempTestCollection');

     var db_str = { 
              'insert': (userId,doc) => {
                    return true;
            }   
            , 'remove': (userId,doc) => {
                    return true;
            }   
            , 'update': (userId,doc) => {
                    return true;
            }   
            };  
    testCollection.allow(db_str);

    remove_all_rows(testCollection);
    console.log("clear testCollection");

        testCollection.insert({
            customer: "test",
            total_ref: 1,
            ubr_ref: 0,
            cbr_ref: 0,
        });

    console.log("insert a item");
    // to debug
    // can not create a collection and insert items


    console.log("Sart to calculate the temp database!");
    //
});

customerInfo = new Mongo.Collection('customerInfo'); 
customerMap = new Mongo.Collection('customerMap'); 
releaseMap = new Mongo.Collection('releaseMap');
tempDashboard = new Mongo.Collection('tempDashboard');
tempChassisSummary = new Mongo.Collection('tempChassisSummary');
tempChassisFeature = new Mongo.Collection('tempChassisFeature');
tempReleaseSummary = new Mongo.Collection('tempReleaseSummary');
tempReleaseFeature = new Mongo.Collection('tempReleaseFeature');
tempCustomerSummary = new Mongo.Collection('tempCustomerSummary');
tempCustomerFeature = new Mongo.Collection('tempCustomerFeature');
tempCustomerChassis = new Mongo.Collection('tempCustomerChassis');
tempFeatureTop = new Mongo.Collection('tempFeatureTop');
tempFeatureCustomer = new Mongo.Collection('tempFeatureCustomer');
tempCustomerMap = new Mongo.Collection('tempCustomerMap');
// unit_test = new Mongo.Collection('unit_test');
if (Meteor.isServer) {
     var db_str = { 
              'insert': (userId,doc) => {
                    return true;
            }   
            , 'remove': (userId,doc) => {
                    return true;
            }   
            , 'update': (userId,doc) => {
                    return true;
            }   
            };

    customerMap.allow(db_str);
    Meteor.publish('customerMap',function () {
        return customerMap.find({});
    });

    releaseMap.allow(db_str);
    Meteor.publish('releaseMap',function () {
        return releaseMap.find({});
    });

    customerInfo.allow(db_str);
    Meteor.publish('customerInfo',function () {
        return customerInfo.find({});
    });

    tempDashboard.allow(db_str);
    Meteor.publish('tempDashboard',function () {
        return tempDashboard.find({});
    });

    tempReleaseFeature.allow(db_str);
    Meteor.publish('tempReleaseFeature',function () {
        return tempReleaseFeature.find({});
    });

    tempReleaseSummary.allow(db_str);
    Meteor.publish('tempReleaseSummary',function () {
        return tempReleaseSummary.find({});
    });

    tempChassisSummary.allow(db_str);
    Meteor.publish('tempChassisSummary',function () {
        return tempChassisSummary.find({});
    });

    tempChassisFeature.allow(db_str);
    Meteor.publish('tempChassisFeature',function () {
        return tempChassisFeature.find({});
    });

    tempCustomerSummary.allow(db_str);
    Meteor.publish('tempCustomerSummary',function () {
        return tempCustomerSummary.find({});
    });

    tempCustomerFeature.allow(db_str);
    Meteor.publish('tempCustomerFeature',function () {
        return tempCustomerFeature.find({});
    });

    tempCustomerChassis.allow(db_str);
    Meteor.publish('tempCustomerChassis',function () {
        return tempCustomerChassis.find({});
    });

    tempFeatureTop.allow(db_str);
    Meteor.publish('tempFeatureTop',function () {
        return tempFeatureTop.find({});
    });

    tempFeatureCustomer.allow(db_str);
    Meteor.publish('tempFeatureCustomer',function () {
        return tempFeatureCustomer.find({});
    });

    tempCustomerMap.allow(db_str);
    Meteor.publish('tempCustomerMap',function () {
        return tempCustomerMap.find({});
    });


}



remove_all_rows = (db) => {
    var ret = db.find({}, {fields:{_id:1}});
    for (var i=0; i<ret.length; i++) {
        db.remove({_id:ret[i]._id});
    }
}

