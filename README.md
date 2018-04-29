# Getting Started

Start by cloning the repository on bitbucket

    git clone git@bitbucket.org:thequotary/asset-generator.git

Enter the newly cloned directory and install

    cd asset-generator/
    npm install

Get the latest version of Postgres then install and run

[https://www.postgresql.org/download/](https://www.postgresql.org/download/) 

Restore the database

    pg_restore pg-backup.sql

Run the following cmd to start your local node server

    nf start -j Procfile_dev

Verify everything is working correctly by visiting the following website in your browser
[http://localhost:5000/](http://localhost:5000/)

# Creating Templates

You can now create new templates. The basic functionality is as follows

### Styles
This is where you can change the appearance of a template. Most of these are pretty self explanatory so play around with inputs to get familiar with them.

### Filters
When a template is rendered into artwork images it uses these filters to determine which quotes/phrases to render. 

### Save
Saves the styles and filters for the current template.

### Build
Starts the process of rendering the current template into images.
 - HD Size: The max width/height of the output image
 - Transparent Size: The max width/height of the transparent output image
 - Limit: Limit the number of images generated (leave empty to render all matching quotes/phrases)
 - Meta: Check to generate a meta file with basic information on all images

## How it works
The template tool works by applying all the styles defined in the template to each quote. It does this by applying the styles quote by quote, line by line. Each quote tests multiple permutations of font sizes to see which font size fits the best in the canvas for the given quote/phrase. This gives the images a high degree of quality but also complicates the process. There are some balances and checks to make sure the quotes don't get stuck in an endless loop. Most of this work is handled in *js/generate.js*

# Rendering Templates
Rendering templates is similar to the template editor and uses the same code to generate the images. It queries the database for all the quotes/phrases that match the filters defined on the current template. Then it renders them one by one to HD and transparent images.

## Starting the process
First you must install the chrome-extension located here: [https://bitbucket.org/thequotary/chrome-extension](https://bitbucket.org/thequotary/chrome-extension)

You will also need an Amazon S3 account to upload the images to. You can get started with a free account [here](https://aws.amazon.com/s3/getting-started/?sc_channel=PS&sc_campaign=acquisition_CA&sc_publisher=google&sc_medium=s3_b_rlsa_hv&sc_content=sitelink&sc_detail=amazon%20s3&sc_category=s3&sc_segment=getting_started&sc_matchtype=e&sc_country=CA&s_kwcid=AL!4422!3!213246142978!e!!g!!amazon%20s3&ef_id=Va7afgAAAK6JYhg8:20180130055411:s)

Once the extension is installed make the sure that the extension id matches the editorExtensionId at the top of *public/js/capture.js*

Make sure that the Amazon S3 key and secret in *public/js/capture.js* and *lib/S3.js* match the S3 account you will be uploading to.

Then you can begin the process by:

 - Selecting the template you want to render from the Load tab
 - Select the Build tab and enter the desired HD Size, transparent size and limit
 - Hit build
 - Hit the "chrome-extension" Full Page Screen Capture button

**Note: this process can very time consuming**

As each image is processed it is uploaded to an Amazon S3 instance.

# FAQ
### Why not render the images on server side?
This was actually the proposed method to render the images when this project began. Unfortunately lots of issues began to arise with rendering. The javascript that attempts to find the best possible fit for given and text and styles was very flaky. Some fonts rendered with weird aliasing issues. Ultimately we decided that render client side would achieve the best possible artwork.

### What is this "parsey" field in the quotes table
The next phase of the template tool was to use the open source library "[Parsey McParseface](https://github.com/tensorflow/models/tree/master/research/syntaxnet)" to help group similar quotes. The idea was we could store things like sentence structure with quotes and then be able to use that in searches. This didn't get very far due to time constraints but you can see this [commit](https://bitbucket.org/thequotary/asset-generator/commits/88ad538f33e8e1e59186d620ab6cb7ea317115d8?at=master) for what was completed.

### Why write the images to S3, can this be done locally?
Writing the images to S3 allows all members of the team to view the images. However, there is no technical reason why this couldn't be changed.