const fs = require("fs");
const fsp = fs.promises;
const { parse } = require("csv-parse");
const { stringify } = require("csv-stringify");
const { createHash } = require("crypto");

let filename = "sample"; // Change this to the name of your file wihout the extension
let teamName;
const writableStream = fs.createWriteStream(`./csv/${filename}.output.csv`);

let hash = []; // This will hold the hashes of the json files
let rows = []; // This will hold the data from the csv file

fs.createReadStream(`./csv/${filename}.csv`) // This reads the csv file
  .pipe(parse({ delimiter: ",", from_line: 2 })) // This parses the csv file and skips the first line
  .on("data", async function (row) {
    rows.push(row); // This pushes the data from the csv file into the rows array
  })
  .on("end", function () {
    console.log("finished");

    handleFileCreationAndHashing(); // This calls the function that creates the json files and hashes them
  })
  .on("error", function (error) {
    console.log(error.message);
  });

async function handleFileCreationAndHashing() {
  // this loops through the rows array and creates a json file for each row
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][0] != "") {
      teamName = rows[i][0];
    }

    // This creates the chip-0007 compliant json file
    let json = {
      format: "CHIP-0007",
      // $id:,
      name: rows[i][3],
      description: rows[i][4],
      minting_tool: teamName,
      sensitive_content: false,
      series_number: rows[i][1],
      series_total: 420,
      attributes: [
        {
          trait_type: "gender",
          value: rows[i][5],
        },
      ],
      collection: {
        name: "Zuri NFT Tickets for Free Lunch",
        id: "b774f676-c1d5-422e-beed-00ef5510c64d",
        attributes: [
          {
            type: "description",
            value: "Rewards for accomplishments during HNGi9.",
          },
        ],
      },
      data: {}
    };

    // console.log(i, rows[i]);
    let attributes = rows[i][6];

    let attributesArray = attributes.split(";");

    // this is used to check for inconsistences
    // if (attributesArray.length < 7) {
    //   // console.log(, rows[i]);
    //   console.log(rows[i][1], attributesArray.length, attributesArray);
    // }

    for (let j = 0; j < attributesArray.length; j++) {
      let arr = attributesArray[j].split(":");

      // console.log(j, arr);

      if (arr[0] != "") {
        let obj = {
          trait_type: arr[0].trim(),
          value: arr[1] != "" ? arr[1].trim() : "",
        };

        json.attributes.push(obj);
      }
    }

    // This creates the json file
    await fsp.writeFile(`./json/${rows[i][2]}.json`, JSON.stringify(json));

    // This reads the content of the json file
    let buff = await fsp.readFile(`./json/${rows[i][2]}.json`);

    // This hashes the content of the json file
    const hashed = createHash("sha256").update(buff).digest("hex");

    // This pushes the hash into the hash array
    hash.push(hashed);
  }

  writeCSV(); // This calls the function that writes the new csv file
}

function writeCSV() {
  // This defines the columns of the new csv file
  const columns = [
    "TEAM NAMES",
    "Series Number",
    "Filename",
    "Name",
    "Description",
    "Gender",
    "Attributes",
    "UUID",
    "Hash",
  ];

  // This writes the columns of the new csv file
  const csv_writer = stringify({ header: true, columns: columns });

  // This writes the data of the new csv file
  for (let i = 0; i < rows.length; i++) {
    rows[i].push(hash[i]); // Push the hash into the rowws array
    csv_writer.write(rows[i]);
  }

  // console.log(rows.length);
  csv_writer.pipe(writableStream); // This pipes the data to the new csv file

  console.log("Finished writing data"); // This logs that the data has been written to the new csv file
}
