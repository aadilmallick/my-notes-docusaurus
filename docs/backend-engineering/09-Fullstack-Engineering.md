## NGINX

### Basics

#### Why Nginx?

NGINX is a **reverse proxy**, meaning it is a middleman between a client and your server, where it can modify the request or send back a response, acting as middleware before it gets to your server and acting as a middleware before the server sends a response back to the client.

This reverse proxy approach makes NGINX have two main use cases:

1. **load balancer**: You can use NGINX as a load balancer by having it be the reverse proxy for a target group, then setting up rules to distribute incoming requests across server instances in the target group
2. **encryption**: If using NGINX as a load balancer, you also benefit from using NGINX because you only have to encrypt the request/response once instead of doing it for every instance in the target group.

Nginx (pronounced "Engine X") is a high-performance web server. Originally it only served static files. Today it is commonly used as

- reverse proxy
- web server
- load balancer
- SSL terminator
- cache
- API gateway

Instead of your application talking directly to users...

```
Internet -> Node App
```

You place nginx in front.

```
Internet ->  Nginx -> Node App
```

Advantages:

- SSL termination
- hides your backend
- faster static files
- request routing
- compression
- caching
- security
- rate limiting

#### NGINX CLI

If installing nginx on WSL, then since you don't have `systemd`, you have to use `sudo service` prefix command or the `sudo systemcl` to acknowledge that NGINX runs with root-level permissions as a reverse proxy for your computer.

- `nginx start`: starts NGINX
- `nginx restart`: kills the NGINX service then restarts it, pulling from the most recent config.
- `nginx reload`: reloads NGINX without dropping active connections, pulling from the most recent config.

So in WSL, you would start NGINX like so:

```bash
# both do the same thing
sudo service nginx start
sudo systemcl start nginx

# both do the same thing
sudo service nginx stop
sudo systemcl stop nginx
```

The `restart` command stops and then starts Nginx, which causes a brief service interruption. The `reload` command gracefully reloads the configuration without dropping active connections.

- Use `sudo systemctl restart nginx` when you need to fully restart the service (e.g., after package updates)
- Use `sudo systemctl reload nginx` when you’ve made configuration changes and want to apply them without downtime
#### NGINX important files and folders

All the NGINX config for a device lives in the `/usr/local/etc/nginx` directory in linux or in `/etc/nginx` in WSL.

- `/etc/nginx`: The Nginx configuration directory. All of the Nginx configuration files reside here.
- `/etc/nginx/nginx.conf`: The main Nginx configuration file. This can be modified to make changes to the Nginx global configuration.
- `/etc/nginx/sites-available/`: The directory where per-site server blocks can be stored. Nginx will not use the configuration files found in this directory unless they are linked to the `sites-enabled` directory. Typically, all server block configuration is done in this directory, and then enabled by linking to the other directory.
- `/etc/nginx/sites-enabled/`: The directory where enabled per-site server blocks are stored. Typically, these are created by linking to configuration files found in the `sites-available` directory.
- `/etc/nginx/snippets`: This directory contains configuration fragments that can be included elsewhere in the Nginx configuration. Potentially repeatable configuration segments are good candidates for refactoring into snippets.

Here are where the server log files live:

- `/var/log/nginx/access.log`: Every request to your web server is recorded in this log file unless Nginx is configured to do otherwise.
- `/var/log/nginx/error.log`: Any Nginx errors will be recorded in this log.

Before that, some terminology:

- **directive**: a key-value pair in configuration.
- **context**: a grouping of directives applied to some specific context, like HTTP traffic or setting up mime types.

Here are the important files:

- `mime.types`: a list of directives that map mimetypes to file extensions
- `nginx.conf`: the NGINX configuration

When dealing with making changes to the config, here are two important commands you should use:

- `sudo systemctl reload nginx`: reloads NGINX with the updated config
- `nginx -t`: checks if the NGINX configuration is error-free

#### Hosting static content via server blocks

> [!NOTE]
> Why host static content via NGINX via something like express? Because NGINX has blazing fast, native filesystem access and can serve files instantly while Node has to call APIs to access files, increasing latency for serving static content.

Server blocks (similar to virtual hosts in Apache) allow you to host multiple websites on a single Nginx server. Each server block contains configuration for a specific domain or site, including:

