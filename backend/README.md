## Describe
These scripts are used to update data in Solr and MongoDB, which are through package pysolr and pymongo.
## How to use it
You can use **python updateSolr.py --action [action] --end [end_index]** to run updateSolr script.<br> 

Main action:
 > * --action updatecompany --end [The number of unknow company case]
 > * --action mapCompany --end [The total case number]
 > * --action updatehostname --end [The number of cbr case]
 > * --action correctHostname --end [The total case number]
 > * --action mapRelease --end [The total case number]
 > * --action updateCbr8ToCbr --end [The number of cbr8 case]
 > * --action checkDuplicate --end [The number of cbr and cbr8 case]
 > * --action updateSpecialCase --end [The number of no hostname case]<br>
 
Use **python updateMongo.py --action[action] --end [end_index]** to run updateMongoDB script in below order.<br>

New case:
 > * --action update_customerInfo --end [The number of show true cbr case]
 > * --action update_sr --end [The number of show true cbr case]
 > * --action update_features 
 > * --action update_shrun  
 > * --action update_feature_shrun 
 > * --action update_duplicateSr --end [The number of show false cbr case]<br>
 
 New features:
 > * --action update_featureList  
 > * --action correct_feature 



