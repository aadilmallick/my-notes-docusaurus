
## Making a basic server and deploying it

### Create the instance then connecting it

After creating an EC2 instance and then generating a key pair, let's walk through how to use that key pair to connect to the EC2 instance, where you can refer to [[AWS tutorial#Connecting via SSH]] for more details.

1. Make sure your EC2 instance's security group allows for SSH on port 22 from any source IP.
2. Run the `whoami` command in the EC2 instance cloud connect, and you'll see the name of the user of the EC2 instance being `ec2-user`. That's the username you will SSH as.
3. Download the `.pem` key pair and then run this ssh command:

```
ssh -i PATH_TO_PEM ec2-user@<public-ip-address>
```


![](https://i.imgur.com/w4o4zNq.jpeg)

### DNS basics

![](https://i.imgur.com/6G4PkBn.jpeg)

- **nameserver**: holds DNS records to translate domain names into IP addresses.
- **TLD**: a domain name ending that ICANN owns and disperses of. Some TLDs are more expensive than others because they are more popular than others.

> [!NOTE]
> Some TLDs are restricted because they are closely associated with the IP of some companies. For example, you have all of the below, which can only be obtained by legitimate organizations or entities meeting specific criteria.
> 
> - `.org` (for registered organizations)
> - `.edu` (for educational institutes)
> - `.gov` (for government entities)
> - `.mil` (for military)



There are two important types of DNS records, but there are more:

- **A record**: maps domain name to public IP address
- **CNAME record**: maps domain name to another domain name, creating a redirection alias.

#### Buying a domain and connecting it with Namecheap

1. Buy a domain through the Namecheap registrar
2. In namecheap, add the nameservers of the hosting polatform that is hosting your site, like `nsi.digitalocean.com` if you are hosting your VPS instance on DigitalOcean and want to connect the domain to point to the IP address of that VPS
3. Add two A records to the hosting platform of your choice:
	- **www A record**: point the www subdomain to the IP address of your VPS
	- **@ A record**: The `@` value of an A record refers to the root domain name, so point that to the IP address of your VPS
4. Set up email redirection options, where you can create a professional business email that when emailed to, forwards to your personal email, so that way you can receive emails without exposing your personal one.
	- Create custom email aliases using your domain (e.g., service@yourdomain.com) that forward to your primary email address. This allows tracking email sources, maintaining privacy, and creating professional-looking email addresses without paying for full email hosting.


![](https://i.imgur.com/1gLeyPq.jpeg)


5. Set up google business using namecheap


> [!NOTE]
> Email redirection is free but if you want to send emails with a forwarder and business account email then you have to pay for that. 


### VPS setup

#### Users and security on brand new server

Here are the six steps that you have to take each time you create a new server, which you can then abstract into a user data script later on. For right now doing it manually is a valuable learning exercise:

1. **Update software**: use your package manager of choice to update the software on your instance.


![](https://i.imgur.com/tgWlrSl.jpeg)


2. **restart the server**: It's important to restart the server because you want to override the cache. The command below shuts down the server and then immediately restarts it.

```bash
shutdown now -r
```

3. **Create a new user**: We don't want to be the root user all the time because that leaves a large attack surface, since root user has 100% access to do anything on the system.


![](https://i.imgur.com/kAOItxr.jpeg)


4. **Give the new user superuser access**: Add the new user into the `sudo` (superusers do) list to allow it to temporarily assume root user access by allowing that user to temporarily switch into the root user profile.
5. **enable login for new user**: add SSH connection for the new user via `~/.ssh/authorized_keys`, which you do by just pasting in the public key into the authorized keys file, separating via newline for additional keys.


![](https://i.imgur.com/Cij7Wmv.jpeg)


6. **disable root login**: change the file permission of the `~/.ssh/authorized_keys` file so that only root can write to it and every other user can only read it, and then disable root login by removing it from the list of allowed SSH users, and then restart the SSH daemon to applyt he changes.


![](https://i.imgur.com/u88At2G.jpeg)


> [!NOTE]
> Why not stay as root user? 
> ***
> Allowing root user as a valid login for people to gain root access is incredibly dangerous because root users have privilege to do any and all actions on the machine. For instance, they can even do `rm -rf /` to delete the entire OS.

#### Custom user data script for installing software

### Nginx setup

#### On EC2 with AMI

1. Install nginx with the package manger on your VPS. For EC2 amazon AMI, it will be `yum`, so install nginx like so:

```bash
sudo yum install nginx -y
```

2. start the nginx service, which automatically starts up on HTTP port 80 

```
sudo systemctl start nginx
sudo systemctl enable nginx
sudo systemctl status nginx
```

3. Check if nginx is running on port 80:

```
lsof -i:80
```

#### On EC2 with Ubuntu

The difference between setting up Nginx on Ubuntu and something different like CentOS or Red Hat or EC2 is that you have to deal with the firewall for Ubuntu. By default all traffic on port 80 and 443 is blocked on Linux and SSH is the only open port on an Ubuntu instance. You need to configure the firewall in order to make the ports actually open. 

- On Linux, SSH to port 22 is the only open port exposed form the instance by default
- To open closed ports like HTTP 80 or HTTPS 443, you need to use the linux `ufw` firewall command to configure that.

So here are the steps:

1. Install nginx with the package manger on your VPS. For EC2 amazon AMI, it will be `yum`, so install nginx like so:

```bash
sudo yum install nginx -y
```

2. start the nginx service, which automatically starts up on HTTP port 80 

```
sudo systemctl start nginx
sudo systemctl enable nginx
sudo systemctl status nginx
```

3. Use the `ufw` tool to check the status of all currently running processes that can expose themselves on a port. This is what the output of listing the apps will look like:

```bash
ufw status
ufw app list
```


![](https://i.imgur.com/TVxooau.jpeg)

4. Choose to allow the `Nginx Full` application, which exposes NGINX for HTTP on port 80 and HTTPS on port 443

```
ufw allow 'Nginx Full'
```

### Nginx app setup

You should think of nginx config files as server proxy registrations that you can create, and then choose to enable selectively. You have these two conventions that are important to follow:

- `/etc/nginx/sites-available`: folder to hold nginx configurations, not really special, just used as convention
- `/etc/nginx/sites-enabled`: directory that NGINX recognizes and loads all nginx config files that live in this directory.


![](https://i.imgur.com/i4koRKv.jpeg)

1. **Create app code in `/var/www` folder**: By default, the HTML content nginx serves is in `/var/www/html` so we're putting our app HTML in `/var/www/app`.

```js
const http = require("http");

http.createServer(function (req, res) {
  res.write("On the way to being a full stack engineer!");
  res.end();
}).listen(3000);

console.log("Server started on port 3000");

```

2. **Create NGINX proxy pass configuration file**: create an NGINX config file that does a proxy pass to the server, put this file in the `/etc/nginx/sites-available/` directory

```nginx title="/etc/nginx/sites-available/my-server"
server {

    listen 80 default_server;
    listen [::]:80 default_server;

    root /var/www/html;
    index index.html;

    server_name <your_domain>;

    location / {
        proxy_pass http://127.0.0:3000;
    }

}

```

3. **enable the NGINX config you created**: Enabled NGINX config files live in the `/etc/nginx/sites-enabled` folder, so you should symlink the config file you just created to be copied to that folder.
4. **let the main nginx config know about the new config you want to include**: The main nginx config file is `/etc/nginx/nginx.conf`, and in there you should use the `include` directive to include the NGINX config file you made so it registers that:

```nginx
include /etc/nginx/sites-enabled/my-server;
```

5. **restart nginx and verify it works**

```bash
sudo nginx -t
sudo service nginx restart
```

6. **start server**: you need to actually run the node server in order for proxy pass to work

```
node app/server.js
```

#### PM2

PM2 is a way to run node servers as a service without using something like systemd, so the server can be automatically restarted on server restarts and after shutdowns, and also continue running as a daemon.



![](https://i.imgur.com/4ptT7c7.jpeg)


1. Install the `pm2` library:

```bash
sudo npm i -g pm2
```

2. Start PM2

```sh
pm2 start app/server.js --watch
```

3. Setup auto restart

```bash
pm2 save # saves as systemd service
pm2 startup # adds to path to start systemd service
```


#### Pocketbase + NextJS example



1. Create a new configuration file in the `/etc/nginx/sites-available` directory, which handles proxy pass for port 80 and 443 to your app running on localhost

```nginx title="/etc/nginx/sites-available/guestbook"
server {
    listen 80;
    server_name linux.fireship.app;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name linux.fireship.app;

    # SSL configuration using Cloudflare certificates
    ssl_certificate /etc/ssl/cert.pem;
    ssl_certificate_key /etc/ssl/key.pem;

    # SSL settings (recommended for security)
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;

    # Next.js application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # PocketBase API and Admin UI
    location /pb/ {
        rewrite ^/pb(/.*)$ $1 break;
        proxy_pass http://localhost:8090;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

2. Create a symlink from the nginx config file you created and copy that via symlink over into the `/etc/nginx/sites-enabled` directory so that specific config will now be available for NGINX to register and use.

```
ln -s /etc/nginx/sites-available/guestbook /etc/nginx/sites-enabled/
```

3. Remove any previous conflicting nginx configs that are currently enabled.

```
rm /etc/nginx/sites-enabled/default
```

## Security

It's important to deal with server security with seriousness because you have a lot of attack surfaces there, such as:

- **ssh**: if an unauthorized person gains access to a server with an SSH key, then they could connect to Github and potentially steal a company's entire worker profile by stealing the server's SSH credentials, pulling down the company code, and just stealing that. 
- **not updating software**: you don't update your software or if you don't restore a compromised server to a backed-up version from a long time ago then a user could still have backdoor access. It's always important to update and patch software to patch OS-level bugs and it's always important to roll back to a version that was not compromised if your server has become compromised. 
- **what to do in case of compromise**: in case your server was compromised, you need to wipe the machine in the store from the backup from a long time ago as you cannot be certain what actions were taken by the intruder. 

> [!NOTE]
> A general principle to keep in mind if your server ever gets compromised is that you have no 100% reliable way of knowing what the attacker did on your server while it was compromised. You should always restore and wipe the server to a version a long long time ago where you have 100% certainty that it was not compromised. 

The three core security practices that you should implement for servers are as follows:

1. Use SSH keys instead of passwords.
2. Use firewalls to restrict server access.
3. Keep software consistently up-to-date.

### Checking ports

A **port** is a communication endpoint that maps to a specific process or network service. Each port can run only one process.

> [!NOTE]
> Ports allow IP addresses to run multiple hundreds or thousands of services at the same time on that same IP address. 

- **port collision**: when you are trying to run a service on a port that is already occupied by another currently running service
- **open port**: A port that is exposed to the broader world on the machine and that someone can target as an origin.

You can use the `nmap` command to check ports:


![](https://i.imgur.com/tVxa9du.jpeg)

### Firewalls


![](https://i.imgur.com/OLUlVfI.jpeg)

### Keep systems up to date

What these commands do is automatically install OS upgrades and patches for you when they become available.


![](https://i.imgur.com/29qb7Fw.jpeg)

### DDoS attacks

VPS systems are pieces of compute you're buying, so they don't scale up infinitely for DDoS attacks, they just get taken down because they run out of memory, which is much better than scaling up infinitely via cloud functions and spending $100,000 as a result.

It's better to outsource DDoS protection to a service like Cloudflare or AWS shield

## CI/CD

- **continuous integration**: code changes are validated and merged back into the main branch as often as possible. 
- **continuous delivery**: code changes are automatically built and ready for production. 
- **continuous deployment**: builds are automatically deployed to production environments. 


> [!NOTE]
> The difference between continuous delivery and continuous appointment is that continuous delivery is all about building automatically, making sure it is ready to be pushed up to production, while continuous appointment handles the actual pushing to production automatically by building and deploying when you push up to the main branch.


![](https://i.imgur.com/8mLHhym.jpeg)

### Using cron for CI/CD

An interesting way to use cron for CI/CD is to write a cron job that continuously pulls code from GitHub or pushes to GitHub based on an interval. 

1. Create a bash script that runs `git pull` from main branch

```bash title="app/cron/pull.sh"
#! /usr/bin/bash

cd ~/app
git pull origin main
```

2. Create a cron job to execute the script we created every 2 minutes, so run `crontab -e` and add this line, redirecting standard output and error to the `/var/log/syslog` system logs file.

```cron
*/2 * * * * bash /home/usernamehere/app/cron/pull.sh 2>&1
```

3. Check cron job logs

```bash
sudo tail -f /var/log/syslog
```

## Websockets

### Websocket NGINX config

So if you're using NGINX as your reverse proxy, it also offers easy ways to upgrade an HTTP connection to a WebSocket protocol connection and in fewer lines of code. 

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name blog.<your_domain>;
    
    location / {
	    # 1. upgrade to ws or other protocol if need be
	    proxy_set_header Upgrade $http_upgrade; 
	    proxy_set_header Connection "upgrade";
	    
	    # 2. after setting headers, then redirect via proxy pass
        proxy_pass http://localhost:3000;
    }
}
```

### Websocket express 

The first step is to create an express app and connect it to the existing HTTP server

```ts
import express from 'express'
import {createServer} from 'http'

// 1. create HTTP server
const server = createServer()

// 2. create express app
const app = express()

app.get('/', (req, res) => {
	res.sendFile('index.html', {root: __dirname })
})

// 3. forward http server requests to express app
server.on('request', app)

// 4. start server on port 3000
server.listen(3000, () => {
	console.log('listening on port 3000')
})
```

And here is how to create websockets on express, look more at [[05-fetching-remote-data#Websockets]].

```ts
import express from 'express'
import {createServer} from 'http'
import  {Server as WebSocketServer} from "ws"

// 1. create HTTP server
const server = createServer()

// 2. create express app
const app = express()

app.get('/', (req, res) => {
	res.sendFile('index.html', {root: __dirname })
})

// 3. forward http server requests to express app
server.on('request', app)

// 4. start server on port 3000
server.listen(3000, () => {
	console.log('listening on port 3000')
})


// 1. create a websocket server
const wss = new WebSocketServer({ server })

function broadcast(wss : WebSocketServer, data: any) {
	wss.clients.forEach(client => {
		// send data to specific client
		client.send(data)
	})
}

// event that gets triggered every time new client connects to web socket server
wss.on('connection', (ws) => {
	// ws represents a single client web socket connection
	// wss.clients is an array of all connected clients
	
	// 2. send a broadcast to all clients
	broadcast(wss, `Current visitor count: ${wss.clients.size}`)
	
	// 3. send message to client
	const isClientConnected = (ws.readyState === ws.OPEN)
	if (isClientConnected) {
		ws.send('hello, client!')
	}
	
	ws.on('close' () => {
		console.log('a client has disconnected')
		broadcast(wss, `Current visitor count: ${wss.clients.size - 1}`)
	})
})
```

Now on the client JS, we need to create a websocket connection that connects to the server via the websocket protocol:

If your app is on HTTPS then you have to use a WSS protocol, which stands for secure web sockets. If your app is on an HTTP connection then you have to use the WS protocol, which is normal web sockets but insecure. 



> [!NOTE]
> Because the Web Software protocols run on the same ports as HTTP and HTTPS, that's why we have to do the server upgrade and handle that in our Nginx as well 
> 
> - `ws://` is used for HTTP connections and typically runs on port 80
> - `wss://` is used for HTTPS connections and typically runs on port 443

```ts

// 1. use wss for secure websockets, or ws for normal websockets protocol
const protocol = window.locations.protocol === "https:" ? 'wss' : 'ws'

const websocket = new WebSocket(`${procotol}://${window.location.host}`)

ws.on('message', (event) => {
	console.log('data received from server', event.data)
})
```

## HTTPS and SSL

### HTTPS overview

#### Request


![](https://i.imgur.com/1I3lB8H.jpeg)


Here are the common headers set:

- `User-agent`: the requesting device type
- `Accept`: what the device will handle, like `text/html` for what a request is asking for
- `Accept-language`: browser languages to translate strings in JS automatically to a specific language
- `Set-cookie`: sets cookie info
- `Content-type`: the type of media used for passing request body metadata or what you're expecting back from a response
- `X-`: the prefix for custom headers

#### Response


![](https://i.imgur.com/jQsvvt9.jpeg)

### NGINX with subdomains


A **subdomain** is a subset of a main domain that allows developers to create separate environments or applications without creating an entirely new URL. 

- It simplifies development by avoiding the need to create new cookies and provides an easier way to manage different parts of a website.

Here's how to set up a subdomain connection in nginx

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name blog.<your_domain>;
    
    location / {
        proxy_pass http://localhost:3000;
    }
}
```

### NGINX with certbot SSL

1. Update the `snap` package manager

```bash
sudo snap install core
sudo snap refresh core
```

2. Remove any previously installed versions of certbot that were not installed with `snap`:

```
sudo apt-get remove certbot
```

3. Install certbot with snap

```
sudo snap install --classic certbot
```

4. Create a symlink

```
sudo ln -s /snap/bin/certbot /usr/local/bin/certbot
```

5. Run this command to get a certificate and have Certbot edit your nginx configuration automatically to serve it, turning on HTTPS access in a single step.

```
sudo certbot --nginx
```

6. Open up the HTTPS port on 443 using `ufw`

```bash
sudo ufw allow https
sudo ufw enable
```


Behind the scenes, this is what certbot does:

7. Request certificates for us on our behalf for the domains and subdomains that NGINX points to through its `server.server_name` property
8. Modifies the NGINX config to work with SSL and redirect HTTP to HTTPS connections

### HTTP2

HTTP/2 lets you use multiplexing, which is a technique that allows this protocol to send multiple things across one single connection instead of just one payload per request-response cycle as per HTTP. 

- **pro**: faster, more parallel work
- **con**: consumes more CPU

To use HTTP2 with node and nginx, NGINX actually handles upgrading to HTTP2 for you via one line of configuration code change:

```nginx
listen 443 http2 ssl;
```

> [!NOTE]
> HTTP2 only works on an SSL connection, therefore that's why we only do that on port 443 and not HTTP on port 80

## Microservices and containers

### NGINX as load balancer

Learn more about load balancing here: [[03-system-design#Load balancers]]

We can use Nginx as an orchestration load balancer over Dockerized servers. Here are the steps to do so:

1. Dockerize a server app, run it on multiple ports:

```
docker run nodeserver -p 3000:3000
docker run nodeserver -p 3001:3000
docker run nodeserver -p 3002:3000
```

2. In the `/etc/nginx/nginx.conf` main configuration file, add a new `http.upstream` block that lists the origins to include in a target group that will be named `nodebackend`.


```nginx
http {
	upstream nodebackend {
		server localhost:3000;
		server localhost:3001;
		server localhost:3002;
	}
}
```

3. In your server block, proxy pass to the upstream target group, referenced by name:

```nginx
server {
	server_name testing-2345.click
	
	location / {
		proxy_pass http://nodebackend;
	}
}
```

## VPSs

### Cloud init scripts

A cloud-init script is a generic configuration script used to automate the setup and initialization of a cloud server right after it’s created. 

It allows you to define tasks like creating user groups and users, setting up SSH access, installing software, running system updates, and configuring services automatically.

A standard cloud init YAML script has these sections:


- **`groups`:** Defines user groups to organize users on the server.

```yaml
groups:
	- usergroup
```

- **`users`:** Creates users with specified settings like shell, groups, and SSH keys for secure access.

```yaml
users:
 # This creates a user `myuser` with bash shell, adds them to `users` and `admin` groups, and sets their SSH public key
  - name: myuser
    shell: /bin/bash
    groups: ["users", "admin"]
    ssh_authorized_keys:
      - ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC...
```

- **`runcmd`:** Runs shell commands automatically on first boot.

```yaml
runcmd:
  - echo "Hello from cloud-init" > /home/myuser/welcome.txt
  - apt-get update
  - apt-get install -y nginx
  - systemctl start nginx
  - systemctl enable nginx
```

- `packages`: a list of packages to install with the provider's package manager, using `apt` or `yum` behind the scenes, depending on the OS running the cloud init script.

```yaml
packages:
	- nginx
```

#### Example

```yaml title="cloudinit.yaml"
#cloud-config-mkdocs-system

groups:
  - ubuntu: [root,sys]
  - dpro42-group

users:
  - default
  - name: spiderman
    gecos: Peter Parker
    shell: /bin/bash
    primary_group: dpro42-group
    sudo: ALL=(ALL) NOPASSWD:ALL
    groups: users, admin
    lock_passwd: false
    ssh_authorized_keys:
      - ssh-ed25519 AAAA-etc (replace with your key here)

runcmd:
  - touch /home/spiderman/hello.txt
  - echo "Hello! and welcome to this server! Destroy me when you are done!" >> /home/spiderman/hello.txt
  - sudo apt-get update
  - sudo apt install apache2 -q -y
  ## 4/1/2025: replaced pip install of mkdocs with apt-get install
  # old - sudo apt install python3-pip -y
  # old - sudo pip install mkdocs
  - sudo apt-get install mkdocs -q -y
  - sudo mkdir /home/spiderman/mkdocs
  - cd /home/spiderman/mkdocs
  - sudo mkdocs new mkdocs-project
  - cd mkdocs-project
  - sudo mkdocs build
  - sudo rm /var/www/html/index.html
  - sudo cp -R site/* /var/www/html
  - sudo systemctl restart apache2
```