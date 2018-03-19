Template.confFeature.rendered = function(){
    initFeatureTable();
};

function initFeatureTable(){

    if(!(FlowRouter.subsReady("confFeature"))){
        Meteor.setTimeout(initFeatureTable, 1);
        return;
    }

    // Initialize confFeature
    $('.confFeatureTable').DataTable({
        dom: '<"html5buttons"B>lTfgitp',
        buttons: [
            {extend: 'excel', title: 'ExampleFile'},
            {extend: 'pdf', title: 'ExampleFile'},
        ]

    });
    //console.log("Load feature successfully!");
};

Template.confFeature.helpers ({
    features: function () {
        return Features.find({});
    },
});

Template.confFeature.events ({
  'click .edit'(){
      // show modal
      Session.set('feature_id', this._id);
      Session.set('feature_name', this.name);
      Session.set('feature_key', this.key);

      Modal.show('updateFeatureModal');

      // set modal input text
      $("#update-name").val(this.name);
      $("#update-key").val(this.key);
  },

  'click .update'(){
      // show modal
      Session.set('feature_id', this._id);
      Session.set('feature_name', this.name);
      Session.set('feature_key', this.key);

      Modal.show('updateFeatureModal');

      // set modal input text
      $("#update-name").val(this.name);
      $("#update-key").val(this.key);
  },

  'click .delete'(){
     // show modal
      Session.set('feature_id', this._id);
      Session.set('option', 'delete');
      Modal.show('alertModal');

      // set modal input text
      $("#alert-title").html('Delete Feature!');
      $("#message").html('Are you sure to delete feature: ' + this.name + '?');
      $("#msg-div-type").attr("class", "alert alert-warning");
      $("#alert-button").html('Yes');
  },
});
       
Template.updateFeatureModal.events({
  'click .update-feature' (){
      $("#updateMsg").html('');
      var updateName = document.getElementById("update-name").value;
      var updateKey = document.getElementById("update-key").value;
      
      var updateId = Session.get('feature_id');
      
      var name = Session.get('feature_name');
      var key = Session.get('feature_key'); 

//      if (name === updateName) {
//          if (key === updateKey) {
//              // none to update
//              //console.log('none to update');
//          }
//          else {
//              // just update key
//              Meteor.call('feature.setKey', updateId, updateKey);
//              //console.log('just update key');
//          }
//      }
//      else {
//          if (key === updateKey) {
//              // just update name
//              Meteor.call('feature.setName',  updateId, updateName);
//              //console.log('just update name');
//          }
//          else {
//              // update name and key
//              Meteor.call('feature.setNameKey', updateId, updateName, updateKey);
//              //console.log('update name and key');
//          }
//      }

      let option='update';

      //let nameCheck = regName.test(updateName);
      let nameCheck = true;
          
      let regKey = new RegExp("^(?!.*%|.*#|.*&)^.*$");
      let keyCheck = regKey.test(updateKey);

      if(nameCheck){
          if(keyCheck){
          }
          else{      
             $("#updateMsgType").attr({"class" : "alert alert-danger"});       
             $("#updateMsg").html('The key should not contain \%, \#, \& ');
          }
      }
      else {
         //console.log('name false');
         $("#updateMsgType").attr({"class" : "alert alert-danger"});
         $("#updateMsg").html('The name should only contain letters, numbers, underscores, "-", and can not start or end with an underscore');
      }

      if(nameCheck && keyCheck){
          // updateName = updateName.replace(/\+/g, "%2B"); // +
          // updateName = updateName.replace(/\//g, "%2F"); // /
          // updateName = updateName.replace(/\?/g, "%3F"); // ?
          // updateName = updateName.replace(/\=/g, "%3D"); // =
          // updateName = updateName.replace(/\&/g, "%26"); // &
          //
          // updateKey = updateKey.replace(/\+/g, "%2B"); // +
          // updateKey = updateKey.replace(/\//g, "%2F"); // /
          // updateKey = updateKey.replace(/\?/g, "%3F"); // ?
          // updateKey = updateKey.replace(/\=/g, "%3D"); // =

          // let cmd="curl -d \"feature_option=" + option + "&feature_id=" + updateId + "&feature_name=" + updateName + "&feature_key=" + updateKey + "\" -H \"Content-Type: application/x-www-form-urlencoded\" -X POST http://127.0.0.1:8181/search";
          
          // send update message to backend, backend research and update the value
          // Meteor.call("create_server", cmd, (error, result) => {console.log("ERROR: " + error);});
          // console.log("not update now, show update info: " + option + " " + updateId + " " + updateName);

          $("#updateModal").modal('hide');

	  //update it in DB
	  rc = Features.update({_id:updateId}, {$set:{name:updateName, key:updateKey}});
	  console.log("DB Update Result: " + rc);
      }

  },

});     
            
Template.alertModal.events({
  'click .alert-button' (){
      var alert_option = Session.get('option');
      if (alert_option === 'delete') {
          var deleteId = Session.get('feature_id');

          // delete the item directly
          // Meteor.call('features.remove', deleteId);
          console.log("not delete feature now, id: " + deleteId);
      }
  },
});
