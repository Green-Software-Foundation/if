# Using API server with Kubernetes

The Impact Framework provides a helm chart, making it easy to run on a Kubernetes cluster.

## Deploy the API server to Kubernetes

The helm chart is provided in OCI format on GitHub Container Registry, so you need to specify `oci:` when referencing the chart.

```sh
$ helm install if oci://ghcr.io/green-software-foundation/charts/if
```

For security reasons, three builtin plugins (Shell, CSVImport, CSVLookup) are disabled by default, but they can be enabled by specifying in `values.yaml`.

```yaml
# enable all builtin plugins
disabledPlugins: []
```

## Install External Plugins

You can also specify in `values.yaml` to install external plugins when the pod starts.

```yaml
additionalPlugins:
- carbon-intensity-plugin
- Green-Software-Foundation/if-github-plugin
```

If an `.npmrc` file is required, you can create a `Secret` by specifying it in the `npmrc` section of the `values.yaml` file.

```yaml
additionalPlugins:
- Green-Software-Foundation/community-plugins
- danuw/if-casdk-plugin

npmrc: |
  //npm.pkg.github.com/:_authToken=<YOUR_PERSONAL_ACCESS_TOKEN>
  @Green-Software-Foundation:registry=https://npm.pkg.github.com/
```

You can also extract the access token as an environment variable.

```yaml
additionalPlugins:
- Green-Software-Foundation/community-plugins
- danuw/if-casdk-plugin

npmrc: |
  //npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
  @Green-Software-Foundation:registry=https://npm.pkg.github.com/

env:
  secret:
    GITHUB_TOKEN: <YOUR_PERSONAL_ACCESS_TOKEN>
```

## Using Custom Container Images

By creating and using a container image with external plugins pre-installed, you can use external plugins without installing them at pod startup, which reduces pod startup time.

`values.yaml` for using `my-image-repository:my-version` as the container image:

```yaml
image:
  repository: my-image-repository
  tag: my-version
```

## Using Kubernetes service

By default, a `ClusterIP` service is deployed, so you can access the API server by running `kubectl port-forward`.

```sh
$ kubectl port-forward svc/if 3000:3000 &
$ curl -H "Content-Type: application/yaml" --data-binary @manifest.yaml http://localhost:3000/v1/run
```

You can access the API server from outside the cluster without using `port-forward` by changing the service type to `NodePort` or `LoadBalancer`.

`values.yaml` for the `NodePort`:

```yaml
# Using NodePort
service:
  type: NodePort
  nodePort: 32000
```

`values.yaml` for the `LoadBalancer`:

```yaml
# Using LoadBalancer
service:
  type: LoadBalancer
```
