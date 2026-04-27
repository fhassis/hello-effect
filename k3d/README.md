# k3d Settings

These configurations enable the creation of a local k3d cluster to explore application development, observability, gitops deployments and other things related to kubernetes.

## k3d Cluster Setup

## Create the cluster

```bash
k3d cluster create --config k3d/dev.yaml
```

### Delete the cluster

```bash
k3d cluster delete k3d-dev
```

## Observability

Helm values for the Grafana observability stack (Prometheus, Loki, Tempo, Grafana, Alloy) live in [observability/](observability/). See [observability/README.md](observability/README.md) for install and access instructions.
