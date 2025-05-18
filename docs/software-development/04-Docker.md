## Dev containers

Dev containers allow you to launch your VSCode workspace using a dockerfile or other images so you don't have to install things locally on your end. They allow for seamless development in collaboration. 

Here are some use cases:

- Ensuring everyone has the same VSCode extensions installed in the workspace
- Ensuring everyone has the same VSCode settings enabled in the workspace
- Ensuring everyone has the same binaries and images installed, like being able to use Deno, Bun, or FFMpeg.

Here is a basic example of the `devcontainer.json`

```json
{
  "name": "Node.js Development Container",
  "image": "mcr.microsoft.com/devcontainers/javascript-node:18",
  "extensions": ["dbaeumer.vscode-eslint", "esbenp.prettier-vscode", "ms-vscode.js-debug-nodejs"],
  "settings": {
    "terminal.integrated.shell.linux": "/bin/bash",
    "editor.formatOnSave": true,
    "eslint.alwaysShowStatus": true
  },
  "forwardPorts": [3000],
  "postCreateCommand": "npm install"
}
```