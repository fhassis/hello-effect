# hello-effect

Template of a production application using [Effect.ts](https://effect.website/).

This template uses the following stack:

- [Effect.ts](https://effect.website/) as framework (functional programming for robustness)
- [NATS](https://nats.io/) as message broker
- [Postgres](https://www.postgresql.org/) as database
- [Kubernetes](https://kubernetes.io/) for deployment

Cluster setup, ArgoCD GitOps, and the observability stack live in [github.com/fhassis/k3d-cluster](https://github.com/fhassis/k3d-cluster).
