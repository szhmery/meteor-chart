Template.featureTemplate.onRendered(function () {
    Session.set('loading', true);
    onDraw();
});

function onDraw() {

    if (!(FlowRouter.subsReady("features"))) {
        Meteor.setTimeout(onDraw, 1);
        return;
    }
    // TODO: select2 could not show normaly.
    //$(".select2").select2();
    Session.set('loading', false);
}


function isInArray(arr, value) {
    var index = $.inArray(value, arr);
    if (index >= 0) {
        return true;
    }
    return false;
}


Template.addFeatureTemplateModal.onRendered(function () {
    $("#select_featurename").select2()
});

Template.updateFeatureTemplateModal.onRendered(function () {
    $("#add_featurename").select2()
});


Template.featureTemplate.events({


    'click .addTemplate'() {
        // show modal
        Session.set('update_id', "");
        Session.set('template_name',  "");
        Session.set('featureList',  "");
        Modal.show('addFeatureTemplateModal');

    },

    'click .deleteTemplate'() {
        //TODO: delete this unit-test result

        Session.set('template_id', this._id);
        Session.set('option', 'delete');
        Modal.show('deleteFeatureTemplateModal');
        // set modal input text
        $("#alert-title").html('Delete Template');
        $("#message").html('Are you sure to delete this template ?');
        $("#msg-div-type").attr("class", "alert alert-warning");
        $("#alert-button").html('Yes');
    },

    'click .editTemplate'() {
        Session.set('update_id', this._id);
        Session.set('template_name', this.template_name);
        // console.log(this.template_name);
        Session.set('featureList', this.featureList);
        let ret = Feature_template.find({"_id": this._id}).fetch();
        Modal.show('addFeatureTemplateModal');
    },
});

Template.addFeatureTemplateModal.events({

    'click .Add_template'() {
        let selectedList = $("#select_featurename").select2().val();
        let template_name = $("#Inputname").val();
        let id = Session.get("update_id");

        if (selectedList === null) {
            swal({
                title: "Warning",
                text: "Please select at least one feature!"
            });
            return;
        }

        // find the template is existed or not
        let status1 = Feature_template.find({
            "template_name":template_name
        }).count();


        // find the featureList is same or not
        let status2 = Feature_template.find({
            "template_name":template_name ,
            "featureList":selectedList
        }).count();



        if (id === "") {
            if (status1 !== 0){
                swal({
                    title: "Warning",
                    text: "The template is already existed!"
                });
                return;
            }

            Feature_template.insert({
                "owner": Meteor.userId(),
                "email": Meteor.user() ? Meteor.user().emails[0].address : "",
                "template_name": template_name,
                "featureList": selectedList
            });
        } else {

            if (status2 !== 0 ){
                swal({
                    title: "Warning",
                    text: "The template is the same with the old one!"
                });
                return;
            }

            Feature_template.update({_id:id}, {$set:{
                // TODO: The two lines will be deleted
                "owner": Meteor.userId(),
                "email": Meteor.user() ? Meteor.user().emails[0].address : "",
                "template_name": template_name,
                "featureList": selectedList
            }});
        }
        $("#addFeatureTemplateModal").modal('hide');
    },

    'click .Close_Modal'() {
        $("#addFeatureTemplateModal").modal('hide');
    },
});

Template.updateFeatureTemplateModal.events({
    'click .Add_file'() {

        //get the update id
        var templateId = Session.get('update_id');

        // TODO: the cmd need to update.

        let username = $("#Inputname").val();
        let selectedList = $("#add_featurename").select2().val();
        // console.log(failedList);
        // status="Running";
        if (selectedList === null) {
            swal({
                title: "Warning",
                text: "Please select at least one feature!"
            });
            return;
        }


        let ret = Feature_template.find({"_id": templateId}).fetch();
        let newSelectedList = ret[0].selected;
        var Date = ret[0].Date;

        var is_same = false;
        if (newSelectedList.length === selectedList.length) {
            is_same = true;
            // Both array will be sorted, so we can compare them simplier.
            for (let i = 0; i < newSelectedList.length; i++) {
                if (newSelectedList[i] !== selectedList[i]) {
                    is_same = false;
                    break;
                }
            }
        }

        if (is_same === true){
            swal({
                title: "Warning",
                text: "The template is the same with old template!"
            });
            return;
        }

        var listLen = selectedList.length;
        console.log(selectedList);
        for (var i = 0; i < listLen; i++) {
            console.log(selectedList[i]);

            // Why it will only append!
            if (!isInArray(newSelectedList, selectedList[i])) {
                newSelectedList.push(selectedList[i]);
            }
        }


        let rc = Feature_template.update({"_id": caseId}, {
            $set: {
                "Username": username,
                "selected": selectedList,
                "status": "Running"
            }
        });

        // Hide the dialog before calling the running
        $("#updateFeatureTemplateModal").modal('hide');

        // var cmd = "curl -d \"date=" + Date + "&status=" + status + "&templateName=" + templateName + "\" -H \"Content-Type: application/x-www-form-urlencoded\" -X POST http://10.79.41.36:8181/check_search";

        // Delay 10 seconds to wait for Meteor to sync the MongoDB from brower to server.
        // setTimeout(function () {
        //     Meteor.call("check_search_update", cmd, (error, result) => {
        //         console.log("ERROR: " + error);
        //     });
        // }, 10000);
    },

    'click .Close_Modal'() {
        $("#updateFeatureTemplateModal").modal('hide');
    },
});

