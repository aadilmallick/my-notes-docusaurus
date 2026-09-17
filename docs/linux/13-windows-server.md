## Remote Desktop Connection

### Modifying Hosts File

The `C:\Windows\System32\drivers\etc\hosts.txt` file on a Windows Server is used to define which hosts a server has access to and how to reach those hosts via DNS.

1. Navigate to `C:\Windows\System32\drivers\etc` in the file explorer


![](https://i.imgur.com/kwymbHr.jpeg)

2. Edit the hosts file with notepad

This is what it should look like:

```bash
# Copyright (c) 1993-2009 Microsoft Corp.
#
# This is a sample HOSTS file used by Microsoft TCP/IP for Windows.
#
# This file contains the mappings of IP addresses to host names. Each
# entry should be kept on an individual line. The IP address should
# be placed in the first column followed by the corresponding host name.
# The IP address and the host name should be separated by at least one
# space.
#
# Additionally, comments (such as these) may be inserted on individual
# lines or following the machine name denoted by a '#' symbol.
#
# For example:
#
#      102.54.94.97     rhino.acme.com          # source server
#       38.25.63.10     x.acme.com              # x client host

# localhost name resolution is handled within DNS itself.
#	127.0.0.1       localhost
#	::1             localhost
172.17.11.117	ashqaweb27-spa.unisonglobal.com
172.17.11.117	ashqaweb27.unisonglobal.com
172.18.5.96            bamregweb06-pathfinder.unisonglobal.com
172.18.5.96            bamregweb06-regulator.unisonglobal.com
172.18.5.96            bamregweb06-spa.unisonglobal.com    
```