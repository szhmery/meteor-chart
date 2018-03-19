import xml.dom
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

#hostname regex
pattern = re.compile('hostname.*')
#+[a-zA-Z0-9\s\.\_-]+


#"the different company but the same hostname"
def checkcompany(configdicts,config,hostname):
    if configdicts[hostname]['company'] == config['company']:
        return True
#"the different chassis but the same hostname"
def checkchassis(configdicts,config,hostname):
    if configdicts[hostname]['chassis'] != config['chassis']:
        return True
#"the different release but the same hostname"
def checkrelease(configdicts,config,hostname):
    if configdicts[hostname]['release'] != config['release']:
        return True

class UpdateCompany :
    def __init__(self, from_url, to_url):
        self._from = from_url
        self._to   = to_url
        self._solr = pysolr.Solr(to_url + '/solr/sr/', timeout=10)
        self._mongo = pymongo.MongoClient("10.79.41.50", 27017)

    # def getFromOld(self, idsr):
    #     startnum = str(0)
    #     url = self._from + '/solr/sr/select?fl=company,idsr,chassis&indent=on&q=idsr:' + idsr + '&rows=10&wt=json&start=' + startnum
    #     #print("URL: %s" % url)
    #     add = urlopen(url)
    #     string = add.read()
    #     data = json.loads(string)
    #     configs = data['response']['docs']
    #     # print("RESPONSE: %s" % string)
    #     docs = data['response']['docs']
    #     for doc in docs:
    #         return doc['company']
    #     return  ""

    def isExist(self, idsr):
        startnum = str(0)
        url = self._to + '/solr/sr/select?indent=on&q=idsr:' + idsr + '&rows=10&wt=json&start=' + startnum
        #print("URL: %s" % url)
        add = urlopen(url)
        string = add.read()
        data = json.loads(string)
        configs = data['response']['docs']
        # print("RESPONSE: %s" % string)
        docs = data['response']['docs']
        for doc in docs:
            return True
        return False

    # Get the 'unknown' customer case idsr, put it to 'unknown_list'
    def check_unknow_company(self):
        i = 0
        unknown_list = []
        for start_num in range(args.start_index, args.end_index, 10):
            startnum = str(start_num)
            url = self._to + '/solr/sr/select?fl=company,idsr,chassis&indent=on&q=company:unknow&rows=10&wt=json&start=' + startnum
            #print('%d/%d - %s' % (start_num, args.end_index, url))
            add = urlopen(url)
            string = add.read()
            data = json.loads(string)
            # configs = data['response']['docs']
            # print("RESPONSE: %s" % string)
            docs = data['response']['docs']
            #print("DOCS:" % docs)
            for doc in docs:
                #print("DOC: %s" % str(doc['company']))
                #print("IDSR: %s: company: %s" % (doc['idsr'], self.getFromOld(doc['idsr'])))
                # customer = self.getFromOld(doc['idsr'])
                customer = doc['company']
                print("IDSR: %s: company: %s" % (doc['idsr'], customer))
                if customer == "unknow" :
                    i += 1
                    unknown_list.append(doc['idsr'])
                    pass
                elif customer == "" :
                    pass
                else:
                    print("IDSR: %s: company: %s" % (doc['idsr'], customer))
        print(len(unknown_list))
        print("Unknow number from origin server: %d" % i)
        return unknown_list

    # Write the data from old solr to new solr
    def checkAndAppend(self):
        self.DATA_PATH = "/tmp/SRDATA"
        if os.path.isdir(self.DATA_PATH) :
            shutil.rmtree(self.DATA_PATH)
        os.mkdir(self.DATA_PATH)
        i = 0
        for start_num in range(args.start_index, args.end_index, 10):
            startnum = str(start_num)
            url = self._from + '/solr/sr/select?indent=on&q=*:*&rows=10&wt=json&start=' + startnum
            #print('%d/%d - %s' % (start_num, args.end_index, url))
            add = urlopen(url)
            string = add.read()
            data = json.loads(string, encoding='utf-8')
            configs = data['response']['docs']
            # print("RESPONSE: %s" % string)
            docs = data['response']['docs']
            #print("DOCS:" % docs)
            for doc in docs:
                #print("IDSR: %s: company: %s" % (doc['idsr'], self.getFromOld(doc['idsr'])))
                idsr = doc['idsr']
                if self.isExist(idsr) :
                    pass
                else :
                    self.writeDocToSolr(doc)
                    print ("Need to addend IDSR %s" % (idsr))

        print("Success")

    # Create Xml element to make Xml
    def create_element(self, doc,sNode,tag,attr,name):
        elementNode=doc.createElement(tag)
        textNode=doc.createTextNode(attr)
        elementNode.setAttribute('name',name)
        elementNode.appendChild(textNode)
        return elementNode

    # Get the hostname from shrun and add data to solr
    def writeDocToSolr(self, data) :
        idsr = data['idsr']
        raw_hostname = pattern.findall(data['shrun'])
        if raw_hostname == []:
            print('no hostname!')
            hostname = u""
        else :
            print(raw_hostname[0])
            hostname = raw_hostname[0][9:]
        data[u'hostname'] = hostname
        data[u'show'] = u'false'
        # Only for debug
        # data[u'shrun'] = u''
        # data[u'shlog'] = u''
        dat = []
        dat.append(data)
        print("Insert SR to solr for IDSR: %s" % idsr)
        self._solr.add(dat)


    # Write the array to Xml
    # def writeDocToXml(self, data) :
    #     idsr = data['idsr']
    #     raw_hostname = pattern.findall(data['shrun'])
    #     if raw_hostname == []:
    #         print('no hostname!')
    #         hostname = ""
    #     else :
    #         print(raw_hostname[0])
    #         hostname = raw_hostname[0][9:]
    #     dom1=xml.dom.getDOMImplementation()
    #     doc=dom1.createDocument(None,"add",None)
    #     top_element = doc.documentElement
    #
    #     sNode=doc.createElement('doc')
    #
    #     idsrNode=self.create_element(doc,sNode,'field',data['idsr'],'idsr')
    #     sNode.appendChild(idsrNode)
    #
    #     companyNode=self.create_element(doc,sNode, 'field',data['company'],'company')
    #     sNode.appendChild(companyNode)
    #
    #     dateNode=self.create_element(doc,sNode, 'field',data['date'],'date')
    #     sNode.appendChild(dateNode)
    #
    #     timestampNode=self.create_element(doc,sNode, 'field',data['timestamp'],'timestamp')
    #     sNode.appendChild(timestampNode)
    #
    #     hostnameNode=self.create_element(doc,sNode, 'field',hostname,'hostname')
    #     sNode.appendChild(hostnameNode)
    #
    #     hostnumNode=self.create_element(doc,sNode, 'field',"0",'hostnum')
    #     sNode.appendChild(hostnumNode)
    #
    #     chassisNode=self.create_element(doc,sNode, 'field',data['chasis'],'chassis')
    #     sNode.appendChild(chassisNode)
    #
    #     releaseNode=self.create_element(doc,sNode, 'field',data['release'],'release')
    #     sNode.appendChild(releaseNode)
    #
    #     imageNode=self.create_element(doc,sNode, 'field',data['image'],'image')
    #     sNode.appendChild(imageNode)
    #
    #     shrunNode=self.create_element(doc,sNode, 'field',"false",'show')
    #     sNode.appendChild(shrunNode)
    #
    #     shrunNode=self.create_element(doc,sNode, 'field',data['shrun'],'shrun')
    #     sNode.appendChild(shrunNode)
    #
    #     if 'shlog' in data:
    #         shlogNode=self.create_element(doc,sNode, 'field',data['shlog'],'shlog')
    #         sNode.appendChild(shlogNode)
    #
    #
    #     top_element.appendChild(sNode)
    #
    #     xmlfile=open(self.DATA_PATH + "/shrun" + idsr + '.xml','w')
    #     doc.writexml(xmlfile,addindent=' '*4, newl='\n', encoding='utf-8')
    #     xmlfile.close()

    # Read file and return the file content
    def read_file(self, filename):
        with open(filename, 'r') as file:
            return file.read()

    # def getCompanyAndHostname(self, idsr):
    #     bdb_api = "https://scripts.cisco.com:443/api/v2/csone/" + idsr
    #     _task_name = "query_sr_info"  
    #     _auth = (args.username, args.password)
    #     base64string = base64.encodestring('%s:%s' % (args.username, args.password))[:-1]
    #     authheader = "Basic %s" % base64string
    #     print authheader
    #     post_data = '["Customer_Company_Name__c","Node_Name__c"]'
    #     ret = requests.post(bdb_api, data=post_data,
    #                        headers={'Content-type': 'application/json'},
    #                        allow_redirects=True,auth= authheader)
    #     # auth = authheader
    #     ret.raise_for_status()
    #     print(ret)

    # Get the real hostname through swagger api
    def getCompany(self, session, idsr):
        baseurl = 'https://scripts.cisco.com/api/v2/csone/'
        url = baseurl + idsr
        command = "curl -s " + " '"+url +"' " +session
        print command
        try:
            output =  os.popen(command).read()
            companyname = json.loads(output)['Customer_Company_Name__c']
        except:
            return ""
        return companyname

    # Get the real hostname through swagger api
    def getHostname(self, session, idsr):
        baseurl = 'https://scripts.cisco.com/api/v2/csone/'
        url = baseurl + idsr
        command = "curl -s " + " '" + url + "' " + session
        # print command
        try:
            output = os.popen(command).read()
            hostname = json.loads(output)['Node_Name__c']
        except:
            return ""
        return hostname


    # If the company name of case is 'unknow', update it in solr
    def updateCompany(self,session):

        for start_num in range(args.start_index, args.end_index, 10):
            ret = self._solr.search('company:unknow', fl='idsr', start=start_num, rows=10)

            for doc in ret.docs:
                idsr = doc['idsr']
                print("Start %d: Uknow company for idsr %s" % (start_num, idsr))

                customer = self.getCompany(session,idsr)
                if customer == "":

                    print ("no company name for idsr %s" % idsr)
                    continue


                doc = {'idsr': idsr, 'company': customer}
                self._solr.add([doc], fieldUpdates={'company': 'set'})


    # Correct the hostname through swagger api
    def updateHostname(self, session):

        change = 0
        total = 0
        for start_num in range(args.start_index, args.end_index, 10):
            ret = self._solr.search('chassis:cbr*',fl='idsr,hostname,origin_hostname',start = start_num, rows = 10)
            index = 0

            for doc in ret.docs:

                # if hostname != None:
                print("index is %d/%d/%d" % (index, start_num, args.end_index))
                index += 1
                total += 1
                idsr = doc['idsr']

                print("    Start %d: updating for idsr %s" % (start_num, idsr))


                if 'origin_hostname' not in doc:
                    # print("begin")
                    origin_hostname = doc['hostname']
                    # print("end")
                    hostname = self.getHostname(session, idsr)
                    if  hostname == None:
                        hostname = origin_hostname
                    elif origin_hostname.lower() == hostname.lower():
                        hostname = origin_hostname
                    else:
                        pass

                    doc = {'idsr': idsr, 'hostname': hostname, 'origin_hostname': origin_hostname}
                    self._solr.add([doc], fieldUpdates={'hostname': 'set', 'origin_hostname': 'add'})
                    change += 1
                    if args.debug_mode:
                        print("    Update idsr %s: hostname from %s to %s" % (idsr, origin_hostname, hostname))

                            # self._solr.add([doc], fieldUpdates={'company': 'set', 'chassis': 'add'})
                # except Exception as inst:
                #     print type(inst)  # the exception instance
                #     print inst.args  # arguments stored in .args
                #     print inst  # __str__ allows args to be printed directly
                else:
                    print("idsr %s update failed! origin_hostname has existed!" % idsr)

        print("Result: Total: %d, changed: %d" % (total, change))


    #
    # def get_collection_sr(self, startnum):
    #     startnum = str(startnum)
    #     url = self._to + '/solr/sr/select?fl=idsr,company,date,timestamp,hostname,chassis,release,image,shrun&indent=on&q=show:true&rows=10&wt=json&start=' + startnum
    #     add = urlopen(url)
    #     string = add.read()
    #     data = json.loads(string, encoding='utf-8')
    #     # configs = data['response']['docs']
    #     # print("RESPONSE: %s" % string)
    #     docs = data['response']['docs']
    #     # print("DOCS:" % docs)
    #     for doc in docs:
    #         # print("IDSR: %s: company: %s" % (doc['idsr'], self.getFromOld(doc['idsr'])))
    #         idsr = doc['idsr']
    #         self.writeDocToXml(doc)
    #
    #
    # def getxml(self):
    #     self.DATA_PATH = "/home/zhicren/newsolrxml"
    #     # if os.path.isdir(self.DATA_PATH) :
    #     #     shutil.rmtree(self.DATA_PATH)
    #     # os.mkdir(self.DATA_PATH)
    #     i = 0
    #     for start_num in range(args.start_index, args.end_index, 10):
    #         print("start_num is %d,end_index is %d" % (start_num,args.end_index))
    #         # self.a(start_num)
    #         try:
    #             self.get_collection_sr(start_num)
    #         except:
    #             try:
    #                 self.get_collection_sr(start_num)
    #             except:
    #                 pass

    # Correct the company through mongodb collection 'customerMap'
    def mapCompany(self):
        db = self._mongo['cmts_features']
        # releaseMap = db['releaseMap_copy']
        customerMap = db['customerMap_backup']

        total = 0
        change = 0
        for start_num in range(args.start_index, args.end_index, 10):

            ret = self._solr.search('*:*', fl='idsr,company,chassis', start=start_num, rows=10)

            index = 0
            for doc in ret.docs:
                print("index is %d/%d/%d" % (index, start_num, args.end_index))
                index += 1
                total += 1
                idsr = doc['idsr']
                print("    Start %d: updating for idsr %s" % (start_num, idsr))


                try:
                    origin_company = doc['company']
                    try:
                        company = customerMap.find({"origin_name":origin_company})[0]['name']
                    except:
                        company = origin_company
                    if company != origin_company:
                        doc = {'idsr': idsr, 'company': company, 'origin_company':origin_company}
                        self._solr.add([doc], fieldUpdates={'company': 'set', 'origin_company':'set'})
                        change += 1
                        if args.debug_mode:
                            print("    Update idsr %s: company from %s to %s" %(idsr, origin_company, company))
                    else:
                        print "The name of company is the real name!"
                    # self._solr.add([doc], fieldUpdates={'company': 'set', 'chassis': 'add'})

                except:
                    print("idsr %s update failed!" % idsr)
        print("Result: Total: %d, changed: %d" % (total, change))

    # Correct the release through mongodb collection 'releaseMap'
    def mapRelease(self):
        db = self._mongo['cmts_features']
        # releaseMap = db['releaseMap_copy']
        releaseMap = db['releaseMap']

        total = 0
        change = 0
        for start_num in range(args.start_index, args.end_index, 10):

            ret = self._solr.search('*:*', fl='idsr,company,release', start=start_num, rows=10)

            index = 0
            for doc in ret.docs:
                print("index is %d/%d/%d" % (index, start_num, args.end_index))
                index += 1
                total += 1
                idsr = doc['idsr']
                print("    Start %d: updating for idsr %s" % (start_num, idsr))
                if 'release' in doc :
                    origin_release = doc['release']
                else :
                    print("idsr %s has no release!" % idsr)
                    continue # skip the one without release name

                try:
                    try:
                        release = releaseMap.find({"origin_name":origin_release})[0]['name']
                    except:
                        release = origin_release
                    if release != origin_release or True:
                        doc = {'idsr': idsr, 'release': release, 'origin_release':origin_release}
                        self._solr.add([doc], fieldUpdates={'release': 'set', 'origin_release':'add'})
                        print ("idsr %s has been add!" % idsr)
                        change += 1
                        if args.debug_mode:
                            print("    Update idsr %s: release from %s to %s" %(idsr, origin_release, release))
                    else:
                        print ("The same release!")
                except:
                    print("idsr %s update failed!" % idsr)
        print("Result: Total: %d, changed: %d" % (total, change))


    # Update hostnum and duplicate_sr in the solr
    def updateDuplicateCase(self, unique_idsr, hostnum, doc, write_mode) :
        curr_idsr = doc['idsr']
        show = doc['show']
        show_string = ''
        dup_string = "add"
        hostnum_string = "add"
        origin_hostnum = 0
        if 'hostnum' in doc:
            origin_hostnum = doc['hostnum']
            hostnum_string = "set"
        if 'duplicate_sr' in doc :
            dup_string = "set"
        if 'hostnum' in doc :
            dup_string = "set"
        show_change = False
        if curr_idsr == unique_idsr :
            show_string = 'true'
            if show != True :
                show_change = True
        else :
            show_string = 'false'
            if show == True :
                show_change = True
        if (show_change or origin_hostnum != hostnum) :
            print("        Need to update solr %s to set show to %s" % (curr_idsr, show_string))
            if write_mode :
                doc = {'idsr': curr_idsr, 'show': show_string, 'duplicate_sr':unique_idsr, 'hostnum':hostnum}
                fields = {'show': 'set', 'duplicate_sr': dup_string, 'hostnum':hostnum_string}
                self._solr.add([doc], fieldUpdates=fields)
            return True
        else :
            return False



    # Search all duplicate IDSR to find the unique case
    # And will write to SOLR when write_mode is true
    def checkDuplicate(self, write_mode):
        total = 0
        unfound = 0
        change = 0
        for start_num in range(args.start_index, args.end_index, 10):
            ret = self._solr.search('chassis:cbr*', fl='idsr,company,hostname,show,duplicate_sr,hostnum', start=start_num, rows=10)
            for doc in ret.docs:
                total += 1
                idsr = doc['idsr']
                if args.debug_mode :
                    print("%d/%d IDSR: %s" % (start_num, args.end_index, idsr))
                try:
                    # For the case, there is no hostname; IDSR: 616555961
                    try:
                        hostname = doc['hostname']
                    except:
                        hostname = ""
                    company = doc['company']

                    sql = "company:\"" + company + "\" AND hostname:\"" + hostname + "\""
                    #sql = sql.replace('\\','\\\\')
                    if args.debug_mode :
                        print("        %d/%d IDSR: %s SQL:%s" % (start_num, args.end_index, idsr, sql))
                    found = False
                    unique_idsr = ""
                    if hostname == '' :
                        found = True
                        unique_idsr = idsr
                        data = {'idsr':idsr, 'show':doc['show']}
                        if 'duplicate_sr' in doc :
                            data['duplicate_sr'] = doc['duplicate_sr']
                        if 'hostnum' in doc :
                            data['hostnum'] = doc['hostnum']
                        if self.updateDuplicateCase(unique_idsr, 1, data, write_mode) :
                            change += 1
                        continue # continue for next doc
                    else :
                        hostnum = 0
                        cases = self._solr.search(sql, fl='idsr,company,hostname,show,duplicate_sr,hostnum', start=0, rows=10)
                        for data in cases.docs:
                            curr_idsr = data['idsr']
                            if curr_idsr > unique_idsr :
                                unique_idsr = curr_idsr
                            found = True
                            hostnum += 1
                    if found == False :
                        unfound += 1
                    else :
                        print("Found the unique IDSR: %s" % (unique_idsr))
                        for data in cases.docs:
                            print write_mode
                            if self.updateDuplicateCase(unique_idsr, hostnum, data, write_mode) :
                                change += 1

                except Exception as inst :
                    print type(inst)  # the exception instance
                    print inst.args  # arguments stored in .args
                    print inst  # __str__ allows args to be printed directly
                    print("Error to search the unique case for %s" % idsr)
        print("Result: Total: %d, unfound: %d, TO be Changed %d" % (total, unfound, change))

    # def checktotalHostnum(self):
    #     total = 0
    #     num = 0
    #     for start_num in range(args.start_index, args.end_index, 10):
    #         ret = self._solr.search('chassis:cbr*', fl='idsr, hostnum', start=start_num, rows=10)
    #         for doc in ret.docs:
    #             num += 1
    #             hostnum = doc['hostnum']
    #             total += int(hostnum)
    #
    #     print ("True number is %d, total hostnum is %d" % (num, total))



    # Correct the hostname: remove the special character "//" from the hostname.
    def correctHostname(self):
        total = 0
        unfound = 0
        for start_num in range(args.start_index, args.end_index, 10):
            if args.debug_mode :
                print("%d/%d - " % (start_num, args.end_index))
            ret = self._solr.search('*:*', fl='idsr,company,hostname', start=start_num, rows=10)
            for doc in ret.docs:
                total += 1
                idsr = doc['idsr']
                set_string = 'set'
                if 'hostname' in doc :
                    origin_hostname = doc['hostname']
                else :
                    set_string = 'add'
                    origin_hostname = ' '
                hostname = origin_hostname.replace('\\',' ')
                hostname = hostname.replace('\'', '')
                hostname = hostname.replace('\*', '')
                hostname = hostname.strip()
                if origin_hostname != hostname :
                    unfound += 1
                    doc = {'idsr': idsr, 'hostname': hostname}
                    self._solr.add([doc], fieldUpdates={'hostname': set_string})
                    print("Set hostname for %s from %s to \"%s\"" % (idsr, origin_hostname, hostname))
        print("Result: Total: %d, unfound: %d" % (total, unfound))

        
        
    # Search all duplicate IDSR to find the unique case
    def updateCbr8ToCbr(self):
        total = 0
        unfound = 0
        for start_num in range(args.start_index, args.end_index, 10):
            ret = self._solr.search('chassis:cbr8', fl='idsr,company,hostname', start=start_num, rows=10)
            for doc in ret.docs:
                total += 1
                idsr = doc['idsr']
                if args.debug_mode :
                    print("%d/%d IDSR: %s" % (start_num, args.end_index, idsr))
                doc = {'idsr': idsr, 'chassis': 'cbr'}
                try:
                    self._solr.add([doc], fieldUpdates={'chassis': 'set'})
                    unfound += 1
                except Exception as inst:
                    print type(inst)  # the exception instance
                    print inst.args  # arguments stored in .args
                    print inst  # __str__ allows args to be printed directly
                    print("Error to search the unique case for %s" % idsr)
        print("Result: Total: %d, unfound: %d" % (total, unfound))

    # Delete the fields of 'chasis'.
    # Otherwise, it will block the update/add by pysolr
    def deleteChasis(self):
        total = 0
        unfound = 0
        for start_num in range(args.start_index, args.end_index, 10):
            # TODO: There is a bug on it.
            # Since the below codes will remove the field 'chasis',
            # we need to loop search from index zero always.
            ret = self._solr.search('chasis:*', start=start_num, rows=10)
            for doc in ret.docs:
                total += 1
                idsr = doc['idsr']
                if args.debug_mode:
                    print("%d/%d IDSR: %s" % (start_num, args.end_index, idsr))
                if doc['chassis'] == None :
                    doc['chassis'] = doc['chasis']
                doc.pop('chasis', None)
                doc.pop('_version_', None)
                try:
                    self._solr.add([doc])
                    unfound += 1
                except Exception as inst:
                    print type(inst)  # the exception instance
                    print inst.args  # arguments stored in .args
                    print inst  # __str__ allows args to be printed directly
                    print("Error to search the unique case for %s" % idsr)
        print("Result: Total: %d, unfound: %d" % (total, unfound))

    # Some case's information is not complete
    # Update them separately
    def updateSpecialCase(self):
        db = self._mongo['cmts_features']
        # releaseMap = db['releaseMap_copy']
        customerMap = db['customerMap']
        releaseMap = db['releaseMap']
        from_solr = 'http://localhost:8983'
        from_solr = pysolr.Solr(from_solr + '/solr/sr/', timeout=10)
        for start_num in range(args.start_index, args.end_index, 10):
            ret = self._solr.search('NOT hostname:*',fl = 'idsr', start = start_num, rows =10)
            for doc in ret.docs:
                idsr = doc['idsr']
                print ("  processing idsr %s" % idsr)
                try:
                    result = from_solr.search('idsr:'+idsr, start = 0, rows = 10)
                    origin_company = result.docs[0]['company']
                    origin_release = result.docs[0]['release']
                    if origin_company != 'unknow':
                        print ("  updating idsr %s company %s" % (idsr, origin_company))


                        chassis = result.docs[0]['chasis']
                        print (' idsr %s chassis is %s' % (idsr,chassis))
                        chassis_pat = re.compile('cbr*')

                        if chassis_pat.match(chassis) == None:
                            doc = {'idsr':idsr, 'show':False}
                            fields = {'show':'set'}

                            self._solr.add([doc],fieldUpdates=fields)
                            print("update ubr case success!")
                        else:
                            try:
                                company = customerMap.find({"origin_name": origin_company})[0]['name']
                            except:
                                company = origin_company
                            try:
                                release = releaseMap.find({"origin_name": origin_release})[0]['name']
                            except:
                                release = origin_release
                            date = result.docs[0]['date']
                            timestamp = result.docs[0]['timestamp']
                            image = result.docs[0]['image']
                            shrun = result.docs[0]['shrun']
                            raw_hostname = pattern.findall(shrun)
                            print raw_hostname
                            if raw_hostname == []:
                                print('no hostname!')
                                hostname = u""
                            else:
                                print(raw_hostname[0])
                                hostname = raw_hostname[0][9:]
                            hostnum = 1
                            doc = {'idsr': idsr, 'company':company, 'release':release, 'date':date, 'timestamp':timestamp, 'chassis':chassis, 'image':image, 'shrun':shrun, 'hostname':hostname, 'hostnum':hostnum}
                            fields = {'company':'add', 'release':'add', 'date':'add', 'timestamp':'add', 'chassis':'add', 'image':'add', 'shrun':'add', 'hostname':'add', 'hostnum':'add'}
                            self._solr.add([doc], fieldUpdates=fields)
                            print("update cbr case success!")

                except Exception as inst:
                    print type(inst)  # the exception instance
                    print inst.args  # arguments stored in .args
                    print inst  # __str__ allows args to be printed directly
                    doc = {'idsr': "612794389 ", 'show': False}
                    fields = {'show': 'set'}
                    self._solr.add([doc], fieldUpdates=fields)
                    print("update ubr case success!")
                    print("idsr %s don't exist in old solr" % idsr)





