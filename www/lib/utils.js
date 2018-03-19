
var relMap = {};
getReleaseName = (name) => {
    if (relMap[name] !== undefined) {
        return relMap[name];
    }

    var names = releaseMap.find({origin_name:name}).fetch();

    if(names.length === 0){
        releaseMap.insert({origin_name:name, name:name, chassis:'unknown', show:true, date: new Date()});
        relMap[name] = name;
        console.log("Util: insert a new release name - " + name);
        return name;
    } else if(names.length !== 1){
        // Wordaround to fix the duplicate case
        for(var i=1; i<names.length; i++){
            releaseMap.remove({_id:names[i]._id});
            console.log("Util: remove a release name - " + name + " ID - " + names[i]._id);
        }
    }
    relMap[name] = names[0].name;
    return names[0].name;
}

var custMap = {}; 
getCustomerName = (name) => {
    if (custMap[name] !== undefined) {
        return custMap[name];
    }   
    var names = customerMap.find({origin_name:name}).fetch();

    if(names.length === 0){ 
        customerMap.insert({origin_name:name, name:name, chassis:'unknown', show:true, date:new Date()});
        console.log("Util: insert a new customer name - " + name);
        custMap[name] = name;
        return name;
    } else if(names.length !== 1){ 
        // Wordaround to fix the duplicate case
        for(var i=1; i<names.length; i++){
            customerMap.remove({_id:names[i]._id});
            console.log("Util: remove a customer name - " + name + " ID - " + names[i]._id);
        }
    }   
    custMap[name] = names[0].name;
    return names[0].name;
}