- The domain name (`server_name`)
- Document root directory (`root`)
- SSL certificate settings
- Location-specific rules

Server blocks are stored in `/etc/nginx/sites-available/` and enabled by creating symlinks in `/etc/nginx/sites-enabled/`.

These directories work together to manage server block configurations:

- **`/etc/nginx/sites-available/`**: Stores all server block configuration files. Files here are not active.
- **`/etc/nginx/sites-enabled/`**: Contains symlinks to configuration files in `sites-available/`. Nginx only reads configurations from this directory.

This separation allows you to keep multiple configurations ready while only enabling the ones you need. To enable a site, create a symlink: `sudo ln -s /etc/nginx/sites-available/your_site /etc/nginx/sites-enabled/`

Server blocks can be used to encapsulate configuration details and host more than one domain from a single server. 

We will set up a domain called **`your_domain`**, but you should **replace this with your own domain name**.


Nginx on Ubuntu has one server block enabled by default that is configured to serve documents out of a directory at `/var/www/html`. 

- While this works well for a single site, it can become unwieldy if you are hosting multiple sites.
- Any folder you put in `/var/www` will be recognized by NGINX and it's just good practice to put the static content you want in that folder.

1. Create the directory for **your_domain** as follows, using the `-p` flag to create any necessary parent directories:

```bash
sudo mkdir -p /var/www/your_domain/html
```

2. Next, assign ownership of the directory with the `$USER` environment variable:

```bash
sudo chown -R $USER:$USER /var/www/your_domain/html
```

3. Set correct permissions for your web root. The following command grants read, write, and execute to the owner, and read/execute to groups and others:

```bash
sudo chmod -R 755 /var/www/your_domain
```

4. Next, create a `index.html` page within the `/var/www/your_domain` directory, which will be automatically recognized by NGINX to be the main server HTML entrypoint.

```bash
sudo nano /var/www/your_domain/html/index.html
```

5. Create a server block with the correct directives for Nginx to serve this content. Instead of modifying the default configuration file directly, create a new one at `/etc/nginx/sites-available/your_domain`:

```bash
sudo nano /etc/nginx/sites-available/your_domain
```

6. Create add this config to the server block:

```nginx
server {
        listen 80;
        listen [::]:80;

        root /var/www/your_domain/html;
        index index.html index.htm index.nginx-debian.html;

        server_name your_domain www.your_domain;

        location / {
                try_files $uri $uri/ =404;
        }
}
```

6. Next, let’s enable the file by creating a symbolic link from it to the `sites-enabled` directory, which Nginx reads when it is running.

```bash
sudo ln -s /etc/nginx/sites-available/your_domain /etc/nginx/sites-enabled/
```

7. To avoid a possible hash bucket memory problem that can arise from adding additional server names, adjust a single value in the `/etc/nginx/nginx.conf` file. Open the file and then edit the `http.server_names_hash_bucket_size` directive to be large enough to avoid collisions.

```nginx
# ...
http {
    ...
    server_names_hash_bucket_size 64;
    # ...
}
# ...
```

8. Check your NGINX config and then reload it:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

> [!NOTE]
> Nginx uses a common practice called symbolic links, or symlinks, to track which of your server blocks are enabled. 
> 
> Creating a symlink is like creating a shortcut on disk, so that you could later delete the shortcut from the `sites-enabled` directory while keeping the server block in `sites-available` if you wanted to enable it.

Now to disable the server block, just remove the symlink:

```bash
sudo unlink /etc/nginx/sites-enabled/default
```

Two server blocks are now enabled and configured to respond to requests based on their `listen` and `server_name` directives.





### NGINX Config

#### Basic NGINX config

Let's go back to basics and not even worry about server blocks. Removing everything else, this is what a basic NGINX config looks like. Here are some rules to consider:

1. Directives have a space in between the key value pair, with the syntax `key value`
2. All directives must end with a semicolon.

```nginx title="/etc/nginx/nginx.conf"
http {
	server {
		# the port to serve the content
		listen 8080; 
		
		# looks for index.html in this folder
		root /home/amallick/personal/mydomain; 
	}
}
```

#### NGINX workers