if __name__ == "__main__": 
    parser = argparse.ArgumentParser(description="The tools to update solr.")
    parser.add_argument('--debug', dest='debug_mode', action='store_true')
    parser.set_defaults(debug_mode=True)
    parser.add_argument('--write', dest='write_mode', action='store_true')
    parser.set_defaults(write_mode=True)
    parser.add_argument('--username', dest='username', type=str)
    parser.set_defaults(username="")
    parser.add_argument('--password', dest='password', type=str)
    parser.set_defaults(password="")
    parser.add_argument('--from', dest='from_solr', type=str)
    parser.set_defaults(from_solr='http://10.79.41.50:8983')
    parser.add_argument('--to', dest='to_solr', type=str)
    parser.add_argument('--start', dest='start_index', type=int)
    parser.set_defaults(start_index=0)
    parser.add_argument('--end', dest='end_index', type=int)
    parser.set_defaults(end_index=1000)
    parser.add_argument('--action', dest='action', type=str)
    parser.set_defaults(action="help")
    parser.set_defaults(to_solr='http://10.79.41.50:8989')
    args = parser.parse_args()




    update = UpdateCompany(args.from_solr, args.to_solr)
    if args.action == "check" :
        update.check_unknow_company()
    elif args.action == "port" :
        update.checkAndAppend()
    elif args.action == "updatecompany" :
        session_file = 'Cookie.txt'
        session = update.read_file(session_file)
        update.updateCompany(session)
    elif args.action == "updatehostname":
        session_file = 'Cookie.txt'
        session = update.read_file(session_file)
        update.updateHostname(session)
    elif args.action == "mapCompany":
        update.mapCompany()
    elif args.action == "mapRelease":
        update.mapRelease()
    elif args.action == "checkDuplicate":
        update.checkDuplicate(args.write_mode)
    elif args.action == "updateCbr8ToCbr":
        update.updateCbr8ToCbr()
    elif args.action == "deleteChasis":
        update.deleteChasis()
    elif args.action == "correctHostname":
        update.correctHostname()
    elif args.action == "updateSpecialCase":
        update.updateSpecialCase()
    elif args.action == "help" :
        print("Help of tools")
    # elif args.action == "checktotalHostnum":
    #     update.checktotalHostnum()
    else :
        print("Unsupported action - %s" % args.action)
        

