# Simple, small, production-ready image for the Daily Positive GUI
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy our single-file GUI
COPY index.html /usr/share/nginx/html/

# Optional: custom nginx config for better caching / gzip (kept minimal)
# Using default is fine for this app.

EXPOSE 80

# Healthcheck (simple)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