How does NGINX handle thousands of connections simultaneously? Well since it's a reverse proxy, it has to maintain mappings of one origin to another, which is in of itself creating a front-facing process so it can route to the destination process.

This means NGINX has a huge attack surface, because for each network connection it's proxying (one per origin), it has to create a new process to handle that forwarding.

> [!NOTE]
> Imagine if your website got hacked. If every NGINX process ran as root, then just one process needs to get compromised in order for the entire OS to become compromised. The answer? Run NGINX proxying processes with limited permissions.

NGINX itself creates multiple **worker processes** that handle the actual reverse proxy functionality of NGINX, while the master process reads the config and manages worker processes.

```
        Master Process
              |
      -------------------
      |        |        |
 Worker1  Worker2  Worker3
```

- **master process**: Reads configuration, starts worker processes, and manages worker termination and replacement. 
	- **security**: This has root permissions.
	- **what they manage**
		- - reads configuration
		- starts workers
		- reloads configuration
		- gracefully shuts workers down
		- replaces workers if they crash
- **worker process**: A child process with limited permissions that does network proxying and performs all the HTTP work
	- **security**: This runs as the `www-data` linux user, so they have limited permissions can cannot install software, modify system files, or change firewall rules.
	- **what they manage**:
		- accept TCP connections
		- parse HTTP
		- proxy requests
		- send files
		- compress responses
		- cache data

> [!NOTE]
> This separation between master processes and worker processes is good for security because it follows the principle of least privilege. Master is the only process NGINX creates that runs as root, while all the worker processes run as the `www-data` linux user.

**number of worker processes**

However, due to the CPU executing instructions synchronously and using scheduling to context switch between processes, and each worker process being a full-fledged process, there can only be as many worker processes as there are CPU cores available, since each core can only work on one process at a time via scheduling.

- If there are 4 CPU cores, NGINX can spawn a maximum of 4 worker processes.

You specify that the number of worker processes that should be spawned should be equal to the number of CPU cores available with this directive:

```nginx
worker_processes auto;
```

**number of threads per worker process**

Traditional web servers need to handle thousands of concurrent requests, so the way they do that without stalling is to use an asynchronous I/O technique of delegating blocking code to run in its own thread, so each incoming request synchronously runs through a request handler in a spawned, separate thread. 

However, this leads to huge memory usage.

NGINX avoids this problem by using an event loop like the one in NodeJS, which is an in-process scheduling technique that keeps processes single-threaded while giving the illusion of concurrency.

This is how it works:

```
Receive request

↓

Start reading

↓

While waiting

↓

Handle someone else's request
```

The main benefit of this event loop approach is now each worker process can handle thousands of incoming connections without a huge bloat in memory or hit to performance.

You can use this directive to specify how many concurrent requests a single worker process can handle at once; in this case, 1024.

```nginx
events {
    worker_connections 1024;
}
```

**all together**

To allow for worker processes to be used correctly, follow these two steps:

1. **establish number of worker processes**: Use the `worker_processes` directive and pass it the `auto` value to say that the number of worker processes running at any given time should be the amount of CPU cores available.
2. **Run as worker user**: The best practice is always to run a server block in NGINX as a worker process, which is the `www-data` user that NGINX creates. You can do this through the `user` directive.
3. **establish number of concurrent requests a single worker process can handle**: supply a numeric value to the `events.worker_connections` directive to set a maximum number of incoming requests a single worker process can handle concurrently.

```nginx
# 1. run as worker process user
user www-data;

# 2. spawn as many worker processes as there are CPU cores
worker_processes auto;

events {
	# 3. each worker can handle 1024 concurrent requests at a time
    worker_connections 1024;
}

http {
	# ...
}
```


### HTTP context


Inside http you configure:

- gzip
- cache
- logs
- servers
- upstreams
- MIME types
- proxy defaults

```nginx
http {

	# defines the mapping of mimetypes to files
    include mime.types;

	# defines route forwarding for a specific origin
    server {

    }

}
```

#### MimeTypes

By default, in the NGINX config it handles mimetypes for you with the `include mime.types` directive, where the `include <filepath>` directive loads a separate file of NGINX directives and executes them in the current file.

If we didn't have that directive, NGINX would treat all files as just plain text files, regardless of mimetypes. We need a mapping of mimetypes to their respective file extensions for NGINX to serve static content of different types correctly.

