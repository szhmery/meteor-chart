# The commands to enter/exit the virtualenv
# source ./CIS/bin/activate
# deactivate
#

JAVA_PATH = /nobackup/jifu/solr-4.1.0/example
all: remove_duplicate update_solr import_excel update_db

remove_duplicate:
	python getXml.py --start 0 --end 10

update_solr:
	java -Durl=http://80.5.5.4:8983/solr/sr/update -jar ${JAVA_PATH}/exampledocs/post.jar /tmp/SRDATA/*

start_solr:
	java -Djetty.port=8983 -Dsolr.solr.home=cabletech/solr -jar ${JAVA_PATH}/start.jar

deleteall_solr:
	java -Durl=http://localhost:8983/solr/sr/update -Ddata=args -Dcommit=false -jar post.jar "<delete><query>*:*</query></delete>"



install:
	sudo pip install virtualenv
	virtualenv CIS	

pip:
	pip install -r requirement.txt


import_excel:
	python import.py

update_db:
	python dataTodb.py
	

