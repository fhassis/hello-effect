# simple-producer-consumer

Simple Producer/Consumer using a single process and a Queue to exchange messages.

# How to Run

## Create the dev cluster

Create the _dev_ cluster if not yet created:

```bash
k3d cluster create --config k3d/dev.yaml
```

## Build the image

```bash
docker build -t simple-pc:v1 .
```

## Import the image into the cluster

```bash
k3d image import simple-pc:v1 -c dev
```

## Deploy the app into the cluster

```bash
kubectl apply -f k8s/deployment.yaml
```

## Monitor the logs

```bash
kubectl logs -f deployment/simple-pc
```

## Useful cleanup commands

### Delete Deployment

```bash
kubectl delete -f k8s/deployment.yaml
```

### Delete Cluster

```bash
k3d cluster delete dev
```
