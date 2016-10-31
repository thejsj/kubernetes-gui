eval $(minikube docker-env)
export KUBERNETES_REGISTRY_POD=$(kubectl get pods --namespace kube-system -l k8s-app=kube-registry \
  -o template --template '{{range .items}}{{.metadata.name}} {{.status.phase}}{{"\n"}}{{end}}' \
  | grep Running | head -1 | cut -f1 -d' ')
KUBERNETES_API_PROXY_PORT=9000
export KUBERNETES_API_URL=$(kubectl config view | grep "server:" | cut -f 2- -d ":" | tr -d " ")
export KUBERNETES_API_TOKEN=$(kubectl describe secret $(kubectl get secrets | grep default | cut -f1 -d ' ') | grep -E '^token' | cut -f2 -d':' | tr -d '\t')
export DOCKER_HOST_IP=$(echo $DOCKER_HOST | awk -F'[/:]' '{print $4}')
echo "export KUBERNETES_API_PROXY_PORT=$KUBERNETES_API_PROXY_PORT"
echo "export KUBERNETES_API_PROXY_URL=localhost:$KUBERNETES_API_PROXY_PORT"
echo "export KUBERNETES_API_URL=$KUBERNETES_API_URL"
echo "export KUBERNETES_API_TOKEN=$KUBERNETES_API_TOKEN"
echo "export KUBERNETES_REGISTRY_URL=localhost:5000"
echo "export KUBERNETES_REGISTRY_POD=$KUBERNETES_REGISTRY_POD"
echo "export DOCKER_HOST_IP=$DOCKER_HOST_IP"
echo $(minikube docker-env)
# export KUBERNETES_API_PROXY_PID=$(kubectl proxy --port=$KUBERNETES_API_PROXY_PORT &)
# export KUBERNETES_REGISTRY_PROXY_PID=$(kubectl port-forward --namespace kube-system $KUBERNETES_REGISTRY_POD 5000:5000 &)
# echo "export KUBERNETES_API_PROXY_PID=$KUBERNETES_API_PROXY_PID"
# echo "export KUBERNETES_REGISTRY_PROXY_PID=$KUBERNETES_REGISTRY_PROXY_PID"