Template.deleteFeatureTemplateModal.events({
    'click .alert-button'() {
        var alert_option = Session.get('option');
        if (alert_option === 'delete') {
            var deleteId = Session.get('template_id');
            // need to check whether have unit-test used this template
            let unitTests1 = Unit_Test.find({}).fetch();
            let unitTests = Unit_Test.find({"templateId": deleteId}).fetch();
            if (unitTests.length >  0) {
                var msg = "";
                for (var i=0; i<unitTests.length;i++) {
                    msg = msg + unitTests.Username + ",";
                }
                $("#alert-title").html('Delete Template');
                $("#message").html('need delete unit test ' + msg + "first");
                $("#msg-div-type").attr("class", "alert alert-warning");
            }
            Feature_template.remove(deleteId);
            console.log("not delete feature now, id: " + deleteId);
        }
    },
});

Template.featureTemplate.rendered = function () {

    Session.set("loading", true);
    initFeaSumTable();
    onDraw();
};

function initFeaSumTable() {
    if (!(FlowRouter.subsReady("featureSearch"))) {
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

}

Template.addFeatureTemplateModal.helpers({
    add_or_update: () => {
        let id = Session.get("update_id");
        if (id == "") {
            return "Add";
        } else {
            return "Update";
        }
    },
    features: function () {
        let selectedFeatures = Session.get("featureList");
        ret = Features.find({}, {"sort": {"name": 1}}).fetch();
        for (let i = 0; i < ret.length; i++) {
            let name = ret[i].name;
            let selected = "";
            if (selectedFeatures.indexOf(name) !== -1) {
                selected = "selected";
            }
            ret[i].isSelected = selected;
        }
        return ret;
    },
    template_name: function () {
        return Session.get("template_name")
    }
});

function getFeatureKey(name) {
    var ret = Features.find({name: name}).fetch();
    if (ret.length > 0) {
        return ret[0].key;
    } else {
        return "";
    }
}

Template.showFeatureTemplateModal.helpers({

    successfeatures: function () {
        var showfailed_id = Session.get('feature_id');
        console.log(showfailed_id);
        let ret = Feature_template.find({_id: showfailed_id}).fetch();
        var result = [];
        for (var i in ret[0].success) {
            var name = ret[0].success[i];
            var key = getFeatureKey(name);
            result.push({name: name, key: key})
        }
        return result;
    },


    failedfeatures: function () {
        var showfailed_id = Session.get('feature_id');
        console.log(showfailed_id);
        let ret = Feature_template.find({_id: showfailed_id}).fetch();
        var result = [];
        for (var i in ret[0].failed) {
            var name = ret[0].failed[i];
            var key = getFeatureKey(name);
            result.push({name: name, key: key})
        }
        return result;
    },


});

Template.updateFeatureTemplateModal.helpers({
    username: function () {
        return Session.get('username');
    },
    features: function () {
        var updateId = Session.get('update_id');
        let ret = Feature_template.find({"_id": updateId}).fetch();
        if (ret.length === 0) {
            return [];
        }
        let selectedFeatures = ret[0].selected;
        ret = Features.find({}, {"sort": {"name": 1}}).fetch();
        for (let i = 0; i < ret.length; i++) {
            let name = ret[i].name;
            let selected = "";
            if (selectedFeatures.indexOf(name) !== -1) {
                selected = "selected";
            }
            ret[i].isSelected = selected;
        }
        return ret;
    },

});


Template.featureTemplate.helpers({
    template: function () {
        return Feature_template.find({});
    },
    features: function () {
        let ret = Features.find({}, {"sort": {"name": 1}});
        return ret;
    },

    getStatusClass: function (status) {
        return !(status === "Running");
    },

    templateDisableButton : (owner) => {
        return (((undefined === owner || null === owner) && null === Meteor.userId()) || owner === Meteor.userId()) ;
    },

});
