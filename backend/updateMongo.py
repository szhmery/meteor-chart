from urllib2 import *
import json
import re
import os
import argparse
import shutil
import pysolr
import requests
import base64
import pymongo
import csv
from updateSolr import UpdateCompany


class updateMongodb:

    def __init__(self, solr_address):
         self._solr = pysolr.Solr(solr_address + '/solr/sr/', timeout=10)
         self._mongo = pymongo.MongoClient("10.79.41.50", 27017)


    def initialMongo(self, db, collection):
         client = self._mongo
         selected_db = client[db]
         selected_collection = selected_db[collection]

         return selected_collection

    # Get the show=true idsr from solr
    def get_trueSrid(self):
         # file = self.trueSrid_cache()
         indexnum = 0
         idsr_array = []
         for start_num in range(args.start_index, args.end_index, 10):
             # startnum = str(start_num)
             data = self._solr.search('show:true AND chassis:cbr*', fl='idsr,company,release,hostname,chassis', start=start_num, rows=10)
             print("No %d Page is being inserted to array" % start_num)

             for doc in data.docs:
                 # shrun_data.insert(config)
                 idsr_array.append(doc)
                 indexnum += 1
                 print("Start %d: insert  to array" % (indexnum))

         print("the length of the array is %d" % len(idsr_array))
         return idsr_array

    # Append list to a local file
    def appendFile(self, filepath, filecontent):
        try:
            localFile = open(filepath, 'a')
            localFile.write(filecontent)
            localFile.close()
            print "append %s with %s" % (filepath, filecontent)
            return True
        except:
            e = sys.exc_info()[0]
            err_msg = "Fail to Write file to %s: err: %s" % (filepath, e)
            print err_msg
            return False

    # Update the data in collection "customerInfo"
    def update_customerInfo(self, customerInfo_data):
        # Empty the collection
        customerInfo_data.remove({})

        total = 0
        skip = 0
        for start_num in range(args.start_index, args.end_index, 10):
            data = self._solr.search('show:true AND chassis:cbr', fl='idsr,company,hostname, hostnum,chassis,release', start=start_num, rows=10)
            for doc in data.docs:
                idsr = doc['idsr']
                hostname = doc['hostname']
                if 'hostnum' in doc:
                    hostnum = doc['hostnum']
                else:
                    hostnum = 1
                    skip += 1
                company = doc['company']
                release = doc['release']
                total += 1
                print("Update customerInfo for %s - %s/%s %s: %s" % (idsr, hostname, company, release, hostnum))
                customerInfo_data.insert({'idsr': idsr, "hostname": hostname, "company": company,
                                          'release': release, 'chassis': 'cbr','hostnum': hostnum})
        print("Update customer Info for duplicate cases : %d, no hostnum %d" % (total, skip))
