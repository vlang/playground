# V Playground: Run, Edit, Share V Code Online

[![Association Official Project][AssociationOfficialBadge]][AssociationUrl]

The [V Playground](https://play.vosca.dev) is a place where you can run, edit and share V
code online.
Documentation can be found in the
[V Playground Documentation](https://docs.vosca.dev/tools/playground.html) section.

![](./docs/images/cover.png)

## Features

- Nice and clean UI
- Powerful editor with syntax highlighting and auto-completion
- Ability to [run code as tests](https://docs.vosca.dev/tools/playground.html#test)
- Ability
  to [see generated C code](https://docs.vosca.dev/tools/playground.html#show-generated-c-code)
  for passed V code
- Pass [flags](https://docs.vosca.dev/tools/playground.html#pass-arguments-to-compiler) to V
  compiler and binary
- [Shareable](https://docs.vosca.dev/tools/playground.html#share-code) code and editor state
  via URL or local storage

## Developing

First, clone the repository:

```bash
git clone https://github.com/vlang-association/playground
cd playground
```

### Quick, containerized local development (recommended)

#### Using Docker Compose

```bash
npm run run-docker
```

then access the playground at <http://localhost:5555>

### Using VSCode DevContainers

1. Install Docker
2. Install [Visual Studio Code](https://code.visualstudio.com/)
3. Install the
   [Remote Development](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack)
   extension for VS Code
4. Clone <https://github.com/vlang-association/playground>
5. Create your application within a container (see gif below)

Done.
And your system will remain "clean".

![vscode-open-in-container](https://user-images.githubusercontent.com/17727170/197407889-88fe33b0-8e95-47fe-b2db-598fd307140e.gif)

Then just run:

```sh
npm run serve
```

then access the playground at <http://localhost:5555>

### Run the playground locally

```bash
npm run local-serve
```

then access the playground at <http://localhost:5555>

### Run the playground locally inside isolate (as on play.vosca.dev)

> NOTE: Only works on Linux, since it uses `isolate`.

#### Install Dependencies

> We use isolate to sandbox the playground, so you need to install it first.

```bash
git clone https://github.com/ioi/isolate /tmp/isolate
cd /tmp/isolate
make isolate isolate-check-environment
make install
```

#### Run the server

```bash
npm run serve
```

then access the playground at <http://localhost:5555>

## Server API

See [server/README.md](./server/README.md) for more information about the server API.

## License

This project is under the **MIT License**.
See the
[LICENSE](https://github.com/vlang-association/playground/blob/main/LICENSE)
file for the full license text.

[AssociationOfficialBadge]: https://vosca.dev/badge.svg

[AssociationUrl]: https://vosca.dev
