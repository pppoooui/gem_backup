# DFC Cubic Zirconia Factory Docker Deployment

Target: Singapore AWS EC2 or another Singapore VPS running Docker.

## Recommended Setup

Use Docker for the app and put Nginx, Caddy, or Cloudflare Tunnel in front of it.

This compose file exposes the app only on the server itself:

```txt
127.0.0.1:3002 -> container:3000
```

That avoids conflict with any existing Docker Node service already using port 3000.

## Required Env File

Create `.env.production` on the server:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_PRODUCT_IMAGE_BUCKET=product-images
NEXT_PUBLIC_SITE_URL=https://dfccz.top
```

Never commit `.env.production`.

## Deploy On Server

```bash
cd /opt/dfcgem
docker compose --env-file .env.production up -d --build
docker compose ps
docker logs -f dfcgem-web
```

`--env-file .env.production` is required during build because
`NEXT_PUBLIC_*` values are compiled into the browser bundle.

Check locally on the server:

```bash
curl -I http://127.0.0.1:3002
curl -I http://127.0.0.1:3002/admin/login
```

## Nginx Reverse Proxy Example

```nginx
server {
    listen 80;
    server_name dfccz.top www.dfccz.top;

    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Use Certbot or Cloudflare Full Strict SSL for HTTPS.

## Small Server Notes

For a 2-core 1GB server, avoid building directly on the server if possible.
Build the image on a stronger machine or GitHub Actions, push it to a registry,
then pull and run it on the Singapore server.

If you must build on the server, add swap first:

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
free -h
```

## Update

Every push to `main` runs `.github/workflows/docker-image.yml`, which builds
the image on GitHub and pushes `ghcr.io/pppoooui/gem_backup:latest` plus a
`:<short-sha>` tag. The workflow needs these repository variables
(Settings > Secrets and variables > Actions > Variables):
`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

Once the workflow is green, on the server:

```bash
cd /opt/dfcgem
git pull
sudo docker compose --env-file .env.production pull
sudo docker compose --env-file .env.production up -d
sudo docker image prune -f
```

Do not build on the server (`--build`): it has too little memory and the
build freezes the whole machine. Do not set `APP_VERSION` in
`.env.production`; the image carries its own commit as the deployment version.

The package is private, so log the server in once with a GitHub token that has
`read:packages`:

```bash
sudo docker login ghcr.io -u pppoooui
```

## Rollback

Run an earlier commit's image by its short-sha tag:

```bash
sudo DFCGEM_IMAGE=ghcr.io/pppoooui/gem_backup:<short-sha> \
  docker compose --env-file .env.production up -d
```
