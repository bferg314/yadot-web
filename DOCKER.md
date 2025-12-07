# Docker Deployment Guide

This guide explains how to run the yadot-web application using Docker and Docker Compose.

## Prerequisites

- Docker installed ([Get Docker](https://docs.docker.com/get-docker/))
- Docker Compose installed (included with Docker Desktop)

## Quick Start

### Using Docker Compose (Recommended)

1. Build and start the container:
   ```bash
   docker-compose up -d
   ```

2. Access the application:
   ```
   http://localhost:3000
   ```

3. View logs:
   ```bash
   docker-compose logs -f
   ```

4. Stop the container:
   ```bash
   docker-compose down
   ```

### Using Docker CLI

1. Build the image:
   ```bash
   docker build -t yadot-web .
   ```

2. Run the container:
   ```bash
   docker run -d -p 3000:3000 --name yadot-web yadot-web
   ```

3. Stop the container:
   ```bash
   docker stop yadot-web
   docker rm yadot-web
   ```

## Configuration

### Environment Variables

Create a `.env` file in the project root (copy from `.env.example`):

```bash
cp .env.example .env
```

Available environment variables:

- `NEXT_PUBLIC_REFERENCE_DATE` - Optional default reference date (format: YYYY-MM-DD)
- `NODE_ENV` - Environment mode (production/development)

### Docker Compose Configuration

The `docker-compose.yml` includes:

- **Port mapping**: 3000:3000
- **Health checks**: Automatic container health monitoring
- **Resource limits**: CPU and memory constraints
- **Security options**: No new privileges, runs as non-root user
- **Auto-restart**: Container restarts unless manually stopped

## Security Features

The Docker setup includes several security enhancements:

1. **Multi-stage build** - Smaller final image with only production dependencies
2. **Non-root user** - Container runs as user `nextjs` (UID 1001)
3. **npm ci** - Reproducible dependency installation
4. **Health checks** - Automated container health monitoring
5. **Resource limits** - Prevents resource exhaustion
6. **Minimal image** - Based on Alpine Linux for smaller attack surface

## Troubleshooting

### Container won't start

Check logs:
```bash
docker-compose logs
```

### Port already in use

Change the port in `docker-compose.yml`:
```yaml
ports:
  - "8080:3000"  # Use port 8080 instead
```

### Permission issues

Ensure Docker has access to the project directory.

### Health check failing

Wait 40 seconds for the application to start (start_period), or check logs for errors.

## Production Deployment

For production deployments:

1. Set `NODE_ENV=production` in your environment
2. Use HTTPS (configure reverse proxy like nginx)
3. Set up proper logging and monitoring
4. Consider using orchestration (Kubernetes, Docker Swarm)
5. Implement backup strategies for user data

## Advanced Usage

### Custom resource limits

Edit `docker-compose.yml`:

```yaml
deploy:
  resources:
    limits:
      cpus: '2'      # Increase CPU limit
      memory: 1G     # Increase memory limit
```

### Using with reverse proxy

Example nginx configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Maintenance

### Update the application

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose up -d --build
```

### Clean up unused images

```bash
docker system prune -a
```

### View resource usage

```bash
docker stats yadot-web
```
