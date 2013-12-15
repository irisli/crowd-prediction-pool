# prediction-pool
A **BTC/USD** swing trading bot that pulls data from user [flair predictions](http://coinsight.org/#reddit) on [/r/bitcoinmarkets](http://reddit.com/r/bitcoinmarkets). By using the wisdom of the crowds, this method can gain valuable insight on the market from a hopefully reliable pool of users.

## Terminology

- **pool** - Group of multiple profiles to compare which way can earn the most profits.
- **profile** - A portfolio of users created by filtering profitable users on reddit based on several criteria

## Install

Fill in the blanks of the config.json.sample and cp it to config.json.

Install mongodb, ubuntu instructions can be found at http://docs.mongodb.org/manual/tutorial/install-mongodb-on-ubuntu/

Setup AWS command line tools, for ubuntu follow http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/SettingUp_CommandLine.html#setting_up_ec2_command_linux

```bash
$ npm install
$ node main.js
```


## Object documentation

### config:

- **aws** - Access keys for connecting to Amazon S3. Can be retrieved from the AWS console under Security Credentials.
	- **bucket** - Must be a bucket that your aws account has read/write access to.
	- **s3File** - Filename of the database
- **serverPort** - Web interface server port. Port 80 requires sudo on most servers.
- **profiles** - Coinsight profiles with filters and settings
	- **name** - Text name of profile
	- **slug** - URL safe representation of the name (lowercase and no spaces)
	- **s3File** - Filename of the database

	- **minAccountAge** - Minimum reddit coinsight age to be included in pool.
	- **minCurrentProfit** - Minimum coinsight monthly profit to be included in pool.
	- **minTotalProfit** - Minimum coinsight lifetime profit to be included in pool.
	- **minChangesMonth** - Minimum coinsight flair changes per month to be included in pool.
	- **minChangeCount** - Minimum coinsight flair lifetime changes to be included in pool.

### coinsight:

- **users** - Object of user data from coinsight
- **filters** - Profile settings from config
- **size** - Amount of users that passed the filter
- **numBears** - Number of bear flairs
- **numBulls** - Number of bull flairs
- **percentBears** - Percent of bear flairs
- **percentBears** - Percent of bull flairs
- **creationTime** - Time of the javaScript coinsight object creation
- **totalProfit** - Percent profit of the profile in decimal form (1 = break even)


