Template.featureSearch.onRendered(function () {
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

function CurentTime() {
    var now = new Date();

    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var day = now.getDate();

    var hh = now.getHours();
    var mm = now.getMinutes();
    var ss = now.getSeconds();

    var clock = year + "-";

    if (month < 10)
        clock += "0";

    clock += month + "-";

    if (day < 10)
        clock += "0";

    clock += day + " ";

    if (hh < 10)
        clock += "0";

    clock += hh + ":";

    if (mm < 10) clock += '0';

    clock += mm + ":";


    clock += ss;
    return (clock);
}


function isInArray(arr, value) {
    var index = $.inArray(value, arr);
    if (index >= 0) {
        return true;
    }
    return false;
}


Template.importModal.onRendered(function () {
    $("#select_featuretemplate").select2()
});

/*
Template.updateFeatureModal.onRendered(function () {
    $("#add_featurename").select2(
        {
            placeholder: 'Select multiple features',
            allowClear: true,
        }
    )
});
*/


Template.featureSearch.events({


    'click .import'() {
        // show modal
        Session.set("update_id", "");
        Session.set("template_name", "")
        Session.set("description", "");
        Modal.show('importModal');

    },


    'click .showfailed'() {
        //TODO: add show failed modal


        Session.set('feature_id', this._id);

        Modal.show('showModal');
        $("#alert-title").html('These features are not found!');

    },

    'click .delete'() {
        //TODO: delete this unit-test result

        Session.set('feature_id', this._id);
        Session.set('option', 'delete');
        Modal.show('deleteModal');
        // set modal input text
        $("#alert-title").html('Delete Case!');
        $("#message").html('Are you sure to delete case ?');
        $("#msg-div-type").attr("class", "alert alert-warning");
        $("#alert-button").html('Yes');
    },

    'click .update'() {
        Session.set('update_id', this._id);
        Session.set('template_name', this.templateName);
        // console.log(this.templateName);
        Session.set('description', this.Username);
        // console.log(template_name);
        let ret = Unit_Test.find({"_id": this._id}).fetch();
        let status = ret[0].status;
        if (status === "Running") {
            // Modal.show('updatewarnningModal');
            // $("#alert-title").html('Update Warning!');
            // $("#message").html('The status is still running, you can not update!');
            // $("#msg-div-type").attr("class", "alert alert-warning");
            // $("#alert-button").html('Yes');
            swal({
                title: "Warning",
                text: "The status is still running, you can not update!"
            });
        } else {
            Modal.show('importModal');
        }
    },
});

// get template name by id
function getTemplateName(id) {
    var one = Feature_template.findOne({_id: new Mongo.ObjectID(id)});
    if (one != null) {
        return one.template_name;
    }
    return "";
}

Template.importModal.events({

    'click .Add_file'() {
        let templateId = $("#select_featuretemplate").select2().val();
        let templateName = getTemplateName(templateId);
        let username = $("#Inputname").val();
        if (Session.get('update_id') === "") {
            // add
            var file = document.getElementById("file").files[0];
            filename = file.name;
            if (file) {
                var reader = new FileReader();
                reader.readAsText(file, "UTF-8");
                reader.onload = function (evt) {
                    var shrun_file = evt.target.result;
                    let failedList = [];
                    let successList = [];
                    var failedNum = 0;
                    var successNum = 0;

                    status = "Running";
                    var date = CurentTime();

                    Unit_Test.insert({
                        owner: Meteor.userId(),
                        email: Meteor.user() ? Meteor.user().emails[0].address : "",
                        "Date": date,
                        "Username": username,
                        "shtech_name": filename,
                        "shtech_content": shrun_file,
                        "status": "Running",
                        "templateId": templateId,
                        "templateName": templateName,
                        "failed": failedList,
                        "success": successList,
                        "successNum": successNum,
                        "failedNum": failedNum
                    });

                    Meteor.call("check_search", date, status, templateName, (error, result) => {
                        console.log("ERROR: " + error);
                    });
                    $("#importModal").modal('hide');
                };
            }
        } else {
            // update
            var caseId = Session.get('update_id');


            if (templateId === null) {
                swal({
                    title: "Warning",
                    text: "Please choose one template"
                });
                return;
            } else if (templateId === Session.get("template_name")) {
                $("#importModal").modal('hide');
                return;
            }

            let ret = Unit_Test.find({"_id":caseId}).fetch();
            let date = ret[0].Date;


            let rc = Unit_Test.update({"_id": caseId}, {
                $set: {
                    "Username": username,
                    "templateId": templateId,
                    "templateName": templateName,
                    "status": "Running"
                }
            });

            // Hide the dialog before calling the running
            $("#importModal").modal('hide');

            // Delay 10 seconds to wait for Meteor to sync the MongoDB from brower to server.
            // TODO null change to templateId

            Meteor.call("check_search", date, status, templateName, (error, result) => {
                console.log("ERROR: " + error);
            });

        }
    },

    'click .Close_Modal'() {
        $("#importModal").modal('hide');
    },

});

Template.deleteModal.events({
    'click .alert-button'() {
        var alert_option = Session.get('option');
        if (alert_option === 'delete') {
            var deleteId = Session.get('feature_id');

            // delete the item directly
            // Meteor.call('features.remove', deleteId);
            Unit_Test.remove(deleteId);
            console.log("not delete feature now, id: " + deleteId);
        }
    },
});


Template.featureSearch.rendered = function () {

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

Template.importModal.helpers({
    featureTempalte: function () {
        let ret = Feature_template.find({}, {"sort": {"name": 1}});
        return ret;
    },
    getIDString: function (id) {
        return id.valueOf();
    },
    add_or_update_button: () => {
        let id = Session.get("update_id");
        if (id === "") {
            return "Add";
        } else {
            return "Update";
        }
    },
    add_or_update_title: () => {
        let id = Session.get("update_id");
        if (id === "") {
            return "Import running-config and select feature template";
        } else {
            return "Update selected feature template";
        }
    },
    add_or_update_file: function () {
        let id = Session.get("update_id");
        if (id === "") {
            return true;
        } else {
            return false;
        }
    },
    description : function () {
        return Session.get('description');
    },
    templates: function () {
        let selectedTemplate = Session.get("template_name");
        ret = Feature_template.find({}, {"sort": {"name": 1}}).fetch();

        for (let i = 0; i < ret.length; i++) {
            let name = ret[i].template_name;
            let selected = "";
            if (name === selectedTemplate) {
                selected = "selected";
            }
            ret[i].isSelected = selected;
        }
        return ret;
    },
});

function getFeatureKey(name) {
    var ret = Features.find({name: name}).fetch();
    if (ret.length > 0) {
        return ret[0].key;
    } else {
        return "";
    }
}

Template.showModal.helpers({

    successfeatures: function () {
        var showfailed_id = Session.get('feature_id');
        console.log(showfailed_id);
        let ret = Unit_Test.find({_id: showfailed_id}).fetch();
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
        let ret = Unit_Test.find({_id: showfailed_id}).fetch();
        var result = [];
        for (var i in ret[0].failed) {
            var name = ret[0].failed[i];
            var key = getFeatureKey(name);
            result.push({name: name, key: key})
        }
        return result;
    },


});

Template.featureSearch.helpers({
    cases: function () {
        return Unit_Test.find({});
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
