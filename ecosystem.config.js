module.exports = {
  apps: [{
    name: 'santech-master',
    script: 'npm',
    args: 'run preview -- --port 4321 --host',
    cwd: '/var/www/santech-master',
    env: {
      NODE_ENV: 'production',
      VITE_ALLOW_UNSAFE_HOST: 'true'
    },
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
