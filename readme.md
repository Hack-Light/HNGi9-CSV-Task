# CSV READER AND WRITER

This is a HNGi9 Project I submitted that reads a csv file, saves out each row as a json file, hashes the json files and creates a modified csv file with the new hash for each row included in the row.

> **Note:** This Script works with csv files that have the following headers - [ "Series Number", "Filename", "Description", "Gender", "UUID", "Hash".

To add new columns, Just edit the `columns` array and add the new column in the right place.

# STRUCTURE

- the `csv` folder contains the original csv file and the modified version
- the `json` folder contains all generated json files
- the `main.js` houses the implementation.

# HOW TO RUN THE PROGRAM

- Clone the repo
- Change into the cloned directory
- In your terminal run `npm install`
- In the `main.js` file, change the filename and teamName variable to your csv file name without the extention
- In your terminal run `node main.js`
