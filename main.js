const fs = require("fs");
const fsp = fs.promises;
const { parse } = require("csv-parse");
const { stringify } = require("csv-stringify");
const { createHash } = require("crypto");

let filename = "sample"; // Change this to the name of your file wihout the extension
let teamName = "X"; // Change this to your team name.
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
    // This creates the chip-0007 compliant json file
    let json = {
      format: "CHIP-0007",
      $id:,
      name: rows[i][1],
      description: rows[i][2],
      minting_tool: `Team ${teamName}`,
      sensitive_content: false,
      series_number: rows[i][0],
      series_total: 526,
      attributes: [
        {
          trait_type: "gender",
          value: rows[i][3],
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
    };

    // This creates the json file
    await fsp.writeFile(`./json/${json.name}.json`, JSON.stringify(json));

    // This reads the content of the json file
    let buff = await fsp.readFile(`./json/${json.name}.json`);

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
    "Series Number",
    "Filename",
    "Description",
    "Gender",
    "UUID",
    "Hash",
  ];

  // This writes the columns of the new csv file
  const csv_writer = stringify({ header: true, columns: columns });

  // This writes the data of the new csv file
  for (let i = 0; i < rows.length; i++) {
    rows[i][rows[i].length - 1] = hash[i]; // The hash column is empty, so this assigns the hash to the last column of the row
    // rows[i].push(hash[i]);
    csv_writer.write(rows[i]);
  }

  // console.log(rows.length);
  csv_writer.pipe(writableStream); // This pipes the data to the new csv file

  console.log("Finished writing data"); // This logs that the data has been written to the new csv file
}
