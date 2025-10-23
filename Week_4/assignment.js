const putri = {
  "name": "Putri",
  "birthday": "2005-02-13",
  "phone": "081234567890",
  "address": {
    "primary": "Bandung",
    "secondary": "Sukabumi"
  }
}

const bayu = JSON.parse(JSON.stringify(putri)); 

bayu.name = "Bayu";
bayu.address.primary = "Aceh";

console.log(putri.name);
console.log(putri.address.primary);