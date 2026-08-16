
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

### Adding basic NGINX

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

### DDoS attacks

VPS systems are pieces of compute you're buying, so they don't scale up infinitely for DDoS attacks, they just get taken down because htey run out of memory, which is much better than scaling up infinitely via cloud functions and spending $100,000 as a result.

It's better to outsource DDoS protection to a service like Cloudflare or AWS shield