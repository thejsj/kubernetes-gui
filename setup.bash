# Setup Docker machine for dev
docker-machine create -d xhyve dev

# Setup Docker machine for registry
docker-machine create -d xhyve registry
eval $(docker-machine env registry)
REG_IP=`docker-machine ip registry`

# Start minikube
minikube start --vm-driver=xhyve --show-libmachine-logs --logtostderr --v=5 --insecure-registry="$REG_IP":80
