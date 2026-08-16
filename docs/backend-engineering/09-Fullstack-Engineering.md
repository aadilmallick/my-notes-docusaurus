
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



### DDoS attacks

VPS systems are pieces of compute you're buying, so they don't scale up infinitely for DDoS attacks, they just get taken down because they run out of memory, which is much better than scaling up infinitely via cloud functions and spending $100,000 as a result.

It's better to outsource DDoS protection to a service like Cloudflare or AWS shield