# simple-producer-consumer

Simple Producer/Consumer using a single process and a Queue to exchange messages.

# How to Run

Make sure that the _k3d-dev_ cluster is already created.

## Build the image

```bash
docker build -t simple-pc:v1 .
```

## Import the image into the cluster

```bash
k3d image import simple-pc:v1 -c k3d-dev
```

## Deploy the app into the cluster

```bash
kubectl apply -f k8s/deployment.yaml
```

## Monitor the logs

```bash
kubectl logs -f deployment/simple-pc
```

## Delete Deployment

```bash
kubectl delete -f k8s/deployment.yaml
```
