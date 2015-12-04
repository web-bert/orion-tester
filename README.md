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

It is recommended to make an index of _id.id and _id.servicePath in the entities collecton, to do this from the mongo shell run:

```bash
db.entities.createIndex( { "_id.id": 1 } );
db.entities.createIndex( { "_id.servicePath": 1 } );
```


## Setup scripts

### Dependencies

First you need to install the dependencies:

```bash
npm install
```

### Config

Then you need to tell the scripts where your orion server is, edit the "orion" object config.json file in the src/ folder to do this. When testing subscriptions you also need to tell the orion server how to call the test subscriptions, edit the "server" object to do this.


### Create the data

The dataset is based around parking lots and the spaces within them - which are the entities. The dataset goes through each country in the UK and their regions and outcodes (first part of the postcode). This gives a simple breakdown for a dataset using servicePaths. Each outcode is then assigned random parking lots and each parking lot is assigned a random amount of spaces.

There is a script generates the data that needs to be sent to Orion and the other scripts use that data to know what is in orion - hence the output is saved into the git repo.

```bash
npm run data
```

This will create the amount of entities in the src/config.json file, randomly picking an outcode and then deciding if it should add a new parking lot or not and then add a space to the new or existing parking lot.

### Create the entities from the data

Once the data has been created it needs to be entered into Orion and given a state. This is done using:

```bash
npm run setup
```

Depending on the dataset this can take a while, so for initial testing you can use some methods on the DataModel to reduce the dataset to something smaller.


## Test scripts

Once the data has been sent to Orion we have some scripts to update or query that data. The amount of concurrent connections is controlled in the config.json file. Updates are done in batches with an optional break in between to give a bit of breathing space to Orion.

### src/queryEntities.js

This will query the state of each entity in the dataset, again for simplified testing the methods on the DataModel can be used to reduce the amount of tests. Conncurrency of the queries is controlled in the config.json file.

### src/updateEntities.js

This script takes an optional argument to specify the amount of updates to perform, it then randomly picks a parking space id and updates the attribute to a random string.

## Subscriptions

### src/createSubscriptions.js

This script takes an optional argument of the amount of subscriptions to create

To test subscriptions we need an API for Orion to call, so this script creates the required amount of http servers, on incremendal ports, and sends them to Orion

The subscriptions ids are stored and written to output/subscriptions.json. If this file contains some subscriptions then only servers are created, otherwise servers and subscriptions are created.

Therefore if you want 10 subscriptions just run:

```bash
./src/createSubscriptions.js 10
```

The first time it will create 10 servers from port 4000 - 4010 and call Orion 10 times to create 10 subscriptions

The second time you call it, only 10 servers will be created.

### src/removeSubscriptions.js

This script is the counterpart to createSubscriptions and it will call the Orion API for each subscription in the output/subscriptions.json file and then remove the entry from the file.
