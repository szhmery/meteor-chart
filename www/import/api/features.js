//import { Meteor } from 'meteor/meteor';
//import { Mongo } from 'meteor/mongo';
//import { check } from 'meteor/check';

Features = new Mongo.Collection('features', {
    idGeneration: 'MONGO'
});

FeatureShrun = new Mongo.Collection('feature_shrun', {
    idGeneration: 'MONGO'
});

Shrun = new Mongo.Collection('shrun', {
    idGeneration: 'MONGO'
});

SR = new Mongo.Collection('sr', {
    idGeneration: 'MONGO'
});

HIS = new Mongo.Collection('case_history', {
    idGeneration: 'MONGO'
});

DuplicatedSr = new Mongo.Collection('duplicatedSr', {
    idGeneration: 'MONGO'
});

Unit_Test = new Mongo.Collection('unit_test', {
    idGeneration: 'MONGO'
});

Feature_template = new Mongo.Collection('feature_template', {
    idGeneration: 'MONGO'
});

if (Meteor.isServer) {
    // This code only runs on the server

    Meteor.publish('features', function tasksPublication() {
        return Features.find();
    });

    Meteor.publish('shrun', function tasksPublication() {
        //return Shrun.find({}, {fields:{"release":1, "featureList":1}});
        return Shrun.find({});
    });


    Meteor.publish('shrunDashboard', function tasksPublication() {
        //return Shrun.find({}, {fields:{"release":1, "featureList":1}});
        return Shrun.find({chassis: /cbr.*/});
    });

    Meteor.publish('duplicatedSr', function tasksPublication() {
        return DuplicatedSr.find({});
    });

    Meteor.publish('SR', function tasksPublication() {
        return SR.find({"hostnum": {$gt: 1}}, {fields: {"hostnum": 1, "company": 1, "hostname": 1, "chassis": 1}});
    });

    Meteor.publish('case_history', function () {
        return HIS.find({});
    });

    Meteor.publish('feature_shrun', function () {
        // Need not publish it for larger amount of data
        //return FeatureShrun.find({}, {fields:{"hostname":1, "company":1}});
        return [];
    });

    var db_str = {
        'insert': (userId, doc) => {
            return true;
        }
        , 'remove': (userId, doc) => {
            return true;
        }
        , 'update': (userId, doc) => {
            return true;
        }
    };
    Unit_Test.allow(db_str);
    Feature_template.allow(db_str);
    Features.allow(
        {
            'insert': (userId, doc) => {
                return false;
            }
            , 'remove': (userId, doc) => {
            return false;
            }
            , 'update': (userId, doc) => {
            return true;
            }
        }
    );

    Meteor.publish('unit_test', function tasksPublication() {
        // Need not publish it for larger amount of data
        //return FeatureShrun.find({}, {fields:{"hostname":1, "company":1}});
        return Unit_Test.find();
    });

    Meteor.publish('feature_template', function tasksPublication() {
        return Feature_template.find();
    });

}

Meteor.methods({
    'features.insert'(name, key) {
        //check(name, String);
        //check(key, String);

        Features.insert({
            name: name,
            key: key,
            reference: 0,
        });
    },
    'feature_template_find_name'(_id) {
        var one = Feature_template.findOne({_id: _id});
        if (one != null) {
            return one.get("template_name")
        }
    },
    'features.remove'(featureId) {
        //check(featureId, Meteor.Collection.ObjectID);

        Features.remove(featureId);
    },

    'feature.setName'(featureId, setName) {
        //check(featureId, Meteor.Collection.ObjectID);
        //check(setName, String);

        Features.update(featureId, {$set: {name: setName}});
    },

    'feature.setKey'(featureId, setKey) {
        //check(featureId, Meteor.Collection.ObjectID);
        //check(setKey, String);

        Features.update(featureId, {$set: {key: setKey}});
    },

    'feature.setNameKey'(featureId, setName, setKey) {
        //check(featureId, Meteor.Collection.ObjectID);
        //check(setName, String);
        //check(setKey, String);

        Features.update(featureId, {$set: {name: setName, key: setKey}});
    },

    'feature.findAll'() {
        return Features.find({});
    },

    'check_search': (date, status, templateId) => {
        // console.log(child_process); //test
        var cmd = "curl -d \"date=" + date + "&status=" + status +  "&templateName=" + templateId + "\" -H \"Content-Type: application/x-www-form-urlencoded\" -X POST http://127.0.0.1:8181/check_search";
        console.log("CMD: " + cmd);
        if (Meteor.isServer) {
            exec = Npm.require('child_process').exec;
            exec(cmd, (err, stdout, stderr) => {
                if (err) {
                    console.log("ERR: " + err);
                } else {
                    console.log("OUT: " + stdout);
                }
            });
        }

    },
});
