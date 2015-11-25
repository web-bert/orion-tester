#some tools to setup and test Orion Context Broker

## Setup CentOS

After a fresh install of 6.x it doesn't have a network interface! You need to edit /etc/sysconfig/network-scripts/ifcfg-eth0 and change the two lines to this:

```
ONBOOT="yes"
NM_CONTROLLED="no"
```

##Mongo

###Breaking Mongo

If you break mongo and can't get it to start then you need to clear the db files:

```bash
sudo rm -Rf /var/lib/mongo/*
```

Now you should be able to start mongo:

```bash
service mongod start
```

###Indexes

It is recommended to make an index of _id.id in the entities collecton, to do this from the mongo shell run:

```bash
db.entities.createIndex( { "_id.id": 1 } );
```
