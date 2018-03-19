from urllib2 import *
import json
import pymongo
from flask import Flask
from flask import request
from bson.objectid import ObjectId
import re,os
import argparse
import time


app =Flask(__name__)

headers = {
              'content-type': "application/json",
              'authorization': "Basic amluZ2N3dV8zOjk3ODYxRTYxMEIwQjBGMDQ=",
          }
@app.route('/search',methods=['POST'])
def search_data():
    mongo = pymongo.MongoClient("10.79.41.50", 27017)

    MongoPara = mongo['cmts_features']
    shrun_data = MongoPara.shrun_data #get the collection

    features = MongoPara.features #get the collection
    #input keyword

    feature_option = request.values.get("feature_option");
        # print(feature_option)
    if feature_option == 'insert': 
        feature_name = request.values.get("feature_name"); 
        feature_key = request.values.get("feature_key");
        print(feature_key)
    if feature_option == 'update': 
        feature_id = request.values.get("feature_id"); 
        feature_name = request.values.get("feature_name"); 
        feature_key = request.values.get("feature_key"); 
    
    # select the search method
    print "start the search!"
    pattern = re.compile('^[a-zA-Z0-9\s_-]+$')
    if pattern.match(feature_key):
        resultList = fast_search(feature_key)
    else:
        resultList = slow_search(shrun_data,feature_key)
    print "finish the search!"


    if feature_option == 'insert': 
        match_count = features.find({"name":feature_name,"key":feature_key}).count()
        if match_count > 0:
            features.update({"name":feature_name,"key":feature_key},{"$set":{"total_reference":resultList[0],"cbr_reference":resultList[1],"ubr_reference":resultList[2],"key":feature_key,"queryflag":"tracked"}})
        else:
            features.insert({"name":feature_name,"key":feature_key,"total_reference":resultList[0],"cbr_reference":resultList[1],"ubr_reference":resultList[2],"queryflag":"tracked"})
    elif feature_option == 'update':
        features.update({"_id":ObjectId(feature_id)},{"$set":{"name":feature_name, "key":feature_key, "total_reference":resultList[0],"cbr_reference":resultList[1],"ubr_reference":resultList[2],"queryflag":"tracked"}})
    return "ok" 

@app.route('/check_search',methods=['POST'])
def check_search():
    mongo = pymongo.MongoClient("10.79.41.50", 27017)
    db = mongo['cmts_features']
    unit_test = db['unit_test']
    features = db['features']
    feature_template = db['feature_template']


    date = request.values.get("date")
    status = request.values.get("status")
    templateName = request.values.get("templateName")


    feature_names = feature_template.find_one({"template_name": templateName})['featureList']



    # Initial the status in the web page
    print ("status is %s" % status)
    # unit_test.update({"Date": date}, {"$set": {"status": status}})
    # time.sleep(20)
    print "status has changed"

   #get selectedfeature and shtech_content
    # if featureList == None:
    #     feature_names = unit_test.find_one({"Date": date})['selected']
    # else:
    #     # TODO some feature has ,
    #     feature_names = featureList.split(",")


    shtech_content = unit_test.find_one({"Date": date})['shtech_content']



    # print feature_names
    failedList = []
    successList = []
    for feature_name in feature_names:
        feature_key = features.find_one({"name": feature_name})['key']
        print "featurekey is %s" % feature_key
        regex = re.compile(feature_key,re.S)
        regex_result = regex.search(shtech_content)
        print "result is %s" % regex_result

        # real_status = status

        if regex_result and feature_name not in successList:
            successList.append(feature_name)
        else:
            status = "failed"
            if feature_name not in failedList:
                failedList.append(feature_name)

    if failedList == []:
        status = "success"




    unit_test.update({"Date":date},{"$set":{"status":status, "failed":failedList, "success": successList, "successNum": len(successList), "failedNum": len(failedList)}})




def fast_search(feature_key):
    print "do the fastSearch"
    resultList = []
    #keyword_processing
    keyword = feature_key.replace(' ','+') 
    if 'AND' in keyword:
        keyword = keyword.replace('+AND+','%22+AND+shrun%3A%22')
    elif 'OR' in keyword:
        keyword = keyword.replace('+OR+','%22+OR+shrun%3A%22')
    elif 'NOT' in keyword:
        keyword = keyword.replace('+NOT+','%22+NOT+shrun%3A%22')
    else:
        keyword = keyword

    #urlopen && analyze the text
    print(keyword)
    #analyze the total
    parser = argparse.ArgumentParser(description="The tools to update the SR data.")
    parser.add_argument('--debug', dest='debug_mode', action='store_true')
    parser.set_defaults(debug_mode=False)
    parser.add_argument('--solradd', dest='solraddress', type=str)
    parser.set_defaults(solraddress='http://10.79.41.36:8983')
    args = parser.parse_args()
    urladdress_1 = args.solraddress+'/solr/sr/select?q=shrun%3A%22'+keyword+'%22&wt=json&indent=true'
    connection_1 = urlopen(urladdress_1)
    string_1 = connection_1.read()
    data_1 = json.loads(string_1)
    totalret = data_1['response']['numFound']
    print("totalret is %d" % totalret)
    resultList.append(totalret)
    #analyze the cbr result
    urladdress_2 = args.solraddress+'/solr/sr/select?q=shrun%3A%22'+keyword+'%22+AND+chassis%3Acbr*&wt=json&indent=true'
    connection_2 = urlopen(urladdress_2)
    string_2 = connection_2.read()
    data_2 = json.loads(string_2)
    cbrret = data_2['response']['numFound']
    print("cbrret is %d" % cbrret)
    resultList.append(cbrret)
    #analyze the ubr result
    urladdress_3 = args.solraddress+'/solr/sr/select?q=shrun%3A%22'+keyword+'%22+AND+chassis%3Aubr*&wt=json&indent=true'
    connection_3 = urlopen(urladdress_3)
    string_3 = connection_3.read()
    data_3 = json.loads(string_3)
    ubrret = data_3['response']['numFound']
    print("ubrret is %d" % ubrret)
    resultList.append(ubrret)

    return resultList

def slow_search(shrun_data,feature_key):
    print "do the slowSearch"
    resultList = []
    cbrret = 0
    ubrret = 0
    totalret = 0
    regex = re.compile(feature_key)
    shrun_num = shrun_data.count()
    for i in range(0,shrun_num):  
        config=shrun_data.find()[i]['shrun']
        chassis=shrun_data.find()[i]['chassis'][0:3]
        if regex.search(config):
            if chassis == 'cbr':
                cbrret += 1
            elif chassis =='ubr':
                ubrret += 1
            totalret += 1

    resultList.append(totalret)
    resultList.append(cbrret)
    resultList.append(ubrret)

    return resultList
if __name__ =='__main__':
    #app.run(debug=True, host="127.0.0.1", port=8181)
    port = int(os.environ.get('PORT', 8181))
    app.run(host='0.0.0.0', port=port, debug=True, use_debugger=False)

