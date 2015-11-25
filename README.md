#some tools to setup and test Orion Context Broker

## Setup CentOS

After a fresh install of 6.x it doesn't have a network interface! You need to edit /etc/sysconfig/network-scripts/ifcfg-eth0 and change the two lines to this:

```
ONBOOT="yes"
NM_CONTROLLED="no"
```
