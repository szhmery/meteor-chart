//Session.set('debug', true);

Template.navigation.rendered = function(){

    // Initialize metisMenu
    $('#side-menu').metisMenu();
    //Session.set('debug', false);

};

// Used only on OffCanvas layout
Template.navigation.events({

    'click .close-canvas-menu' : function(){
        $('body').toggleClass("mini-navbar");
    }

});