Here's an example of how we can do that manually:

```nginx title="/etc/nginx/nginx.conf"
http {
	
	types {
		text/css css;
		text/html html;
	}

	server {
		# the port to serve the content
		listen 8080; 
		
		# looks for index.html in this folder
		root /home/amallick/personal/mydomain; 
	}
}
```

The `include mime.types` directive solves this issue by loading the `mime.types` file of directives into the NGINX config. The `mime.types` file is a file of a bunch of directives mapping common mime types to their respective file extensions.

```nginx title="/etc/nginx/nginx.conf"
http {
	# include all directives from the mime.types file
	include mime.types

	server {
		# the port to serve the content
		listen 8080; 
		
		# looks for index.html in this folder
		root /home/amallick/personal/mydomain; 
	}
}
```

#### Server blocks

Server blocks colocate all server-related configuration, and is where you define routing rules for an origin and also proxy passing to other URLs.

Here are the different things you can do with a server block:

- **routing with static content**: Combine the `location`, `root`, and `try_files` directives to serve static content.
- **setup domain name and origin**: You can give the proxy a domain name through the `server.server_name` directive, and then have the proxy listen on a specific port with the `server.listen` directive.

```nginx
server {
    listen 80;
    server_name banana.com;
}
```
#### Location

The `server.location` context is used to control the routing of pathnames to the specific HTML file to serve.

Here are the three main directives you should know:

- `root`: the folder of static content to search for an `index.html` in and then serve that. The root will always follow the pattern of being the topmost folder in the domain.
	- **root scope**: The `root` directive can be scoped, where a `root` set in a `location` context block overrides a higher-level `root`.
	- **example**: `root /home/amallick/personal/mydomain`
- `alias`: the folder of static content to search for, where you explicitly type out the full path of a subfolder in the domain, then it looks for an `index.html` within that subfolder to serve.
	- **example**: `root /home/amallick/personal/mydomain/fruits`
- `try_files`: A directive which is a list of filepaths to try to serve statically, with the filepaths being relative to the root. The filepaths are in order of fallback priority, but can also be used to specify a different HTML filename rather than just `index.html` to serve statically.
- `index`: A directive which overrides the entrypoint HTML (default `index.html`) you want to serve from a folder to some other HTML filepath you specify, relative to the scoped `root` directive set.

> [!NOTE]
> For all of these examples, understand that the `root` and `alias` directives have scope, so if you reuse those directives within a `location` context block, other directives used in that `location` context will use the local value of `root` and `alias`.

Here is an example filesystem we want to serve:

```
.
└── /var/www/your_domain/html/
    ├── index.html
    ├── fruits/
    │   └── index.html
    └── vegetables/
        └── veggies.html
```

Let's say we want the following routes:

- `GET /`: serve `index.html`
- `GET /fruits`: serve `fruits/index.html`
- `GET /carbs`: serve `fruits/index.html`
- `GET /vegetables`: serve `vegetables/veggies.html`

To accomplish this, here is how we use the `location` context:


```nginx title="/etc/nginx/nginx.conf"
http {
	# include all directives from the mime.types file
	include mime.types;

	server {
		# the port to serve the content
		listen 8080; 
		
		# on /, serve /var/www/your_domain/html/index.html
		root /var/www/your_domain/html;
		
		# on /fruits, serve /var/www/your_domain/html/fruits/index.html
		location /fruits {
			root /var/www/your_domain/html;
		}
		
		# on /carbs, serve /var/www/your_domain/html/fruits/index.html
		location /carbs {
			alias /var/www/your_domain/html/fruits;
		}
		
		# /veggies : serve /var/www/your_domain/html/vegetables/veggies.html
		# fallback routes are /var/www/your_domain/html/index.html and 404 response
		location /veggies {
			root /var/www/your_domain/html;
			try_files /vegetables/veggies.html /index.html =404;
		}
		
		location /vegetables {
			root /var/www/your_domain/html;
			index /vegetables/veggies.html;
		}
		
	}
}
```

However, the routing rules of the `location` context are kind of weird and isntead of matching the exact route, they treat the pathname as a route segment prefix, then match all routes which start with that route segment prefix. 

Here's the actual mapping:

