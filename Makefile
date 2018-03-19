cis:
	-docker rm -f $@
	docker run -it \
        -p 3000:3000 \
        -e MODE=PROD \
	--name $@ \
	sdntools.cisco.com/cis \
	bash

cis1:
	-docker rm -f $@
	docker run -it \
        -p 3000:3000 \
        -e MODE=DEBUG \
	--name $@ \
	sdntools.cisco.com/cis:3.0 \
	bash

debug_3002:
	-docker rm -f $@
	docker run -it \
	-p 3002:3000 \
	--name $@ \
	-v ${PWD}/www:/CIS/www \
	-v ${PWD}/backend:/CIS/backend \
	sdntools.cisco.com/cis:3.0 \
	bash

