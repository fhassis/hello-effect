# Observability Stack

Single-replica, non-HA Grafana stack (Prometheus, Loki, Tempo, Grafana, Alloy) deployed as four Helm releases into the `observability` namespace.

The same values files are intended to work across all current target environments:

- `k3d-dev` (local single node)
- Single-node VPS running k3s
- 5-node k3s cluster

All three rely on the `local-path` StorageClass (default in k3s/k3d) and use single-replica filesystem storage. No object store, no Memcached, no Ingress.

## Components

| Release | Chart | Role |
|---|---|---|
| `kps`   | `prometheus-community/kube-prometheus-stack` | Prometheus + Grafana + Operator CRDs (`ServiceMonitor`/`PodMonitor`) + node-exporter + kube-state-metrics |
| `loki`  | `grafana/loki` (SingleBinary) | Log storage + query |
| `tempo` | `grafana/tempo` (single binary, **deprecated** — see note in [tempo.values.yaml](tempo.values.yaml)) | Trace storage + query, OTLP receiver on 4317/4318 |
| `alloy` | `grafana/alloy` (DaemonSet) | Tails pod logs to Loki, accepts OTLP traces and forwards to Tempo |

Metrics scraping is owned by `kube-prometheus-stack` (via the Prometheus Operator). Alloy is logs + traces only.

## Install

```bash
# 1. Add Helm repos (once per machine)
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

# 2. Create namespace
kubectl create namespace observability

# 3. Install (order matters: Loki + Tempo before Alloy so its targets exist)
helm install kps   prometheus-community/kube-prometheus-stack \
  -n observability -f k3d/observability/kube-prometheus-stack.values.yaml

helm install loki  grafana/loki \
  -n observability -f k3d/observability/loki.values.yaml

helm install tempo grafana/tempo \
  -n observability -f k3d/observability/tempo.values.yaml

helm install alloy grafana/alloy \
  -n observability -f k3d/observability/alloy.values.yaml

# 4. Watch pods come up
kubectl -n observability get pods -w
```

## Access Grafana

```bash
kubectl -n observability port-forward svc/kps-grafana 3000:80
```

Open <http://localhost:3000> — log in as `admin` / `admin`.

Then go to **Connections → Data sources** and confirm three healthy data sources:

- **Prometheus** (auto-wired by kube-prometheus-stack)
- **Loki**  → `http://loki.observability.svc.cluster.local:3100`
- **Tempo** → `http://tempo.observability.svc.cluster.local:3100`

Quick smoke tests in **Explore**:

- Prometheus: `up` should return >0 series.
- Loki: `{namespace="kube-system"}` should return logs.
- Tempo: empty until an app sends traces (next milestone).

## Send a trace from a workload

Apps in any namespace can ship OTLP traces to Alloy:

| Protocol | Endpoint |
|---|---|
| OTLP gRPC | `alloy.observability.svc.cluster.local:4317` |
| OTLP HTTP | `alloy.observability.svc.cluster.local:4318` |

Set `OTEL_EXPORTER_OTLP_ENDPOINT` (or the SDK equivalent) to one of those.

## Uninstall

```bash
helm uninstall alloy tempo loki kps -n observability
kubectl delete namespace observability
```

The `kube-prometheus-stack` chart leaves CRDs behind on uninstall (intentional — they may be in use by other charts). Remove them manually if you want a fully clean slate:

```bash
kubectl get crd -o name | grep monitoring.coreos.com | xargs kubectl delete
```

## Secrets

Deliberately simple. The only secret in this stack right now is the Grafana admin password, and on `k3d-dev` it's a throwaway `admin/admin` committed inline in [kube-prometheus-stack.values.yaml](kube-prometheus-stack.values.yaml). That's fine because:

- It's a well-known dev default, not a real credential.
- Self-documenting and reproducible — `git clone` + `helm install` works with no out-of-band steps.

**Switch to a real secrets tool when any of these become true:**

- This repo goes public.
- The VPS exposes Grafana on a public IP — `admin/admin` becomes a real exposure.
- A genuine credential enters the stack (S3 / GCS keys for Loki or Tempo storage, OAuth client secret, SMTP creds for alerting).

Migration path: **SOPS + [age](https://github.com/FiloSottile/age) + the [`helm-secrets`](https://github.com/jkroepke/helm-secrets) plugin**. Encrypted values files committed to git, decrypted at apply time, same key works across all environments. No in-cluster controller. Base `*.values.yaml` files stay committable; encrypted overrides go in `values-prod.yaml`-style overlays.

External Secrets Operator (ESO) comes later if/when a Vault or cloud secrets manager is available.

## Adapting for VPS / work cluster

The base values are environment-agnostic. Likely later additions per environment (out of scope for now):

- Ingress + TLS for Grafana (and maybe Tempo/Loki APIs).
- Real Grafana admin password (see **Secrets** above).
- Larger PVC sizes and longer Prometheus retention.
- `alertmanager.enabled: true` once alerting rules exist.
- Replace local PVC storage with S3-compatible object storage for Loki/Tempo if retention grows.

These belong in a per-environment overlay (e.g. `values-prod.yaml`) passed with a second `-f` flag — the base files stay untouched.