#       self.getCompanyAndHostname(customerInfo_data, start_num)

 #       shrun_num = customerInfo_data.count()
 #       print shrun_num
 #       for i in range(0, shrun_num):
 #           company = customerInfo_data.find()[i]['company']
 #           hostname = customerInfo_data.find()[i]['hostname']
 #           self.update_duplicate_num(customerInfo_data, company, hostname)
 #           print ("updating %d data" % (i+1))


    # def getCompanyAndHostname(self, customerInfo_data, startnum):
    #     indexnum = 0
    #     url = args.solr_address + '/solr/sr/select?q=show:true&fl=company,hostname&start=' + str(startnum) + '&rows=10&wt=json&indent=true'
    #     print(url)
    #     try:
    #         add = urlopen(url)
    #         print "try"
    #     except:
    #         print "except"
    #         return self.getCompanyAndHostname(customerInfo_data, startnum)
    #     string = add.read()
    #     data = json.loads(string)
    #     configs = data['response']['docs']
    #     for config in configs:
    #         customerInfo_data.insert(config)
    #         indexnum += 1
    #         print("Start %d: insert  to mongodb" % (indexnum))


    # def update_duplicate_num(self, customerInfo_data, company, hostname):
    #     companyname = company.replace(' ', '+')
    #     try:
    #         url = args.solr_address + '/solr/sr/select?fl=company,hostname&indent=on&q=company:%22' + companyname + '%22%20AND%20hostname:%22' + hostname + '%22&wt=json'
    #         print url
    #         try:
    #             add = urlopen(url)
    #         except:
    #             return self.update_duplicate_num(company, hostname)
    #         string = add.read()
    #         data = json.loads(string)
    #         # ret = self._solr.search('company:'+company,'hostname:'+hostname, fl='idsr', start=start_num, rows=10)
    #         num = data['response']['numFound']
    #         if num == 0:
    #             print ("company %s hostname %s have no result!" % (company, hostname))
    #             num = 1
    #     except:
    #         print("%s only have one!" + company)
    #         num = 1
    #     customerInfo_data.update({"hostname": hostname, "company": company}, {"$set": {"num": num}})



    # Update the data in collection "sr"
    def update_sr(self, sr_data):  # the sr db contains the shrun config

         array = self.get_trueSrid()
         sr_num = sr_data.count()
         untrack_array = []
         # file = open('untracked')

         # See if all data have querflag field, if not, add it, else turn the flag to untracked
         count = sr_data.find({"queryflag": {"$exists": True}} ).count()
         print count
         print sr_num
         print(" The total db case is %d, the queryflagcase is %d" % (sr_num, count))

        # There is no updateMany() API as mongodb manual. So we haveto update one by one.
         if count < sr_num:
             if sr_num != 0:
                 print "The field is not existed in all case!"
                 for i in range(0, sr_num):
                     print("No %d/%d is being add queryflag" % (i, sr_num))
                     sr_data.update({"queryflag": {"$exists": False}}, {"$set": {"queryflag": "untracked"}})
                     sr_data.update({"queryflag": "tracked"}, {"$set": {"queryflag": "untracked"}})
             else:
                 pass
         else:
            if sr_num != 0:
                print "The field queryflag is already in each case!"
                for i in range(0, sr_num):
                    print("No %d/%d is being turn queryflag" % (i, sr_num))
                    sr_data.update({"queryflag": "tracked"}, {"$set": {"queryflag": "untracked"}})

            else:
                pass


         i = 0
         for data in array:
             i = i + 1
             idsr = data['idsr']
             print("No %d idsr %s case is processing!" % (i, idsr))
             ret = sr_data.find({'idsr':idsr})
             match_count = ret.count()

             if match_count > 0:  # TODO: Remove duplicate cases if possible
                 # for j in range(1, match_count):
                 #     sr_data.remove({'_id':ret[j]['_id']})
                 print("idsr %s case is already in the db!" % idsr)
                 try:
                     addInfo = self._solr.search(q='idsr:' + idsr, start=0, rows=10)
                     hostname = addInfo.docs[0]['hostname']
                     sr_data.update({"idsr": idsr}, {"$set": {"queryflag": "tracked", "hostname": hostname}})
                 except:
                     print "update queryflag error!The idsr is %s" % idsr

                 # try:
                 #    if 'release' not in data :
                 #        continue
                 #    release = data['release']
                 #    company = data['company']
                 #    hostname = data['hostname']
                 #    chassis = data['chassis']
                 #    release_indb = ret[0]['release']
                 #    company_indb = ret[0]['company']
                 #    hostname_indb = ret[0]['hostname']
                 #    if 'chassis' in ret[0] :
                 #        chassis_indb = ret[0]['chassis']
                 #    else:
                 #        chassis_indb = ""
                 #    if release != release_indb or company != company_indb or hostname != hostname_indb or chassis != chassis_indb:
                 #        sr_data.update({"idsr": idsr}, {"$set": {"queryflag": "tracked", "company": company,
                 #                                                 'chassis':chassis, 'hostname':hostname, 'release':release}})
                 #        print("Update the IDSR %s for %s/%s/%s/%s" % (idsr, hostname, company, release, chassis))
                 #    else:
                 #        sr_data.update({"idsr": idsr}, {"$set": {"queryflag": "tracked"}})
                 #        print("Need not update the IDSR %s" % idsr)
                 # except:
                 #     print ("idsr %s case has no companyname!" % idsr)
             else:
                 print ("idsr %s case is not in the db!" % idsr)
                 Info = self._solr.search(q='idsr:' + idsr, start=0, rows=10)
                 newInfo = Info.docs[0]
                 if 'shlog' in newInfo:
                     del newInfo['shlog']
                 try:
                     sr_data.insert(newInfo)
                 except:
                     print "the file is too large,fail to insert!"
                 try:
                     sr_data.update({"idsr": idsr}, {"$set": {"queryflag": "tracked"}})
                 except:
                     print "update error!The idsr is %s" % idsr
                 untrack_array.append(idsr)
                 print("the length of the untracked array is %d " % len(untrack_array))

         # Remove the unchacked SR
         sr_data.remove({"queryflag": "untracked", "chassis":{"$regex":"cbr*","$options":"$i"}})
         print("Done to remove the untracked case!")

    # Update the data in collection "features"
    def update_features(self, sr_data, features):
        # Empty the collection
        features.remove({})
        with open(args.filepath, 'rb')as csvfile:  # default:'/home/sdn/csvfile/0830.csv'
            reader = csv.DictReader(csvfile)
            exacelData = []
            for row in reader:
                flag = row['Detectable by CLI (Yes or No)']
                if flag == 'yes' or flag == 'Yes':
                    exacelData.append(row)

        features_num = features.count()

        global duplicatedNum
        duplicatedNum = 0

        for i in range(0, len(exacelData)):  # len(exacelData)
            self.search_update_features(features, sr_data, exacelData, i)
            print(duplicatedNum)

        print("The number of dulicated is :%d" % duplicatedNum)

    # Search the key in cbr\ubr\total, insert the data to collection "features"
    def search_update_features(self, features, sr_data, exacelData, index):

        feature_name = exacelData[index]['displayName']
        feature_key = exacelData[index]['Regexp']
        global duplicatedNum
        match_count = features.find({"name": feature_name, "key": feature_key}).count()
        if match_count > 0:  # the same name, same key
            print "Duplicated!"
            duplicatedNum += 1
            # print(duplicatedNum)
            features.update({"name": feature_name}, {"$set": {"queryflag": "tracked"}})
        else:
            if features.find({"key": feature_key}).count() > 0:  # the same key but different name
                existed_totalret = features.find_one({"key": feature_key})['total_reference']
                existed_cbrret = features.find_one({"key": feature_key})['cbr_reference']
                existed_ubrret = features.find_one({"key": feature_key})['ubr_reference']
                features.insert({"name": feature_name, "key": feature_key, "total_reference": existed_totalret,
                                 "cbr_reference": existed_cbrret, "ubr_reference": existed_ubrret,
                                 "queryflag": "tracked"})
            else:
                pattern = re.compile('^[a-zA-Z0-9\s_-]+$')
                if pattern.match(feature_key):
                    resultList = self.fast_for_features(feature_key)
                else:
                    resultList = self.slow_for_features(sr_data, feature_key)
                if features.find({"name": feature_name}).count() > 0:  # the different key but the same name
                    features.update({"name": feature_name}, {
                        "$set": {"total_reference": resultList[0], "cbr_reference": resultList[1],
                                 "ubr_reference": resultList[2], "key": feature_key, "queryflag": "tracked"}})
                else:  # the different key and the different name
                    features.insert({"name": feature_name, "key": feature_key, "total_reference": resultList[0],
                                     "cbr_reference": resultList[1], "ubr_reference": resultList[2],
                                     "queryflag": "tracked"})

    # Get the all features pair in collection "features"
    def get_all_feature(self, features):

        feature_num = features.count()
        featureDict = dict()

        for index in range(0, feature_num):
            pair = {features.find()[index]['name']: features.find()[index]['key']}
            featureDict.update(pair)
        return featureDict

    # Update the data in collection "shrun", which contains all customers' featureList
    def update_shrun(self, sr_data, shrun_data, featureDict):

        shrun_num = shrun_data.count()

        # See if all data have querflag field, if not, add it, else turn the flag to untracked
        count = shrun_data.find({"queryflag": {"$exists": True}}).count()
        print count
        print shrun_num
        print(" The total db case is %d, the queryflagcase is %d" % (shrun_num, count))

        # There is no updateMany() API as mongodb manual. So we haveto update one by one.
        if count < shrun_num:
            if shrun_num != 0:
                print "The field is not existed in all case!"
                for i in range(0, shrun_num):
                    print("No %d/%d is being add queryflag" % (i, shrun_num))
                    shrun_data.update({"queryflag": {"$exists": False}}, {"$set": {"queryflag": "untracked"}})
                    shrun_data.update({"queryflag": "tracked"}, {"$set": {"queryflag": "untracked"}})
            else:
                pass
        else:
            if shrun_num != 0:
                print "The field queryflag is already in each case!"
                for i in range(0, shrun_num):
                    print("No %d/%d is being turn queryflag" % (i, shrun_num))
                    shrun_data.update({"queryflag": "tracked"}, {"$set": {"queryflag": "untracked"}})

            else:
                pass

        # traverse the db get the idsr
        sr_data = sr_data.find({"chassis":{"$regex":"cbr*","$options":"$i"}})

        sr_num = sr_data.count()


        print("Start to calculate the %d cases" % sr_num)
        for i in range(0, sr_num):
            print("No. %d/%d" % (i, sr_num))
            # get the shrun config
            # start = time.clock()
            self.find_featureList(sr_data, shrun_data, i, file)

        # Remove the unchacked cbr SR
        shrun_data.remove({"chassis":{"$regex":"cbr*","$options":"$i"}, "queryflag": "untracked"})
        print("Done to remove the untracked case!")




    def sr_to_errorsrlist(self, idsr):
        self.appendFile('./errorlist', "\n" + idsr)


    # Traverse each case in sr, search features in each shrun config to make featureList
    def find_featureList(self, sr_data, shrun_data, index, file):
        idsr = sr_data[index]['idsr']
        hostname = sr_data[index]['hostname']
        shrun_find = shrun_data.find({"idsr":idsr})
        match_count = shrun_find.count()
        if match_count > 0 :
            print("idsr %s case is already in the db!" % idsr)

            _id = shrun_data.find({"idsr":idsr})[match_count-1]['_id']
            shrun_data.update({"_id": _id}, {"$set": {"queryflag": "tracked", "hostname":hostname}})
            pass
        else:
            try:
                hostname = sr_data[index]['hostname']
                company = sr_data[index]['company']
                release = sr_data[index]['release']
                chassis = sr_data[index]['chassis']
                featureList = []
                # i = 0
                for name in featureDict:
                    key = featureDict[name]
                    print("searching key is %s" % key)
                    pattern = re.compile('^[a-zA-Z0-9\s_-]+$')
                    if pattern.match(key):
                        if self.fast_for_shrun(idsr, key):
                            featureList.append(name)
                        else:
                            featureList = featureList
                    else:
                        if self.slow_for_shrun(sr_data, idsr, key):
                            featureList.append(name)
                        else:
                            featureList = featureList

                shrun_data.insert(
                    {"idsr": idsr, "hostname": hostname, "company": company, "release": release, "chassis": chassis,
                     "featureList": featureList, "queryflag": "tracked"})
            except:
                print ("idsr % s case's information is not completed!" % idsr)
                self.sr_to_errorsrlist(idsr)


    # Update collection "feature_shrun", which contains every customer's every feature information
    def update_feature_shrun(self, shrun, feature_shrun, featureDict):

        # shrun_num = shrun.count()
        shrun = shrun.find({"chassis":{"$regex":"cbr*","$options":"$i"}})
        shrun_num = shrun.count()

        #add queryflag
        feature_shrun_num = feature_shrun.find({"chassis":{"$regex":"cbr*","$options":"$i"}}).count()
        count = feature_shrun.find({"chassis":{"$regex":"cbr*","$options":"$i"},"queryflag": {"$exists": True}}).count()
        print count
        print feature_shrun_num
        print(" The total db case is %d, the queryflagcase is %d" % (feature_shrun_num, count))

        # There is no updateMany() API as mongodb manual. So we have to update one by one.
        if count < feature_shrun_num:
            if feature_shrun_num != 0:
                print "The field is not existed in all case!"
                for i in range(0, feature_shrun_num):
                    print("No %d/%d is being add queryflag" % (i, feature_shrun_num))
                    feature_shrun.update({"chassis":{"$regex":"cbr*","$options":"$i"},"queryflag": {"$exists": False}}, {"$set": {"queryflag": "untracked"}})
                    # shrun_data.update({"queryflag": "tracked"}, {"$set": {"queryflag": "untracked"}})
            else:
                pass
        else:
            if feature_shrun_num != 0:
                print "The field queryflag is already in each case!"
                for i in range(0, feature_shrun_num):
                    print("No %d/%d is being turn queryflag" % (i, feature_shrun_num))
                    feature_shrun.update({"chassis":{"$regex":"cbr*","$options":"$i"},"queryflag": "tracked"}, {"$set": {"queryflag": "untracked"}})

            else:
                pass

        for i in range(0, shrun_num):
            print("No. %d/%d" % (i, shrun_num))

            idsr = shrun[i]['idsr']

            try:
                hostname = shrun[i]['hostname']
                company = shrun[i]['company']
                release = shrun[i]['release']
                chassis = shrun[i]['chassis']
                featureList = shrun[i]['featureList']

                for featurename in featureList:
                    featurekey = featureDict[featurename]
                    match_count = feature_shrun.find({"company": company, "hostname": hostname, "featurename":featurename}).count()
                    print match_count
                    if match_count > 0:
                        print("company:%s hostname:%s featurename:%s is already existed %d times! skip it!" % (company, hostname, featurename, match_count))
                        feature_shrun.update({"company": company, "hostname": hostname, "featurename": featurename}, {"$set": {"queryflag": "tracked"}})
                    else:
                        feature_shrun.insert(
                            {"idsr": idsr, "company": company, "hostname": hostname, "featurekey": featurekey,
                             "featurename": featurename, "release": release, "chassis": chassis, "queryflag": "tracked"})
            except:
                print("idsr %s case exist error!" % idsr)

        # Remove the unchacked cbr SR
        feature_shrun.remove({"chassis":{"$regex":"cbr*","$options":"$i"}, "queryflag": "untracked"})
        print("Done to remove the untracked case!")



    # if this feature for this case can be searched, return True
    def fast_for_shrun(self,idsr, key):
        # print "do the fastSearch"
        # keyword_processing
        keyword = key.replace(' ', '+')
        if 'AND' in keyword:
            keyword = keyword.replace('+AND+', '%22+AND+shrun%3A%22')
        elif 'OR' in keyword:
            keyword = keyword.replace('+OR+', '%22+OR+shrun%3A%22')
        elif 'NOT' in keyword:
            keyword = keyword.replace('+NOT+', '%22+NOT+shrun%3A%22')
        else:
            keyword = keyword

        urladdress = args.solr_address+'/solr/sr/select?q=show:true+AND+idsr%3A' + idsr + '+AND+shrun%3A%22' + keyword + '%22&fl=idsr&wt=json&indent=true'
        try:
            connection = urlopen(urladdress)
        except:
            return self.fast_for_shrun(idsr, key)
        string = connection.read()
        data = json.loads(string)

        if data['response']['numFound'] != 0:
            return True
        else:
            return False

    # if this feature for this case can be searched, return True
    def slow_for_shrun(self, sr_data, idsr, key):
        # print "do the slowSearch"
        regex = re.compile(key)
        # get the shrun config
        try:
            config = sr_data.find_one({"idsr":idsr})['shrun']
        except:
            print "this case don't have shrun!"
            return False
        if regex.search(config):
            return True
        else:
            return False


    # Search the key in solr, return the total\ubr\cbr resultList.
    def fast_for_features(self, feature_key):
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
        urladdress_1 = args.solr_address+'/solr/sr/select?q=show:true+AND+shrun%3A%22'+keyword+'%22&fl=idsr&wt=json&indent=true' #default:'http://localhost:8983'
        try:
            connection_1 = urlopen(urladdress_1)
        except:
            return self.fast_for_features(feature_key)
        string_1 = connection_1.read()
        data_1 = json.loads(string_1)
        totalret = data_1['response']['numFound']
        print("totalret is %d" % totalret)
        resultList.append(totalret)
        #analyze the cbr result
        urladdress_2 = args.solr_address+'/solr/sr/select?q=show:true+AND+shrun%3A%22'+keyword+'%22+AND+chassis%3Acbr*&fl=idsr&wt=json&indent=true'
        try:
            connection_2 = urlopen(urladdress_2)
        except:
            return self.fast_for_features(feature_key)
        string_2 = connection_2.read()
        data_2 = json.loads(string_2)
        cbrret = data_2['response']['numFound']
        print("cbrret is %d" % cbrret)
        resultList.append(cbrret)
        #analyze the ubr result
        urladdress_3 = args.solr_address+'/solr/sr/select?q=show:true+AND+shrun%3A%22'+keyword+'%22+AND+chassis%3Aubr*&fl=idsr&wt=json&indent=true'
        try:
            connection_3 = urlopen(urladdress_3)
        except:
            return self.fast_for_features(feature_key)
        string_3 = connection_3.read()
        data_3 = json.loads(string_3)
        ubrret = data_3['response']['numFound']
        print("ubrret is %d" % ubrret)
        resultList.append(ubrret)

        return resultList

    # Search the key in MongoDB, return the total\ubr\cbr resultList.
    def slow_for_features(self, sr_data,feature_key):
        print "do the slowSearch"
        resultList = []
        # regex = re.compile(feature_key)
        # shrun_num = shrun_data.count()
        # print(regex)
        totalret = sr_data.find({"shrun":{"$regex":feature_key,"$options":"$i"}}).count()
        print("totalret is %d" % totalret)
        cbrret = sr_data.find({"shrun":{"$regex":feature_key,"$options":"$i"},"chassis":{"$regex":"cbr*","$options":"$i"}}).count()
        print("cbrret is %d" % cbrret)
        ubrret = totalret - cbrret
        print("ubrret is %d" % ubrret)

        resultList.append(totalret)
        resultList.append(cbrret)
        resultList.append(ubrret)

        return resultList


    # Update the collection "duplicated_sr", which will use in UI dashboard raw data download.
    def getduplicatedSr(self, duplicated_sr):

        duplicated_sr.remove({})
        index = 0
        for start_num in range(args.start_index, args.end_index, 10):
            url_cbr = "http://10.79.41.50:8989/solr/sr/select?fl=idsr,company,hostname,release,duplicate_sr&indent=on&q=show:false%20AND%20(chassis:cbr%20OR%20chassis:cbr8)&rows=10&start=" + str(start_num) + "&wt=json"
            con = urlopen(url_cbr)
            string = con.read()
            data = json.loads(string)
            docs = data['response']['docs']
            for doc in docs:
                index += 1
                print("index is %d" % index)
                idsr = doc['idsr']
                company = doc['company']
                release = doc['release']
                hostname = doc['hostname']
                origin_idsr = doc['idsr']
                try:
                    origin_idsr = doc['duplicate_sr']
                except:
                    ret = self._solr.search('company:' + company + ' AND ' + 'hostname:' + hostname, fl="idsr,show", start=0, rows=10)
                    for doc in ret.docs:
                        showflag = doc['show']
                        idsr_1 = doc['idsr']
                        if showflag:
                            origin_idsr = idsr_1

                duplicated_sr.insert({"duplicated_sr": origin_idsr, 'company':company, 'hostname':hostname, "release":release, "origin_sr":idsr})

    # Get idsr in "duplicated_sr" and find the corresponding featureList in "sr".
    def updatedupFeatureList(self,duplicated_sr,shrun):
        duplicated_count = duplicated_sr.count()

        # print shrun.find()[2]['idsr']
        # print duplicated_sr.find()[0]['origin_sr']
        for i in range(0,duplicated_count):
            print("%d/%d" % (i,duplicated_count))
            duplicated = duplicated_sr.find()[i]['duplicated_sr']
            _id = duplicated_sr.find()[i]['_id']
            origin_sr = duplicated_sr.find()[i]['origin_sr']
            # featurelist = []

            try:
                featurelist = shrun.find_one({"idsr": duplicated})['featureList']
                # print type(featurelist)
            except:
                print("Case %s has no featureList!" % origin_sr)
                continue
            duplicated_sr.update({"_id":_id},{"$set":{"featureList":featurelist}})


    # Compare the hostname in collection "customerInfo" and swagger api
    def checkHostname(self, duplicated_sr, customerInfo):
        filename = 'Cookie.txt'
        with open(filename, 'r') as file:
            session = file.read()

        customerInfo_count = customerInfo.count()
        for i in range(0, customerInfo_count):
            print ("%d/%d" % (i,customerInfo_count))
            idsr = customerInfo.find()[i]['idsr']
            db_hostname = customerInfo.find()[i]['hostname']
        # db_hostname =  customerInfo.find_one({"idsr":idsr})['hostname']
            print ("The hostname in db is %s" % db_hostname)
            baseurl = 'https://scripts.cisco.com/api/v2/csone/'
            url = baseurl + idsr
            command = "curl -s " + " '" + url + "' " + session
            # print command
            try:
                output = os.popen(command).read()
                print output
                hostname = json.loads(output)['Node_Name__c']
                print ("The found hostname is %s" % hostname)
                hostname_line = ("idsr:%s----db_hostname:%s----csone_hostname:%s" % (idsr, db_hostname, hostname))
                if hostname == "null":
                    self.appendFile("./nullhostnamelist","\n" + hostname_line)
                elif db_hostname == hostname:
                    self.appendFile("./samehostnamelist", "\n" + hostname_line)
                else:
                    self.appendFile("./diffhostnamelist", "\n" + hostname_line)
            except:
                print "Case %s Not Found!" % idsr
                hostname_line = ("idsr:%s----db_hostname:%s----csone_hostname:Not Found!" % (idsr, db_hostname))
                self.appendFile("./hostnameNotFoundlist", "\n" + hostname_line)


    # Check same hostname diff company case, write them to excel.
    def checkHostnamediffCompany(self, customerInfo):
        import xlsxwriter
        workbook = xlsxwriter.Workbook('SameHostnameDiffCompany.xlsx')
        worksheet = workbook.add_worksheet()

        # Widen the first column to make the text clearer.
        worksheet.set_column('A:A', 20)

        # Add a bold format to use to highlight cells.

        bold = workbook.add_format({'bold': True})

        #find all hostname
        hostnameDict = []
        customerInfo_count = customerInfo.count()
        for i in range(0, customerInfo_count):
            hostname = customerInfo.find()[i]['hostname']
            if hostname not in hostnameDict:
                hostnameDict.append(hostname)
                worksheet.write(i + 1, 0, hostname)
                match_count = customerInfo.find({"hostname":hostname}).count()
                hostline = hostname
                for i in range(0, match_count):
                   company = customerInfo.find({"hostname":hostname})[i]['company']
                   hostline = hostline+company
            else:
                continue

            hostline = hostline+str(match_count)
            print hostline


        # file.close()


    # Get the new features and update them in "shrun" featureList.
    def update_featureList(self, shrun_data, sr_data):
       with open('/home/odl/0830.csv', 'rb')as csvfile:  # default:'/home/odl/0830.csv'
           reader = csv.DictReader(csvfile)
           # excelData = []
           featureDict_old = dict()
           for row in reader:
               flag = row['Detectable by CLI (Yes or No)']
               if flag == 'yes' or flag == 'Yes':
                   # excelData.append(row)
                   featurename = row['displayName']
                   featurekey = row['Regexp']
                   featurepair = {featurename : featurekey}
                   featureDict_old.update(featurepair)

       print featureDict_old
       print ("The length of the old featureDict is %d" % len(featureDict_old))

       with open('/home/odl/1023.csv', 'rb')as csvfile:  # default:'/home/odl/0830.csv'
           reader = csv.DictReader(csvfile)
           # excelData = []
           featureDict_new = dict()
           for row in reader:
               flag = row['Detectable by CLI (Yes or No)']
               if flag == 'yes' or flag == 'Yes':
                   featurename_new = row['displayName']
                   featurekey_new = row['Regexp']
                   featurepair_new = {featurename_new: featurekey_new}
                   featureDict_new.update(featurepair_new)

       print featureDict_new
       print ("The length of the new featureDict is %d" % len(featureDict_new))

       old_len = len(featureDict_old)
       new_len = len(featureDict_new)
       # diffkeys = dict()
       samenumber = 0
       samenamediffkey = dict()
       for key, value in featureDict_old.items():
           if featureDict_new.has_key(key):
               if value != featureDict_new[key]:
                   featurename = key
                   featurekey = featureDict_new[key]
                   pair={featurename:featurekey}
                   samenamediffkey.update(pair)
                   print("name is %s, old value is %s, new value is %s" % (key, value, featurekey))
               # else:
               del featureDict_new[key]
               del featureDict_old[key]
               samenumber += 1
           # else:
           #     featurename = key
           #     featurekey = value
           #     pair={featurename:featurekey}
           #     diffkeys.update(pair)
       delnumber = len(featureDict_old)
       addnumber = len(featureDict_new)
       print "The new add features is %s" % str(featureDict_new)
       print "The delete features is %s" % str(featureDict_old)
       print "The same name but different is %s" % str(samenamediffkey)
       print ("The same features are %d, new add %d features, delete %d features" % (samenumber, addnumber, delnumber))
       # update the featureList in shrun
       shrun_data_count = shrun_data.find({"chassis":{"$regex":"cbr*","$options":"$i"}}).count()
       # oldfeatureList = []
        # delete the unexisted features
       for i in range(0, shrun_data_count):
           oldfeatureList = shrun_data.find({"chassis":{"$regex":"cbr*","$options":"$i"}})[i]['featureList']
           idsr = shrun_data.find({"chassis":{"$regex":"cbr*","$options":"$i"}})[i]['idsr']
           key_delete_number = 0
           for key in featureDict_old:
               if key in oldfeatureList:
                   oldfeatureList.remove(key)
                   key_delete_number += 1

           newfeatureList = oldfeatureList
           key_add_number = 0

           count = sr_data.find({"idsr": idsr}).count()
           if count == 0:
               print "The idsr %s is not in collection sr!" % idsr
               continue
           # add the new features
           for key, value in featureDict_new.items():
               if self.fast_for_shrun(idsr, value):
                   newfeatureList.append(key)
                   key_add_number += 1
               else:
                   pass
           try:
               shrun_data.update({"idsr": idsr}, {"$set": {"featureList": newfeatureList}})
           except:
               print "update idsr %s case failed!" % idsr
           print("NO %d/%d, the idsr %s add %d/%d features, delete %d/%d features." % (i, shrun_data_count, idsr, key_add_number, addnumber, key_delete_number, delnumber))


    # Add feature_component and origin_regex in "features".
    def addinfo_features(self, features):

        features_count = features.count()
        featureDict = []
        num = 0
        with open('/home/odl/1023.csv', 'rb')as csvfile:  # default:'/home/odl/0830.csv'
            reader = csv.DictReader(csvfile)

            for row in reader:
                flag = row['Detectable by CLI (Yes or No)']
                if flag == 'yes' or flag == 'Yes':
                    featurename = row['displayName']
                    if featurename not in featureDict:
                        featureDict.append(featurename)
                        feature_componet = row['Feature Component']
                        feature_originkey = row['OriginRegexp']
                        _id = features.find_one({"name": featurename})['_id']
                        print _id
                        features.update({"_id":_id}, {"$set": {"feature_component": feature_componet, "origin_key": feature_originkey}})
                        num += 1
                        print ("No %d/%d is updating!" % (num, features_count))
                    else:
                        print "This feature is already updated!"



    # Correct some feature key, update featureList in "shrun"
    # Turn the flag 'Detectable by CLI (Yes or No)' in every correct feature to 'update'
    def correctfeature(self, shrun_data, sr_data):
        with open('/home/odl/1023.csv', 'rb')as csvfile:  # default:'/home/odl/0830.csv'
            reader = csv.DictReader(csvfile)
            # excelData = []
            featureDict_new = dict()
            for row in reader:
                flag = row['Detectable by CLI (Yes or No)']
                if flag == 'update':
                    featurename_new = row['displayName']
                    featurekey_new = row['Regexp']
                    featurepair_new = {featurename_new: featurekey_new}
                    featureDict_new.update(featurepair_new)
        add_number = len(featureDict_new)
        print("The number of new add zero features are %d" % add_number)
        shrun_data_count = shrun_data.find({"chassis": {"$regex": "cbr*", "$options": "$i"}}).count()
        for i in range(0, shrun_data_count):
            oldfeatureList = shrun_data.find({"chassis": {"$regex": "cbr*", "$options": "$i"}})[i]['featureList']
            idsr = shrun_data.find({"chassis": {"$regex": "cbr*", "$options": "$i"}})[i]['idsr']

            newfeatureList = oldfeatureList
            key_add_number = 0
            key_del_number = 0
            count = sr_data.find({"idsr": idsr}).count()
            if count == 0:
                print "The idsr %s is not in collection sr!" % idsr
                continue
            # add the new features
            for name in featureDict_new:
                key = featureDict_new[name]
                print("searching key is %s" % key)
                pattern = re.compile('^[a-zA-Z0-9\s_-]+$')
                if pattern.match(key):
                    if self.fast_for_shrun(idsr, key):
                        if name not in newfeatureList:
                            newfeatureList.append(name)
                            key_add_number += 1
                        else:
                            print "This feature is already in featureList!"
                    else:
                        if name in newfeatureList:
                            newfeatureList.remove(name)
                            key_del_number += 1
                            print "This feature is existed but need to remove!"
                        else:
                            pass
                else:
                    if self.slow_for_shrun(sr_data, idsr, key):
                        if name not in newfeatureList:
                            newfeatureList.append(name)
                            key_add_number += 1
                        else:
                            print "This feature is already in featureList!"
                    else:
                        if name in newfeatureList:
                            newfeatureList.remove(name)
                            key_del_number += 1
                            print "This feature is existed but need to remove!"
                        else:
                            pass

            try:
                shrun_data.update({"idsr": idsr}, {"$set": {"featureList": newfeatureList}})
            except:
                print "update idsr %s case failed!" % idsr
            print("NO %d/%d, the idsr %s add %d/%d features, delete %d/%d features." % (i, shrun_data_count, idsr, key_add_number, add_number, key_del_number, add_number))

    # def checkcustomerMap(self, customerMap):
    #     customerdict = dict()
    #     map_count = customerMap.count()
    #     for i in range(0, map_count):
    #         origin_name = customerMap.find()[i]['origin_name']
    #         name = customerMap.find()[i]['name']
    #         pair = {name: origin_name}
    #         customerdict.update(pair)
    #     print customerdict
    #     print "The number of customers are %d" % len(customerdict)















