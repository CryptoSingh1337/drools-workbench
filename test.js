const XLSX = require("xlsx");

const workbook = XLSX.readFile("FaridabadBike.xlsx");

workbook.SheetNames.forEach((sheetName, index) => {
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "", raw: false });
  const celldata = [];
  for (let r = 0; r < jsonData.length; r++) {
    const row = jsonData[r];
    for (let c = 0; c < row.length; c++) {
      if (row[c] !== "" && row[c] !== null && row[c] !== undefined) {
        celldata.push({
          r: r,
          c: c,
          v: {
            v: row[c],
            ct: { fa: "General", t: "g" },
            m: String(row[c]),
          },
        });
      }
    }
  }
  console.log(celldata);
});
