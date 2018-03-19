import bdblib
import requests
import xlrd
import logging
import json
import bdbclient
import urllib
import re
from bdblib import Env
from urllib2 import *

logger = logging.getLogger(__name__)
logger.setLevel(logging.WARNING)


def task(env, srID, inExcel):
    """
    This task downloads show-tech files attached in the input SR IDs.

    Input: SR IDs
    Output: Downloaded show-tech files attached to the SR IDs

    """
    sr_list = []
    if srID:
        sr_list = [srNum for srNum in re.split(r'[\s,]+', srID) if srID]

    if (inExcel is not None):
        sr_list = []
        inWorkbook = xlrd.open_workbook(inExcel)
        inWorksheet = inWorkbook.sheet_by_index(0)

        for i in range(inWorksheet.nrows):
            line = inWorksheet.cell_value(i, 0)
            # print(str(line))
	    line = int(line)
            print (str(line))
            sr_list.append(str(line))

    sr_db = {}
    for sr_num in sr_list:
        attachedFiles = []
        match = re.match("[\d]{9}", sr_num)
        # print ("\n---***---")
        if not match:
            sr_db[sr_num] = "Invalid SR Number"
            print (float(sr_num), sr_db[sr_num])
        else:
            print (str(sr_num))

            attachedFiles = []
            try:
                attachedFiles = get_list_of_attachments(sr_num, env.cookies)
            except:
                print ("No attachments found.")

            bdb_client = bdbclient.BdbClient(cookies=env.cookies)
            no_attachments = True
            for file_data in attachedFiles:
                fileName = file_data['fileName']

                uri = "https://scripts.cisco.com/api/v2/attachments-meta/{}?filenames={}".format(sr_num, fileName)

                # Make the API call to fetch the file meta info into the BDB session folder.
                r = requests.get(uri, cookies=env.cookies, headers={'Accept': 'application/json'})
                # print ((r.json()))

                if (len(r.json()) != 0 and "category" in r.json()[0] and r.json()[0]['category'] == "show_tech"):
                    no_attachments = False
                    print ("File Name: ", file_data["fileName"])
                    # print ("File Parameters: ", r.json())
            #         file_param = r.json()[0]
            #         url = bdb_client._baseapiv2 + "/attachments/{0}/{1}".format(sr_num, urllib.quote(fileName.encode("utf-8")))
            #         logger.debug(url)
            #         print url
            #
            #         # req = requests.get(url, cookies = env.cookies, headers={'Accept': 'application/json'})
            #         # print req.iter_content()                    #
            #         # filename = './'+fileName
            #         # with open(filename,'wb') as handle:
            #         #     r = requests.get(url, cookies=env.cookies, headers={'Accept': 'application/json'}, stream=True)
            #         #     r.raise_for_status()
            #         #     for block in r.iter_content():
            #         #         if not block:
            #         #             break
            #         #         handle.write(block)
            #         print env.cookies
            #         # file_info = {}
            #         # response = bdb_client._session.get(url)
            #         # print response
            #         # bdb_client.fetch_url(url,fileName)
            #         print(type(bdb_client._session))
            #         # # bdb_client.session_files()
            #         # # webFile = urlopen(url)
            #         # # localFile = open('./showtech'+sr_num, 'w')
            #         # # localFile.write(response.text)
            #         # # # webFile.close()
            #         # # localFile.close()
            #         # # req = urllib.urlopen(url)
            #         # # print req.read()
            # print bdb_client.session_files()
                    # print response

                    # bdb_client.raise_on_http_error(response)
                    # r = requests.get(url, cookies=env.cookies, headers={'Accept': 'application/json'})
                    # print r.text

    return 'something useful here'


#
# This function obtains the information of the files attached to a case
# Input: SRID
# Output: List containing information on the attached files
#
def get_list_of_attachments(srId, cookies):
    bdb_client = bdbclient.BdbClient(cookies=cookies)
    # print (cookies)
    url = bdb_client._baseapiv2 + "/attachments/{}".format(srId)
    print bdb_client._baseapiv2
    logger.debug(url)
    response = bdb_client._session.get(url)
    bdb_client.raise_on_http_error(response)

    return json.loads(response.text)

if __name__ == "__main__":
    env = Env.from_user_input(task_name="show_tech_download",username="zhicren")
    # env = Env.from_user_input()
    task(env, '681778774','/home/odl/srid.xlsx')