- `location /` matches `/*`, so it is the ultimate fallback route
- `location /fruits` matches `/fruits*`, so it is not really what we intended. Rather, we want `location /fruits/`.
- `location /carbs/` matches `/carbs/*`

And here is the breakdown:

- **Breaking down the `/fruits` location**: The `root` directive is relative to the location, so it appends the `/fruits` pathname to the directory passed into the root, meaning that it actually searches for an `index.html` in the `/var/www/your_domain/html/fruits` folder.
- **Breaking down the `/carbs` location**: We use the `alias` directive to make NGINX look for `index.html` within the `/var/www/your_domain/html/fruits` directory.
- **Breaking down the `/veggies` location**: We declare the folder to search for `index.html` in to be `/var/www/your_domain/html`, but we change the static file search order with the `try_files` directive to first try and load the files in this order:
	- **primary option**: Relative to the root folder directory defined by the `root` directive, serve `/vegetables/veggies.html` as the HTML file.
	- **fallback option 1**: Relative to the root folder, serve `index.html`
	- **fallback option 2**: The `=404` is a special value which tells NGINX to return its default 404 response, so we save this as the absolute last fallback.

##### Exact match routing

For exact matching of routes, use the `location = <pathname>` syntax:

```nginx
location = /login {
	# ...
}
```

Matches:

```
/login
```

Does not match:

```
/login/
/login/reset
```

> [!NOTE]
> Exact matches are slightly faster because Nginx doesn't need to continue checking other location blocks.

##### **Advanced path matching options with location regex**

You can match pathnames using regex, which you specify that you're using regex to match a route by using the `location ~*` context:

```nginx title="/etc/nginx/nginx.conf"
server {
	# the port to serve the content
	listen 8080; 
	
	# on /, serve /var/www/your_domain/html/index.html
	location / {
		root /var/www/your_domain/html;
	}
	
	# on /count/<num>, serve /var/www/your_domain/html/count.html
	location ~* /count/[0-9] {
		root /var/www/your_domain/html;
		try_files /count.html /index.html =404;
	}
	
}
```

> [!IMPORTANT]
> Regular expressions are powerful but slower than prefix or exact matches, so use them only when needed.

##### Redirects

For a location context, you can redirect a route to another route location by using the `return` directive to return an HTTP response.

In the case of a redirect, we return a 307 status code and then the route to redirect to:

```nginx
server {
	location /old-route {
		return 307 /new-route;
	}
}
```

However, if you don't want to redirect, you can instead just rewrite routes to render a different route's content, using the `rewrite` directive, which you can use regex for:

```nginx
server {
	# ...
	rewrite <old-route-pattern> <new-route-pattern>;
}
```

Here's a complete example:

```nginx title="/etc/nginx/nginx.conf"

server {
	listen 8080; 
	root /var/www/your_domain/html;
	
	
	# on /fruits, serve /var/www/your_domain/html/fruits/index.html
	location /fruits {
		root /var/www/your_domain/html;
	}
	
	# on /carbs, redirect to fruits
	location /carbs {
		return 307 /fruits;
	}
	
	# on /count/*, render count.html
	location ~* /count/\w* {
		root /var/www/your_domain/html;
		try_files /count.html /index.html =404;
	}
	
	# rewrite /number/* to /count/*, passing the captured group
	rewrite ^/number/(\w*) /count/$1;
	
}
```



### NGINX as a reversed proxy

The `proxy_pass <url>` directive is the most powerful directive in NGINX. It reroutes an incoming request and redirects it to the specified URL.

#### NGINX as a load balancer

After preparing a target group ready to be load balanced by NGINX, you have several options for load balancing algorithms:

- **round robin**: NGINX goes in a cycle distributing incoming requests to the next instance in the cycle.

For a simple demonstration of setting up a round robin load balancer, we will use docker to create several container instances of the same image, where the image is of a nodejs server running on port 7777. 

Each container instance will be mapped to a different localhost port, for example, to `localhost:1111`, `localhost:2222`, `localhost:3333`, `localhost:4444`.

Now here are the steps:

1. In an NGINX server block, specify it to listen on a specific port, say 8080.

```nginx
server {
	listen 8080;
}
```

