# Deploying web resources

See the [spkl repository for documentation on spkl](https://github.com/scottdurow/SparkleXrm/wiki/spkl)

## Usage

Open a terminal window, go to the spkl subdirectory and run deploy-webresources.bat.


As currently set up the spkl/deploy-webresources.bat file can be used to deploy the web resources listed in spkl.json.
These are: -

- arup_opportunity_tags.js
- ccrm_opportunity_library_2015

There is a second config file spkl.bidReview.json that shows how the files related to BidReview could be deployed.

## Future

Note that Spkl will only deploy modified web resources.
potentially this could be set up to deploy all our web resources into dev, and it would then deploy any 
updated web resources directly from visual studio to CRM.

- There are probably a number of redundant web resources in the project. The could/should be removed.
- Using the 