if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="The tools to update mongodb.")
    parser.add_argument('--debug', dest='debug_mode', action='store_true')
    parser.add_argument('--username', dest='username', type=str)
    parser.set_defaults(username="")
    parser.add_argument('--password', dest='password', type=str)
    parser.set_defaults(password="")
    parser.add_argument('--solr', dest='solr_address', type=str)
    parser.add_argument('--start', dest='start_index', type=int)
    parser.set_defaults(start_index=0)
    parser.add_argument('--end', dest='end_index', type=int)
    parser.set_defaults(end_index=1000)
    parser.add_argument('--action', dest='action', type=str)
    parser.set_defaults(action="help")
    parser.set_defaults(solr_address='http://sdntools.cisco.com:8989')
    parser.add_argument('--csvpath', dest='filepath', type=str)
    parser.set_defaults(filepath='/home/odl/1023.csv')
    args = parser.parse_args()


    db_name = "cmts_features"
    update = updateMongodb(args.solr_address)
    sr_data = update.initialMongo(db_name, "sr")
    shrun_data = update.initialMongo(db_name, "shrun")
    features_data = update.initialMongo(db_name, "features")
    feature_shrun_data = update.initialMongo(db_name, "feature_shrun")
    duplicated_sr = update.initialMongo(db_name, "duplicatedSr")
    releaseMap = update.initialMongo(db_name, "releaseMap_copy")
    customerMap = update.initialMongo(db_name, "customerMap")

    if args.action == "update_customerInfo":
        customerInfo_data = update.initialMongo(db_name, "customerInfo")
        update.update_customerInfo(customerInfo_data)
    elif args.action == "update_sr":
        update.update_sr(sr_data)
    elif args.action == "update_features":
        update.update_features(sr_data, features_data)

    elif args.action == "update_shrun":
        featureDict = update.get_all_feature(features_data)
        update.update_shrun(sr_data, shrun_data, featureDict)

    elif args.action == "update_feature_shrun":
        featureDict = update.get_all_feature(features_data)
        update.update_feature_shrun(shrun_data, feature_shrun_data, featureDict)

    elif args.action == "update_duplicateSr":
        update.getduplicatedSr(duplicated_sr)
        update.updatedupFeatureList(duplicated_sr, shrun_data)

    elif args.action == "check_hostname":
        customerInfo_data = update.initialMongo(db_name, "customerInfo")
        update.checkHostname(duplicated_sr, customerInfo_data)

    elif args.action == "checkHostnamediffCompany":
        customerInfo_data = update.initialMongo(db_name, "customerInfo")
        update.checkHostnamediffCompany(customerInfo_data)

    elif args.action == "update_featureList":
        update.update_featureList(shrun_data, sr_data)

    elif args.action == "addinfo_features":
        update.addinfo_features(features_data)

    elif args.action == "correct_feature":
        update.correctfeature(shrun_data, sr_data)
    #
    # elif args.action == "checkcustomerMap":
    #     update.checkcustomerMap(customerMap)