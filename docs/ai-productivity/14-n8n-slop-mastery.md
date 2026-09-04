## basics

### self-hosted installation

To run N8N locally, you can use `npx` or `docker`:

**npx route**

```bash
npx n8n
```

**docker route**

```bash
docker volume create n8n_data
docker run -it --rm --name n8n -p 5678:5678 -v n8n_data:/home/node/.n8n docker.n8n.io/n8nio/n8n
```

