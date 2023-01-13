# V Playground: Run, Edit, Share V Code Online

The [V Playground](https://play.vlang.io) is a official place where you can run, edit and share V code online.

![](./docs/images/cover.png)

## Features

- Nice and clean UI
- Powerful editor with syntax highlighting and auto-completion
- Easy run code
- Easy run tests
- Easy code formatting
- Shareable code and editor state via URL or local storage

## Developing

First clone the repository:

```bash
git clone https://github.com/vlang/playground
cd playground
```

### Quick, containerized local development (recommended)

#### Using Docker Compose

```bash
docker-compose up -d
```

then access the playground at <http://localhost:5555>

### Using VSCode DevContainers

1. Install Docker
2. Install [Visual Studio Code](https://code.visualstudio.com/)
3. Install the [Remote Development](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack) extension for VS Code
4. Clone <https://github.com/vlang/playground>
5. Create your application within a container (see gif below)

Done. And your system will remain "clean".

![vscode-open-in-container](https://user-images.githubusercontent.com/17727170/197407889-88fe33b0-8e95-47fe-b2db-598fd307140e.gif)

Then just run

```sh
make run
```

then access the playground at <http://localhost:5555>

### Run the playground locally

Just run:

```bash
make local_run
```

then access the playground at <http://localhost:5555>

### Run the playground locally inside isolate (as on play,vlang.io)

> NOTE: Only works on Linux, since it uses `isolate`.

#### Install Dependencies

> We use isolate to sandbox the playground, so you need to install it first.

```bash
git clone https://github.com/ioi/isolate /tmp/isolate
cd /tmp/isolate
make isolate isolate-check-environment
make install
```

### Run the server

```bash
make run
```

then access the playground at <http://localhost:5555>
