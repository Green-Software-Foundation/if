# Using Docker Container

The Impact Framework API server can be run as a Docker container.
The official image is provided at `ghcr.io/green-software-foundation/if`.

## Running the Container

Run a container using the built image:

```sh
# Run with default port (3000)
$ docker run --rm -p 3000:3000 ghcr.io/green-software-foundation/if

# Run with custom port
$ docker run --rm -p 8080:3000 ghcr.io/green-software-foundation/if
```

When specifying arguments for the `if-api` command, you need to include the `if-api` command as shown below.

```sh
# Run without external plugin warning
$ docker run --rm -p 3000:3000 ghcr.io/green-software-foundation/if if-api --disableExternalPluginWarning
```

## Using the containerized API server

The containerized API server provides the same endpoints as the regular API server:

```sh
# Process manifest
$ curl -H "Content-Type: application/yaml" --data-binary @manifest.yaml http://localhost:3000/v1/run
```

## Adding external plugins at startup
You can add any external plugins at startup by mounting a file that lists the plugins to `/app/plugins.txt`.

```sh
$ cat plugins.txt
carbon-intensity-plugin
Green-Software-Foundation/if-github-plugin
$ docker run --rm -p 3000:3000 -v $(pwd)/plugins.txt:/app/plugins.txt ghcr.io/green-software-foundation/if
```

The contents of `/app/plugins.txt` are used directly as arguments for `npm install`.
For available formats, refer to: https://docs.npmjs.com/cli/v8/commands/npm-install

If the plugin itself or packages it depends on are private, you'll need to mount an `.npmrc` file at `/app/.npmrc` for the access token required to install packages.

```sh
$ cat plugins.txt
@myscope/myplugin
$ cat .npmrc
//registry.npmjs.org/:_authToken=<YOUR_AUTH_TOKEN>
@myscope:registry=https://registry.npmjs.org/
$ docker run --rm -p 3000:3000 -v $(pwd)/plugins.txt:/app/plugins.txt -v $(pwd)/.npmrc:/app/.npmrc ghcr.io/green-software-foundation/if
```

For `.npmrc` format reference: https://docs.npmjs.com/cli/v8/configuring-npm/npmrc

Note that if the plugin itself or packages it depends on are in GitHub Packages, a personal access token (classic) with `read:packages` permission is required even for public packages.

```sh
$ cat plugins.txt
danuw/if-casdk-plugin
$ cat .npmrc
//npm.pkg.github.com/:_authToken=<YOUR_PERSONAL_ACCESS_TOKEN>
@Green-Software-Foundation:registry=https://npm.pkg.github.com/
$ docker run --rm -p 3000:3000 -v $(pwd)/plugins.txt:/app/plugins.txt -v $(pwd)/.npmrc:/app/.npmrc ghcr.io/green-software-foundation/if
```

Alternatively, the access token can also be extracted to an environment variable (but this is not recommended as it can easily leak through `ps` commands, `proc` filesystem, dumps, etc.).

```sh
$ cat plugins.txt
@myscope/myplugin
$ cat .npmrc
//registry.npmjs.org/:_authToken=${NODE_AUTH_TOKEN}
@myscope:registry=https://registry.npmjs.org/
$ docker run --rm -p 3000:3000 -v $(pwd)/plugins.txt:/app/plugins.txt -e NODE_AUTH_TOKEN=<YOUR_AUTH_TOKEN> -v $(pwd)/.npmrc:/app/.npmrc ghcr.io/green-software-foundation/if
```

## Building the Container Image

As mentioned above, there are official images available, but you can also build your own container image using the provided `Dockerfile`:

```sh
# Build the container image
$ docker build -t myorg/if:v1.0.0 .
```

## Building Slim Image

The built container image includes the git command to enable installation of external plugins from git repositories such as GitHub at startup.
However, if you know that you don't need to install external plugins from git repositories during startup, you can create a slimmer container image without git by specifying the `--build-arg PACKAGES=` option in the container image build command.

```sh
# Build custom image without git
$ docker build -t myorg/if:v1.0.0-slim --build-arg PACKAGES= .
```

Note that the absence of git does not affect the installation of npm packages.

```sh
# Run the custom image with the npm package
$ cat plugins-startup.txt
carbon-intensity-plugin
$ docker run --rm -p 3000:3000 -v $(pwd)/plugins-startup.txt:/app/plugins.txt myorg/if:v1.0.0-slim
```

## Building the Container Image with external plugins

While the official image and images built using the methods described above can add external plugins at container startup, installing external plugins takes considerable time, which significantly slows down container startup.
To avoid this, a `Dockerfile` for building container images with external plugins pre-installed is also provided in the `with-plugins` directory.
Create a `with-plugins/plugins.txt` file and build the image.

```sh
$ cat with-plugins/plugins.txt
carbon-intensity-plugin
Green-Software-Foundation/if-github-plugin
$ docker build -t myorg/if-with-plugins:v1.0.0 with-plugins
```

A `with-plugins/.npmrc` is required if you need an access token, as well as if you want to add external plugins when starting the container (The `with-plugins/.npmrc` file will not remain in the container image).

```sh
$ cat with-plugins/plugins.txt
danuw/if-casdk-plugin
$ cat with-plugins/.npmrc
//npm.pkg.github.com/:_authToken=<YOUR_PERSONAL_ACCESS_TOKEN>
@Green-Software-Foundation:registry=https://npm.pkg.github.com/
$ docker build -t myorg/if-with-plugins:v1.0.0 with-plugins
```

The base image used for installing external plugins is the official image, and the base image for the final image is `node:18-slim`, but these can be changed using the `BUILDBASEIMAGE` and `BASEIMAGE` arguments respectively.

```sh
$ docker build -t myorg/if-with-plugins:v1.0.0 --build-arg BUILDBASEIMAGE=myorg/if:v1.0.0 --build-arg BASEIMAGE=node:20-slim with-plugins
```

Note that, as with regular images, you can also create a slim image without git by adding the `--build-arg PACKAGES=` option.

## Execution Other Than API Server

The container image can execute commands other than the `if-api` command.

```sh
$ docker run --rm -v $(pwd)/manifests/examples/pipelines/sci.yml:/app/sci.yml myorg/if:v1.0.0 if-run -m sci.yml
```