2. Use the `upstream` context to create a named grouping that will become the load balancer domain. In this context, we specify the origins of the different servers/instances we want to target in our target group.

```nginx
upstream loadbalancer {
	server localhost:1111;
	server localhost:2222;
	server localhost:3333;
	server localhost:4444;
}

server {
	listen 8080;
}
```

3. Create a `location` context that matches the `/` route and then uses the `proxy_pass` directive to reroute to the `/` route of the load balancer domain we crated.

```nginx
upstream loadbalancer {
	server localhost:1111;
	server localhost:2222;
	server localhost:3333;
	server localhost:4444;
}

server {
	listen 8080;
	
	location / {
		proxy_pass http://loadbalancer/;
	}
}
```

#### Standard reversed proxy

Nginx can be used as a [reverse proxy](https://www.digitalocean.com/community/tutorials/how-to-configure-nginx-as-a-reverse-proxy-on-ubuntu-22-04) (compatible with Ubuntu 20.04 and 22.04) to route requests to different applications or services. This is useful when you have multiple applications running on the same server and want to manage them as a single entity.

To set up Nginx as a reverse proxy, you need to create a server block in the `sites-available` directory and configure it to listen for requests on a specific port. You can then use the `proxy_pass` directive to forward requests to the appropriate backend application or service.

For example, if you have a Node.js application running on port 3000, you can set up a server block like this:

```nginx
server {
    listen 80;
    server_name your_domain;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### [1. “403 Forbidden” Error](https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-20-04#1-403-forbidden-error)[](https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-20-04#1-403-forbidden-error)

The “403 Forbidden” error occurs when Nginx denies access to a requested resource. This can happen due to incorrect permissions on the file or directory, or if the Nginx user does not have the necessary permissions to access the content.

**Solution:** Ensure Nginx can read the files you are serving. For a typical site under `/var/www`, verify directory and file permissions (for example, `755` on directories and `644` on files) and confirm your `root` path in the server block points to the correct location. 

Avoid blanket ownership changes on `/var/www/html`; instead, update permissions or ownership only for the specific site directory you are serving.

#### [2. “502 Bad Gateway” Error](https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-20-04#2-502-bad-gateway-error)[](https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-20-04#2-502-bad-gateway-error)

The “502 Bad Gateway” error occurs when Nginx acts as a reverse proxy and the backend server fails to respond. This can happen due to a misconfigured backend server or if the backend server is not running.

**Solution:** Check the backend server’s status and ensure it is running correctly. If the backend server is running, check the Nginx configuration files for any errors in the `proxy_pass` directive. 

For example, ensure that the port number in the `proxy_pass` directive matches the port the backend server is listening on.

#### [3. “504 Gateway Timeout” Error](https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-20-04#3-504-gateway-timeout-error)[](https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-20-04#3-504-gateway-timeout-error)

The “504 Gateway Timeout” error occurs when Nginx acts as a reverse proxy and the backend server takes too long to respond. This can happen due to a slow backend server or if the timeout values in the Nginx configuration are set too low.

**Solution:** Increase the timeout values in the Nginx configuration files. For example, you can add the following lines to your server block to increase the timeout values:

```nginx
proxy_connect_timeout 300;
proxy_send_timeout 300;
proxy_read_timeout 300;
```

These lines increase the timeout values to 300 seconds.

### NGINX with SSL

To secure Nginx with SSL, you need to obtain an SSL certificate and configure Nginx to use it. Here’s an example of how to do this:

Obtain an SSL certificate from a trusted certificate authority or use a self-signed certificate for testing purposes. For production, use Let’s Encrypt (see the conclusion section) or obtain certificates from a trusted CA. Certificate files are typically stored in `/etc/ssl/certs/` for certificates and `/etc/ssl/private/` for private keys.

Create or update a dedicated server block for your domain in `/etc/nginx/sites-available/<your_domain>` with the following configuration:

```nginx
server {
    listen 443 ssl;
    server_name your_domain.com;

    ssl_certificate /etc/ssl/certs/your_certificate.crt;
    ssl_certificate_key /etc/ssl/private/your_certificate.key;

    location / {
        root /var/www/your_domain/html;
        index index.html index.htm;
    }
}
```

Then restart nginx to apply the changes:

```bash
sudo systemctl restart nginx
```